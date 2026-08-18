'use client';

import React, { useState } from 'react';
import {
  ReadmeOptions,
  ReadmeStyle,
  ProjectKnowledge,
  AIProviderConfig,
} from '@/types/readme';
import {
  Sparkles,
  X,
  Check,
  Layers,
  Wand2,
  FileText,
  Sliders,
  Eye,
  Terminal,
  Shield,
  Palette,
  Activity,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { PROVIDER_CATALOG } from '@/lib/ai/providers';

interface ReadmeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledge: ProjectKnowledge;
  options: ReadmeOptions;
  onChangeOptions: (opts: ReadmeOptions) => void;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  providerConfig: AIProviderConfig;
  onOpenSettings: () => void;
}

const STYLES: {
  id: ReadmeStyle;
  name: string;
  badge: string;
  description: string;
  preview: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Industry Standard',
    description: 'Clean developer documentation with structured hierarchy, tables, prerequisites, and runnable commands.',
    preview: '# Project\n> Crisp overview\n\n## Quickstart\n```bash\nnpm install\n```',
    icon: <FileText className="w-5 h-5 text-blue-400" />,
  },
  {
    id: 'modern',
    name: 'Modern & Visual',
    badge: 'Popular',
    description: 'Sleek Shields.io badges, feature cards, modern GitHub callouts (> [!NOTE]), and vibrant layout.',
    preview: '[![React](https://img.shields.io/badge/React-20232A)]\n\n> [!TIP]\n> Instant install with 1 command',
    icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
  },
  {
    id: 'animated',
    name: 'Animated & Dynamic',
    badge: 'Interactive',
    description: 'Typing ASCII/SVG banners, terminal animation code blocks, and dynamic badge clusters.',
    preview: '<div align="center">\n  <img src="typing.svg" />\n</div>\n\n```bash\n$ run app --watch\n```',
    icon: <Activity className="w-5 h-5 text-pink-400" />,
  },
  {
    id: 'creative',
    name: 'Creative & Bold',
    badge: 'Distinctive',
    description: 'Distinctive ASCII header art, stylized section dividers, and high-impact presentation with verified facts.',
    preview: '```text\n  ___  ____  __  __\n / _ \\|  _ \\|  \\/  |\n| (_) | |_) | |\\/| |\n```\n---',
    icon: <Palette className="w-5 h-5 text-purple-400" />,
  },
  {
    id: 'minimal',
    name: 'Minimal & Concise',
    badge: 'Zero Fluff',
    description: 'Hyper-dense 1-page quick reference with direct install commands and environment tables.',
    preview: '# App\n2-sentence description.\n\n### Commands\n| Run | `npm start` |',
    icon: <Terminal className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Architecture',
    badge: 'Production Grade',
    description: 'Rigorous architectural topology, compliance policy, security notes, and production deployment guide.',
    preview: '## Architecture\n```mermaid\ngraph TD; Client-->API-->DB\n```\n## Compliance',
    icon: <Shield className="w-5 h-5 text-amber-400" />,
  },
];

export const ReadmeConfigModal: React.FC<ReadmeConfigModalProps> = ({
  isOpen,
  onClose,
  knowledge,
  options,
  onChangeOptions,
  onGenerate,
  isGenerating,
  providerConfig,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'sections' | 'custom'>('style');

  if (!isOpen) return null;

  const currentProvider = PROVIDER_CATALOG[providerConfig.provider];

  const handleSectionToggle = (key: keyof ReadmeOptions['sections']) => {
    onChangeOptions({
      ...options,
      sections: {
        ...options.sections,
        [key]: !options.sections[key],
      },
    });
  };

  const handleSelectStyle = (style: ReadmeStyle) => {
    onChangeOptions({ ...options, style });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">README Configuration & Style Studio</h2>
              <p className="text-xs text-gray-400">
                Customizing documentation for <strong className="text-gray-200">{knowledge.project.fullName}</strong>
              </p>
            </div>
          </div>

          <button
            id="close-config-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 border-b border-[#30363d] flex items-center gap-4 text-xs font-semibold">
          <button
            id="tab-select-style-btn"
            onClick={() => setActiveTab('style')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'style'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            1. Select Design Style
          </button>

          <button
            id="tab-select-sections-btn"
            onClick={() => setActiveTab('sections')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sections'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Included Sections & Badges
          </button>

          <button
            id="tab-select-custom-btn"
            onClick={() => setActiveTab('custom')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            3. Tone & Custom Directives
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: STYLES */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300">
                Choose the visual layout and typographic tone for your generated README. All styles strictly respect verified repository facts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STYLES.map((style) => (
                  <div
                    key={style.id}
                    id={`style-card-${style.id}`}
                    onClick={() => handleSelectStyle(style.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      options.style === style.id
                        ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                        : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {style.icon}
                          <span className="font-bold text-white text-sm">{style.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#21262d] text-gray-300">
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{style.description}</p>
                    </div>

                    <div className="bg-[#161b22] p-2.5 rounded-lg border border-[#30363d]/60 font-mono text-[10px] text-gray-400 whitespace-pre">
                      {style.preview}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS & BADGES */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              {/* Badges and Diagrams */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Badge Density</label>
                  <select
                    value={options.badgeLevel}
                    onChange={(e) => onChangeOptions({ ...options, badgeLevel: e.target.value as any })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="minimal">Minimal (License & Status)</option>
                    <option value="standard">Standard (Stack & License)</option>
                    <option value="comprehensive">Comprehensive (All Tools & Stats)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Badge Visual Style</label>
                  <select
                    value={options.badgeStyle}
                    onChange={(e) => onChangeOptions({ ...options, badgeStyle: e.target.value as any })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="flat">Flat</option>
                    <option value="flat-square">Flat Square</option>
                    <option value="for-the-badge">For the Badge</option>
                    <option value="plastic">Plastic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Target Language</label>
                  <select
                    value={options.language}
                    onChange={(e) => onChangeOptions({ ...options, language: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                    <option value="Chinese">Chinese (简体中文)</option>
                    <option value="Portuguese">Portuguese (Português)</option>
                  </select>
                </div>
              </div>

              {/* Diagrams Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                <label className="flex items-center gap-2.5 text-xs text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeMermaidDiagram}
                    onChange={(e) => onChangeOptions({ ...options, includeMermaidDiagram: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-[#161b22] border-[#30363d]"
                  />
                  <span>Include Mermaid Architecture Flow Diagram</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeTreeDiagram}
                    onChange={(e) => onChangeOptions({ ...options, includeTreeDiagram: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-[#161b22] border-[#30363d]"
                  />
                  <span>Include Visual Directory Tree Summary</span>
                </label>
              </div>

              {/* Sections Matrix */}
              <div>
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                  Document Sections Selection
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(options.sections).map(([key, isEnabled]) => (
                    <label
                      key={key}
                      className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isEnabled
                          ? 'bg-blue-600/10 border-blue-500/40 text-white'
                          : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleSectionToggle(key as keyof ReadmeOptions['sections'])}
                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 bg-[#161b22] border-[#30363d]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TONE & CUSTOM DIRECTIVES */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Typographic & Documentation Tone</label>
                <select
                  value={options.tone}
                  onChange={(e) => onChangeOptions({ ...options, tone: e.target.value as any })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="professional">Professional & Technical (Recommended)</option>
                  <option value="developer-first">Developer-First & Action-Oriented</option>
                  <option value="friendly">Friendly & Welcoming to Contributors</option>
                  <option value="academic">Academic & Architectural Rigor</option>
                  <option value="concise">Hyper-Concise / Minimal Prose</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Special Instructions / Custom Directives (Optional)
                </label>
                <textarea
                  value={options.customInstructions || ''}
                  onChange={(e) => onChangeOptions({ ...options, customInstructions: e.target.value })}
                  placeholder="e.g., Emphasize Docker deployment, include quick troubleshooting for port conflicts, highlight the Next.js App Router structure..."
                  rows={4}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0d1117] border-t border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              Engine: <strong className="text-gray-200">{currentProvider?.name}</strong> ({providerConfig.model})
            </span>
            <button
              onClick={onOpenSettings}
              className="text-blue-400 hover:underline ml-1 cursor-pointer text-[11px]"
            >
              Change
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="cancel-config-btn"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="generate-readme-submit-btn"
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing README...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate README Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
