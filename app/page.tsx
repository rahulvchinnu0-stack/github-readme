'use client';

import React, { useState } from 'react';
import {
  ProjectKnowledge,
  ReadmeOptions,
  ReadmeStyle,
  ReadmeVerification,
  ReadmeVersion,
  ValidationResult,
  AIProviderConfig,
  GitHubUser,
  DEFAULT_README_OPTIONS,
} from '@/types/readme';
import { DEFAULT_AI_CONFIG } from '@/lib/ai/providers';
import { Navbar } from '@/components/Navbar';
import { LandingHero } from '@/components/LandingHero';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';
import { ReadmeConfigModal } from '@/components/ReadmeConfigModal';
import { ReadmeBuilder } from '@/components/ReadmeBuilder';
import { AIProviderSettingsModal } from '@/components/AIProviderSettingsModal';
import { GitHubCommitModal } from '@/components/GitHubCommitModal';
import { VersionHistoryModal } from '@/components/VersionHistoryModal';
import { SavedProjectsView, SavedProjectItem } from '@/components/SavedProjectsView';
import { DocsModal } from '@/components/DocsModal';

const STORAGE_KEY_SAVED_PROJECTS = 'ai_readme_saved_projects';
const STORAGE_KEY_AI_CONFIG = 'ai_readme_provider_config';
const STORAGE_KEY_GITHUB_TOKEN = 'ai_readme_github_token';
const STORAGE_KEY_GITHUB_USER = 'ai_readme_github_user';

const createSnapshotItem = (
  markdown: string,
  style: ReadmeStyle,
  label: string,
  score?: number
): ReadmeVersion => {
  const ts = Date.now();
  return {
    id: `v-${ts}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: ts,
    markdown,
    style,
    label,
    score,
  };
};

export default function HomePage() {
  // Navigation
  const [currentView, setCurrentView] = useState<'home' | 'analysis' | 'builder' | 'history'>('home');

  // State: Repo & Knowledge
  const [, setRepoUrl] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [knowledge, setKnowledge] = useState<ProjectKnowledge | null>(null);

  // State: README Generation & Editing
  const [readmeOptions, setReadmeOptions] = useState<ReadmeOptions>(DEFAULT_README_OPTIONS);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [verification, setVerification] = useState<ReadmeVerification | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);

  // State: Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // State: Version History
  const [versions, setVersions] = useState<ReadmeVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>('');

  // State: AI Provider & GitHub Auth
  const [providerConfig, setProviderConfig] = useState<AIProviderConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return DEFAULT_AI_CONFIG;
  });

  const [githubToken, setGithubToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEY_GITHUB_TOKEN);
      } catch {}
    }
    return null;
  });

  const [githubUser, setGithubUser] = useState<GitHubUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_GITHUB_USER);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });

  // State: Saved Projects
  const [savedProjects, setSavedProjects] = useState<SavedProjectItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_SAVED_PROJECTS);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  // Dark mode (default true)
  const [darkMode, setDarkMode] = useState(true);

  // Save AI Provider Config changes
  const handleSaveProviderConfig = (newConfig: AIProviderConfig) => {
    setProviderConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
  };

  // Connect GitHub Auth
  const handleConnectGitHub = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setIsCommitModalOpen(true);
      }
    } catch {
      setIsCommitModalOpen(true);
    }
  };

  const handleDisconnectGitHub = () => {
    setGithubToken(null);
    setGithubUser(null);
    localStorage.removeItem(STORAGE_KEY_GITHUB_TOKEN);
    localStorage.removeItem(STORAGE_KEY_GITHUB_USER);
  };

  // Ingest & Analyze Repository
  const handleAnalyzeRepository = async (targetUrl: string, branch?: string, tokenOverride?: string) => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) return;

    setRepoUrl(cleanUrl);
    setIsAnalyzing(true);
    setAnalysisError(null);

    const activeToken = tokenOverride || githubToken || undefined;

    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: cleanUrl,
          branch: branch || undefined,
          token: activeToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze repository structure.');
      }

      const projKnowledge: ProjectKnowledge = data.knowledge;
      setKnowledge(projKnowledge);
      const curBranch = projKnowledge.project.currentBranch || 'main';
      setSelectedBranch(curBranch);

      // Fetch branches in parallel for selector
      fetch('/api/github/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: projKnowledge.project.owner,
          repo: projKnowledge.project.repo,
          token: activeToken,
        }),
      })
        .then((bRes) => bRes.json())
        .then((bData) => {
          if (bData.branches && Array.isArray(bData.branches)) {
            setAvailableBranches(bData.branches.map((b: { name: string }) => b.name));
          } else {
            setAvailableBranches([curBranch]);
          }
        })
        .catch(() => {
          setAvailableBranches([curBranch]);
        });

      setCurrentView('analysis');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to save project snapshot into local storage
  const saveProjectSnapshot = (
    kn: ProjectKnowledge,
    md: string,
    opts: ReadmeOptions
  ) => {
    const projectId = kn.project.fullName;
    setSavedProjects((prev) => {
      const existing = prev.filter((p) => p.id !== projectId);
      const updated: SavedProjectItem[] = [
        {
          id: projectId,
          knowledge: kn,
          markdown: md,
          options: opts,
          lastUpdated: Date.now(),
        },
        ...existing,
      ];
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_PROJECTS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Execute AI README Generation
  const handleGenerateReadme = async (optionsToUse = readmeOptions) => {
    if (!knowledge) return;

    setIsConfigModalOpen(false);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knowledge,
          options: optionsToUse,
          providerConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'README generation failed.');
      }

      const newMarkdown = data.markdown;
      const newVerification = data.verification || knowledge.verification;

      setGeneratedMarkdown(newMarkdown);
      setVerification(newVerification);

      // Create a snapshot version
      const newVersion = createSnapshotItem(
        newMarkdown,
        optionsToUse.style,
        `Generated (${optionsToUse.style})`,
        newVerification?.verifiedScore
      );

      setVersions((prev) => [newVersion, ...prev]);
      setCurrentVersionId(newVersion.id);

      // Auto-save project to history
      saveProjectSnapshot(knowledge, newMarkdown, optionsToUse);

      // Trigger initial validation
      triggerValidation(newMarkdown, knowledge);

      setCurrentView('builder');
    } catch (err: unknown) {
      alert(`Generation Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Validate README markdown against knowledge
  const triggerValidation = async (md: string, kn: ProjectKnowledge) => {
    try {
      const res = await fetch('/api/validate-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: md,
          knowledge: kn,
        }),
      });
      const data = await res.json();
      if (res.ok && data.validation) {
        setValidationResult(data.validation);
      }
    } catch (e) {
      console.error('Validation error:', e);
    }
  };

  const handleValidate = async () => {
    if (!knowledge || !generatedMarkdown) return;
    await triggerValidation(generatedMarkdown, knowledge);
  };

  // Section transformation handler
  const handleTransformSection = async (actionType: string, instruction?: string) => {
    if (!knowledge || !generatedMarkdown) return;

    setIsTransforming(true);
    try {
      const res = await fetch('/api/ai/transform-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          markdown: generatedMarkdown,
          knowledge,
          providerConfig,
          customInstruction: instruction,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Section transformation failed.');
      }

      const updatedMd = data.markdown;
      setGeneratedMarkdown(updatedMd);

      const newVersion = createSnapshotItem(
        updatedMd,
        readmeOptions.style,
        `Transformed (${actionType})`,
        verification?.verifiedScore
      );
      setVersions((prev) => [newVersion, ...prev]);
      setCurrentVersionId(newVersion.id);

      saveProjectSnapshot(knowledge, updatedMd, readmeOptions);
      triggerValidation(updatedMd, knowledge);
    } catch (err: unknown) {
      alert(`Transformation Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsTransforming(false);
    }
  };

  // Restore snapshot version
  const handleRestoreVersion = (ver: ReadmeVersion) => {
    setGeneratedMarkdown(ver.markdown);
    setCurrentVersionId(ver.id);
  };

  // Manual snapshot creation
  const handleSaveCurrentVersion = (label?: string) => {
    const newVersion = createSnapshotItem(
      generatedMarkdown,
      readmeOptions.style,
      label || `Manual Snapshot ${versions.length + 1}`,
      verification?.verifiedScore
    );
    setVersions((prev) => [newVersion, ...prev]);
    setCurrentVersionId(newVersion.id);
  };

  // Delete snapshot version
  const handleDeleteVersion = (id: string) => {
    setVersions((prev) => prev.filter((v) => v.id !== id));
  };

  // Delete saved project
  const handleDeleteProject = (id: string) => {
    setSavedProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_PROJECTS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Open saved project in studio
  const handleOpenSavedProject = (item: SavedProjectItem) => {
    setKnowledge(item.knowledge);
    setGeneratedMarkdown(item.markdown);
    setReadmeOptions(item.options);
    setVerification(item.knowledge.verification);
    triggerValidation(item.markdown, item.knowledge);
    setCurrentView('builder');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        providerConfig={providerConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        githubUser={githubUser}
        onConnectGitHub={handleConnectGitHub}
        onDisconnectGitHub={handleDisconnectGitHub}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        hasKnowledge={Boolean(knowledge)}
        hasMarkdown={Boolean(generatedMarkdown)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <LandingHero
            onAnalyze={handleAnalyzeRepository}
            isLoading={isAnalyzing}
            providerConfig={providerConfig}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentView === 'analysis' && knowledge && (
          <AnalysisDashboard
            knowledge={knowledge}
            onProceedToStyle={() => setIsConfigModalOpen(true)}
            onRefreshRepo={async () => {
              await handleAnalyzeRepository(knowledge.project.fullName, selectedBranch);
            }}
            isLoading={isAnalyzing}
            onBranchChange={async (newBranch) => {
              setSelectedBranch(newBranch);
              await handleAnalyzeRepository(knowledge.project.fullName, newBranch);
            }}
            availableBranches={availableBranches.length > 0 ? availableBranches : [selectedBranch || 'main']}
          />
        )}

        {currentView === 'builder' && knowledge && (
          <ReadmeBuilder
            markdown={generatedMarkdown}
            onChangeMarkdown={setGeneratedMarkdown}
            knowledge={knowledge}
            validation={validationResult}
            onValidate={handleValidate}
            onRegenerate={() => setIsConfigModalOpen(true)}
            onOpenCommitModal={() => setIsCommitModalOpen(true)}
            onOpenVersionsModal={() => setIsVersionHistoryOpen(true)}
            onSaveVersion={handleSaveCurrentVersion}
            providerConfig={providerConfig}
            onTransformSection={handleTransformSection}
            isTransforming={isTransforming}
          />
        )}

        {currentView === 'history' && (
          <SavedProjectsView
            projects={savedProjects}
            onOpenProject={handleOpenSavedProject}
            onDeleteProject={handleDeleteProject}
            onNewAnalysis={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Generation Configuration Modal */}
      {knowledge && (
        <ReadmeConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          knowledge={knowledge}
          options={readmeOptions}
          onChangeOptions={setReadmeOptions}
          onGenerate={() => handleGenerateReadme(readmeOptions)}
          isGenerating={isGenerating}
          providerConfig={providerConfig}
          onOpenSettings={() => {
            setIsConfigModalOpen(false);
            setIsSettingsOpen(true);
          }}
        />
      )}

      {/* AI Provider & Models Settings Modal */}
      <AIProviderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={providerConfig}
        onSaveConfig={handleSaveProviderConfig}
      />

      {/* 1-Click GitHub Direct Commit Modal */}
      {knowledge && (
        <GitHubCommitModal
          isOpen={isCommitModalOpen}
          onClose={() => setIsCommitModalOpen(false)}
          knowledge={knowledge}
          markdown={generatedMarkdown}
          githubUser={githubUser}
          githubToken={githubToken}
          onConnectGitHub={handleConnectGitHub}
        />
      )}

      {/* Version History & Snapshots Modal */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        versions={versions}
        currentVersionId={currentVersionId}
        onRestoreVersion={handleRestoreVersion}
        onSaveCurrentVersion={handleSaveCurrentVersion}
        onDeleteVersion={handleDeleteVersion}
      />

      {/* Interactive System Docs & Architecture Modal */}
      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
