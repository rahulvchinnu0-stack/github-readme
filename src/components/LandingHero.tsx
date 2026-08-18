import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Key,
  Flame,
  CheckCircle2,
  FileCode2,
  Lock,
  Github,
  FolderGit2,
  User,
} from 'lucide-react';
import { PRESET_REPOSITORIES, PresetRepo } from '@/src/lib/github/parser';
import { AIProviderConfig, GitHubUser } from '@/src/types/readme';

interface LandingHeroProps {
  onAnalyze: (targetUrl: string, branch?: string, tokenOverride?: string) => Promise<void>;
  isLoading: boolean;
  providerConfig: AIProviderConfig;
  onOpenSettings: () => void;
  githubUser?: GitHubUser | null;
  onOpenGitHubLogin?: () => void;
}

export function LandingHero({
  onAnalyze,
  isLoading,
  providerConfig,
  onOpenSettings,
  githubUser,
  onOpenGitHubLogin,
}: LandingHeroProps) {
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [patToken, setPatToken] = useState(githubUser?.accessToken || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim()) {
      setErrorText('Please enter a GitHub repository URL or owner/repo format.');
      return;
    }
    setErrorText(null);
    try {
      const activeToken = patToken.trim() || githubUser?.accessToken;
      await onAnalyze(repoInput.trim(), branchInput.trim() || undefined, activeToken || undefined);
    } catch (err: unknown) {
      setErrorText(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSelectPreset = async (preset: PresetRepo) => {
    setRepoInput(preset.url);
    setErrorText(null);
    await onAnalyze(preset.url);
  };

  const handleSelectUserRepo = async (htmlUrl: string) => {
    setRepoInput(htmlUrl);
    setErrorText(null);
    const activeToken = patToken.trim() || githubUser?.accessToken;
    await onAnalyze(htmlUrl, undefined, activeToken || undefined);
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
      {/* Title & Introduction */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Anti-Hallucination Grounded Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Architect Perfect GitHub READMEs from{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Real Codebase Facts
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Deep-scans your repository's package manifests, scripts, env vars, and AST structures to generate authoritative, hallucination-free documentation with interactive Mermaid diagrams and 1-click GitHub commits.
        </p>

        {/* GitHub Login Banner / Profile Status */}
        <div className="pt-1 flex items-center justify-center">
          {githubUser ? (
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#161b22] border border-emerald-500/30 text-xs shadow-md">
              <img
                src={githubUser.avatarUrl}
                alt={githubUser.login}
                className="w-4 h-4 rounded-full border border-emerald-400/80"
              />
              <span className="text-gray-300">
                Logged in as <strong className="text-emerald-400 font-mono">@{githubUser.login}</strong>
              </span>
              {onOpenGitHubLogin && (
                <button
                  type="button"
                  onClick={onOpenGitHubLogin}
                  className="text-[11px] text-gray-400 hover:text-gray-200 underline ml-1 cursor-pointer"
                >
                  Switch Profile
                </button>
              )}
            </div>
          ) : (
            onOpenGitHubLogin && (
              <button
                type="button"
                onClick={onOpenGitHubLogin}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 text-xs text-gray-300 transition-colors shadow-sm cursor-pointer"
              >
                <Github className="w-3.5 h-3.5 text-gray-300" />
                <span>Connect GitHub Profile to browse your repositories</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Main URL Input Card */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/40 max-w-3xl mx-auto w-full mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="e.g. facebook/react or https://github.com/shadcn-ui/ui"
                className="w-full pl-11 pr-4 py-3 bg-[#0d1117] border border-gray-700/80 rounded-xl text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Codebase...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Generate</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </div>

          {errorText && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {errorText}
            </div>
          )}

          {/* Advanced toggle for branch / PAT token */}
          <div className="pt-2 border-t border-gray-800/60 flex flex-wrap items-center justify-between text-xs text-gray-400">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="hover:text-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Custom Branch & Private Token' : 'Specify Branch / Private Repo Token'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-gray-500">AI Engine:</span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-blue-400 hover:text-blue-300 font-mono text-[11px] underline underline-offset-2 cursor-pointer"
              >
                {providerConfig.model}
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  Custom Branch (Optional)
                </label>
                <input
                  type="text"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  placeholder="e.g. main, v2-dev"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700/80 rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>GitHub Personal Access Token (For Private Repos)</span>
                </label>
                <input
                  type="password"
                  value={patToken}
                  onChange={(e) => setPatToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700/80 rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* User's Own Repositories Quick-Selector (When logged in) */}
      {githubUser && githubUser.recentRepos && githubUser.recentRepos.length > 0 && (
        <div className="max-w-3xl mx-auto w-full mb-8 p-4 bg-[#161b22]/90 border border-emerald-500/30 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Your GitHub Repositories (@{githubUser.login})
              </span>
            </div>
            <span className="text-xs text-gray-400">Click to scan immediately</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {githubUser.recentRepos.slice(0, 6).map((repo) => (
              <button
                key={repo.id}
                onClick={() => handleSelectUserRepo(repo.htmlUrl)}
                disabled={isLoading}
                className="text-left p-2.5 rounded-xl bg-[#0d1117] hover:bg-gray-800/80 border border-gray-800 hover:border-emerald-500/40 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-gray-200 group-hover:text-emerald-400 truncate">
                    {repo.name}
                  </span>
                  {repo.stars > 0 && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      ★ {repo.stars}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                    {repo.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Preset Repositories */}
      <div className="max-w-3xl mx-auto w-full mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Popular Open Source Repositories to Test
          </span>
          <span className="text-xs text-gray-500">1-click instant ingestion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {PRESET_REPOSITORIES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset)}
              disabled={isLoading}
              className="text-left p-3 rounded-xl bg-[#161b22]/70 hover:bg-[#161b22] border border-gray-800 hover:border-gray-700 transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700/50">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-800/40 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>{preset.category}</span>
                <span>⭐ {(preset.stars / 1000).toFixed(0)}k</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
        <div className="p-4 rounded-xl bg-[#161b22]/40 border border-gray-800/80 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-gray-200">Zero Hallucinated Commands</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Checks true package managers (pnpm/yarn/npm/cargo/pip) and manifest scripts so quickstart commands always run.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#161b22]/40 border border-gray-800/80 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-gray-200">Mermaid Architecture Graphs</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Auto-synthesizes clear, GitHub-native sequence flowcharts and component diagrams directly from repository file trees.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#161b22]/40 border border-gray-800/80 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <FileCode2 className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-gray-200">1-Click Direct GitHub Commit</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Push generated documentation directly to your target branch or open a pull request without leaving the studio.
          </p>
        </div>
      </div>
    </div>
  );
}
