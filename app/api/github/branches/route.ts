import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, token } = body;

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'AI-GitHub-Readme-Generator',
    };
    const authToken = token || process.env.GITHUB_TOKEN;
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=50`, {
      headers,
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch branches' }, { status: res.status });
    }

    const data = await res.json();
    const branches = Array.isArray(data) ? data.map((b: { name: string }) => b.name) : [];

    return NextResponse.json({ branches });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
