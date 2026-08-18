import { NextRequest, NextResponse } from 'next/server';
import { GitHubAnalyzer, parseGitHubUrl } from '@/lib/github/analyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, branch, token } = body;

    if (!url) {
      return NextResponse.json({ error: 'Repository URL or identifier is required' }, { status: 400 });
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed.isValid) {
      return NextResponse.json({ error: parsed.error || 'Invalid GitHub repository format' }, { status: 400 });
    }

    const analyzer = new GitHubAnalyzer(token);
    const knowledge = await analyzer.analyzeRepository(
      parsed.owner,
      parsed.repo,
      branch || parsed.branch
    );

    return NextResponse.json({ success: true, knowledge });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
