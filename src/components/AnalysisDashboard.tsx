import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  ShieldCheck,
  Code2,
  Terminal,
  Key,
  FolderTree,
  Box,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Star,
  GitFork,
  FileCode,
  Check,
  Copy,
  Share2,
} from 'lucide-react';
import { ProjectKnowledge } from '@/src/types/readme';

interface AnalysisDashboardProps {
  knowledge: ProjectKnowledge;
  onProceedToStyle: () => void;
  onRefreshRepo: () => Promise<void>;
  isLoading: boolean;
  onBranchChange: (branch: string) => Promise<void>;
  availableBranches: string[];
  onOpenSocialCard?: () => void;
}

export function AnalysisDashboard({
  knowledge,
  onProceedToStyle,
  onRefreshRepo,
  isLoading,
  onBranchChange,
  availableBranches,
  onOpenSocialCard,
}: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stack' | 'scripts' | 'env' | 'tree' | 'docker'>('stack');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const { project, languages, techStack, manifest, scripts, envVariables, docker, ciWorkflows, treeStructureText, verification } = knowledge;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner: Repo Identity & Actions */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          {project.avatarUrl && (
            <img
              src={project.avatarUrl}
              alt={project.owner}
              className="w-12 h-12 rounded-xl border border-gray-700/60 object-cover"
            />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-mono">
                {project.fullName}
              </h2>
              <a
                href={project.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-200"
                title="View on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              {project.license && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                  {project.license}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400 font-mono">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>{(project.stars || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5 text-blue-400" />
                <span>{(project.forks || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-800/80 px-2 py-1 rounded border border-gray-700/60">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <select
                  value={project.currentBranch || 'main'}
                  onChange={(e) => onBranchChange(e.target.value)}
                  disabled={isLoading}
                  className="bg-transparent text-gray-200 text-xs focus:outline-none cursor-pointer"
                >
                  {availableBranches.map((b) => (
                    <option key={b} value={b} className="bg-[#161b22] text-gray-200">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {onOpenSocialCard && (
            <button
              onClick={onOpenSocialCard}
              className="px-4 py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs sm:text-sm font-medium flex items-center gap-2 transition-all shadow-sm cursor-pointer group"
              title="Design OpenGraph Social Card & Banner"
            >
              <Share2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Social Card</span>
            </button>
          )}

          <button
            onClick={onRefreshRepo}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-colors"
            title="Re-analyze repository"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={onProceedToStyle}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Customize & Generate README</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Anti-Hallucination Ground Truth Baseline Card */}
      <div className="bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-purple-950/20 border border-blue-900/40 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base text-gray-100">
                  Anti-Hallucination Ground Truth Verified
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {verification.truthfulnessScore}% Baseline Score
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {verification.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {verification.passedChecksCount} Validated
            </span>
            <span className="text-gray-600">•</span>
            <span>Package Manager: <strong className="text-gray-200">{manifest?.packageManager || 'npm'}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('stack')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'stack'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Tech Stack & Languages ({techStack.length + languages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'scripts'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Executable Scripts ({Object.keys(scripts).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('env')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'env'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Environment Variables ({envVariables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'tree'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Directory Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'docker'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Docker & CI Workflows</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'stack' && (
        <div className="space-y-6">
          {/* Languages breakdown */}
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              Repository Languages Breakdown
            </h3>
            {languages.length > 0 ? (
              <div className="space-y-3">
                {/* Progress bar */}
                <div className="h-3 w-full rounded-full bg-gray-800 overflow-hidden flex">
                  {languages.map((lang) => (
                    <div
                      key={lang.name}
                      style={{
                        width: `${lang.percentage}%`,
                        backgroundColor: lang.color || '#3b82f6',
                      }}
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 pt-1">
                  {languages.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-2 text-xs font-mono">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: lang.color || '#3b82f6' }}
                      />
                      <span className="text-gray-300">{lang.name}</span>
                      <span className="text-gray-500">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No language data found.</p>
            )}
          </div>

          {/* Categorized Tech Stack */}
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              Identified Frameworks, Libraries & Tools
            </h3>
            {techStack.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {techStack.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-gray-200 font-mono">
                        {item.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                        {item.category}
                      </span>
                    </div>
                    {item.purpose && (
                      <p className="text-[11px] text-gray-400 leading-snug">
                        {item.purpose}
                      </p>
                    )}
                    {item.version && (
                      <span className="text-[10px] text-gray-500 font-mono block">
                        v{item.version}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No external dependencies detected.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'scripts' && (
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-200">
              Verified Manifest Scripts & Execution Commands
            </h3>
            <span className="text-xs font-mono text-gray-400">
              Package Manager: <strong className="text-blue-400">{manifest?.packageManager || 'npm'}</strong>
            </span>
          </div>

          {Object.keys(scripts).length > 0 ? (
            <div className="divide-y divide-gray-800/80">
              {Object.entries(scripts).map(([name, cmd]) => {
                const pm = manifest?.packageManager || 'npm';
                const runCmd = `${pm} run ${name}`;
                return (
                  <div key={name} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {name}
                        </span>
                        <code className="text-xs font-mono text-gray-400">
                          {cmd}
                        </code>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(runCmd, name)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-mono text-gray-300 border border-gray-700 transition-colors"
                      title="Copy full execution command"
                    >
                      {copiedScript === name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{runCmd}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4">No script definitions found in manifest.</p>
          )}
        </div>
      )}

      {activeTab === 'env' && (
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">
            Discovered Environment Variables (.env.example)
          </h3>

          {envVariables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {envVariables.map((v, i) => (
                <div key={i} className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {v.key}
                    </span>
                    {v.isSecret && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Secret
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    {v.description}
                  </p>
                  {v.exampleValue && (
                    <div className="text-[10px] text-gray-500 font-mono">
                      Example: <code className="text-gray-400">{v.exampleValue}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-gray-500">
              <p>No .env.example file or required secrets detected in the repository.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tree' && (
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200">
              Extracted Directory Architecture
            </h3>
            <button
              onClick={() => handleCopy(treeStructureText, 'tree-text')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 font-mono"
            >
              {copiedScript === 'tree-text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Tree</span>
            </button>
          </div>
          <pre className="p-4 bg-[#0d1117] rounded-xl border border-gray-800/80 font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed max-h-96">
            <code>{treeStructureText}</code>
          </pre>
        </div>
      )}

      {activeTab === 'docker' && (
        <div className="space-y-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-200">
              Containerization (Docker & Compose)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl">
                <span className="text-gray-400 block mb-1">Dockerfile Status</span>
                <span className="font-semibold text-gray-200">
                  {docker.hasDockerfile ? `Present (Base: ${docker.baseImage || 'Custom'})` : 'Not configured'}
                </span>
              </div>
              <div className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl">
                <span className="text-gray-400 block mb-1">Docker Compose</span>
                <span className="font-semibold text-gray-200">
                  {docker.hasDockerCompose ? 'docker-compose.yml detected' : 'Not configured'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-200">
              Continuous Integration (GitHub Actions)
            </h3>
            {ciWorkflows.length > 0 ? (
              <div className="space-y-2">
                {ciWorkflows.map((ci, i) => (
                  <div key={i} className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-semibold text-gray-200 block">
                        {ci.name}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {ci.path}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Active CI
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No .github/workflows detected.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
