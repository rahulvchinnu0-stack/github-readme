export interface CommitReadmeParams {
  owner: string;
  repo: string;
  branch: string;
  markdown: string;
  commitMessage: string;
  token: string;
}

export interface CommitReadmeResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  htmlUrl?: string;
  error?: string;
}

export async function commitReadmeToGitHub(params: CommitReadmeParams): Promise<CommitReadmeResult> {
  const { owner, repo, branch, markdown, commitMessage, token } = params;

  if (!token) {
    return { success: false, error: 'GitHub authorization token is required to commit.' };
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'AI-GitHub-Readme-Generator',
    'Content-Type': 'application/json',
  };

  try {
    // 1. Check if README.md exists to get SHA for update
    let existingSha: string | undefined;
    const checkRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/README.md?ref=${branch}`,
      { headers }
    );

    if (checkRes.ok) {
      const fileData = await checkRes.json();
      existingSha = fileData.sha;
    }

    // 2. Base64 encode the new README content (handling UTF-8 cleanly)
    const utf8Bytes = new TextEncoder().encode(markdown);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Content = btoa(binary);

    // 3. Commit the file
    const body: Record<string, string> = {
      message: commitMessage || 'docs: update README.md via AI GitHub README Generator',
      content: base64Content,
      branch: branch || 'main',
    };
    if (existingSha) {
      body.sha = existingSha;
    }

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json().catch(() => ({ message: commitRes.statusText }));
      return {
        success: false,
        error: `GitHub Commit Failed (${commitRes.status}): ${err.message || commitRes.statusText}`,
      };
    }

    const commitData = await commitRes.json();
    return {
      success: true,
      commitSha: commitData.commit?.sha,
      commitUrl: commitData.commit?.html_url,
      htmlUrl: commitData.content?.html_url,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
