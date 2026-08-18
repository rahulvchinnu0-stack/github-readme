import { NextRequest, NextResponse } from 'next/server';
import { ReadmeValidator } from '@/lib/validator/readmeValidator';
import { ProjectKnowledge } from '@/types/readme';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { markdown, knowledge }: { markdown: string; knowledge: ProjectKnowledge } = body;

    if (!markdown || !knowledge) {
      return NextResponse.json({ error: 'Markdown content and knowledge object are required' }, { status: 400 });
    }

    const validation = ReadmeValidator.validate(markdown, knowledge);
    return NextResponse.json({ success: true, validation });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
