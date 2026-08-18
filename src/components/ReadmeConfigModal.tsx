import React from 'react';
import {
  X,
  Sparkles,
  Layers,
  Palette,
  Globe,
  Sliders,
  Check,
  Cpu,
  FileText,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import {
  ProjectKnowledge,
  ReadmeOptions,
  ReadmeStyle,
  BadgeStyle,
  ReadmeTone,
  AIProviderConfig,
} from '@/src/types/readme';

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

interface StylePresetInfo {
  id: ReadmeStyle;
  title: string;
  badge: string;
  description: string;
}

const STYLE_PRESETS: StylePresetInfo[] = [
  {
    id: 'comprehensive',
    title: 'Full Developer & Comprehensive',
    badge: 'Recommended',
    description: 'In-depth documentation with architecture diagrams, quickstart, AST breakdown, and troubleshooting.',
  },
  {
    id: 'modern',
    title: 'Modern Minimalist',
    badge: 'Clean UI',
    description: 'Sleek typography, concise copy, and essential setup steps for fast developer onboarding.',
  },
  {
    id: 'enterprise',
    title: 'Enterprise & Corporate',
    badge: 'Governance',
    description: 'Formal structure, security compliance, architecture flowcharts, and rigorous contribution guides.',
  },
  {
    id: 'creative',
    title: 'Creative & Visual',
    badge: 'Showcase',
    description: 'Rich shields.io badges, feature showcase tables, and visual highlights.',
  },
  {
    id: 'animated',
    title: 'Animated & Interactive',
    badge: 'Badge-Heavy',
    description: 'Dynamic shields, activity stats, and animated visual assets.',
  },
  {
    id: 'cli',
    title: 'Terminal / CLI Focused',
    badge: 'DevTools',
    description: 'Optimized for command-line utilities, flags, options, and shell usage examples.',
  },
];

const BADGE_STYLES: { id: BadgeStyle; name: string }[] = [
  { id: 'flat-square', name: 'Flat Square (Default)' },
  { id: 'for-the-badge', name: 'For-the-Badge (Bold)' },
  { id: 'flat', name: 'Flat (Rounded)' },
  { id: 'plastic', name: 'Plastic (Skeuomorphic)' },
];

const TONE_OPTIONS: { id: ReadmeTone; name: string }[] = [
  { id: 'developer', name: 'Technical & Developer-centric' },
  { id: 'executive', name: 'High-level & Executive' },
  { id: 'concise', name: 'Ultra-concise & Minimal' },
  { id: 'playful', name: 'Engaging & Modern' },
];

const LANGUAGES = [
  'English',
  'Spanish',
  'Chinese (Simplified)',
  'Japanese',
  'German',
  'French',
  'Portuguese',
  'Hindi',
];

export function ReadmeConfigModal({
  isOpen,
  onClose,
  knowledge,
  options,
  onChangeOptions,
  onGenerate,
  isGenerating,
  providerConfig,
  onOpenSettings,
}: ReadmeConfigModalProps) {
  if (!isOpen) return null;

  const handleSectionToggle = (sectionKey: keyof typeof options.sections) => {
    onChangeOptions({
      ...options,
      sections: {
        ...options.sections,
        [sectionKey]: !options.sections[sectionKey],
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-100">
                Customize README Architecture & Style
              </h2>
              <p className="text-xs text-gray-400">
                Tailor sections, diagram formatting, tone, and badges for {knowledge.project.fullName}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Style Selection Cards */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              1. Choose README Aesthetic & Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {STYLE_PRESETS.map((st) => {
                const isSelected = options.style === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onChangeOptions({ ...options, style: st.id })}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                        : 'bg-[#0d1117] border-gray-800 hover:border-gray-700 text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{st.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">
                        {st.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Inclusions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                2. Documentation Sections & Architectural Components
              </label>
              <span className="text-xs text-gray-500">
                {Object.values(options.sections).filter(Boolean).length} enabled
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {Object.entries(options.sections).map(([secKey, isEnabled]) => (
                <button
                  key={secKey}
                  type="button"
                  onClick={() => handleSectionToggle(secKey as keyof typeof options.sections)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    isEnabled
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                      : 'bg-[#0d1117] border-gray-800 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="capitalize font-mono text-[11px]">
                    {secKey.replace(/([A-Z])/g, ' $1')}
                  </span>
                  {isEnabled && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Diagrams & Visual Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0d1117] border border-gray-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-gray-200 block">
                    Mermaid Architecture Diagram
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Generate valid GitHub flowchart diagrams
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeMermaidDiagram}
                  onChange={(e) =>
                    onChangeOptions({
                      ...options,
                      includeMermaidDiagram: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <div>
                  <span className="font-semibold text-xs text-gray-200 block">
                    Directory Structure Tree
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Include clean ASCII file hierarchy
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={options.includeTreeDiagram}
                  onChange={(e) =>
                    onChangeOptions({
                      ...options,
                      includeTreeDiagram: e.target.checked,
                    })
                  }
                  className="rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Badges & Tone Controls */}
            <div className="p-4 bg-[#0d1117] border border-gray-800 rounded-xl space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  Shields.io Badge Style
                </label>
                <select
                  value={options.badgeStyle}
                  onChange={(e) =>
                    onChangeOptions({
                      ...options,
                      badgeStyle: e.target.value as BadgeStyle,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-[#161b22] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none"
                >
                  {BADGE_STYLES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">
                    Tone & Voice
                  </label>
                  <select
                    value={options.tone}
                    onChange={(e) =>
                      onChangeOptions({
                        ...options,
                        tone: e.target.value as ReadmeTone,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#161b22] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none"
                  >
                    {TONE_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">
                    Language
                  </label>
                  <select
                    value={options.language}
                    onChange={(e) =>
                      onChangeOptions({
                        ...options,
                        language: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-[#161b22] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Prompt Instructions */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              3. Additional Custom Instructions (Optional)
            </label>
            <textarea
              value={options.customInstructions || ''}
              onChange={(e) =>
                onChangeOptions({
                  ...options,
                  customInstructions: e.target.value,
                })
              }
              placeholder="e.g. Highlight the zero-dependency CLI mode, emphasize Docker deployment, and include an FAQ about rate limits."
              rows={2}
              className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700/80 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Powered by</span>
            <button
              onClick={onOpenSettings}
              className="text-blue-400 hover:text-blue-300 font-mono font-semibold underline underline-offset-2"
            >
              {providerConfig.model}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing README...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate README</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
