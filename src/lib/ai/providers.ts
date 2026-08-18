import { AIProviderConfig, AIProviderType } from '@/src/types/readme';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  provider: AIProviderType;
  recommended?: boolean;
  contextWindow?: string;
}

export const AVAILABLE_MODELS: Record<AIProviderType, ModelOption[]> = {
  nvidia: [
    {
      id: 'meta/muse-glimmer-30b',
      name: 'NVIDIA Muse Glimmer 30B',
      description: 'High-speed instruction tuned model on NVIDIA integrate platform',
      provider: 'nvidia',
      recommended: true,
      contextWindow: '8k tokens',
    },
    {
      id: 'meta/llama-3.3-70b-instruct',
      name: 'NVIDIA Llama 3.3 70B Instruct',
      description: 'Deep architectural reasoning and codebase markdown synthesis',
      provider: 'nvidia',
      contextWindow: '128k tokens',
    },
    {
      id: 'mistralai/mistral-large-2-instruct',
      name: 'NVIDIA Mistral Large 2',
      description: 'Advanced multilingual and codebase reasoning',
      provider: 'nvidia',
      contextWindow: '128k tokens',
    },
  ],
  gemini: [
    {
      id: 'gemini-3.7-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Ultra-fast, high-precision developer reasoning & markdown synthesis',
      provider: 'gemini',
      recommended: true,
      contextWindow: '1M tokens',
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 2.5 Pro',
      description: 'Deep architectural reasoning, extensive AST analysis & Mermaid generation',
      provider: 'gemini',
      contextWindow: '2M tokens',
    },
  ],
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'OpenAI flagship multimodal reasoning model',
      provider: 'openai',
      recommended: true,
      contextWindow: '128k tokens',
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Fast, cost-effective model for concise documentation',
      provider: 'openai',
      contextWindow: '128k tokens',
    },
  ],
  anthropic: [
    {
      id: 'claude-3-5-sonnet-latest',
      name: 'Claude 3.5 Sonnet',
      description: 'State-of-the-art code understanding and structured markdown',
      provider: 'anthropic',
      recommended: true,
      contextWindow: '200k tokens',
    },
  ],
  deepseek: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek V3',
      description: 'Open-weight developer intelligence model',
      provider: 'deepseek',
      contextWindow: '64k tokens',
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      description: 'Specialized for repository structure and script analysis',
      provider: 'deepseek',
      contextWindow: '64k tokens',
    },
  ],
  ollama: [
    {
      id: 'llama3.3:70b',
      name: 'Llama 3.3 70B (Local)',
      description: 'Local Ollama endpoint for private on-premise repos',
      provider: 'ollama',
      contextWindow: '128k tokens',
    },
    {
      id: 'qwen2.5-coder:32b',
      name: 'Qwen 2.5 Coder 32B (Local)',
      description: 'Local coding intelligence for offline repos',
      provider: 'ollama',
      contextWindow: '32k tokens',
    },
  ],
  custom: [
    {
      id: 'custom-model',
      name: 'Custom OpenAI-Compatible API',
      description: 'OpenRouter, vLLM, LiteLLM, or self-hosted proxy',
      provider: 'custom',
      contextWindow: 'Configurable',
    },
  ],
};

export const NVIDIA_DEFAULT_ENDPOINT = 'https://integrate.api.nvidia.com/v1';
export const NVIDIA_DEFAULT_MODEL = 'meta/muse-glimmer-30b';

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  provider: 'nvidia',
  model: NVIDIA_DEFAULT_MODEL,
  endpoint: NVIDIA_DEFAULT_ENDPOINT,
  temperature: 1,
  maxTokens: 8192,
};
