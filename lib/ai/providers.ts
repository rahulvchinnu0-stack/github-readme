import { GoogleGenAI } from '@google/genai';
import {
  AIProviderConfig,
  AIProviderType,
  ProjectKnowledge,
  ReadmeOptions,
  ReadmeStyle,
} from '@/types/readme';

export interface GenerateParams {
  systemPrompt: string;
  prompt: string;
  config: AIProviderConfig;
  temperature?: number;
}

export interface ProviderModelInfo {
  id: string;
  name: string;
  recommended?: boolean;
}

export const PROVIDER_CATALOG: Record<
  AIProviderType,
  {
    name: string;
    description: string;
    defaultModel: string;
    models: ProviderModelInfo[];
    requiresApiKey: boolean;
    requiresEndpoint?: boolean;
    defaultEndpoint?: string;
  }
> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Built-in high performance AI with deep code understanding',
    defaultModel: 'gemini-3.7-flash',
    models: [
      { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash (Fast & Accurate)', recommended: true },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Deep Reasoning)' },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Ultra Low Latency)' },
    ],
    requiresApiKey: false, // Can use server process.env.GEMINI_API_KEY by default!
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT-4o and advanced OpenAI models',
    defaultModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Omni flagship)', recommended: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & cost-effective)' },
      { id: 'o3-mini', name: 'o3-mini (Reasoning model)' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
    requiresApiKey: true,
  },
  anthropic: {
    name: 'Anthropic Claude',
    description: 'Claude 3.7 Sonnet & Haiku models with nuanced technical writing',
    defaultModel: 'claude-3-7-sonnet-20250219',
    models: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', recommended: true },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    ],
    requiresApiKey: true,
  },
  groq: {
    name: 'Groq',
    description: 'Ultra-fast LPU inference for open source models',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', recommended: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B' },
    ],
    requiresApiKey: true,
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Unified gateway to 100+ AI models',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', recommended: true },
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1' },
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
    ],
    requiresApiKey: true,
  },
  deepseek: {
    name: 'DeepSeek',
    description: 'DeepSeek V3 and DeepSeek R1 reasoning models',
    defaultModel: 'deepseek-chat',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3 (Chat)', recommended: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1 (Reasoner)' },
    ],
    requiresApiKey: true,
  },
  mistral: {
    name: 'Mistral AI',
    description: 'Mistral Large, Codestral and specialized developer models',
    defaultModel: 'codestral-latest',
    models: [
      { id: 'codestral-latest', name: 'Codestral (Code Specialist)', recommended: true },
      { id: 'mistral-large-latest', name: 'Mistral Large' },
      { id: 'mistral-small-latest', name: 'Mistral Small' },
    ],
    requiresApiKey: true,
  },
  nvidia: {
    name: 'NVIDIA NIM',
    description: 'NVIDIA accelerated microservices & open source foundation models',
    defaultModel: 'meta/llama-3.3-70b-instruct',
    models: [
      { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', recommended: true },
      { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1' },
      { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2' },
    ],
    requiresApiKey: true,
    defaultEndpoint: 'https://integrate.api.nvidia.com/v1',
  },
  xai: {
    name: 'xAI (Grok)',
    description: 'Grok models by xAI',
    defaultModel: 'grok-2-latest',
    models: [
      { id: 'grok-2-latest', name: 'Grok 2', recommended: true },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision' },
    ],
    requiresApiKey: true,
  },
  ollama: {
    name: 'Ollama (Local / Self-Hosted)',
    description: 'Run locally on your machine or private cluster',
    defaultModel: 'llama3.2',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', recommended: true },
      { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder' },
      { id: 'mistral', name: 'Mistral 7B' },
      { id: 'codellama', name: 'CodeLlama' },
    ],
    requiresApiKey: false,
    requiresEndpoint: true,
    defaultEndpoint: 'http://localhost:11434/v1',
  },
  custom: {
    name: 'Custom OpenAI-Compatible API',
    description: 'Connect any OpenAI-compatible proxy, vLLM, LM Studio, or local endpoint',
    defaultModel: 'default-model',
    models: [{ id: 'custom-model', name: 'Custom Model' }],
    requiresApiKey: false,
    requiresEndpoint: true,
    defaultEndpoint: 'http://localhost:8000/v1',
  },
};

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  provider: 'gemini',
  model: 'gemini-3.7-flash',
  temperature: 0.3,
  maxTokens: 8192,
};

export class AIProviderService {
  /**
   * Tests the connection with the given provider config
   */
  static async testConnection(config: AIProviderConfig): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    model: string;
  }> {
    const startTime = Date.now();
    try {
      const response = await this.generate({
        systemPrompt: 'You are a test ping agent. Reply only with "PONG".',
        prompt: 'PING',
        config,
        temperature: 0.1,
      });

      const latencyMs = Date.now() - startTime;
      if (response && response.length > 0) {
        return {
          success: true,
          latencyMs,
          message: `Connected successfully (${latencyMs}ms)`,
          model: config.model,
        };
      }
      throw new Error('Empty response from model');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        message: `Connection failed: ${msg}`,
        model: config.model,
      };
    }
  }

  /**
   * Main universal generation pipeline
   */
  static async generate(params: GenerateParams): Promise<string> {
    const { systemPrompt, prompt, config, temperature = 0.2 } = params;

    switch (config.provider) {
      case 'gemini':
        return this.generateGemini(systemPrompt, prompt, config, temperature);
      case 'anthropic':
        return this.generateAnthropic(systemPrompt, prompt, config, temperature);
      case 'openai':
      case 'groq':
      case 'openrouter':
      case 'deepseek':
      case 'mistral':
      case 'nvidia':
      case 'xai':
      case 'ollama':
      case 'custom':
        return this.generateOpenAICompatible(systemPrompt, prompt, config, temperature);
      default:
        throw new Error(`Unsupported AI Provider: ${config.provider}`);
    }
  }

  /**
   * Google Gemini Generator via @google/genai SDK
   */
  private static async generateGemini(
    systemPrompt: string,
    prompt: string,
    config: AIProviderConfig,
    temperature: number
  ): Promise<string> {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const modelName = config.model || 'gemini-3.7-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature,
      },
    });

    if (!response.text) {
      throw new Error('No text returned from Gemini model');
    }

    return response.text;
  }

  /**
   * Anthropic Claude Generator
   */
  private static async generateAnthropic(
    systemPrompt: string,
    prompt: string,
    config: AIProviderConfig,
    temperature: number
  ): Promise<string> {
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-7-sonnet-20250219',
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text;
    if (!content) {
      throw new Error('No text returned from Claude');
    }
    return content;
  }

  /**
   * OpenAI / OpenAI-Compatible (Groq, OpenRouter, DeepSeek, Mistral, NVIDIA, Ollama, Custom)
   */
  private static async generateOpenAICompatible(
    systemPrompt: string,
    prompt: string,
    config: AIProviderConfig,
    temperature: number
  ): Promise<string> {
    let endpoint = 'https://api.openai.com/v1';
    let authHeader = `Bearer ${config.apiKey}`;
    const extraHeaders: Record<string, string> = {};

    switch (config.provider) {
      case 'groq':
        endpoint = 'https://api.groq.com/openai/v1';
        break;
      case 'openrouter':
        endpoint = 'https://openrouter.ai/api/v1';
        extraHeaders['HTTP-Referer'] = 'https://ai-github-readme-generator.local';
        extraHeaders['X-Title'] = 'AI GitHub README Generator';
        break;
      case 'deepseek':
        endpoint = 'https://api.deepseek.com/v1';
        break;
      case 'mistral':
        endpoint = 'https://api.mistral.ai/v1';
        break;
      case 'nvidia':
        endpoint = config.endpoint || 'https://integrate.api.nvidia.com/v1';
        break;
      case 'xai':
        endpoint = 'https://api.x.ai/v1';
        break;
      case 'ollama':
        endpoint = (config.endpoint || 'http://localhost:11434/v1').replace(/\/$/, '');
        if (!config.apiKey) authHeader = 'Bearer ollama';
        break;
      case 'custom':
        endpoint = (config.endpoint || 'http://localhost:8000/v1').replace(/\/$/, '');
        break;
    }

    if (config.provider !== 'ollama' && config.provider !== 'custom' && !config.apiKey) {
      throw new Error(`API key required for ${config.provider}`);
    }

    const url = `${endpoint}/chat/completions`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${config.provider.toUpperCase()} API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`No content returned from ${config.provider}`);
    }
    return content;
  }
}

/**
 * Builds the strict, anti-hallucination prompt given repository knowledge and style options
 */
export function buildReadmePrompt(knowledge: ProjectKnowledge, options: ReadmeOptions): {
  systemPrompt: string;
  userPrompt: string;
} {
  const { project, languages, frameworks, dependencies, scripts, environment_variables, database, authentication, testing, deployment, screenshots, license, architecture, repository_structure } = knowledge;

  const styleGuides: Record<ReadmeStyle, string> = {
    professional: `
STYLE: PROFESSIONAL (High-credibility developer documentation)
- Structure: Clear H1/H2 hierarchy, concise overview paragraph, tech stack list or table, clean badges, step-by-step Prerequisites -> Installation -> Quick Start -> Configuration -> Contributing -> License.
- Tone: Crisp, technical, objective, developer-focused.
- Formatting: Clean Markdown tables for env vars and scripts, standard copyable bash code blocks.
`,
    modern: `
STYLE: MODERN (Visually engaging, modern SaaS-grade documentation)
- Structure: Vibrant Shields.io tech stack badges, feature cards, sleek callout boxes (> [!NOTE], > [!TIP]), clear interactive quick-start guide, expandable details for advanced config.
- Badges: Colorful shields for languages, frameworks, license, build status.
- Tone: High-energy, polished, welcoming yet deeply technical.
`,
    animated: `
STYLE: ANIMATED & VISUAL (Dynamic elements & visual assets)
- Structure: Includes dynamic typing SVG header or ASCII artwork banner, animated terminal mockup in code blocks, badge clusters.
- Media: Incorporates verified screenshots/media from repository if available.
- Visual elements: Clean formatting with visual hierarchy and status indicators.
`,
    creative: `
STYLE: CREATIVE (Distinctive identity while 100% technically faithful)
- Structure: Custom styled ASCII header or brand typography block, distinctive section dividers, interactive feeling layout.
- Tone: Distinctive, memorable, technical and strictly factual.
`,
    minimal: `
STYLE: MINIMAL (Streamlined, zero-fluff, fast reference)
- Structure: Compact project overview in 2 sentences, 1-line installation, exact commands reference table, direct environment variable table.
- Tone: Hyper-concise, zero unnecessary commentary, strictly high-density facts and commands.
`,
    enterprise: `
STYLE: ENTERPRISE (Rigorous architecture, compliance & governance)
- Structure: Executive summary, Architectural Overview (with ASCII or Mermaid component topology), Security & Compliance posture, Prerequisites, Production Deployment guide, Governance & Contributing standard.
- Tone: Formal, precise, enterprise-ready.
`,
  };

  const systemPrompt = `You are the world's most rigorous, precision-engineered GitHub Documentation Architect.
Your task is to generate a comprehensive, flawless, production-grade README.md file for the verified repository.

==================== CRITICAL DIRECTIVE: ZERO HALLUCINATION MANDATE ====================
1. You MUST ONLY document technologies, dependencies, commands, environment variables, APIs, and features that exist in the provided VERIFIED KNOWLEDGE OBJECT.
2. NEVER INVENT or assume:
   - Database engines (e.g. do NOT write MongoDB or PostgreSQL unless explicitly in the verified knowledge).
   - Authentication providers (e.g. do NOT write Auth0 or Clerk unless in the verified knowledge).
   - Package manager commands (use ONLY the verified package managers and exact scripts from package.json/Makefile/Cargo.toml).
   - Environment variables (document ONLY the verified environment variables).
   - APIs or SDKs (document ONLY verified endpoints and SDKs).
   - Screenshots or external images (use ONLY verified screenshot paths provided).
3. If an item is unknown, either state it simply or omit the unverified section.
4. Output ONLY clean, valid, standard Markdown. Do not wrap the entire output in markdown code fences (\`\`\`markdown ... \`\`\`). Output the raw README markdown directly.
5. All code blocks must specify their language tag (e.g. \`\`\`bash, \`\`\`typescript, \`\`\`json, \`\`\`mermaid).
========================================================================================`;

  const sectionsToInclude: string[] = [];
  const s = options.sections;
  if (s.badges) sectionsToInclude.push('Badges (Shields.io status, license, tech stack)');
  if (s.overview) sectionsToInclude.push('Project Overview & Value Proposition');
  if (s.features) sectionsToInclude.push('Key Verified Features');
  if (s.screenshots && screenshots.length > 0) sectionsToInclude.push('Screenshots / Media (using verified URLs)');
  if (s.quickstart || s.installation) sectionsToInclude.push('Prerequisites & Step-by-Step Installation (using exact verified scripts)');
  if (s.usage) sectionsToInclude.push('Usage & Execution Commands');
  if (s.envVars && environment_variables.length > 0) sectionsToInclude.push('Environment Variables (Complete markdown table of verified vars)');
  if (s.database && database.length > 0) sectionsToInclude.push('Database & Persistence');
  if (s.apiDocs && knowledge.api_routes.length > 0) sectionsToInclude.push('API Endpoints');
  if (s.architecture) sectionsToInclude.push('Architecture & System Design' + (options.includeMermaidDiagram ? ' (with Mermaid diagram)' : ''));
  if (s.projectStructure && options.includeTreeDiagram) sectionsToInclude.push('Repository Structure (Directory tree)');
  if (s.testing && testing.length > 0) sectionsToInclude.push('Testing & Quality');
  if (s.deployment && deployment.length > 0) sectionsToInclude.push('Deployment');
  if (s.contributing) sectionsToInclude.push('Contributing Guidelines');
  if (s.faq) sectionsToInclude.push('Frequently Asked Questions');
  if (s.license && license) sectionsToInclude.push(`License (${license.name})`);

  const userPrompt = `
Generate a complete, production-ready README.md for the following repository based STRICTLY on this verified data:

--- VERIFIED REPOSITORY KNOWLEDGE ---
Project: ${project.fullName} (${project.htmlUrl})
Description: ${project.description || 'N/A'}
Primary Language: ${project.language}
Languages breakdown: ${languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}
Default Branch: ${project.defaultBranch}
Stars: ${project.stars} | Forks: ${project.forks} | License: ${project.license || 'None detected'}

DETECTED FRAMEWORKS & STACK:
${frameworks.map((f) => `- ${f.name} [${f.category}] (Confidence: ${f.confidence}%, from: ${f.detectedFrom})`).join('\n') || 'None detected'}

CORE DEPENDENCIES:
${dependencies.slice(0, 30).map((d) => `- ${d.name} (${d.version || 'latest'}) [${d.ecosystem}]`).join('\n') || 'None detected'}

VERIFIED RUNNABLE SCRIPTS:
${scripts.map((sc) => `- \`${sc.command}\`: ${sc.description || sc.name} (Source: ${sc.sourceFile})`).join('\n') || 'None detected'}

VERIFIED ENVIRONMENT VARIABLES:
${environment_variables.map((ev) => `- \`${ev.name}\` (Required: ${ev.required}, Default: "${ev.defaultValue || ''}"): ${ev.description || ''}`).join('\n') || 'None specified'}

DATABASE & PERSISTENCE:
${database.map((db) => `- ${db.type} (ORM: ${db.orm || 'None'}, Source: ${db.sourceFile})`).join('\n') || 'None detected'}

AUTHENTICATION:
${authentication.map((a) => `- ${a.provider} (${a.method}, Source: ${a.sourceFile})`).join('\n') || 'None detected'}

TESTING SUITE:
${testing.map((t) => `- ${t.framework} (Command: \`${t.testCommand || ''}\`, Test files count: ${t.testFilesCount})`).join('\n') || 'None detected'}

DEPLOYMENT:
${deployment.map((dp) => `- ${dp.platform} (Dockerized: ${dp.dockerized}${dp.sourceFile ? `, Config: ${dp.sourceFile}` : ''})`).join('\n') || 'None detected'}

API ROUTES:
${knowledge.api_routes.map((ar) => `- ${ar.method} ${ar.path} (${ar.sourceFile})`).join('\n') || 'None detected'}

VERIFIED SCREENSHOTS:
${screenshots.map((sc) => `- ![${sc.alt}](${sc.url}) (${sc.path})`).join('\n') || 'No verified screenshots in repo'}

ARCHITECTURE & DIRECTORY TREE:
Pattern: ${architecture.pattern}
Key Directories:
${architecture.keyDirectories.map((kd) => `- \`${kd.path}\`: ${kd.purpose}`).join('\n')}
Directory Tree:
\`\`\`
${repository_structure.fileTreeSummary}
\`\`\`

--- USER PREFERENCES & CONFIGURATION ---
${styleGuides[options.style]}
Tone: ${options.tone}
Language: ${options.language || 'English'}
Badge Level: ${options.badgeLevel} (Badge Style: ${options.badgeStyle})
Requested Sections:
${sectionsToInclude.map((sec) => `[✓] ${sec}`).join('\n')}

${options.customInstructions ? `Special User Instructions: ${options.customInstructions}` : ''}

Generate the final README.md now. Start immediately with the top-level Markdown title or banner.`;

  return { systemPrompt, userPrompt };
}

/**
 * Builds prompt for targeted section transformations (improve, make professional, add diagram, simplify, fix accuracy)
 */
export function buildTransformPrompt(
  currentMarkdown: string,
  instruction: string,
  actionType: 'improve' | 'make_professional' | 'make_creative' | 'add_animations' | 'simplify' | 'fix_accuracy' | 'add_mermaid' | 'custom',
  knowledge: ProjectKnowledge
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a precision Markdown editor and technical documentation improver.
Your job is to apply the requested transformation to the provided README.md content.
Maintain 100% technical truthfulness based on the repository knowledge.
Do NOT invent fake features, fake environment variables, or fake commands.
Output ONLY the updated Markdown content without code wrappers around the entire document.`;

  let actionDesc = instruction;
  switch (actionType) {
    case 'make_professional':
      actionDesc = 'Refactor the Markdown to follow high-standard professional developer documentation standards with clean tables, clear prerequisites, and crisp typography.';
      break;
    case 'make_creative':
      actionDesc = 'Enhance the visual composition, add stylized section dividers, aesthetic formatting, and engaging structure while keeping technical commands exact.';
      break;
    case 'add_animations':
      actionDesc = 'Add animated banner elements, interactive-looking terminal execution boxes, and modern badge clusters.';
      break;
    case 'simplify':
      actionDesc = 'Condense and streamline the README: remove unnecessary fluff, prioritize direct commands, and create a high-density quick reference.';
      break;
    case 'fix_accuracy':
      actionDesc = 'Review and strictly correct any inaccurate commands, dependencies, or environment variables to match the verified repository data exactly.';
      break;
    case 'add_mermaid':
      actionDesc = 'Generate and inject a clean, accurate Mermaid diagram (\`\`\`mermaid ... \`\`\`) representing the verified system architecture and workflow.';
      break;
  }

  const userPrompt = `
TRANSFORMATION TASK: ${actionDesc}

--- VERIFIED REPOSITORY CONTEXT ---
Repository: ${knowledge.project.fullName}
Stack: ${knowledge.frameworks.map((f) => f.name).join(', ')} (${knowledge.project.language})
Scripts: ${knowledge.scripts.map((s) => s.command).join(', ')}
Env Vars: ${knowledge.environment_variables.map((e) => e.name).join(', ')}
Database: ${knowledge.database.map((d) => d.type).join(', ')}

--- CURRENT MARKDOWN ---
${currentMarkdown}

Apply the transformation and return the updated Markdown now:`;

  return { systemPrompt, userPrompt };
}
