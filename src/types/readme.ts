export type ReadmeStyle =
  | 'modern'
  | 'minimal'
  | 'enterprise'
  | 'creative'
  | 'animated'
  | 'cli'
  | 'comprehensive';

export type BadgeStyle =
  | 'flat'
  | 'flat-square'
  | 'plastic'
  | 'for-the-badge'
  | 'social';

export type ReadmeTone = 'developer' | 'executive' | 'playful' | 'concise';

export type AIProviderType =
  | 'nvidia'
  | 'gemini'
  | 'openai'
  | 'anthropic'
  | 'deepseek'
  | 'ollama'
  | 'custom';

export interface AIProviderConfig {
  provider: AIProviderType;
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface RepositoryInfo {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  currentBranch?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  license?: string;
  topics?: string[];
  isPrivate?: boolean;
  homepageUrl?: string;
  avatarUrl?: string;
  htmlUrl: string;
}

export interface DetectedLanguage {
  name: string;
  percentage: number;
  bytes: number;
  color?: string;
}

export interface TechStackItem {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devtools' | 'testing' | 'cloud' | 'styling' | 'other';
  version?: string;
  purpose?: string;
  icon?: string;
}

export interface ManifestData {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  type?: string;
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'cargo' | 'pip' | 'poetry' | 'go' | 'maven' | 'gradle' | 'composer' | 'unknown';
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  rawType?: string;
}

export interface EnvVariableInfo {
  key: string;
  exampleValue?: string;
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
}

export interface DockerInfo {
  hasDockerfile: boolean;
  hasDockerCompose: boolean;
  baseImage?: string;
  exposedPorts?: number[];
  services?: string[];
  composeContent?: string;
}

export interface CIWorkflowInfo {
  name: string;
  path: string;
  triggers: string[];
  jobs: string[];
}

export interface FileTreeItem {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  summary?: string;
}

export interface VerificationCheck {
  id: string;
  title: string;
  category: 'scripts' | 'dependencies' | 'env' | 'install' | 'diagram' | 'general';
  passed: boolean;
  detail: string;
  sourceFact?: string;
  foundInMarkdown?: string;
}

export interface FlaggedDiscrepancy {
  id: string;
  severity: 'warning' | 'error' | 'info';
  issue: string;
  codebaseFact: string;
  readmeClaim: string;
  suggestedFix: string;
}

export interface VerificationReport {
  truthfulnessScore: number; // 0 - 100
  verifiedScore?: number;
  totalChecks: number;
  passedChecksCount: number;
  checks: VerificationCheck[];
  checksPassed?: string[];
  discrepancies: FlaggedDiscrepancy[];
  warnings?: string[];
  summary: string;
}

export type ReadmeVerification = VerificationReport;

export interface ValidationItem {
  id: string;
  type: 'pass' | 'warning' | 'error';
  message: string;
  context?: string;
}

export interface ValidationResult {
  score: number;
  items: ValidationItem[];
  verifiedAt: number;
  summary: string;
}

export interface ProjectKnowledge {
  project: RepositoryInfo;
  languages: DetectedLanguage[];
  techStack: TechStackItem[];
  manifest?: ManifestData;
  scripts: Record<string, string>;
  envVariables: EnvVariableInfo[];
  docker: DockerInfo;
  ciWorkflows: CIWorkflowInfo[];
  fileTree: FileTreeItem[];
  treeStructureText: string;
  keyFilesContent?: Record<string, string>;
  architectureSummary: string;
  verification: VerificationReport;
  ingestedAt: number;
}

export interface ReadmeSectionConfig {
  overview: boolean;
  features: boolean;
  badges: boolean;
  quickstart: boolean;
  installation: boolean;
  usage: boolean;
  configuration: boolean;
  envVars: boolean;
  apiDocs: boolean;
  architecture: boolean;
  projectStructure: boolean;
  database: boolean;
  testing: boolean;
  deployment: boolean;
  screenshots: boolean;
  contributing: boolean;
  faq: boolean;
  license: boolean;
  acknowledgements: boolean;
}

export interface ReadmeOptions {
  style: ReadmeStyle;
  badgeStyle: BadgeStyle;
  animationLevel: 'none' | 'subtle' | 'rich';
  tone: ReadmeTone;
  language: string;
  sections: ReadmeSectionConfig;
  includeMermaidDiagram: boolean;
  includeTreeDiagram: boolean;
  primaryBadgeColor?: string;
  accentColor?: string;
  logoUrl?: string;
  customInstructions?: string;
  authorName?: string;
  authorUrl?: string;
}

export const DEFAULT_README_OPTIONS: ReadmeOptions = {
  style: 'comprehensive',
  badgeStyle: 'flat-square',
  animationLevel: 'subtle',
  tone: 'developer',
  language: 'English',
  sections: {
    overview: true,
    features: true,
    badges: true,
    quickstart: true,
    installation: true,
    usage: true,
    configuration: true,
    envVars: true,
    apiDocs: true,
    architecture: true,
    projectStructure: true,
    database: false,
    testing: true,
    deployment: true,
    screenshots: false,
    contributing: true,
    faq: false,
    license: true,
    acknowledgements: false,
  },
  includeMermaidDiagram: true,
  includeTreeDiagram: true,
  primaryBadgeColor: '2563EB',
};

export interface ReadmeVersion {
  id: string;
  timestamp: number;
  markdown: string;
  style: ReadmeStyle;
  label?: string;
  score?: number;
  versionNumber?: number;
  title?: string;
  createdAt?: string;
  validation?: ValidationResult;
  modelUsed?: string;
  promptNote?: string;
}

export interface GitHubUserRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  forks: number;
  language: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  updatedAt: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  avatarUrl: string;
  htmlUrl: string;
  email?: string;
  accessToken?: string;
  bio?: string;
  publicRepos?: number;
  followers?: number;
  location?: string;
  company?: string;
  recentRepos?: GitHubUserRepo[];
}

export interface SavedProjectItem {
  id: string;
  knowledge: ProjectKnowledge;
  markdown: string;
  options: ReadmeOptions;
  lastUpdated: number;
}
