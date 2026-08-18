import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  FolderGit2,
  Users,
  Building2,
  MapPin,
  Sparkles,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { GitHubUser } from '@/src/types/readme';
import { extractGitHubUsername, fetchGitHubUserProfile } from '@/src/lib/github/user';

interface GitHubLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: GitHubUser) => void;
  initialUser?: GitHubUser | null;
}

const SAMPLE_PROFILES = [
  { username: 'torvalds', label: 'Linus Torvalds' },
  { username: 'shadcn', label: 'shadcn' },
  { username: 'leerob', label: 'Lee Robinson' },
  { username: 'antfu', label: 'Anthony Fu' },
];

export function GitHubLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialUser,
}: GitHubLoginModalProps) {
  const [profileInput, setProfileInput] = useState('');
  const [patToken, setPatToken] = useState(initialUser?.accessToken || '');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [previewUser, setPreviewUser] = useState<GitHubUser | null>(initialUser || null);

  useEffect(() => {
    if (isOpen && initialUser) {
      setProfileInput(initialUser.htmlUrl || initialUser.login);
      setPreviewUser(initialUser);
      setPatToken(initialUser.accessToken || '');
    } else if (isOpen && !initialUser) {
      setProfileInput('');
      setPreviewUser(null);
      setErrorText(null);
    }
  }, [isOpen, initialUser]);

  if (!isOpen) return null;

  const handleFetchProfile = async (targetInput?: string) => {
    const raw = targetInput !== undefined ? targetInput : profileInput;
    const username = extractGitHubUsername(raw);
    if (!username) {
      setErrorText('Please enter your GitHub profile link or username.');
      return;
    }

    setIsLoading(true);
    setErrorText(null);

    try {
      const user = await fetchGitHubUserProfile(username, patToken.trim() || undefined);
      setPreviewUser(user);
    } catch (err: unknown) {
      setPreviewUser(null);
      setErrorText(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = async (username: string) => {
    const link = `https://github.com/${username}`;
    setProfileInput(link);
    await handleFetchProfile(link);
  };

  const handleConfirmLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUser) {
      await handleFetchProfile();
      return;
    }

    // Attach PAT token if entered
    const finalUser: GitHubUser = {
      ...previewUser,
      accessToken: patToken.trim() || previewUser.accessToken || undefined,
    };

    onLoginSuccess(finalUser);
    onClose();
  };

  return (
    <div
      id="github-login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="github-login-modal-content"
        className="relative w-full max-w-lg bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0d1117]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-white">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Log In with GitHub Profile
              </h2>
              <p className="text-xs text-gray-400">
                Connect your profile to import repos and publish READMEs
              </p>
            </div>
          </div>
          <button
            id="close-github-login-modal-btn"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Main Input Form */}
          <form onSubmit={handleConfirmLogin} className="space-y-4">
            <div>
              <label
                htmlFor="github-profile-input"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2"
              >
                GitHub Profile Link or Username
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    id="github-profile-input"
                    type="text"
                    value={profileInput}
                    onChange={(e) => {
                      setProfileInput(e.target.value);
                      setErrorText(null);
                    }}
                    placeholder="https://github.com/your-username or your-username"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0d1117] border border-gray-700/80 rounded-xl text-gray-100 placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
                <button
                  id="fetch-github-profile-btn"
                  type="button"
                  onClick={() => handleFetchProfile()}
                  disabled={isLoading || !profileInput.trim()}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-gray-200 font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span>Verify</span>
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                Paste your GitHub URL (e.g. <span className="font-mono text-gray-300">https://github.com/torvalds</span>) or your handle.
              </p>
            </div>

            {/* Quick Sample Profiles */}
            <div>
              <span className="text-[11px] text-gray-400 block mb-1.5 font-medium">
                Try quick sample profile:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROFILES.map((p) => (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => handleSelectSample(p.username)}
                    className="px-2.5 py-1 rounded-lg bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-[11px] text-gray-300 font-mono transition-colors cursor-pointer"
                  >
                    @{p.username}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorText && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">{errorText}</p>
                  <p className="text-[11px] text-rose-400/80">
                    Make sure the username exists on GitHub and has public visibility.
                  </p>
                </div>
              </div>
            )}

            {/* Verified Profile Card Preview */}
            {previewUser && (
              <div className="p-4 bg-[#0d1117] rounded-xl border border-emerald-500/30 shadow-lg relative space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUser.avatarUrl}
                      alt={previewUser.login}
                      className="w-12 h-12 rounded-full border-2 border-emerald-500/50 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {previewUser.name || previewUser.login}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                          @{previewUser.login}
                        </span>
                      </div>
                      {previewUser.bio && (
                        <p className="text-gray-300 text-[11px] line-clamp-2 mt-0.5 leading-relaxed">
                          {previewUser.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={previewUser.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-blue-400 p-1"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-800 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      <strong className="text-gray-200">{previewUser.publicRepos ?? 0}</strong> Public Repos
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      <strong className="text-gray-200">{previewUser.followers ?? 0}</strong> Followers
                    </span>
                  </div>
                  {previewUser.location && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{previewUser.location}</span>
                    </div>
                  )}
                </div>

                {/* Recent Repos preview */}
                {previewUser.recentRepos && previewUser.recentRepos.length > 0 && (
                  <div className="pt-2 border-t border-gray-800/80">
                    <span className="text-[10px] uppercase font-semibold text-gray-500 block mb-1.5">
                      Recent Repositories ({previewUser.recentRepos.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {previewUser.recentRepos.slice(0, 6).map((repo) => (
                        <span
                          key={repo.id}
                          className="px-2 py-0.5 bg-[#161b22] border border-gray-700/60 rounded text-[10px] text-gray-300 font-mono"
                        >
                          {repo.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional Personal Access Token (PAT) Drawer */}
            <div className="pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 font-medium transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {showTokenInput
                    ? 'Hide Personal Access Token'
                    : 'Add GitHub Personal Access Token (For 1-click Commits)'}
                </span>
              </button>

              {showTokenInput && (
                <div className="mt-2 p-3 bg-[#0d1117] rounded-xl border border-gray-800 space-y-2 animate-in fade-in duration-150">
                  <label
                    htmlFor="github-pat-token"
                    className="block text-[11px] font-semibold text-gray-300"
                  >
                    GitHub Personal Access Token (PAT)
                  </label>
                  <input
                    id="github-pat-token"
                    type="password"
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_... or github_pat_..."
                    className="w-full px-3 py-1.5 bg-[#161b22] border border-gray-700 rounded-lg text-xs text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-gray-400">
                    Required only if you want to push commits directly to GitHub without manually copying files. Stored securely in your browser session.
                  </p>
                </div>
              )}
            </div>

            {/* Submit / Login Button */}
            <div className="pt-3">
              <button
                id="submit-github-login-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Profile...</span>
                  </>
                ) : previewUser ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Log In as @{previewUser.login}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-300" />
                    <span>Verify & Log In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
