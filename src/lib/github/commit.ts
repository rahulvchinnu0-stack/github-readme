export interface CommitOptions {
  owner: string;
  repo: string;
  branch: string;
  path?: string;
  message: string;
  content: string;
  token: string;
  author?: {
    name: string;
    email: string;
  };
  createNewBranch?: boolean;
  newBranchName?: string;
}

export interface CommitResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  branch?: string;
  error?: string;
}

export async function commitReadmeToGitHub(options: CommitOptions): Promise<CommitResult> {
  const { owner, repo, branch, path = 'README.md', message, content, token, author, createNewBranch, newBranchName } = options;

  if (!token) {
    return { success: false, error: 'GitHub Personal Access Token or OAuth token is required.' };
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'README-Architect-Applet',
    'Content-Type': 'application/json',
  };

  try {
    let targetBranch = branch;

    // Optional: create a new branch from current branch ref
    if (createNewBranch && newBranchName) {
      targetBranch = newBranchName.trim();
      // Get ref of base branch
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
      if (!refRes.ok) {
        throw new Error(`Failed to get branch reference for ${branch}`);
      }
      const refData = await refRes.json();
      const baseSha = refData.object.sha;

      // Create new ref
      const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${targetBranch}`,
          sha: baseSha,
        }),
      });

      if (!createRefRes.ok && createRefRes.status !== 422) {
        const createRefErr = await createRefRes.json();
        throw new Error(createRefErr.message || `Failed to create branch ${targetBranch}`);
      }
    }

    // Step 1: Get existing file sha if it exists
    let existingSha: string | undefined;
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${targetBranch}`, {
      headers,
    });

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      existingSha = fileData.sha;
    }

    // Step 2: Encode content in UTF-8 base64
    const base64Content = typeof window !== 'undefined'
      ? btoa(unescape(encodeURIComponent(content)))
      : Buffer.from(content, 'utf-8').toString('base64');

    // Step 3: Put file contents
    const putPayload: Record<string, any> = {
      message: message || 'docs: update README.md via README Architect',
      content: base64Content,
      branch: targetBranch,
    };

    if (existingSha) {
      putPayload.sha = existingSha;
    }

    if (author) {
      putPayload.author = author;
      putPayload.committer = author;
    }

    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putPayload),
    });

    const putData = await putRes.json();
    if (!putRes.ok) {
      return {
        success: false,
        error: putData.message || `GitHub API error: ${putRes.statusText}`,
      };
    }

    return {
      success: true,
      commitSha: putData.commit?.sha,
      commitUrl: putData.commit?.html_url || `https://github.com/${owner}/${repo}/commit/${putData.commit?.sha}`,
      branch: targetBranch,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
