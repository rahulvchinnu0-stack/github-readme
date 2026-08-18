import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  X,
  Download,
  Copy,
  Check,
  Share2,
  Image as ImageIcon,
  Sliders,
  Layers,
  ShieldCheck,
  Eye,
  Github,
  Twitter,
  Linkedin,
  MessageSquare,
  FileCode2,
  RefreshCw,
  Plus,
  Trash2,
  Palette,
  ExternalLink,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { ProjectKnowledge } from '@/src/types/readme';
import {
  SocialCardConfig,
  SocialCardTheme,
  SocialCardAspectRatio,
  THEME_PRESETS,
  buildDefaultSocialCardConfig,
  renderSocialCardToCanvas,
  generateOpenGraphHtml,
  generateReadmeBannerMarkdown,
  generateSocialCardSVG,
  getDimensions,
} from '@/src/lib/socialCard/generator';

interface SocialCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  knowledge: ProjectKnowledge;
  currentMarkdown: string;
  onApplyToReadme?: (mode: 'banner' | 'meta-tags' | 'both', config: SocialCardConfig) => void;
}

export function SocialCardModal({
  isOpen,
  onClose,
  knowledge,
  currentMarkdown,
  onApplyToReadme,
}: SocialCardModalProps) {
  const [config, setConfig] = useState<SocialCardConfig>(() =>
    buildDefaultSocialCardConfig(knowledge)
  );

  const [activeTab, setActiveTab] = useState<'preview' | 'meta-tags' | 'markdown-code'>('preview');
  const [previewPlatform, setPreviewPlatform] = useState<'canvas' | 'twitter' | 'linkedin' | 'discord' | 'readme-banner'>('canvas');
  const [newTagInput, setNewTagInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync default config when knowledge changes
  useEffect(() => {
    if (knowledge) {
      setConfig(buildDefaultSocialCardConfig(knowledge));
    }
  }, [knowledge]);

  // Re-render canvas on config change or tab change
  useEffect(() => {
    if (canvasRef.current && isOpen) {
      renderSocialCardToCanvas(canvasRef.current, config);
    }
  }, [config, isOpen, previewPlatform]);

  if (!isOpen) return null;

  const currentDimensions = getDimensions(config.aspectRatio);

  const ogHtml = generateOpenGraphHtml(config, knowledge?.project?.htmlUrl);
  const markdownEmbed = generateReadmeBannerMarkdown(config);
  const svgContent = generateSocialCardSVG(config);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${config.title.toLowerCase().replace(/\s+/g, '-')}-social-card.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSVG = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${config.title.toLowerCase().replace(/\s+/g, '-')}-social-card.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApply = (mode: 'banner' | 'meta-tags' | 'both') => {
    if (onApplyToReadme) {
      onApplyToReadme(mode, config);
      setAppliedNotification(
        mode === 'banner'
          ? 'Social banner inserted into README header!'
          : mode === 'meta-tags'
          ? 'OpenGraph metadata inserted into README!'
          : 'Social card banner & OpenGraph meta tags inserted into README!'
      );
      setTimeout(() => setAppliedNotification(null), 3000);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !config.tags.includes(newTagInput.trim())) {
      setConfig({
        ...config,
        tags: [...config.tags, newTagInput.trim()],
      });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setConfig({
      ...config,
      tags: config.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Social Card & OpenGraph Generator
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  SEO & Social Embed
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Craft custom 1200×630 OpenGraph banners and metadata tags grounded in your codebase facts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main 2-Column Split: Controls on Left, Live Social Previews on Right */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Customization Controls */}
          <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-gray-800 p-4 sm:p-5 overflow-y-auto space-y-5 bg-[#0d1117]/50">
            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Visual Theme & Atmosphere</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setConfig({ ...config, theme: t.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      config.theme === t.id
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-sm'
                        : 'border-gray-800 bg-[#161b22]/70 hover:border-gray-700 hover:bg-[#161b22]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <span className="font-semibold text-xs text-gray-200">{t.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Target */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Card Dimensions & Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'og' as SocialCardAspectRatio, label: 'OpenGraph / X', size: '1200 × 630', sub: '1.91:1' },
                  { id: 'banner' as SocialCardAspectRatio, label: 'GitHub Header', size: '1280 × 640', sub: '2:1' },
                  { id: 'square' as SocialCardAspectRatio, label: 'Square Avatar', size: '1080 × 1080', sub: '1:1' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setConfig({ ...config, aspectRatio: r.id })}
                    className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                      config.aspectRatio === r.id
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300 font-medium'
                        : 'border-gray-800 bg-[#161b22] text-gray-400 hover:text-gray-200 hover:border-gray-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{r.label}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{r.size}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Title & Subtitle */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  Card Headline / Project Name
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  placeholder="e.g. react, shadcn/ui"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700/80 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  Subtitle / Breadcrumb
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  placeholder="e.g. FACEBOOK/REACT • OFFICIAL DOCUMENTATION"
                  className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700/80 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">
                  Summary / Tagline
                </label>
                <textarea
                  rows={2}
                  value={config.summary}
                  onChange={(e) => setConfig({ ...config, summary: e.target.value })}
                  placeholder="e.g. A declarative, efficient, and flexible JavaScript library for building user interfaces."
                  className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700/80 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Tech Stack Tags Chips */}
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
                Tech Stack Badges ({config.tags.length})
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {config.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161b22] border border-gray-700 text-xs font-mono text-gray-200"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-rose-400 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add badge (e.g. Docker, Tailwind)..."
                  className="flex-1 px-2.5 py-1.5 bg-[#0d1117] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Display Toggles */}
            <div className="pt-2 border-t border-gray-800 space-y-2 text-xs">
              <label className="flex items-center justify-between text-gray-300 cursor-pointer">
                <span>Display GitHub Stars & Forks Stats</span>
                <input
                  type="checkbox"
                  checked={config.showMetrics}
                  onChange={(e) => setConfig({ ...config, showMetrics: e.target.checked })}
                  className="rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-gray-300 cursor-pointer">
                <span>Display "Ground Truth Verified" Badge</span>
                <input
                  type="checkbox"
                  checked={config.showVerifiedBadge}
                  onChange={(e) => setConfig({ ...config, showVerifiedBadge: e.target.checked })}
                  className="rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-gray-300 cursor-pointer">
                <span>Display Tech Stack Pills</span>
                <input
                  type="checkbox"
                  checked={config.showTags}
                  onChange={(e) => setConfig({ ...config, showTags: e.target.checked })}
                  className="rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Right Column: Live Interactive Social Mockup Previews & Code Generator */}
          <div className="w-full lg:w-7/12 p-4 sm:p-5 flex flex-col bg-[#0d1117] overflow-y-auto space-y-4">
            {/* View Switcher: Social Previews vs. Raw Meta Tags / Markdown */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-xl border border-gray-800 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1.5" />
                  Social Previews
                </button>
                <button
                  onClick={() => setActiveTab('meta-tags')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'meta-tags'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 inline mr-1.5" />
                  OpenGraph &lt;meta&gt; Tags
                </button>
                <button
                  onClick={() => setActiveTab('markdown-code')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'markdown-code'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 inline mr-1.5" />
                  Markdown Embed
                </button>
              </div>

              {/* Sub-Platform selector for live preview */}
              {activeTab === 'preview' && (
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setPreviewPlatform('canvas')}
                    className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      previewPlatform === 'canvas'
                        ? 'bg-gray-800 text-white border-gray-700'
                        : 'text-gray-400 border-transparent hover:bg-gray-800/60'
                    }`}
                  >
                    Direct Card
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('twitter')}
                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                      previewPlatform === 'twitter'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'text-gray-400 border-transparent hover:bg-gray-800/60'
                    }`}
                  >
                    <Twitter className="w-3 h-3" />
                    <span>X / Twitter</span>
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('linkedin')}
                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                      previewPlatform === 'linkedin'
                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                        : 'text-gray-400 border-transparent hover:bg-gray-800/60'
                    }`}
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('discord')}
                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                      previewPlatform === 'discord'
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                        : 'text-gray-400 border-transparent hover:bg-gray-800/60'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Discord</span>
                  </button>
                  <button
                    onClick={() => setPreviewPlatform('readme-banner')}
                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                      previewPlatform === 'readme-banner'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'text-gray-400 border-transparent hover:bg-gray-800/60'
                    }`}
                  >
                    <Github className="w-3 h-3" />
                    <span>README</span>
                  </button>
                </div>
              )}
            </div>

            {appliedNotification && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{appliedNotification}</span>
              </div>
            )}

            {/* Hidden / Shared HTML5 Canvas Element */}
            <div className="hidden">
              <canvas ref={canvasRef} />
            </div>

            {/* Tab 1: Live Interactive Previews */}
            {activeTab === 'preview' && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                {/* 1. Direct Canvas Display */}
                {previewPlatform === 'canvas' && (
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="w-full rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-[#090d16] flex items-center justify-center p-2 sm:p-4">
                      <canvas
                        ref={(el) => {
                          if (el) renderSocialCardToCanvas(el, config);
                        }}
                        className="w-full max-w-full h-auto rounded-xl shadow-lg border border-gray-800/80 object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono">
                      Native Render Resolution: {currentDimensions.width} × {currentDimensions.height}px ({currentDimensions.ratio})
                    </span>
                  </div>
                )}

                {/* 2. Twitter / X Large Summary Card Mockup */}
                {previewPlatform === 'twitter' && (
                  <div className="w-full max-w-lg bg-black border border-gray-800 rounded-2xl p-4 space-y-3 font-sans shadow-2xl">
                    <div className="flex items-start gap-3">
                      <img
                        src={config.authorAvatarUrl || 'https://github.com/github.png'}
                        alt={config.owner}
                        className="w-10 h-10 rounded-full border border-gray-700"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white">{config.owner}</span>
                          <span className="text-xs text-gray-500 font-mono">@{config.owner}</span>
                          <span className="text-xs text-gray-500">· 2m</span>
                        </div>
                        <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                          Just released an updated ground-truth documentation engine for <strong>{config.title}</strong>! Check out the interactive architecture and quickstart guide 🚀
                        </p>
                      </div>
                    </div>

                    {/* The Large OpenGraph Card Link */}
                    <div className="rounded-2xl border border-gray-800 overflow-hidden bg-[#16181c] group cursor-pointer hover:border-gray-700 transition-colors">
                      <canvas
                        ref={(el) => {
                          if (el) renderSocialCardToCanvas(el, config);
                        }}
                        className="w-full h-auto object-cover border-b border-gray-800"
                      />
                      <div className="p-3">
                        <div className="text-[11px] text-gray-400 uppercase font-mono">
                          github.com/{config.owner}/{config.title}
                        </div>
                        <div className="font-bold text-sm text-white truncate mt-0.5">
                          {config.title} — {config.summary}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {config.summary}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. LinkedIn Rich Post Mockup */}
                {previewPlatform === 'linkedin' && (
                  <div className="w-full max-w-lg bg-[#1b1f23] border border-gray-700/80 rounded-2xl p-4 space-y-3 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={config.authorAvatarUrl || 'https://github.com/github.png'}
                        alt={config.owner}
                        className="w-11 h-11 rounded-full border border-gray-600"
                      />
                      <div>
                        <div className="font-bold text-sm text-white">{config.owner}</div>
                        <div className="text-[11px] text-gray-400">Open Source Maintainer & Architect</div>
                        <div className="text-[10px] text-gray-500">Just now • 🌐</div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed">
                      Excited to announce the new developer documentation and verified architecture for <strong>{config.title}</strong>. Powered by README Architect!
                    </p>

                    <div className="rounded-xl border border-gray-700 overflow-hidden bg-[#12161a]">
                      <canvas
                        ref={(el) => {
                          if (el) renderSocialCardToCanvas(el, config);
                        }}
                        className="w-full h-auto object-cover"
                      />
                      <div className="p-3 bg-[#161b22] border-t border-gray-700">
                        <div className="text-[10px] text-gray-400 font-mono uppercase">
                          github.com
                        </div>
                        <div className="font-bold text-sm text-white truncate">
                          {config.title}: {config.summary.slice(0, 60)}...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Discord Rich Embed Mockup */}
                {previewPlatform === 'discord' && (
                  <div className="w-full max-w-lg bg-[#2b2d31] border border-[#1f2023] rounded-2xl p-4 space-y-2 font-sans shadow-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        DEV
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">DevBot</span>
                          <span className="text-[10px] uppercase px-1 py-0.5 rounded bg-indigo-500 text-white font-bold">
                            BOT
                          </span>
                          <span className="text-[10px] text-gray-400">Today at 4:20 PM</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                          Check out the repository docs: https://github.com/{config.owner}/{config.title}
                        </p>
                      </div>
                    </div>

                    {/* Discord Embed Box */}
                    <div className="ml-12 pl-3 py-2 bg-[#232428] rounded-r-lg border-l-4 border-indigo-500 space-y-2">
                      <div className="text-[11px] text-gray-400 font-medium">GitHub Repository</div>
                      <a href="#" className="font-bold text-sm text-indigo-400 hover:underline block">
                        {config.owner}/{config.title}
                      </a>
                      <p className="text-xs text-gray-300">{config.summary}</p>

                      <div className="rounded-lg overflow-hidden border border-gray-700/60 max-w-md">
                        <canvas
                          ref={(el) => {
                            if (el) renderSocialCardToCanvas(el, config);
                          }}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GitHub README Header Mockup */}
                {previewPlatform === 'readme-banner' && (
                  <div className="w-full max-w-lg bg-[#0d1117] border border-gray-800 rounded-2xl p-5 space-y-4 font-mono shadow-2xl">
                    <div className="text-xs text-gray-500 border-b border-gray-800 pb-2 flex items-center gap-2">
                      <Github className="w-4 h-4 text-gray-400" />
                      <span>README.md — Rendered GitHub Preview</span>
                    </div>

                    <div className="text-center space-y-3">
                      <canvas
                        ref={(el) => {
                          if (el) renderSocialCardToCanvas(el, config);
                        }}
                        className="w-full h-auto rounded-xl border border-gray-800 shadow-md mx-auto"
                      />

                      <div className="space-y-1 text-center font-sans">
                        <h1 className="text-xl font-extrabold text-white">{config.title}</h1>
                        <p className="text-xs text-gray-400">{config.summary}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Raw OpenGraph Meta Tags */}
            {activeTab === 'meta-tags' && (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Paste these tags inside your HTML <code>&lt;head&gt;</code> or as a top-level documentation block:
                  </span>
                  <button
                    onClick={() => handleCopy(ogHtml, 'og-tags')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCode === 'og-tags' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Meta Tags</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 bg-[#090d16] border border-gray-800 rounded-xl p-3.5 overflow-x-auto">
                  <pre className="font-mono text-xs text-indigo-300 whitespace-pre leading-relaxed">
                    {ogHtml}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 3: Markdown Embed Code */}
            {activeTab === 'markdown-code' && (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Embed snippet to display this banner at the top of your README:
                  </span>
                  <button
                    onClick={() => handleCopy(markdownEmbed, 'md-embed')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCode === 'md-embed' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 bg-[#090d16] border border-gray-800 rounded-xl p-3.5 overflow-x-auto">
                  <pre className="font-mono text-xs text-emerald-300 whitespace-pre leading-relaxed">
                    {markdownEmbed}
                  </pre>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
              {/* Export Downloads */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPNG}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-medium text-gray-200 transition-colors cursor-pointer"
                  title="Export High-Res PNG (1200x630)"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={handleDownloadSVG}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-medium text-gray-200 transition-colors cursor-pointer"
                  title="Export Scalable Vector Graphic (SVG)"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download SVG</span>
                </button>
              </div>

              {/* Direct 1-Click Insert into README */}
              {onApplyToReadme && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApply('banner')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Insert Banner in README</span>
                  </button>

                  <button
                    onClick={() => handleApply('both')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Insert Banner + Meta Tags</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
