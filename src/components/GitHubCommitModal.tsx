import React, { useState } from 'react';
import {
  X,
  GitBranch,
  GitCommit,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ProjectKnowledge, GitHubUser } from '@/src/types/readme';
import { commitReadmeToGitHub, CommitResult } from '@/src/lib/github/commit';

interface GitHubCommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledge: ProjectKnowledge;
  markdown: string;
  githubUser: GitHubUser | null;
  onConnectGitHub: () => void;
}

export function GitHubCommitModal({
  isOpen,
  onClose,
  knowledge,
  markdown,
  githubUser,
  onConnectGitHub,
}: GitHubCommitModalProps) {
  const [targetBranch, setTargetBranch] = useState(knowledge.project.currentBranch || 'main');
  const [createNewBranch, setCreateNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('docs/update-readme');
  const [filePath, setFilePath] = useState('README.md');
  const [commitMessage, setCommitMessage] = useState('docs: update README.md via README Architect AI Studio');
  const [tokenInput, setTokenInput] = useState(githubUser?.accessToken || '');
  const [isCommitting, setIsCommitting] = useState(false);
  const [result, setResult] = useState<CommitResult | null>(null);

  if (!isOpen) return null;

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = githubUser?.accessToken || tokenInput.trim();
    if (!token) {
      setResult({
        success: false,
        error: 'Please provide a GitHub Personal Access Token or connect your GitHub account.',
      });
      return;
    }

    setIsCommitting(true);
    setResult(null);

    const res = await commitReadmeToGitHub({
      owner: knowledge.project.owner,
      repo: knowledge.project.repo,
      branch: targetBranch,
      path: filePath.trim() || 'README.md',
      message: commitMessage.trim(),
      content: markdown,
      token,
      createNewBranch,
      newBranchName: newBranchName.trim(),
      author: githubUser?.name
        ? { name: githubUser.name, email: githubUser.email || `${githubUser.login}@users.noreply.github.com` }
        : undefined,
    });

    setIsCommitting(false);
    setResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-100">
                Commit README to GitHub
              </h2>
              <p className="text-xs text-gray-400">
                Push changes to {knowledge.project.fullName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleCommit} className="p-6 space-y-4">
          {result && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                result.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {result.success ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">Committed successfully to {result.branch}!</p>
                    {result.commitUrl && (
                      <a
                        href={result.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 inline-flex items-center gap-1 text-emerald-200 hover:text-white"
                      >
                        <span>View commit on GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Commit failed</p>
                    <p className="text-[11px] mt-0.5">{result.error}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* GitHub Token / Auth Status */}
          {!githubUser && (
            <div className="p-3.5 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>GitHub Personal Access Token (repo scope)</span>
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Generate Token
                </a>
              </div>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 bg-[#161b22] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none"
              />
            </div>
          )}

          {/* Branch Configuration */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Target Branch
              </label>
              <input
                type="text"
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-branch"
                checked={createNewBranch}
                onChange={(e) => setCreateNewBranch(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700 text-emerald-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="create-branch" className="text-xs text-gray-300 cursor-pointer">
                Create new branch (recommended for PRs)
              </label>
            </div>

            {createNewBranch && (
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  New Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. docs/update-readme"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Commit Message */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Commit Message
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none"
            />
          </div>

          {/* Target File Path */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Target File Path
            </label>
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none font-mono"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={isCommitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isCommitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Pushing to GitHub...</span>
                </>
              ) : (
                <>
                  <GitCommit className="w-4 h-4" />
                  <span>Push Commit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
