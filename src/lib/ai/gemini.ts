import { GoogleGenAI } from '@google/genai';
import { ProjectKnowledge, ReadmeOptions, AIProviderConfig } from '@/src/types/readme';

export function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment or secrets.');
  }

  return new GoogleGenAI({ apiKey });
}

export function resolveGeminiModel(model?: string): string {
  if (model && (model.startsWith('gemini-') || model.startsWith('models/gemini-'))) {
    return model;
  }
  return 'gemini-2.5-flash';
}

export function buildReadmePrompt(knowledge: ProjectKnowledge, options: ReadmeOptions): string {
  const { project, languages, techStack, manifest, scripts, envVariables, docker, ciWorkflows, treeStructureText } = knowledge;
  const pm = manifest?.packageManager || 'npm';

  return `You are a world-class principal software architect and open-source documentation engineer.
Your mission is to write a production-ready, beautiful, high-precision GitHub README.md for the repository "${project.fullName}".

STRICT ANTI-HALLUCINATION GROUND RULES:
1. ONLY reference real package scripts found in the manifest: ${JSON.stringify(scripts)}.
2. Use the verified package manager: "${pm}". Do NOT invent non-existent commands.
3. ONLY document true environment variables from the codebase: ${JSON.stringify(envVariables.map((e) => e.key))}.
4. Accurately reflect the repository's languages: ${languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}.
5. Accurately represent the verified tech stack: ${techStack.map((s) => s.name).join(', ')}.
6. If Docker is present (${docker.hasDockerfile}), provide accurate docker commands.

README SPECIFICATIONS:
- Style: ${options.style} (e.g. modern, minimal, enterprise, creative, animated, cli, comprehensive)
- Tone: ${options.tone}
- Output Language: ${options.language || 'English'}
- Badge Style: ${options.badgeStyle} (e.g. flat-square, for-the-badge)
- Primary Badge Color: ${options.primaryBadgeColor || '2563EB'}
- Include Mermaid Architecture Diagram: ${options.includeMermaidDiagram ? 'YES (include valid ```mermaid flowchart or sequence diagram)' : 'NO'}
- Include Directory Structure Tree: ${options.includeTreeDiagram ? 'YES' : 'NO'}

SECTIONS TO INCLUDE (strictly follow what is enabled):
${Object.entries(options.sections)
  .filter(([, enabled]) => enabled)
  .map(([sec]) => `- ${sec}`)
  .join('\n')}

REPOSITORY GROUND TRUTH DATA:
- Full Name: ${project.fullName}
- Description: ${project.description}
- Default Branch: ${project.defaultBranch}
- Stars: ${project.stars}, Forks: ${project.forks}, License: ${project.license}
- Dependencies: ${Object.keys(manifest?.dependencies || {}).join(', ')}
- Directory Structure:
\`\`\`
${treeStructureText}
\`\`\`

CUSTOM USER INSTRUCTIONS:
${options.customInstructions || 'None'}

OUTPUT FORMAT:
Return ONLY the raw, pure Markdown content of the README. Do NOT wrap the entire output in triple backticks. Start directly with the title / badges.`;
}

export async function generateReadmeWithAI(
  knowledge: ProjectKnowledge,
  options: ReadmeOptions,
  config?: AIProviderConfig
): Promise<string> {
  const modelName = resolveGeminiModel(config?.model);
  const ai = getGeminiClient(config?.apiKey);

  const prompt = buildReadmePrompt(knowledge, options);

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: config?.temperature ?? 0.3,
    },
  });

  const rawText = response.text || '';
  // Clean up any leading/trailing ```markdown fences if the model output them
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```markdown')) {
    cleaned = cleaned.replace(/^```markdown\n/, '').replace(/\n```$/, '');
  } else if (cleaned.startsWith('```md')) {
    cleaned = cleaned.replace(/^```md\n/, '').replace(/\n```$/, '');
  } else if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  return cleaned;
}

export async function transformReadmeSectionWithAI(
  actionType: string,
  currentMarkdown: string,
  knowledge: ProjectKnowledge,
  config?: AIProviderConfig,
  customInstruction?: string
): Promise<string> {
  const modelName = resolveGeminiModel(config?.model);
  const ai = getGeminiClient(config?.apiKey);

  const pm = knowledge.manifest?.packageManager || 'npm';

  let actionDirective = '';
  switch (actionType) {
    case 'enhance-diagram':
      actionDirective = 'Add or upgrade the Mermaid.js architecture flowchart diagram with high-precision components, data flows, and subsystem boundaries.';
      break;
    case 'add-quickstart':
      actionDirective = `Ensure an infallible, copy-paste Quickstart section with verified package manager (${pm}) and real script commands (${JSON.stringify(knowledge.scripts)}).`;
      break;
    case 'add-troubleshooting':
      actionDirective = 'Add a comprehensive Troubleshooting & Common Pitfalls section covering port collisions, missing environment variables, and build caching.';
      break;
    case 'add-benchmarks':
      actionDirective = 'Add an elegant Markdown comparison and feature benchmark table.';
      break;
    case 'shorten':
      actionDirective = 'Condense and tighten the README: remove conversational filler while preserving all code snippets, commands, tables, and architectural details.';
      break;
    case 'contributing':
      actionDirective = 'Add a polished Contributing section outlining branch naming, conventional commits (feat:, fix:), and PR guidelines.';
      break;
    case 'custom':
      actionDirective = `Apply the following custom instruction: "${customInstruction || 'Improve clarity and presentation'}".`;
      break;
    default:
      actionDirective = 'Refine and polish the README markdown.';
  }

  const prompt = `You are editing an existing GitHub README.md for the repository "${knowledge.project.fullName}".

CURRENT README MARKDOWN:
\`\`\`markdown
${currentMarkdown}
\`\`\`

MODIFICATION GOAL:
${actionDirective}

CODEBASE FACTS (Do not hallucinate outside these):
- Package Manager: ${pm}
- Real Scripts: ${JSON.stringify(knowledge.scripts)}
- Environment Variables: ${JSON.stringify(knowledge.envVariables.map((e) => e.key))}

INSTRUCTIONS:
Return the complete, updated README.md in pure raw markdown format. Do NOT wrap the entire output in outer \`\`\`markdown backticks.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: config?.temperature ?? 0.3,
    },
  });

  const rawText = response.text || '';
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```markdown')) {
    cleaned = cleaned.replace(/^```markdown\n/, '').replace(/\n```$/, '');
  } else if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  return cleaned;
}
