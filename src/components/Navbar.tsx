import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Settings,
  BookOpen,
  FolderHeart,
  Github,
  Sun,
  Moon,
  LogOut,
  Zap,
  ChevronDown,
  ExternalLink,
  FolderGit2,
  Users,
  Key,
  User,
} from 'lucide-react';
import { AIProviderConfig, GitHubUser } from '@/src/types/readme';

interface NavbarProps {
  currentView: 'home' | 'analysis' | 'builder' | 'history';
  onNavigate: (view: 'home' | 'analysis' | 'builder' | 'history') => void;
  providerConfig: AIProviderConfig;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
  githubUser: GitHubUser | null;
  onConnectGitHub: () => void;
  onDisconnectGitHub: () => void;
  onSelectRepo?: (repoUrl: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  hasKnowledge: boolean;
  hasMarkdown: boolean;
  usageCount: number;
  maxLimit: number;
  onOpenUsageModal: () => void;
}

export function Navbar({
  currentView,
  onNavigate,
  providerConfig,
  onOpenSettings,
  onOpenDocs,
  githubUser,
  onConnectGitHub,
  onDisconnectGitHub,
  onSelectRepo,
  darkMode,
  onToggleDarkMode,
  hasKnowledge,
  hasMarkdown,
  usageCount,
  maxLimit,
  onOpenUsageModal,
}: NavbarProps) {
  const isLimitReached = usageCount >= maxLimit && !providerConfig.apiKey;
  const remaining = Math.max(0, maxLimit - usageCount);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-[#0d1117]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight">
                  README Architect
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI Studio
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Anti-Hallucination Docs & Architecture Engine
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/60 p-1 rounded-lg border border-gray-800 text-xs font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Analyze Repo
            </button>
            {hasKnowledge && (
              <button
                onClick={() => onNavigate('analysis')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  currentView === 'analysis'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Codebase Facts
              </button>
            )}
            {hasMarkdown && (
              <button
                onClick={() => onNavigate('builder')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  currentView === 'builder'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Studio Editor
              </button>
            )}
            <button
              onClick={() => onNavigate('history')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>Projects</span>
            </button>
          </nav>
        </div>

        {/* Right Tools, Usage Limit Badge & Provider Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Usage Limit Indicator */}
          <button
            onClick={onOpenUsageModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              isLimitReached
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                : remaining <= 3
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
            title="Free Generation Quota (Click for more access)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {providerConfig.apiKey
                ? 'Unlimited (Key Active)'
                : `${usageCount}/${maxLimit} Used`}
            </span>
          </button>

          {/* Active AI Model Badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-900/80 hover:bg-gray-800/80 border border-gray-700/60 text-xs text-gray-300 transition-colors cursor-pointer"
            title="Configure AI Model & Provider"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-gray-300 hidden sm:inline max-w-[130px] truncate">
              {providerConfig.model.split('/').pop()}
            </span>
            <Settings className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Docs Modal Button */}
          <button
            onClick={onOpenDocs}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            title="System Documentation & Pipeline Rules"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* GitHub User Auth / Profile Card */}
          {githubUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="github-user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-[#161b22] hover:bg-[#21262d] border border-gray-700/80 rounded-xl pl-1.5 pr-2.5 py-1 transition-all cursor-pointer shadow-sm group"
                title={`Logged in as @${githubUser.login}`}
              >
                <img
                  src={githubUser.avatarUrl}
                  alt={githubUser.login}
                  className="w-6 h-6 rounded-full border border-emerald-500/50"
                />
                <span className="text-xs font-medium text-gray-200 font-mono hidden sm:inline">
                  @{githubUser.login}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-200 transition-transform" />
              </button>

              {/* Profile Dropdown Card */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Card Header */}
                  <div className="p-4 bg-[#0d1117] border-b border-gray-800">
                    <div className="flex items-start gap-3">
                      <img
                        src={githubUser.avatarUrl}
                        alt={githubUser.login}
                        className="w-11 h-11 rounded-full border border-gray-700 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white truncate">
                            {githubUser.name || githubUser.login}
                          </span>
                          {githubUser.accessToken && (
                            <span title="PAT active for 1-click commits" className="text-amber-400">
                              <Key className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-mono">@{githubUser.login}</p>
                        {githubUser.bio && (
                          <p className="text-[11px] text-gray-300 mt-1 line-clamp-2 leading-tight">
                            {githubUser.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-gray-800 text-[11px] text-gray-400">
                      <div className="flex items-center gap-1">
                        <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                        <span><strong>{githubUser.publicRepos ?? 0}</strong> repos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span><strong>{githubUser.followers ?? 0}</strong> followers</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Repos to Quickly Analyze */}
                  {githubUser.recentRepos && githubUser.recentRepos.length > 0 && (
                    <div className="p-3 border-b border-gray-800/80 bg-[#161b22]">
                      <div className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 mb-2 px-1">
                        Your Public Repositories:
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {githubUser.recentRepos.slice(0, 5).map((repo) => (
                          <button
                            key={repo.id}
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              if (onSelectRepo) {
                                onSelectRepo(repo.htmlUrl);
                              }
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gray-800/80 text-xs text-gray-300 hover:text-blue-400 flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <span className="font-mono truncate">{repo.name}</span>
                            <span className="text-[10px] text-gray-500 group-hover:text-blue-400/80">
                              Scan →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-2 bg-[#0d1117]/60 flex flex-col gap-1 text-xs font-medium">
                    <a
                      href={githubUser.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>View Profile on GitHub</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </a>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onConnectGitHub();
                      }}
                      className="px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 flex items-center gap-2 text-left transition-colors cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>{githubUser.accessToken ? 'Update GitHub Profile / PAT' : 'Add PAT for 1-Click Commits'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onDisconnectGitHub();
                      }}
                      className="px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out / Switch Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="github-login-trigger-btn"
              onClick={onConnectGitHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-gray-600/80 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer group"
            >
              <Github className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
              <span>Log In with GitHub</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
