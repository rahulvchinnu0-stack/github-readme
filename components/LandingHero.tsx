'use client';

import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  GitBranch,
  Layers,
  FileCode2,
  CheckCircle2,
  Lock,
  ExternalLink,
  Cpu,
  Eye,
} from 'lucide-react';
import { AIProviderConfig } from '@/types/readme';

interface LandingHeroProps {
  onAnalyze: (url: string, branch?: string, token?: string) => Promise<void>;
  isLoading: boolean;
  providerConfig: AIProviderConfig;
  onOpenSettings: () => void;
}

const SAMPLE_REPOS = [
  { name: 'facebook/react', label: 'React.js', desc: 'UI Library' },
  { name: 'expressjs/express', label: 'Express', desc: 'Node.js Backend' },
  { name: 'fastapi/fastapi', label: 'FastAPI', desc: 'Python Framework' },
  { name: 'tailwindlabs/tailwindcss', label: 'Tailwind CSS', desc: 'Utility CSS' },
  { name: 'shadcn-ui/ui', label: 'shadcn/ui', desc: 'Component Registry' },
  { name: 'vercel/next.js', label: 'Next.js', desc: 'Full-Stack Framework' },
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onAnalyze,
  isLoading,
  providerConfig,
  onOpenSettings,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [personalToken, setPersonalToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!repoUrl.trim()) {
      setError('Please provide a GitHub repository URL or slug (e.g. owner/repo)');
      return;
    }
    try {
      await onAnalyze(repoUrl.trim(), branch.trim() || undefined, personalToken.trim() || undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSelectSample = (sample: string) => {
    setRepoUrl(sample);
    setError(null);
  };

  return (
    <section className="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="text-center max-w-3xl mx-auto space-y-6">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-medium text-blue-400 shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Zero-Hallucination Codebase Verification Pipeline</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Turn Any GitHub Repository Into a{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Professional README
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Analyze your codebase, discover verified dependencies, extract environment variables & runnable scripts, and generate technically accurate documentation with your preferred AI model.
        </p>

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="pt-2 max-w-2xl mx-auto text-left">
          <div className="bg-[#161b22] p-2 sm:p-2.5 rounded-2xl border border-[#30363d] shadow-2xl shadow-black/60 focus-within:border-blue-500/80 transition-all">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="repo-url-input"
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo or owner/repo"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                  disabled={isLoading}
                />
              </div>

              <button
                id="analyze-repo-submit-btn"
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Repo...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Repository</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Advanced options toggle */}
            <div className="mt-2 pt-2 border-t border-[#30363d]/50 flex items-center justify-between text-xs text-gray-400 px-2">
              <button
                type="button"
                id="toggle-advanced-opts-btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="hover:text-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                <span>{showAdvanced ? 'Hide Advanced Options' : 'Branch / Private Repo Token'}</span>
              </button>

              <span className="text-[11px] text-gray-500">
                AI Engine: <strong className="text-gray-300">{providerConfig.provider}</strong>
              </span>
            </div>

            {/* Advanced options collapse */}
            {showAdvanced && (
              <div className="mt-3 p-3 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1 font-medium">Branch (Optional)</label>
                    <input
                      id="branch-input"
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. main, master, dev"
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      GitHub Token (For Private Repos)
                    </label>
                    <input
                      id="token-input"
                      type="password"
                      value={personalToken}
                      onChange={(e) => setPersonalToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Sample repositories */}
        <div className="pt-2">
          <p className="text-xs text-gray-400 mb-2.5 font-medium">Or try an instant sample repository:</p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {SAMPLE_REPOS.map((sample) => (
              <button
                key={sample.name}
                id={`sample-repo-${sample.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                onClick={() => handleSelectSample(sample.name)}
                className="bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-gray-500 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 group text-left"
              >
                <span className="font-semibold text-gray-200 group-hover:text-blue-400">{sample.label}</span>
                <span className="text-[10px] text-gray-500 hidden sm:inline">({sample.desc})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Pipeline Section */}
      <div className="mt-20 pt-10 border-t border-[#30363d]/60">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How The Analysis & Generation Pipeline Works
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Zero blind prompts. Every single section is grounded in verified repository facts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#161b22]/70 border border-[#30363d] p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Step 01</span>
            <h3 className="text-sm font-bold text-white mt-1">Deep File Discovery</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Crawls repository trees, extracts package manifests, workflows, entrypoints, and redacts sensitive data.
            </p>
          </div>

          <div className="bg-[#161b22]/70 border border-[#30363d] p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Step 02</span>
            <h3 className="text-sm font-bold text-white mt-1">Verified Stack Intelligence</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Discovers exact frameworks, runnable scripts, environment variables, APIs, databases, auth, and testing suites.
            </p>
          </div>

          <div className="bg-[#161b22]/70 border border-[#30363d] p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Step 03</span>
            <h3 className="text-sm font-bold text-white mt-1">Precision Style Generation</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Synthesizes documentation across 6 specialized styles (Professional, Modern, Animated, Creative, Minimal, Enterprise).
            </p>
          </div>

          <div className="bg-[#161b22]/70 border border-[#30363d] p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Step 04</span>
            <h3 className="text-sm font-bold text-white mt-1">Quality & Anti-Hallucination</h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Automated validator measures technical accuracy, installation validity, coverage, and enables 1-click GitHub commit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
