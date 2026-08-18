import {
  ProjectKnowledge,
  RepositoryInfo,
  DetectedLanguage,
  DetectedFramework,
  DetectedDependency,
  DetectedScript,
  DetectedFeature,
  DetectedAPIRoute,
  DetectedDatabase,
  DetectedAuth,
  DetectedEnvVar,
  DetectedDeployment,
  DetectedTesting,
  DetectedScreenshot,
  DetectedLicense,
  ArchitectureInfo,
  RepositoryStructure,
  VerificationReport,
} from '@/types/readme';

export interface RepoParseResult {
  owner: string;
  repo: string;
  branch?: string;
  isValid: boolean;
  error?: string;
}

export function parseGitHubUrl(input: string): RepoParseResult {
  const clean = input.trim();
  if (!clean) {
    return { owner: '', repo: '', isValid: false, error: 'Repository URL is required' };
  }

  // Regex patterns:
  // 1. https://github.com/owner/repo or https://github.com/owner/repo.git
  // 2. https://github.com/owner/repo/tree/branch_name
  // 3. owner/repo or owner/repo#branch
  const fullUrlPattern = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/tree\/([a-zA-Z0-9_./-]+))?(?:\/.*)?$/;
  const shortPattern = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:#([a-zA-Z0-9_./-]+))?$/;

  let match = clean.match(fullUrlPattern);
  if (match) {
    const owner = match[1];
    let repo = match[2];
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }
    const branch = match[3];
    return { owner, repo, branch, isValid: true };
  }

  match = clean.match(shortPattern);
  if (match) {
    const owner = match[1];
    let repo = match[2];
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }
    const branch = match[3];
    return { owner, repo, branch, isValid: true };
  }

  return {
    owner: '',
    repo: '',
    isValid: false,
    error: 'Invalid GitHub URL format. Use "https://github.com/owner/repo" or "owner/repo"',
  };
}

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

interface AnalyzedFileContent {
  path: string;
  content: string;
  size: number;
}

export class GitHubAnalyzer {
  private token?: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'AI-GitHub-Readme-Generator',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async fetchRepoInfo(owner: string, repo: string): Promise<RepositoryInfo> {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const res = await fetch(url, { headers: this.getHeaders() });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" was not found or is private.`);
      }
      if (res.status === 403 || res.status === 429) {
        throw new Error('GitHub API rate limit exceeded. Provide a GitHub token in settings or connect via GitHub.');
      }
      throw new Error(`GitHub API error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    return {
      owner: data.owner.login,
      repo: data.name,
      fullName: data.full_name,
      defaultBranch: data.default_branch || 'main',
      currentBranch: data.default_branch || 'main',
      description: data.description || '',
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      watchers: data.watchers_count || 0,
      language: data.language || 'Unknown',
      topics: data.topics || [],
      isPrivate: data.private || false,
      license: data.license?.spdx_id || data.license?.name || null,
      htmlUrl: data.html_url,
      avatarUrl: data.owner.avatar_url || '',
      updatedAt: data.updated_at || '',
      createdAt: data.created_at || '',
    };
  }

  async fetchLanguages(owner: string, repo: string): Promise<DetectedLanguage[]> {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/languages`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return [];

      const data: Record<string, number> = await res.json();
      const totalBytes = Object.values(data).reduce((acc, curr) => acc + curr, 0);

      const colorMap: Record<string, string> = {
        TypeScript: '#3178c6',
        JavaScript: '#f1e05a',
        Python: '#3572A5',
        Rust: '#dea584',
        Go: '#00ADD8',
        Java: '#b07219',
        Kotlin: '#A97BFF',
        HTML: '#e34c26',
        CSS: '#563d7c',
        PHP: '#4F5D95',
        C: '#555555',
        'C++': '#f34b7d',
        'C#': '#178600',
        Ruby: '#701516',
        Swift: '#F05138',
        Dart: '#00B4AB',
        Shell: '#89e051',
      };

      return Object.entries(data).map(([name, bytes]) => ({
        name,
        bytes,
        percentage: totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(1)) : 0,
        color: colorMap[name] || '#8b949e',
      }));
    } catch {
      return [];
    }
  }

  async fetchFileTree(owner: string, repo: string, branch: string): Promise<GitHubTreeItem[]> {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) {
        // Fallback to contents API if recursive tree fails
        return this.fetchContentsFallback(owner, repo, '', branch);
      }
      const data = await res.json();
      return (data.tree || []).filter((item: GitHubTreeItem) => !this.isIgnoredPath(item.path));
    } catch {
      return this.fetchContentsFallback(owner, repo, '', branch);
    }
  }

  private async fetchContentsFallback(
    owner: string,
    repo: string,
    path: string,
    ref: string,
    depth = 0
  ): Promise<GitHubTreeItem[]> {
    if (depth > 2) return [];
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return [];
      const items = await res.json();
      if (!Array.isArray(items)) return [];

      let result: GitHubTreeItem[] = [];
      for (const item of items) {
        if (this.isIgnoredPath(item.path)) continue;
        result.push({
          path: item.path,
          mode: '100644',
          type: item.type === 'dir' ? 'tree' : 'blob',
          sha: item.sha,
          size: item.size,
          url: item.url,
        });
        if (item.type === 'dir' && depth < 2) {
          const sub = await this.fetchContentsFallback(owner, repo, item.path, ref, depth + 1);
          result = result.concat(sub);
        }
      }
      return result;
    } catch {
      return [];
    }
  }

  private isIgnoredPath(path: string): boolean {
    const p = path.toLowerCase();
    const ignoredDirs = [
      'node_modules/',
      '.git/',
      '.next/',
      'dist/',
      'build/',
      'out/',
      'coverage/',
      '.turbo/',
      '.cache/',
      'vendor/',
      'target/',
      'venv/',
      '.venv/',
      '__pycache__/',
      '.pytest_cache/',
      'bin/',
      'obj/',
    ];
    return ignoredDirs.some((dir) => p.startsWith(dir) || p.includes('/' + dir));
  }

  private isSensitivePath(path: string): boolean {
    const p = path.toLowerCase();
    const sensitive = [
      '.env',
      '.env.local',
      '.env.production',
      'id_rsa',
      'id_dsa',
      '.pem',
      '.key',
      'credentials.json',
      'service-account',
      'secret',
      'private_key',
    ];
    // .env.example, .env.sample, .env.template are allowed!
    if (p.endsWith('.example') || p.endsWith('.sample') || p.endsWith('.template')) {
      return false;
    }
    return sensitive.some((s) => p.endsWith(s) || p.includes(s + '.'));
  }

  async fetchRawFile(owner: string, repo: string, path: string, branch: string): Promise<string | null> {
    try {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return null;
      let text = await res.text();
      // Redact obvious secret patterns
      text = this.redactSensitiveText(text);
      return text;
    } catch {
      return null;
    }
  }

  private redactSensitiveText(content: string): string {
    return content
      .replace(/(password|passwd|secret|api_key|apikey|token|private_key)\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]{8,})["']?/gi, '$1="[REDACTED]"')
      .replace(/(AIzaSy[a-zA-Z0-9_\-]{33})/g, '[REDACTED_API_KEY]')
      .replace(/(ghp_[a-zA-Z0-9]{36})/g, '[REDACTED_GH_TOKEN]')
      .replace(/(sk-[a-zA-Z0-9]{32,})/g, '[REDACTED_OPENAI_KEY]');
  }

  async analyzeRepository(
    owner: string,
    repo: string,
    branch?: string
  ): Promise<ProjectKnowledge> {
    const repoInfo = await this.fetchRepoInfo(owner, repo);
    const activeBranch = branch || repoInfo.defaultBranch;
    repoInfo.currentBranch = activeBranch;

    const [languages, tree] = await Promise.all([
      this.fetchLanguages(owner, repo),
      this.fetchFileTree(owner, repo, activeBranch),
    ]);

    // Select critical files for content retrieval
    const criticalFilePatterns = [
      /^package\.json$/,
      /^pnpm-workspace\.yaml$/,
      /^requirements\.txt$/,
      /^Pipfile$/,
      /^pyproject\.toml$/,
      /^setup\.py$/,
      /^Cargo\.toml$/,
      /^go\.mod$/,
      /^pom\.xml$/,
      /^build\.gradle(?:\.kts)?$/,
      /^Gemfile$/,
      /^composer\.json$/,
      /^Dockerfile$/,
      /^docker-compose\.(?:ya?ml)$/,
      /^\.env\.(?:example|sample|template)$/,
      /^tsconfig\.json$/,
      /^vite\.config\.(?:ts|js|mjs)$/,
      /^next\.config\.(?:ts|js|mjs)$/,
      /^tailwind\.config\.(?:ts|js|mjs)$/,
      /^README\.md$/i,
      /^LICENSE(?:\.md|\.txt)?$/i,
      /^\.github\/workflows\/.*\.ya?ml$/,
      /^Makefile$/,
      /^(?:src|app|lib|pages)\/(?:index|main|app|server|layout|page)\.(?:ts|tsx|js|jsx|py|rs|go)$/,
    ];

    const targetFiles: string[] = [];
    for (const item of tree) {
      if (item.type !== 'blob') continue;
      if (this.isSensitivePath(item.path)) continue;

      const matches = criticalFilePatterns.some((pattern) => pattern.test(item.path));
      if (matches && targetFiles.length < 25) {
        targetFiles.push(item.path);
      }
    }

    // Fetch contents
    const fetchedFiles: AnalyzedFileContent[] = [];
    await Promise.all(
      targetFiles.map(async (filePath) => {
        const content = await this.fetchRawFile(owner, repo, filePath, activeBranch);
        if (content !== null && content.length < 500000) {
          fetchedFiles.push({
            path: filePath,
            content,
            size: content.length,
          });
        }
      })
    );

    // Run Detection Modules
    const frameworks = this.detectFrameworks(tree, fetchedFiles);
    const dependencies = this.detectDependencies(fetchedFiles);
    const scripts = this.detectScripts(fetchedFiles);
    const environmentVariables = this.detectEnvVars(fetchedFiles, tree);
    const database = this.detectDatabase(fetchedFiles, dependencies);
    const authentication = this.detectAuth(fetchedFiles, dependencies);
    const testing = this.detectTesting(tree, fetchedFiles, dependencies);
    const deployment = this.detectDeployment(tree, fetchedFiles);
    const apiRoutes = this.detectAPIRoutes(tree, fetchedFiles);
    const screenshots = this.detectScreenshots(tree, fetchedFiles, owner, repo, activeBranch);
    const license = this.detectLicense(repoInfo, fetchedFiles);
    const architecture = this.buildArchitecture(tree, frameworks, repoInfo.language);
    const repositoryStructure = this.buildRepoStructure(tree);
    const features = this.extractFeatures(frameworks, dependencies, scripts, apiRoutes, database, authentication, fetchedFiles, repoInfo);
    const existingReadme = this.analyzeExistingReadme(fetchedFiles);

    // Verification engine
    const verification = this.calculateVerification(
      repoInfo,
      languages,
      frameworks,
      dependencies,
      scripts,
      environmentVariables,
      database,
      testing,
      deployment,
      license
    );

    return {
      project: repoInfo,
      languages,
      frameworks,
      dependencies,
      scripts,
      features,
      api_routes: apiRoutes,
      database,
      authentication,
      environment_variables: environmentVariables,
      deployment,
      testing,
      screenshots,
      license,
      architecture,
      repository_structure: repositoryStructure,
      existing_readme: existingReadme,
      raw_files_analyzed: fetchedFiles.map((f) => ({
        path: f.path,
        size: f.size,
        summary: f.content.slice(0, 300).replace(/\n/g, ' '),
      })),
      verification,
    };
  }

  private detectFrameworks(tree: GitHubTreeItem[], files: AnalyzedFileContent[]): DetectedFramework[] {
    const frameworks: DetectedFramework[] = [];
    const paths = tree.map((t) => t.path);

    const pkgFile = files.find((f) => f.path === 'package.json');
    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

        if (allDeps['next']) {
          frameworks.push({ name: 'Next.js', category: 'fullstack', version: allDeps['next'], confidence: 100, detectedFrom: 'package.json' });
        } else if (allDeps['react']) {
          frameworks.push({ name: 'React', category: 'frontend', version: allDeps['react'], confidence: 100, detectedFrom: 'package.json' });
        }
        if (allDeps['vue']) frameworks.push({ name: 'Vue.js', category: 'frontend', version: allDeps['vue'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['nuxt']) frameworks.push({ name: 'Nuxt.js', category: 'fullstack', version: allDeps['nuxt'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['@sveltejs/kit'] || allDeps['svelte']) frameworks.push({ name: 'Svelte', category: 'frontend', version: allDeps['svelte'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['astro']) frameworks.push({ name: 'Astro', category: 'frontend', version: allDeps['astro'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['express']) frameworks.push({ name: 'Express', category: 'backend', version: allDeps['express'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['fastify']) frameworks.push({ name: 'Fastify', category: 'backend', version: allDeps['fastify'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['@nestjs/core']) frameworks.push({ name: 'NestJS', category: 'backend', version: allDeps['@nestjs/core'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['hono']) frameworks.push({ name: 'Hono', category: 'backend', version: allDeps['hono'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['tailwindcss']) frameworks.push({ name: 'Tailwind CSS', category: 'styling', version: allDeps['tailwindcss'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['electron']) frameworks.push({ name: 'Electron', category: 'desktop', version: allDeps['electron'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['react-native'] || allDeps['expo']) frameworks.push({ name: 'React Native', category: 'mobile', version: allDeps['react-native'] || allDeps['expo'], confidence: 100, detectedFrom: 'package.json' });
        if (allDeps['@google/genai'] || allDeps['openai'] || allDeps['@anthropic-ai/sdk'] || allDeps['langchain']) {
          frameworks.push({ name: 'AI / GenAI SDKs', category: 'ai/ml', confidence: 95, detectedFrom: 'package.json' });
        }
      } catch {
        // ignore json parse error
      }
    }

    // Python Frameworks
    const pyReqs = files.find((f) => f.path === 'requirements.txt' || f.path === 'pyproject.toml' || f.path === 'Pipfile');
    if (pyReqs) {
      const c = pyReqs.content.toLowerCase();
      if (c.includes('fastapi')) frameworks.push({ name: 'FastAPI', category: 'backend', confidence: 100, detectedFrom: pyReqs.path });
      if (c.includes('django')) frameworks.push({ name: 'Django', category: 'fullstack', confidence: 100, detectedFrom: pyReqs.path });
      if (c.includes('flask')) frameworks.push({ name: 'Flask', category: 'backend', confidence: 100, detectedFrom: pyReqs.path });
      if (c.includes('torch') || c.includes('pytorch')) frameworks.push({ name: 'PyTorch', category: 'ai/ml', confidence: 100, detectedFrom: pyReqs.path });
      if (c.includes('tensorflow')) frameworks.push({ name: 'TensorFlow', category: 'ai/ml', confidence: 100, detectedFrom: pyReqs.path });
      if (c.includes('langchain')) frameworks.push({ name: 'LangChain', category: 'ai/ml', confidence: 100, detectedFrom: pyReqs.path });
      if (c.includes('streamlit')) frameworks.push({ name: 'Streamlit', category: 'frontend', confidence: 100, detectedFrom: pyReqs.path });
    }

    // Rust Frameworks
    const cargo = files.find((f) => f.path === 'Cargo.toml');
    if (cargo) {
      const c = cargo.content.toLowerCase();
      if (c.includes('actix-web')) frameworks.push({ name: 'Actix Web', category: 'backend', confidence: 100, detectedFrom: 'Cargo.toml' });
      if (c.includes('axum')) frameworks.push({ name: 'Axum', category: 'backend', confidence: 100, detectedFrom: 'Cargo.toml' });
      if (c.includes('tokio')) frameworks.push({ name: 'Tokio', category: 'backend', confidence: 100, detectedFrom: 'Cargo.toml' });
      if (c.includes('tauri')) frameworks.push({ name: 'Tauri', category: 'desktop', confidence: 100, detectedFrom: 'Cargo.toml' });
    }

    // Go Frameworks
    const goMod = files.find((f) => f.path === 'go.mod');
    if (goMod) {
      const c = goMod.content.toLowerCase();
      if (c.includes('github.com/gin-gonic/gin')) frameworks.push({ name: 'Gin', category: 'backend', confidence: 100, detectedFrom: 'go.mod' });
      if (c.includes('github.com/gofiber/fiber')) frameworks.push({ name: 'Fiber', category: 'backend', confidence: 100, detectedFrom: 'go.mod' });
      if (c.includes('github.com/spf13/cobra')) frameworks.push({ name: 'Cobra CLI', category: 'tooling', confidence: 100, detectedFrom: 'go.mod' });
    }

    // File structure clues
    if (paths.some((p) => p.startsWith('app/') || p.startsWith('src/app/'))) {
      if (!frameworks.some((f) => f.name === 'Next.js' || f.name === 'Remix')) {
        frameworks.push({ name: 'App Router Architecture', category: 'fullstack', confidence: 85, detectedFrom: 'app/ directory' });
      }
    }

    return frameworks;
  }

  private detectDependencies(files: AnalyzedFileContent[]): DetectedDependency[] {
    const deps: DetectedDependency[] = [];

    // npm dependencies
    const pkgFile = files.find((f) => f.path === 'package.json');
    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        if (pkg.dependencies) {
          for (const [name, version] of Object.entries(pkg.dependencies)) {
            deps.push({ name, version: String(version), type: 'runtime', ecosystem: 'npm' });
          }
        }
        if (pkg.devDependencies) {
          for (const [name, version] of Object.entries(pkg.devDependencies)) {
            deps.push({ name, version: String(version), type: 'dev', ecosystem: 'npm' });
          }
        }
      } catch {
        // ignore
      }
    }

    // Python dependencies
    const reqFile = files.find((f) => f.path === 'requirements.txt');
    if (reqFile) {
      const lines = reqFile.content.split('\n');
      for (const line of lines) {
        const clean = line.trim().split('#')[0].trim();
        if (clean && !clean.startsWith('-')) {
          const parts = clean.split(/[=><~^]/);
          const name = parts[0].trim();
          const version = clean.slice(name.length).trim();
          deps.push({ name, version: version || undefined, type: 'runtime', ecosystem: 'pypi' });
        }
      }
    }

    // Cargo dependencies
    const cargoFile = files.find((f) => f.path === 'Cargo.toml');
    if (cargoFile) {
      const inDeps = cargoFile.content.match(/\[dependencies\]([\s\S]*?)(?:\[|$)/);
      if (inDeps && inDeps[1]) {
        const lines = inDeps[1].split('\n');
        for (const line of lines) {
          const match = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.*)$/);
          if (match) {
            deps.push({ name: match[1].trim(), version: match[2].trim(), type: 'runtime', ecosystem: 'cargo' });
          }
        }
      }
    }

    return deps;
  }

  private detectScripts(files: AnalyzedFileContent[]): DetectedScript[] {
    const scripts: DetectedScript[] = [];

    // npm scripts
    const pkgFile = files.find((f) => f.path === 'package.json');
    if (pkgFile) {
      try {
        const pkg = JSON.parse(pkgFile.content);
        if (pkg.scripts) {
          for (const [name, command] of Object.entries(pkg.scripts)) {
            const cmd = String(command);
            let category: DetectedScript['category'] = 'other';
            if (name.includes('dev') || name.includes('start:dev')) category = 'dev';
            else if (name.includes('build')) category = 'build';
            else if (name.includes('test')) category = 'test';
            else if (name.includes('lint')) category = 'lint';
            else if (name.includes('start') || name === 'serve') category = 'start';
            else if (name.includes('deploy')) category = 'deploy';
            else if (name.includes('format') || name.includes('prettier')) category = 'format';

            scripts.push({
              name,
              command: `npm run ${name}`,
              description: `Executes "${cmd}"`,
              category,
              sourceFile: 'package.json',
            });
          }
        }
      } catch {
        // ignore
      }
    }

    // Makefile targets
    const makefile = files.find((f) => f.path === 'Makefile');
    if (makefile) {
      const lines = makefile.content.split('\n');
      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_-]+):/);
        if (match && !match[1].startsWith('.')) {
          scripts.push({
            name: match[1],
            command: `make ${match[1]}`,
            description: `Runs makefile target ${match[1]}`,
            category: 'other',
            sourceFile: 'Makefile',
          });
        }
      }
    }

    return scripts;
  }

  private detectEnvVars(files: AnalyzedFileContent[], tree: GitHubTreeItem[]): DetectedEnvVar[] {
    const envVars: Map<string, DetectedEnvVar> = new Map();

    // 1. Check .env.example / .env.sample / .env.template
    const envExample = files.find((f) => f.path.startsWith('.env.') || f.path === '.env.example');
    if (envExample) {
      const lines = envExample.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split('=');
          const name = parts[0].trim();
          if (name && /^[A-Z0-9_]+$/.test(name)) {
            const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            envVars.set(name, {
              name,
              defaultValue: val || undefined,
              required: true,
              description: `Configured in ${envExample.path}`,
              sourceFile: envExample.path,
            });
          }
        }
      }
    }

    // 2. Scan source code files for process.env.XXX, os.environ.get("XXX")
    for (const f of files) {
      const nodeMatches = f.content.matchAll(/process\.env\.([A-Z0-9_]+)/g);
      for (const m of nodeMatches) {
        const name = m[1];
        if (name && !envVars.has(name) && name !== 'NODE_ENV') {
          envVars.set(name, {
            name,
            required: false,
            description: `Referenced in ${f.path}`,
            sourceFile: f.path,
          });
        }
      }

      const pyMatches = f.content.matchAll(/os\.(?:environ|getenv)\(?["']([A-Z0-9_]+)["']/g);
      for (const m of pyMatches) {
        const name = m[1];
        if (name && !envVars.has(name)) {
          envVars.set(name, {
            name,
            required: false,
            description: `Referenced in ${f.path}`,
            sourceFile: f.path,
          });
        }
      }
    }

    return Array.from(envVars.values());
  }

  private detectDatabase(files: AnalyzedFileContent[], deps: DetectedDependency[]): DetectedDatabase[] {
    const dbs: DetectedDatabase[] = [];
    const depNames = deps.map((d) => d.name.toLowerCase());

    if (depNames.some((d) => d.includes('@prisma/client') || d.includes('prisma'))) {
      dbs.push({ type: 'Prisma ORM', orm: 'Prisma', sourceFile: 'schema.prisma / package.json' });
    }
    if (depNames.some((d) => d.includes('drizzle-orm'))) {
      dbs.push({ type: 'Drizzle ORM', orm: 'Drizzle', sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('mongoose') || d.includes('mongodb'))) {
      dbs.push({ type: 'MongoDB', orm: 'Mongoose / MongoDB Driver', sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('pg') || d.includes('postgres') || d.includes('psycopg2') || d.includes('asyncpg'))) {
      dbs.push({ type: 'PostgreSQL', sourceFile: 'dependencies' });
    }
    if (depNames.some((d) => d.includes('mysql') || d.includes('mysql2') || d.includes('pymysql'))) {
      dbs.push({ type: 'MySQL', sourceFile: 'dependencies' });
    }
    if (depNames.some((d) => d.includes('sqlite') || d.includes('better-sqlite3') || d.includes('sqlite3'))) {
      dbs.push({ type: 'SQLite', sourceFile: 'dependencies' });
    }
    if (depNames.some((d) => d.includes('redis') || d.includes('ioredis'))) {
      dbs.push({ type: 'Redis', sourceFile: 'dependencies' });
    }
    if (depNames.some((d) => d.includes('@supabase/supabase-js'))) {
      dbs.push({ type: 'Supabase (Postgres)', orm: 'Supabase SDK', sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('firebase') || d.includes('firebase-admin'))) {
      dbs.push({ type: 'Firebase Firestore', orm: 'Firestore SDK', sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('sqlalchemy'))) {
      dbs.push({ type: 'SQLAlchemy ORM', orm: 'SQLAlchemy', sourceFile: 'requirements.txt' });
    }

    return dbs;
  }

  private detectAuth(files: AnalyzedFileContent[], deps: DetectedDependency[]): DetectedAuth[] {
    const authList: DetectedAuth[] = [];
    const depNames = deps.map((d) => d.name.toLowerCase());

    if (depNames.some((d) => d.includes('next-auth') || d.includes('@auth/core'))) {
      authList.push({ provider: 'NextAuth / Auth.js', method: 'OAuth / Credentials / Sessions', sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('@clerk/nextjs') || d.includes('@clerk/clerk-react'))) {
      authList.push({ provider: 'Clerk', method: 'JWT & Hosted Identity', sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('@supabase/auth') || d.includes('@supabase/supabase-js'))) {
      authList.push({ provider: 'Supabase Auth', method: 'OAuth, Magic Links & Email/Password', sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('firebase/auth') || d.includes('firebase-admin'))) {
      authList.push({ provider: 'Firebase Auth', method: 'OAuth & Phone/Email Tokens', sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('jsonwebtoken') || d.includes('jose') || d.includes('pyjwt'))) {
      authList.push({ provider: 'JWT (JSON Web Tokens)', method: 'Stateless Token Authentication', sourceFile: 'dependencies' });
    }
    if (depNames.some((d) => d.includes('passport'))) {
      authList.push({ provider: 'Passport.js', method: 'Strategy-based middleware', sourceFile: 'package.json' });
    }

    return authList;
  }

  private detectTesting(tree: GitHubTreeItem[], files: AnalyzedFileContent[], deps: DetectedDependency[]): DetectedTesting[] {
    const testList: DetectedTesting[] = [];
    const depNames = deps.map((d) => d.name.toLowerCase());
    const testFiles = tree.filter((t) =>
      /(?:test|spec)\.(?:ts|tsx|js|jsx|py|rs|go)$/.test(t.path) || t.path.startsWith('tests/') || t.path.startsWith('test/')
    );

    if (depNames.some((d) => d.includes('vitest'))) {
      testList.push({ framework: 'Vitest', testCommand: 'npm run test / npx vitest', testFilesCount: testFiles.length, sourceFile: 'package.json' });
    } else if (depNames.some((d) => d.includes('jest'))) {
      testList.push({ framework: 'Jest', testCommand: 'npm test', testFilesCount: testFiles.length, sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('@playwright/test'))) {
      testList.push({ framework: 'Playwright', testCommand: 'npx playwright test', testFilesCount: testFiles.length, sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('cypress'))) {
      testList.push({ framework: 'Cypress', testCommand: 'npx cypress open', testFilesCount: testFiles.length, sourceFile: 'package.json' });
    }
    if (depNames.some((d) => d.includes('pytest'))) {
      testList.push({ framework: 'Pytest', testCommand: 'pytest', testFilesCount: testFiles.length, sourceFile: 'requirements.txt' });
    }

    if (testList.length === 0 && testFiles.length > 0) {
      testList.push({ framework: 'Standard Test Suite', testCommand: 'npm test / pytest / cargo test', testFilesCount: testFiles.length });
    }

    return testList;
  }

  private detectDeployment(tree: GitHubTreeItem[], files: AnalyzedFileContent[]): DetectedDeployment[] {
    const deployments: DetectedDeployment[] = [];
    const paths = tree.map((t) => t.path);

    const hasDocker = paths.some((p) => p === 'Dockerfile' || p.includes('Dockerfile'));
    const hasCompose = paths.some((p) => p.startsWith('docker-compose'));

    if (hasDocker || hasCompose) {
      deployments.push({
        platform: 'Docker / Containerized',
        dockerized: true,
        sourceFile: hasDocker ? 'Dockerfile' : 'docker-compose.yml',
      });
    }

    const ghWorkflows = paths.filter((p) => p.startsWith('.github/workflows/'));
    if (ghWorkflows.length > 0) {
      deployments.push({
        platform: 'GitHub Actions CI/CD',
        dockerized: hasDocker,
        ciWorkflow: ghWorkflows.join(', '),
      });
    }

    if (paths.some((p) => p === 'vercel.json' || p === 'next.config.ts' || p === 'next.config.js')) {
      deployments.push({ platform: 'Vercel / Cloud Run', dockerized: hasDocker });
    }

    if (paths.some((p) => p === 'netlify.toml')) {
      deployments.push({ platform: 'Netlify', dockerized: hasDocker, sourceFile: 'netlify.toml' });
    }

    return deployments;
  }

  private detectAPIRoutes(tree: GitHubTreeItem[], files: AnalyzedFileContent[]): DetectedAPIRoute[] {
    const routes: DetectedAPIRoute[] = [];

    // Next.js App Router API routes
    for (const item of tree) {
      if (item.type !== 'blob') continue;
      const m = item.path.match(/(?:src\/)?app\/(api\/.*?)\/route\.(?:ts|js)$/);
      if (m) {
        routes.push({
          path: `/${m[1]}`,
          method: 'ALL',
          sourceFile: item.path,
          description: `Next.js API endpoint at ${m[1]}`,
        });
      }
    }

    // Express / FastAPI route regex in analyzed files
    for (const f of files) {
      const expressMatches = f.content.matchAll(/(?:app|router)\.(get|post|put|delete|patch)\(\s*["']([^"']+)["']/g);
      for (const m of expressMatches) {
        routes.push({
          path: m[2],
          method: m[1].toUpperCase() as DetectedAPIRoute['method'],
          sourceFile: f.path,
        });
      }

      const fastapiMatches = f.content.matchAll(/@(?:app|router)\.(get|post|put|delete|patch)\(\s*["']([^"']+)["']/g);
      for (const m of fastapiMatches) {
        routes.push({
          path: m[2],
          method: m[1].toUpperCase() as DetectedAPIRoute['method'],
          sourceFile: f.path,
        });
      }
    }

    return routes.slice(0, 15);
  }

  private detectScreenshots(
    tree: GitHubTreeItem[],
    files: AnalyzedFileContent[],
    owner: string,
    repo: string,
    branch: string
  ): DetectedScreenshot[] {
    const screenshots: DetectedScreenshot[] = [];
    const imgExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

    for (const item of tree) {
      if (item.type !== 'blob') continue;
      const lower = item.path.toLowerCase();
      const isImg = imgExts.some((ext) => lower.endsWith(ext));
      if (!isImg) continue;

      const isScreenFolder =
        lower.includes('screenshot') ||
        lower.includes('demo') ||
        lower.includes('preview') ||
        lower.includes('assets/') ||
        lower.includes('docs/images') ||
        lower.includes('media/');

      if (isScreenFolder && !lower.includes('favicon') && !lower.includes('icon-') && screenshots.length < 6) {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
        screenshots.push({
          path: item.path,
          alt: item.path.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Project Demo',
          url: rawUrl,
          isRelative: true,
        });
      }
    }

    return screenshots;
  }

  private detectLicense(repoInfo: RepositoryInfo, files: AnalyzedFileContent[]): DetectedLicense | null {
    if (repoInfo.license) {
      return {
        name: repoInfo.license,
        spdxId: repoInfo.license,
        url: `https://spdx.org/licenses/${repoInfo.license}.html`,
      };
    }

    const licenseFile = files.find((f) => f.path.toLowerCase().startsWith('license'));
    if (licenseFile) {
      const c = licenseFile.content;
      if (c.includes('MIT License') || c.includes('Permission is hereby granted')) {
        return { name: 'MIT License', spdxId: 'MIT', textSnippet: c.slice(0, 200) };
      }
      if (c.includes('Apache License') || c.includes('Version 2.0')) {
        return { name: 'Apache 2.0', spdxId: 'Apache-2.0', textSnippet: c.slice(0, 200) };
      }
      if (c.includes('GNU GENERAL PUBLIC LICENSE')) {
        return { name: 'GPL 3.0', spdxId: 'GPL-3.0', textSnippet: c.slice(0, 200) };
      }
      return { name: 'Custom License', spdxId: 'CUSTOM', textSnippet: c.slice(0, 200) };
    }

    return null;
  }

  private buildArchitecture(tree: GitHubTreeItem[], frameworks: DetectedFramework[], mainLanguage: string): ArchitectureInfo {
    const paths = tree.map((t) => t.path);
    const keyDirs: Array<{ path: string; purpose: string }> = [];

    const dirMap: Record<string, string> = {
      'src/components': 'UI Components and design system elements',
      components: 'Reusable React/UI layout and interface components',
      'app/api': 'Next.js App Router API routes and backend services',
      'pages/api': 'Next.js Pages Router API endpoints',
      'src/services': 'Business logic, database interactions, and API wrappers',
      services: 'Backend services and integration adapters',
      'src/lib': 'Shared utility functions, client helpers, and constants',
      lib: 'Shared libraries and configuration helpers',
      'src/hooks': 'Custom React hooks and state primitives',
      hooks: 'Custom reactive hooks',
      'src/types': 'TypeScript interfaces and data contract definitions',
      types: 'Global type definitions and schemas',
      tests: 'Automated test suites (unit, integration, and e2e)',
      test: 'Test runner files and test fixtures',
      docs: 'Project documentation, manuals, and technical specifications',
      public: 'Static assets, images, icons, and fonts',
      assets: 'Media assets and visual illustrations',
      prisma: 'Prisma schema and database migration scripts',
    };

    const seenDirs = new Set<string>();
    for (const p of paths) {
      for (const [dir, purpose] of Object.entries(dirMap)) {
        if ((p === dir || p.startsWith(dir + '/')) && !seenDirs.has(dir)) {
          seenDirs.add(dir);
          keyDirs.push({ path: dir, purpose });
        }
      }
    }

    let pattern = 'Modular Clean Architecture';
    if (frameworks.some((f) => f.name === 'Next.js')) {
      pattern = 'Full-Stack React Framework (Next.js App Router / Server Components)';
    } else if (frameworks.some((f) => f.category === 'frontend') && frameworks.some((f) => f.category === 'backend')) {
      pattern = 'Client-Server Full Stack Architecture';
    } else if (frameworks.some((f) => f.category === 'frontend')) {
      pattern = 'Single Page Client-Side Application (SPA)';
    } else if (frameworks.some((f) => f.category === 'backend')) {
      pattern = 'RESTful / Service-Oriented Backend';
    }

    const entryPoints = paths.filter((p) =>
      /^(?:src\/)?(?:index|main|app|server|layout)\.(?:ts|tsx|js|jsx|py|rs|go)$/.test(p)
    );

    return {
      pattern,
      description: `Structured ${mainLanguage} application built with ${pattern}.`,
      keyDirectories: keyDirs.slice(0, 10),
      entryPoints,
    };
  }

  private buildRepoStructure(tree: GitHubTreeItem[]): RepositoryStructure {
    const keyConfigFiles = tree
      .map((t) => t.path)
      .filter((p) =>
        /^(?:package\.json|Cargo\.toml|requirements\.txt|Dockerfile|docker-compose\.ya?ml|tsconfig\.json|\.env\.example|Makefile|go\.mod)$/.test(
          p
        )
      );

    // Build ascii directory tree preview
    const topLevel = new Set<string>();
    for (const item of tree) {
      const parts = item.path.split('/');
      if (parts.length === 1) {
        topLevel.add(parts[0]);
      } else {
        topLevel.add(parts[0] + '/');
      }
    }

    const treePreview = Array.from(topLevel)
      .sort()
      .slice(0, 20)
      .map((item) => `├── ${item}`)
      .join('\n');

    return {
      fileTreeSummary: `.\n${treePreview}\n└── ... (${tree.length} total files)`,
      totalFiles: tree.length,
      keyConfigFiles,
    };
  }

  private extractFeatures(
    frameworks: DetectedFramework[],
    deps: DetectedDependency[],
    scripts: DetectedScript[],
    apiRoutes: DetectedAPIRoute[],
    dbs: DetectedDatabase[],
    auths: DetectedAuth[],
    files: AnalyzedFileContent[],
    repoInfo: RepositoryInfo
  ): DetectedFeature[] {
    const features: DetectedFeature[] = [];

    // Feature from repo description & topics
    if (repoInfo.description) {
      features.push({
        title: 'Core System Capability',
        description: repoInfo.description,
        evidenceFile: 'GitHub Metadata',
        confidence: 'high',
      });
    }

    // Features from Frameworks
    for (const f of frameworks) {
      features.push({
        title: `${f.name} Powered Architecture`,
        description: `Implements modern ${f.category} architecture utilizing ${f.name}${f.version ? ` (${f.version})` : ''}.`,
        evidenceFile: f.detectedFrom,
        confidence: 'high',
      });
    }

    // Database feature
    if (dbs.length > 0) {
      features.push({
        title: 'Database Persistence & Schema Management',
        description: `Backed by ${dbs.map((d) => d.type).join(', ')} with structured data modeling.`,
        evidenceFile: dbs[0].sourceFile,
        confidence: 'high',
      });
    }

    // Auth feature
    if (auths.length > 0) {
      features.push({
        title: 'Authentication & Access Control',
        description: `Secure identity management powered by ${auths.map((a) => a.provider).join(', ')}.`,
        evidenceFile: auths[0].sourceFile,
        confidence: 'high',
      });
    }

    // API feature
    if (apiRoutes.length > 0) {
      features.push({
        title: 'REST / Serverless API Layer',
        description: `Exposes structured endpoints including ${apiRoutes.slice(0, 3).map((r) => r.path).join(', ')}.`,
        evidenceFile: apiRoutes[0].sourceFile,
        confidence: 'high',
      });
    }

    // Testing feature
    if (scripts.some((s) => s.category === 'test')) {
      features.push({
        title: 'Automated Testing & Quality Suite',
        description: 'Includes automated test execution pipeline for regressions and unit tests.',
        evidenceFile: 'package.json / test runner',
        confidence: 'high',
      });
    }

    // Docker feature
    if (files.some((f) => f.path.toLowerCase().includes('docker'))) {
      features.push({
        title: 'Containerized Deployment Ready',
        description: 'Configured with Docker and container orchestration for consistent multi-environment runtime.',
        evidenceFile: 'Dockerfile',
        confidence: 'high',
      });
    }

    return features;
  }

  private analyzeExistingReadme(files: AnalyzedFileContent[]): ProjectKnowledge['existing_readme'] {
    const readme = files.find((f) => f.path.toLowerCase() === 'readme.md');
    if (!readme) {
      return { exists: false, length: 0, detectedBadges: [] };
    }

    const badgeMatches = readme.content.match(/!\[.*?\]\(https:\/\/(?:img\.shields\.io|badge\.fury\.io|github\.com\/.*?\/workflows).*?\)/g) || [];

    return {
      exists: true,
      length: readme.content.length,
      contentPreview: readme.content.slice(0, 500),
      detectedBadges: badgeMatches,
    };
  }

  private calculateVerification(
    repo: RepositoryInfo,
    languages: DetectedLanguage[],
    frameworks: DetectedFramework[],
    deps: DetectedDependency[],
    scripts: DetectedScript[],
    envVars: DetectedEnvVar[],
    dbs: DetectedDatabase[],
    testing: DetectedTesting[],
    deployment: DetectedDeployment[],
    license: DetectedLicense | null
  ): VerificationReport {
    let score = 70;
    const checksPassed: string[] = [];
    const warnings: string[] = [];

    if (languages.length > 0) {
      score += 5;
      checksPassed.push(`Language composition verified (${languages.map((l) => l.name).join(', ')})`);
    }

    if (frameworks.length > 0) {
      score += 5;
      checksPassed.push(`Framework manifests verified (${frameworks.map((f) => f.name).join(', ')})`);
    }

    if (scripts.length > 0) {
      score += 5;
      checksPassed.push(`Runnable scripts cataloged (${scripts.length} commands)`);
    } else {
      warnings.push('No explicit run scripts found in package or build manifests.');
    }

    if (license) {
      score += 5;
      checksPassed.push(`License verified (${license.name})`);
    } else {
      warnings.push('No standard LICENSE file detected in repository root.');
    }

    if (testing.length > 0) {
      score += 5;
      checksPassed.push(`Test framework verified (${testing.map((t) => t.framework).join(', ')})`);
    } else {
      warnings.push('No test framework or test directory detected in codebase.');
    }

    if (envVars.length > 0) {
      score += 5;
      checksPassed.push(`Environment variables cataloged (${envVars.length} parameters)`);
    }

    return {
      verifiedScore: Math.min(score, 100),
      itemsVerified: checksPassed.length,
      warnings,
      checksPassed,
    };
  }
}
