export type ReadmeStyle = 
  | 'professional'
  | 'modern'
  | 'animated'
  | 'creative'
  | 'minimal'
  | 'enterprise'
  | 'comprehensive';

export type AIProviderType =
  | 'gemini'
  | 'openai'
  | 'anthropic'
  | 'groq'
  | 'openrouter'
  | 'nvidia'
  | 'mistral'
  | 'deepseek'
  | 'xai'
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
  defaultBranch: string;
  currentBranch: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language: string;
  topics: string[];
  isPrivate: boolean;
  license: string | null;
  htmlUrl: string;
  avatarUrl: string;
  updatedAt: string;
  createdAt: string;
}

export interface DetectedLanguage {
  name: string;
  percentage: number;
  bytes: number;
  color?: string;
}

export interface DetectedFramework {
  name: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'desktop' | 'ai/ml' | 'styling' | 'tooling' | 'database' | 'other';
  version?: string;
  confidence: number;
  detectedFrom: string;
}

export interface DetectedDependency {
  name: string;
  version?: string;
  type: 'runtime' | 'dev' | 'peer';
  ecosystem: 'npm' | 'pypi' | 'cargo' | 'go' | 'composer' | 'maven' | 'nuget' | 'gem' | 'other';
  description?: string;
}

export interface DetectedScript {
  name: string;
  command: string;
  description?: string;
  category: 'dev' | 'build' | 'test' | 'lint' | 'start' | 'deploy' | 'format' | 'other';
  sourceFile: string;
}

export interface DetectedFeature {
  title: string;
  description: string;
  evidenceFile: string;
  confidence: 'high' | 'medium' | 'inferred';
}

export interface DetectedAPIRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ALL' | 'WS';
  handler?: string;
  sourceFile: string;
  description?: string;
  params?: string[];
}

export interface DetectedDatabase {
  type: string;
  orm?: string;
  models?: string[];
  sourceFile: string;
}

export interface DetectedAuth {
  provider: string;
  method: string;
  sourceFile: string;
}

export interface DetectedEnvVar {
  name: string;
  defaultValue?: string;
  required: boolean;
  description?: string;
  sourceFile: string;
}

export interface DetectedDeployment {
  platform: string;
  dockerized: boolean;
  sourceFile?: string;
  ciWorkflow?: string;
}

export interface DetectedTesting {
  framework: string;
  testCommand?: string;
  testFilesCount: number;
  sourceFile?: string;
}

export interface DetectedScreenshot {
  url: string;
  alt: string;
  path: string;
  isRelative: boolean;
}

export interface DetectedLicense {
  name: string;
  spdxId: string;
  url?: string;
  textSnippet?: string;
}

export interface ArchitectureInfo {
  pattern: string;
  description: string;
  keyDirectories: Array<{ path: string; purpose: string }>;
  entryPoints: string[];
}

export interface RepositoryStructure {
  fileTreeSummary: string;
  totalFiles: number;
  keyConfigFiles: string[];
}

export interface VerificationReport {
  verifiedScore: number;
  itemsVerified: number;
  warnings: string[];
  checksPassed: string[];
}

export type ReadmeVerification = VerificationReport;

export interface ProjectKnowledge {
  project: RepositoryInfo;
  languages: DetectedLanguage[];
  frameworks: DetectedFramework[];
  dependencies: DetectedDependency[];
  scripts: DetectedScript[];
  features: DetectedFeature[];
  api_routes: DetectedAPIRoute[];
  database: DetectedDatabase[];
  authentication: DetectedAuth[];
  environment_variables: DetectedEnvVar[];
  deployment: DetectedDeployment[];
  testing: DetectedTesting[];
  screenshots: DetectedScreenshot[];
  license: DetectedLicense | null;
  architecture: ArchitectureInfo;
  repository_structure: RepositoryStructure;
  existing_readme: {
    exists: boolean;
    length: number;
    contentPreview?: string;
    detectedBadges?: string[];
  };
  raw_files_analyzed: Array<{
    path: string;
    size: number;
    summary: string;
  }>;
  verification: VerificationReport;
}

export interface ReadmeOptions {
  style: ReadmeStyle;
  badgeLevel: 'comprehensive' | 'standard' | 'minimal' | 'none';
  badgeStyle: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
  animationLevel: 'high' | 'subtle' | 'none';
  tone: 'professional' | 'developer' | 'friendly' | 'academic' | 'concise';
  language: string;
  sections: {
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
  };
  includeMermaidDiagram: boolean;
  includeTreeDiagram: boolean;
  customInstructions?: string;
}

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  fixSuggestion?: string;
  section?: string;
  codeSnippet?: string;
}

export interface ValidationStats {
  documentedEnvVars: number;
  totalEnvVars: number;
  documentedScripts: number;
  totalScripts: number;
  documentedTech: number;
  totalTech: number;
  hasInstallGuide: boolean;
  hasLicenseSection: boolean;
  hasValidLinks: boolean;
  wordCount: number;
  headingCount: number;
  codeBlockCount: number;
  badgeCount: number;
}

export interface ValidationResult {
  overallScore: number;
  scores: {
    technicalAccuracy: number;
    documentationCoverage: number;
    installationAccuracy: number;
    visualQuality: number;
    hallucinationRisk: 'Low' | 'Medium' | 'High';
  };
  issues: ValidationIssue[];
  stats: ValidationStats;
}

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
};

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
  token?: string;
}
