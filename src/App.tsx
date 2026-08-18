import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ProjectKnowledge,
  ReadmeOptions,
  DEFAULT_README_OPTIONS,
  ReadmeVersion,
  AIProviderConfig,
  SavedProjectItem,
  GitHubUser,
} from '@/src/types/readme';
import { DEFAULT_AI_CONFIG } from '@/src/lib/ai/providers';
import { Navbar } from '@/src/components/Navbar';
import { LandingHero } from '@/src/components/LandingHero';
import { AnalysisDashboard } from '@/src/components/AnalysisDashboard';
import { ReadmeConfigModal } from '@/src/components/ReadmeConfigModal';
import { ReadmeBuilder } from '@/src/components/ReadmeBuilder';
import { AIProviderSettingsModal } from '@/src/components/AIProviderSettingsModal';
import { GitHubCommitModal } from '@/src/components/GitHubCommitModal';
import { VersionHistoryModal } from '@/src/components/VersionHistoryModal';
import { SavedProjectsView } from '@/src/components/SavedProjectsView';
import { DocsModal } from '@/src/components/DocsModal';
import { UsageLimitModal } from '@/src/components/UsageLimitModal';
import { GitHubLoginModal } from '@/src/components/GitHubLoginModal';
import { SocialCardModal } from '@/src/components/SocialCardModal';
import { insertSocialCardIntoReadme, SocialCardConfig } from '@/src/lib/socialCard/generator';
import { analyzeRepository } from '@/src/lib/github/parser';
import { generateGroundTruthReadme } from '@/src/lib/ai/fallbackGenerator';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'home' | 'analysis' | 'builder' | 'history'>('home');

  // Core Data State
  const [knowledge, setKnowledge] = useState<ProjectKnowledge | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [options, setOptions] = useState<ReadmeOptions>(DEFAULT_README_OPTIONS);
  const [providerConfig, setProviderConfig] = useState<AIProviderConfig>(DEFAULT_AI_CONFIG);
  const [versions, setVersions] = useState<ReadmeVersion[]>([]);
  const [savedProjects, setSavedProjects] = useState<SavedProjectItem[]>([]);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Usage Limit State (Limit = 30)
  const MAX_FREE_LIMIT = 30;
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState<boolean>(false);

  // Loading States
  const [isLoadingRepo, setIsLoadingRepo] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isCommitOpen, setIsCommitOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isGitHubLoginOpen, setIsGitHubLoginOpen] = useState<boolean>(false);
  const [isSocialCardOpen, setIsSocialCardOpen] = useState<boolean>(false);

  // Load saved projects, token & usage count on mount
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('readme_architect_projects');
      if (storedProjects) {
        setSavedProjects(JSON.parse(storedProjects));
      }
      const storedConfig = localStorage.getItem('readme_architect_ai_config');
      if (storedConfig) {
        setProviderConfig(JSON.parse(storedConfig));
      }
      const storedGh = localStorage.getItem('readme_architect_gh_user');
      if (storedGh) {
        setGithubUser(JSON.parse(storedGh));
      }
      const storedUsage = localStorage.getItem('readme_architect_usage_count');
      if (storedUsage) {
        setUsageCount(parseInt(storedUsage, 10) || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  const incrementUsage = () => {
    if (providerConfig.apiKey) return; // Custom API key doesn't consume free quota
    const nextCount = usageCount + 1;
    setUsageCount(nextCount);
    try {
      localStorage.setItem('readme_architect_usage_count', String(nextCount));
    } catch {
      // ignore
    }
  };

  // Save projects on update
  const persistProject = (k: ProjectKnowledge, md: string, opts: ReadmeOptions) => {
    const newItem: SavedProjectItem = {
      id: `${k.project.owner}-${k.project.repo}`,
      knowledge: k,
      markdown: md,
      options: opts,
      lastUpdated: Date.now(),
    };

    setSavedProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== newItem.id);
      const updated = [newItem, ...filtered];
      try {
        localStorage.setItem('readme_architect_projects', JSON.stringify(updated.slice(0, 20)));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // 1. Analyze Repository Action
  const handleAnalyzeRepository = async (targetUrl: string, branch?: string, tokenOverride?: string) => {
    setIsLoadingRepo(true);
    try {
      let repoKnowledge: ProjectKnowledge;
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            branch,
            token: tokenOverride || githubUser?.accessToken,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          repoKnowledge = data.knowledge;
        } else {
          repoKnowledge = await analyzeRepository(targetUrl, branch, tokenOverride || githubUser?.accessToken);
        }
      } catch {
        repoKnowledge = await analyzeRepository(targetUrl, branch, tokenOverride || githubUser?.accessToken);
      }

      setKnowledge(repoKnowledge);
      setCurrentView('analysis');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg);
    } finally {
      setIsLoadingRepo(false);
    }
  };

  // 2. Generate README Action
  const handleGenerateReadme = async () => {
    if (!knowledge) return;

    // Check usage limit (30 max)
    if (usageCount >= MAX_FREE_LIMIT && !providerConfig.apiKey) {
      setIsUsageModalOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      let generatedMarkdown = '';
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            knowledge,
            options,
            config: providerConfig,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.markdown) {
            generatedMarkdown = data.markdown;
          }
        }
      } catch (fetchErr) {
        console.warn('API generate endpoint error, switching to Ground-Truth generator:', fetchErr);
      }

      // If backend was not reached or returned empty, generate using deterministic ground truth engine
      if (!generatedMarkdown) {
        generatedMarkdown = generateGroundTruthReadme(knowledge, options);
      }

      setMarkdown(generatedMarkdown);
      setIsConfigOpen(false);
      setCurrentView('builder');
      incrementUsage();

      // Add to version snapshots
      const newVersion: ReadmeVersion = {
        id: `v-${Date.now()}`,
        timestamp: Date.now(),
        markdown: generatedMarkdown,
        style: options.style,
        label: `Generated (${options.style})`,
        score: knowledge.verification.truthfulnessScore,
      };
      setVersions((prev) => [newVersion, ...prev]);

      // Save project
      persistProject(knowledge, generatedMarkdown, options);

      // Trigger celebratory confetti
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#6366f1', '#10b981', '#f59e0b'],
      });
    } catch (err: unknown) {
      // Fallback guarantees generation never fails
      const fallbackMd = generateGroundTruthReadme(knowledge, options);
      setMarkdown(fallbackMd);
      setIsConfigOpen(false);
      setCurrentView('builder');
      incrementUsage();
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. AI Section Transformation
  const handleTransformSection = async (actionType: string, customInstruction?: string) => {
    if (!knowledge || !markdown) return;

    // Check usage limit
    if (usageCount >= MAX_FREE_LIMIT && !providerConfig.apiKey) {
      setIsUsageModalOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      let updatedMarkdown = '';
      try {
        const res = await fetch('/api/transform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType,
            currentMarkdown: markdown,
            knowledge,
            config: providerConfig,
            customInstruction,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.markdown) {
            updatedMarkdown = data.markdown;
          }
        }
      } catch (transformErr) {
        console.warn('API transform error, using client refactor:', transformErr);
      }

      // Client-side transformation fallback
      if (!updatedMarkdown) {
        const pm = knowledge.manifest?.packageManager || 'npm';
        if (actionType === 'enhance-diagram') {
          const mermaidBlock = `\n\n## 🏗️ Architecture & Component Flow\n\n\`\`\`mermaid\nflowchart TD\n    A[Client / Web Browser] -->|HTTP / API| B[Application Gateway]\n    B -->|Services| C[Core Logic Engine]\n    C -->|State| D[(Persistent Data Store)]\n\`\`\`\n`;
          updatedMarkdown = markdown.includes('```mermaid')
            ? markdown.replace(/```mermaid[\s\S]*?```/, mermaidBlock.trim())
            : markdown + mermaidBlock;
        } else if (actionType === 'add-quickstart') {
          const quickstartBlock = `\n\n## ⚡ Quickstart Guide\n\n\`\`\`bash\n# Install verified dependencies\n${pm} install\n\n# Run development server\n${pm} run dev\n\`\`\`\n`;
          updatedMarkdown = markdown + quickstartBlock;
        } else if (actionType === 'add-troubleshooting') {
          const troubleshootBlock = `\n\n## 🔧 Troubleshooting & FAQ\n\n| Issue | Possible Cause | Resolution |\n| :--- | :--- | :--- |\n| \`Port 3000 in use\` | Another process is binding the port | Run with custom port or kill existing process |\n| \`Missing API Key\` | \`.env\` not loaded | Ensure \`cp .env.example .env\` and set keys |\n| \`Module Not Found\` | Stale node_modules cache | Run \`${pm} install\` |\n`;
          updatedMarkdown = markdown + troubleshootBlock;
        } else if (actionType === 'add-benchmarks') {
          const benchBlock = `\n\n## 📊 Performance & Feature Comparison\n\n| Feature | ${knowledge.project.name || 'This Project'} | Standard Solutions |\n| :--- | :--- | :--- |\n| **AST Grounding** | ✅ Real-time | ❌ Hallucinated |\n| **Package Manager** | \`${pm}\` | Generic |\n| **Mermaid Flowcharts** | ✅ Native | ❌ Plain text |\n`;
          updatedMarkdown = markdown + benchBlock;
        } else {
          updatedMarkdown = markdown + `\n\n<!-- Refactored: ${actionType} -->\n`;
        }
      }

      setMarkdown(updatedMarkdown);
      incrementUsage();

      // Snapshot
      const newVersion: ReadmeVersion = {
        id: `v-${Date.now()}`,
        timestamp: Date.now(),
        markdown: updatedMarkdown,
        style: options.style,
        label: `Refactored: ${actionType}`,
        score: knowledge.verification.truthfulnessScore,
      };
      setVersions((prev) => [newVersion, ...prev]);
      persistProject(knowledge, updatedMarkdown, options);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error refactoring section.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Branch Switcher
  const handleBranchChange = async (newBranch: string) => {
    if (!knowledge) return;
    await handleAnalyzeRepository(knowledge.project.htmlUrl, newBranch);
  };

  // 5. Open Saved Project
  const handleOpenSavedProject = (item: SavedProjectItem) => {
    setKnowledge(item.knowledge);
    setMarkdown(item.markdown);
    setOptions(item.options);
    setCurrentView(item.markdown ? 'builder' : 'analysis');
  };

  // 6. Delete Saved Project
  const handleDeleteSavedProject = (id: string) => {
    setSavedProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('readme_architect_projects', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // 7. Save AI Provider config
  const handleSaveAIConfig = (newConfig: AIProviderConfig) => {
    setProviderConfig(newConfig);
    try {
      localStorage.setItem('readme_architect_ai_config', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  // 8. GitHub Connect Dialog
  const handleConnectGitHub = () => {
    setIsGitHubLoginOpen(true);
  };

  const handleLoginSuccess = (user: GitHubUser) => {
    setGithubUser(user);
    try {
      localStorage.setItem('readme_architect_gh_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  const handleDisconnectGitHub = () => {
    setGithubUser(null);
    try {
      localStorage.removeItem('readme_architect_gh_user');
    } catch {
      // ignore
    }
  };

  // 9. Apply Social Card to Markdown
  const handleApplySocialCard = (
    mode: 'banner' | 'meta-tags' | 'both',
    cardConfig: SocialCardConfig
  ) => {
    const updatedMarkdown = insertSocialCardIntoReadme(
      markdown || `# ${knowledge?.project?.name || 'Project'}\n\n${knowledge?.project?.description || ''}`,
      mode,
      cardConfig,
      knowledge?.project?.htmlUrl
    );
    setMarkdown(updatedMarkdown);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'dark bg-[#0d1117] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        providerConfig={providerConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        githubUser={githubUser}
        onConnectGitHub={handleConnectGitHub}
        onDisconnectGitHub={handleDisconnectGitHub}
        onSelectRepo={(url) => handleAnalyzeRepository(url)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        hasKnowledge={Boolean(knowledge)}
        hasMarkdown={Boolean(markdown)}
        usageCount={usageCount}
        maxLimit={MAX_FREE_LIMIT}
        onOpenUsageModal={() => setIsUsageModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <LandingHero
            onAnalyze={handleAnalyzeRepository}
            isLoading={isLoadingRepo}
            providerConfig={providerConfig}
            onOpenSettings={() => setIsSettingsOpen(true)}
            githubUser={githubUser}
            onOpenGitHubLogin={() => setIsGitHubLoginOpen(true)}
          />
        )}

        {currentView === 'analysis' && knowledge && (
          <AnalysisDashboard
            knowledge={knowledge}
            onProceedToStyle={() => {
              if (usageCount >= MAX_FREE_LIMIT && !providerConfig.apiKey) {
                setIsUsageModalOpen(true);
              } else {
                setIsConfigOpen(true);
              }
            }}
            onRefreshRepo={() => handleAnalyzeRepository(knowledge.project.htmlUrl, knowledge.project.currentBranch)}
            isLoading={isLoadingRepo}
            onBranchChange={handleBranchChange}
            availableBranches={['main', 'master', 'dev', 'develop']}
            onOpenSocialCard={() => setIsSocialCardOpen(true)}
          />
        )}

        {currentView === 'builder' && knowledge && (
          <ReadmeBuilder
            knowledge={knowledge}
            markdown={markdown}
            onChangeMarkdown={setMarkdown}
            options={options}
            onChangeOptions={setOptions}
            onRegenerate={handleGenerateReadme}
            onTransformSection={handleTransformSection}
            isProcessing={isGenerating}
            onOpenCommit={() => setIsCommitOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenConfig={() => setIsConfigOpen(true)}
            onOpenSocialCard={() => setIsSocialCardOpen(true)}
            providerConfig={providerConfig}
          />
        )}

        {currentView === 'history' && (
          <SavedProjectsView
            projects={savedProjects}
            onOpenProject={handleOpenSavedProject}
            onDeleteProject={handleDeleteSavedProject}
            onStartNew={() => setCurrentView('home')}
          />
        )}
      </main>

      {/* Modals */}
      {knowledge && (
        <>
          <ReadmeConfigModal
            isOpen={isConfigOpen}
            onClose={() => setIsConfigOpen(false)}
            knowledge={knowledge}
            options={options}
            onChangeOptions={setOptions}
            onGenerate={handleGenerateReadme}
            isGenerating={isGenerating}
            providerConfig={providerConfig}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <GitHubCommitModal
            isOpen={isCommitOpen}
            onClose={() => setIsCommitOpen(false)}
            knowledge={knowledge}
            markdown={markdown}
            githubUser={githubUser}
            onConnectGitHub={handleConnectGitHub}
          />
        </>
      )}

      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        versions={versions}
        onRestoreVersion={(v) => {
          setMarkdown(v.markdown);
          setOptions((prev) => ({ ...prev, style: v.style }));
        }}
      />

      <AIProviderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={providerConfig}
        onSaveConfig={handleSaveAIConfig}
      />

      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      <UsageLimitModal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
        usageCount={usageCount}
        maxLimit={MAX_FREE_LIMIT}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <GitHubLoginModal
        isOpen={isGitHubLoginOpen}
        onClose={() => setIsGitHubLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialUser={githubUser}
      />

      {knowledge && (
        <SocialCardModal
          isOpen={isSocialCardOpen}
          onClose={() => setIsSocialCardOpen(false)}
          knowledge={knowledge}
          currentMarkdown={markdown}
          onApplyToReadme={handleApplySocialCard}
        />
      )}
    </div>
  );
}
