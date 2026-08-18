'use client';

import React, { useState } from 'react';
import {
  ProjectKnowledge,
  GitHubUser,
} from '@/types/readme';
import {
  GitCommit,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Github,
  GitBranch,
  FileText,
  Lock,
} from 'lucide-react';

interface GitHubCommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledge: ProjectKnowledge;
  markdown: string;
  githubUser: GitHubUser | null;
  githubToken: string | null;
  onConnectGitHub: () => void;
}

export const GitHubCommitModal: React.FC<GitHubCommitModalProps> = ({
  isOpen,
  onClose,
  knowledge,
  markdown,
  githubUser,
  githubToken,
  onConnectGitHub,
}) => {
  const [branch, setBranch] = useState(knowledge.project.currentBranch || 'main');
  const [commitMessage, setCommitMessage] = useState(
    'docs: update README.md via AI GitHub README Generator'
  );
  const [manualToken, setManualToken] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<{
    success: boolean;
    commitSha?: string;
    commitUrl?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const effectiveToken = githubToken || manualToken;

  const handleCommit = async () => {
    if (!effectiveToken) {
      setCommitResult({
        success: false,
        error: 'Please connect GitHub or provide a GitHub Personal Access Token.',
      });
      return;
    }

    setIsCommitting(true);
    setCommitResult(null);

    try {
      const res = await fetch('/api/github/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: knowledge.project.owner,
          repo: knowledge.project.repo,
          branch,
          markdown,
          commitMessage,
          token: effectiveToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCommitResult({
          success: true,
          commitSha: data.commitSha,
          commitUrl: data.commitUrl,
        });
      } else {
        setCommitResult({
          success: false,
          error: data.error || 'Failed to commit to GitHub.',
        });
      }
    } catch (err: unknown) {
      setCommitResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Commit README to GitHub</h2>
              <p className="text-xs text-gray-400">
                Push changes directly to <strong className="text-gray-200">{knowledge.project.fullName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {commitResult?.success ? (
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">README.md Committed Successfully!</h3>
              <p className="text-xs text-gray-300">
                The updated documentation is now live in your repository on branch <code className="text-emerald-300 font-bold">{branch}</code>.
              </p>
              {commitResult.commitUrl && (
                <div className="pt-2">
                  <a
                    href={commitResult.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    <span>View Commit on GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* GitHub Auth Status */}
              {githubUser ? (
                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {githubUser.avatar_url ? (
                      <img src={githubUser.avatar_url} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      <Github className="w-5 h-5 text-white" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{githubUser.name || githubUser.login}</p>
                      <p className="text-[10px] text-emerald-400">Authenticated via GitHub OAuth</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      GitHub Authorization Required
                    </span>
                    <button
                      type="button"
                      onClick={onConnectGitHub}
                      className="bg-[#21262d] hover:bg-[#30363d] text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Connect with OAuth</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Or paste a Personal Access Token with <code className="text-gray-300">repo</code> scope:
                    </label>
                    <input
                      type="password"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx"
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Branch and Message */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                    Target Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Commit Message</label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Summary pill */}
              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d] flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Target: <strong className="text-gray-200">README.md</strong>
                </span>
                <span>{markdown.length} characters ({markdown.split('\n').length} lines)</span>
              </div>

              {commitResult?.error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{commitResult.error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[#21262d]"
          >
            {commitResult?.success ? 'Close' : 'Cancel'}
          </button>

          {!commitResult?.success && (
            <button
              id="confirm-github-commit-btn"
              onClick={handleCommit}
              disabled={isCommitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {isCommitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Committing to GitHub...</span>
                </>
              ) : (
                <>
                  <GitCommit className="w-4 h-4" />
                  <span>Authorize & Commit</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
