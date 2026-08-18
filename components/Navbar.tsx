'use client';

import React from 'react';
import {
  Sparkles,
  Github,
  BookOpen,
  Settings,
  History,
  Code2,
  CheckCircle2,
  Sun,
  Moon,
  ExternalLink,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { AIProviderConfig, GitHubUser } from '@/types/readme';
import { PROVIDER_CATALOG } from '@/lib/ai/providers';

interface NavbarProps {
  currentView: 'home' | 'analysis' | 'builder' | 'history';
  onNavigate: (view: 'home' | 'analysis' | 'builder' | 'history') => void;
  providerConfig: AIProviderConfig;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
  githubUser: GitHubUser | null;
  onConnectGitHub: () => void;
  onDisconnectGitHub: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  hasKnowledge: boolean;
  hasMarkdown: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  providerConfig,
  onOpenSettings,
  onOpenDocs,
  githubUser,
  onConnectGitHub,
  onDisconnectGitHub,
  darkMode,
  onToggleDarkMode,
  hasKnowledge,
  hasMarkdown,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const currentProviderInfo = PROVIDER_CATALOG[providerConfig.provider];

  return (
    <header className="sticky top-0 z-40 border-b border-[#30363d] bg-[#0d1117]/90 backdrop-blur-md text-white px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <button
            id="nav-brand-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-left cursor-pointer transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
                <span>README</span>
                <span className="text-blue-400 font-extrabold">.ai</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-normal hidden sm:block">
                Deep Codebase Analyzer & AI Generator
              </p>
            </div>
          </button>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#161b22] p-1 rounded-lg border border-[#30363d]/60 text-xs font-medium">
            <button
              id="nav-home-btn"
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
              }`}
            >
              Analyze Repo
            </button>

            {hasKnowledge && (
              <button
                id="nav-analysis-btn"
                onClick={() => onNavigate('analysis')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'analysis'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Intelligence
              </button>
            )}

            {hasMarkdown && (
              <button
                id="nav-builder-btn"
                onClick={() => onNavigate('builder')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'builder'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                README Studio
              </button>
            )}

            <button
              id="nav-history-btn"
              onClick={() => onNavigate('history')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Saved Projects
            </button>
          </nav>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2.5">
          {/* Active AI Provider pill */}
          <button
            id="nav-provider-pill-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group"
            title="Configure AI Provider and Models"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex flex-col text-left">
              <span className="text-gray-400 text-[10px] leading-tight">AI Engine</span>
              <span className="text-gray-200 font-semibold group-hover:text-blue-400 transition-colors">
                {currentProviderInfo?.name || 'Google Gemini'}
              </span>
            </div>
            <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-white ml-1" />
          </button>

          {/* GitHub User / Connect */}
          {githubUser ? (
            <div className="relative">
              <button
                id="nav-github-user-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
              >
                {githubUser.avatar_url ? (
                  <img
                    src={githubUser.avatar_url}
                    alt={githubUser.login}
                    className="w-5 h-5 rounded-full ring-1 ring-emerald-500"
                  />
                ) : (
                  <Github className="w-4 h-4 text-white" />
                )}
                <span className="font-medium text-gray-200 hidden sm:inline">{githubUser.login}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#30363d]">
                    <p className="text-xs text-gray-400">Signed in to GitHub as</p>
                    <p className="text-xs font-semibold text-white truncate">{githubUser.name || githubUser.login}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready for Private Repos & Commits
                    </span>
                  </div>
                  <button
                    id="nav-disconnect-gh-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onDisconnectGitHub();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    Disconnect GitHub Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="nav-connect-github-btn"
              onClick={onConnectGitHub}
              className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-gray-200 hover:text-white border border-[#30363d] px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Connect GitHub</span>
            </button>
          )}

          {/* Documentation Modal trigger */}
          <button
            id="nav-docs-btn"
            onClick={onOpenDocs}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#161b22] border border-transparent hover:border-[#30363d] transition-colors cursor-pointer"
            title="Application Architecture & Docs"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
