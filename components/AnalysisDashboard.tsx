'use client';

import React, { useState } from 'react';
import {
  ProjectKnowledge,
  DetectedFramework,
  DetectedScript,
  DetectedEnvVar,
  DetectedAPIRoute,
  DetectedDatabase,
  DetectedAuth,
} from '@/types/readme';
import {
  GitFork,
  Star,
  Eye,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Server,
  Database,
  Lock,
  Layers,
  FileCode2,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  FolderTree,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface AnalysisDashboardProps {
  knowledge: ProjectKnowledge;
  onProceedToStyle: () => void;
  onRefreshRepo: () => Promise<void>;
  isLoading: boolean;
  onBranchChange: (branch: string) => Promise<void>;
  availableBranches: string[];
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  knowledge,
  onProceedToStyle,
  onRefreshRepo,
  isLoading,
  onBranchChange,
  availableBranches,
}) => {
  const [activeTab, setActiveTab] = useState<'stack' | 'scripts' | 'env' | 'api_db' | 'structure' | 'verification'>('stack');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const { project, languages, frameworks, dependencies, scripts, environment_variables, database, authentication, testing, deployment, screenshots, license, architecture, repository_structure, verification } = knowledge;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(text);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Top Repo Header Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {project.avatarUrl ? (
              <img
                src={project.avatarUrl}
                alt={project.owner}
                className="w-14 h-14 rounded-2xl ring-2 ring-[#30363d] bg-[#0d1117]"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xl">
                {project.repo.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <a
                    href={project.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                  >
                    {project.fullName}
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                </h1>

                {project.isPrivate && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Private Repo
                  </span>
                )}

                {license && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {license.name}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-300 mt-1 max-w-2xl">
                {project.description || 'No description provided by repository maintainers.'}
              </p>

              {/* GitHub Stats */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-gray-200">{project.stars.toLocaleString()}</strong> stars
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5 text-blue-400" />
                  <strong className="text-gray-200">{project.forks.toLocaleString()}</strong> forks
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <strong className="text-gray-200">{project.watchers.toLocaleString()}</strong> watchers
                </span>

                {/* Branch Switcher */}
                <div className="flex items-center gap-1 bg-[#0d1117] px-2.5 py-1 rounded-lg border border-[#30363d]">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  {availableBranches.length > 1 ? (
                    <select
                      id="branch-select"
                      value={project.currentBranch}
                      onChange={(e) => onBranchChange(e.target.value)}
                      className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
                      disabled={isLoading}
                    >
                      {availableBranches.map((b) => (
                        <option key={b} value={b} className="bg-[#161b22] text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-200 font-medium">{project.currentBranch}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="refresh-repo-btn"
              onClick={onRefreshRepo}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-200 hover:text-white border border-[#30363d] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh repository files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="proceed-to-style-btn"
              onClick={onProceedToStyle}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Choose README Style & Generate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Verification Summary Banner */}
        <div className="mt-5 pt-4 border-t border-[#30363d]/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{verification.verifiedScore}% Verified Confidence</span>
            </div>
            <span className="text-xs text-gray-400 hidden sm:inline">
              {verification.itemsVerified} verified architectural contracts discovered
            </span>
          </div>

          {verification.warnings.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{verification.warnings.length} verification notices</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 overflow-x-auto">
        <button
          id="tab-stack-btn"
          onClick={() => setActiveTab('stack')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stack'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Tech Stack & Architecture ({frameworks.length})
        </button>

        <button
          id="tab-scripts-btn"
          onClick={() => setActiveTab('scripts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'scripts'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Runnable Scripts ({scripts.length})
        </button>

        <button
          id="tab-env-btn"
          onClick={() => setActiveTab('env')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'env'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Environment Variables ({environment_variables.length})
        </button>

        <button
          id="tab-api-db-btn"
          onClick={() => setActiveTab('api_db')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'api_db'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          APIs, DB & Auth ({knowledge.api_routes.length + database.length + authentication.length})
        </button>

        <button
          id="tab-structure-btn"
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'structure'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          Project Tree & Media
        </button>

        <button
          id="tab-verification-btn"
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'verification'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Verification Audit
        </button>
      </div>

      {/* TAB 1: STACK & ARCHITECTURE */}
      {activeTab === 'stack' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Left 2 Cols: Frameworks & Languages */}
          <div className="lg:col-span-2 space-y-6">
            {/* Languages Bar */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-blue-400" />
                Language Composition
              </h3>

              {languages.length > 0 ? (
                <>
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#0d1117] border border-[#30363d]/50 mb-3">
                    {languages.map((l) => (
                      <div
                        key={l.name}
                        style={{ width: `${l.percentage}%`, backgroundColor: l.color || '#3178c6' }}
                        title={`${l.name}: ${l.percentage}%`}
                        className="h-full transition-all"
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {languages.map((l) => (
                      <div key={l.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color || '#3178c6' }} />
                        <span className="font-semibold text-gray-200">{l.name}</span>
                        <span className="text-gray-500">{l.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400">No language data returned by GitHub API.</p>
              )}
            </div>

            {/* Frameworks List */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Detected Frameworks & Libraries
              </h3>

              {frameworks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {frameworks.map((fw) => (
                    <div
                      key={fw.name}
                      className="p-3.5 bg-[#0d1117] rounded-xl border border-[#30363d] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{fw.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase">
                          {fw.category}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>Source: <code className="text-gray-300">{fw.detectedFrom}</code></span>
                        <span className="text-emerald-400 font-medium">{fw.confidence}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No major frameworks detected in project manifests.</p>
              )}
            </div>

            {/* Core Dependencies */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                Verified Dependencies ({dependencies.length})
              </h3>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {dependencies.map((dep) => (
                  <span
                    key={dep.name}
                    className="px-2.5 py-1 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-gray-300 flex items-center gap-1.5"
                  >
                    <span className="font-medium text-white">{dep.name}</span>
                    {dep.version && <span className="text-gray-500 text-[10px]">{dep.version}</span>}
                    <span className="text-[9px] px-1 py-0.2 bg-[#21262d] text-gray-400 rounded uppercase">
                      {dep.ecosystem}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Architecture Pattern & Key Dirs */}
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                Architecture Pattern
              </h3>
              <p className="text-xs font-semibold text-blue-400 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                {architecture.pattern}
              </p>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                {architecture.description}
              </p>

              <h4 className="text-xs font-bold text-white mt-4 mb-2">Key Directories</h4>
              <div className="space-y-2">
                {architecture.keyDirectories.map((kd) => (
                  <div key={kd.path} className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363d]/60 text-xs">
                    <code className="text-indigo-300 font-bold">{kd.path}</code>
                    <p className="text-gray-400 text-[11px] mt-0.5">{kd.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCRIPTS */}
      {activeTab === 'scripts' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                Verified Runnable Scripts ({scripts.length})
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Exact commands extracted from <code className="text-gray-300">package.json</code>, <code className="text-gray-300">Makefile</code>, or build configurations.
              </p>
            </div>
          </div>

          {scripts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scripts.map((sc) => (
                <div
                  key={sc.name}
                  className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] flex flex-col justify-between group hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{sc.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 uppercase">
                      {sc.category}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between bg-[#161b22] px-3 py-2 rounded-lg border border-[#30363d]/60 font-mono text-xs text-blue-300">
                    <span className="truncate">{sc.command}</span>
                    <button
                      onClick={() => handleCopy(sc.command)}
                      className="text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
                      title="Copy command"
                    >
                      {copiedScript === sc.command ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-2 truncate">
                    {sc.description || `Configured in ${sc.sourceFile}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              No runnable scripts discovered in repository manifests.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ENVIRONMENT VARIABLES */}
      {activeTab === 'env' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-lg animate-in fade-in">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            Discovered Environment Variables ({environment_variables.length})
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Extracted from <code className="text-gray-300">.env.example</code>, configuration templates, or source references.
          </p>

          {environment_variables.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#30363d] rounded-xl overflow-hidden">
                <thead className="bg-[#0d1117] text-gray-400 uppercase text-[10px] font-semibold border-b border-[#30363d]">
                  <tr>
                    <th className="p-3">Variable Name</th>
                    <th className="p-3">Requirement</th>
                    <th className="p-3">Default / Sample</th>
                    <th className="p-3">Source Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d] text-gray-300">
                  {environment_variables.map((ev) => (
                    <tr key={ev.name} className="hover:bg-[#21262d]/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-300">{ev.name}</td>
                      <td className="p-3">
                        {ev.required ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold text-[10px]">
                            Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-400 text-[10px]">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-gray-400">{ev.defaultValue || '—'}</td>
                      <td className="p-3 text-gray-400">{ev.sourceFile}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              No environment variables declared in .env.example or referenced in scanned files.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: APIS, DB & AUTH */}
      {activeTab === 'api_db' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
          {/* APIs */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              API Routes ({knowledge.api_routes.length})
            </h3>
            {knowledge.api_routes.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {knowledge.api_routes.map((ar, i) => (
                  <div key={i} className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363d] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 font-mono text-[10px] rounded font-bold">
                        {ar.method}
                      </span>
                      <span className="font-mono text-gray-200 truncate">{ar.path}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{ar.sourceFile}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No explicit REST API routes detected.</p>
            )}
          </div>

          {/* Database */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Database & ORM ({database.length})
            </h3>
            {database.length > 0 ? (
              <div className="space-y-2">
                {database.map((db, i) => (
                  <div key={i} className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] text-xs">
                    <span className="font-bold text-white">{db.type}</span>
                    {db.orm && <p className="text-emerald-400 text-[11px] mt-0.5">ORM: {db.orm}</p>}
                    <p className="text-gray-500 text-[10px] mt-1">Found in: {db.sourceFile}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No database drivers or ORMs detected.</p>
            )}
          </div>

          {/* Authentication */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Authentication ({authentication.length})
            </h3>
            {authentication.length > 0 ? (
              <div className="space-y-2">
                {authentication.map((a, i) => (
                  <div key={i} className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] text-xs">
                    <span className="font-bold text-white">{a.provider}</span>
                    <p className="text-purple-300 text-[11px] mt-0.5">{a.method}</p>
                    <p className="text-gray-500 text-[10px] mt-1">Source: {a.sourceFile}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No dedicated auth packages detected.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STRUCTURE & MEDIA */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          {/* File Tree */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-400" />
              Repository Directory Tree ({repository_structure.totalFiles} files)
            </h3>
            <pre className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] font-mono text-xs text-gray-300 overflow-auto max-h-96 leading-relaxed">
              {repository_structure.fileTreeSummary}
            </pre>
          </div>

          {/* Media & Screenshots */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              Discovered Visual Media & Screenshots ({screenshots.length})
            </h3>
            {screenshots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {screenshots.map((sc, i) => (
                  <div key={i} className="p-2 bg-[#0d1117] rounded-xl border border-[#30363d] text-center">
                    <img
                      src={sc.url}
                      alt={sc.alt}
                      className="w-full h-28 object-contain rounded-lg bg-[#161b22]"
                    />
                    <p className="text-[11px] text-gray-300 font-medium mt-1 truncate">{sc.alt}</p>
                    <p className="text-[10px] text-gray-500 truncate">{sc.path}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-xs">
                No screenshot assets found in <code className="text-gray-300">docs/</code> or <code className="text-gray-300">assets/</code>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: VERIFICATION AUDIT */}
      {activeTab === 'verification' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-lg space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Anti-Hallucination Verification Audit
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Every claim generated in the README must originate from these verified facts.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">{verification.verifiedScore}%</span>
              <p className="text-[10px] text-gray-400">Confidence Rating</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d]">
              <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Verified Codebase Checks ({verification.checksPassed.length})
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                {verification.checksPassed.map((check, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363d]">
              <h4 className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Verification Notices & Omissions ({verification.warnings.length})
              </h4>
              {verification.warnings.length > 0 ? (
                <ul className="space-y-2 text-xs text-gray-300">
                  {verification.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-400">Zero warnings or gaps detected!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
