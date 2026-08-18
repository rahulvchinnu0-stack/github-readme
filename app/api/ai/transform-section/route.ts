import { NextRequest, NextResponse } from 'next/server';
import { AIProviderService, buildTransformPrompt } from '@/lib/ai/providers';
import { ProjectKnowledge, AIProviderConfig } from '@/types/readme';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      currentMarkdown,
      instruction,
      actionType,
      knowledge,
      config,
    }: {
      currentMarkdown: string;
      instruction: string;
      actionType: 'improve' | 'make_professional' | 'make_creative' | 'add_animations' | 'simplify' | 'fix_accuracy' | 'add_mermaid' | 'custom';
      knowledge: ProjectKnowledge;
      config: AIProviderConfig;
    } = body;

    if (!currentMarkdown || !knowledge || !config) {
      return NextResponse.json(
        { error: 'Missing required parameters: currentMarkdown, knowledge, or config' },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildTransformPrompt(
      currentMarkdown,
      instruction || '',
      actionType || 'custom',
      knowledge
    );

    let transformedMarkdown = await AIProviderService.generate({
      systemPrompt,
      prompt: userPrompt,
      config,
      temperature: 0.2,
    });

    transformedMarkdown = transformedMarkdown.trim();
    if (transformedMarkdown.startsWith('```markdown') && transformedMarkdown.endsWith('```')) {
      transformedMarkdown = transformedMarkdown.slice(11, -3).trim();
    } else if (transformedMarkdown.startsWith('```md') && transformedMarkdown.endsWith('```')) {
      transformedMarkdown = transformedMarkdown.slice(5, -3).trim();
    }

    return NextResponse.json({
      success: true,
      markdown: transformedMarkdown,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
