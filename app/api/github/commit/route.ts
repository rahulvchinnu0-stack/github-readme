import { NextRequest, NextResponse } from 'next/server';
import { commitReadmeToGitHub } from '@/lib/github/export';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, branch, markdown, commitMessage, token } = body;

    if (!owner || !repo || !markdown) {
      return NextResponse.json(
        { error: 'Missing required parameters: owner, repo, or markdown' },
        { status: 400 }
      );
    }

    const authToken = token || process.env.GITHUB_TOKEN;
    if (!authToken) {
      return NextResponse.json(
        { error: 'GitHub authorization token is required to commit. Please connect GitHub or provide a token.' },
        { status: 401 }
      );
    }

    const result = await commitReadmeToGitHub({
      owner,
      repo,
      branch: branch || 'main',
      markdown,
      commitMessage: commitMessage || 'docs: update README.md via AI GitHub README Generator',
      token: authToken,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to commit to GitHub' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
