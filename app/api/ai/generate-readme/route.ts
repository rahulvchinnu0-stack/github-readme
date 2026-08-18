import { NextRequest, NextResponse } from 'next/server';
import { AIProviderService, buildReadmePrompt } from '@/lib/ai/providers';
import { ReadmeValidator } from '@/lib/validator/readmeValidator';
import { ProjectKnowledge, ReadmeOptions, AIProviderConfig } from '@/types/readme';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      knowledge,
      options,
      config,
    }: {
      knowledge: ProjectKnowledge;
      options: ReadmeOptions;
      config: AIProviderConfig;
    } = body;

    if (!knowledge || !options || !config) {
      return NextResponse.json(
        { error: 'Missing required parameters: knowledge, options, or provider config' },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt } = buildReadmePrompt(knowledge, options);

    let generatedMarkdown = await AIProviderService.generate({
      systemPrompt,
      prompt: userPrompt,
      config,
      temperature: 0.25,
    });

    // Clean any accidental wrap-around code fences if the model emitted ```markdown ... ```
    generatedMarkdown = generatedMarkdown.trim();
    if (generatedMarkdown.startsWith('```markdown') && generatedMarkdown.endsWith('```')) {
      generatedMarkdown = generatedMarkdown.slice(11, -3).trim();
    } else if (generatedMarkdown.startsWith('```md') && generatedMarkdown.endsWith('```')) {
      generatedMarkdown = generatedMarkdown.slice(5, -3).trim();
    } else if (generatedMarkdown.startsWith('```') && generatedMarkdown.endsWith('```') && !generatedMarkdown.includes('\n#')) {
      generatedMarkdown = generatedMarkdown.slice(3, -3).trim();
    }

    // Run Quality & Anti-Hallucination validation pass
    const validation = ReadmeValidator.validate(generatedMarkdown, knowledge);

    return NextResponse.json({
      success: true,
      markdown: generatedMarkdown,
      validation,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
