import { ProjectKnowledge, ReadmeOptions, AIProviderConfig } from '@/src/types/readme';
import { buildReadmePrompt } from './gemini';

const DEFAULT_NVIDIA_KEY = process.env.NVIDIA_API_KEY || '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';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export async function generateReadmeWithNvidia(
  knowledge: ProjectKnowledge,
  options: ReadmeOptions,
  config?: AIProviderConfig
): Promise<string> {
  const apiKey = config?.apiKey || DEFAULT_NVIDIA_KEY;
  const baseUrl = config?.endpoint || NVIDIA_BASE_URL;
  const model = config?.model || 'meta/muse-glimmer-30b';
  const prompt = buildReadmePrompt(knowledge, options);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: config?.temperature ?? 1,
      top_p: 0.95,
      max_tokens: config?.maxTokens ?? 8192,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';

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

export async function transformReadmeWithNvidia(
  actionType: string,
  currentMarkdown: string,
  knowledge: ProjectKnowledge,
  config?: AIProviderConfig,
  customInstruction?: string
): Promise<string> {
  const apiKey = config?.apiKey || DEFAULT_NVIDIA_KEY;
  const baseUrl = config?.endpoint || NVIDIA_BASE_URL;
  const model = config?.model || 'meta/muse-glimmer-30b';
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

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: config?.temperature ?? 1,
      top_p: 0.95,
      max_tokens: config?.maxTokens ?? 8192,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';

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
