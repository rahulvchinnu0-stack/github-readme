import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  GitBranch,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Sliders,
  History,
  Eye,
  Edit3,
  FileCode,
  Layers,
  Wand2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Table,
  Terminal,
  Info,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Share2,
} from 'lucide-react';
import {
  ProjectKnowledge,
  ReadmeOptions,
  ValidationResult,
  VerificationReport,
  ReadmeStyle,
  AIProviderConfig,
} from '@/src/types/readme';
import { MarkdownRenderer } from '@/src/lib/markdown/renderer';
import { verifyReadmeMarkdown } from '@/src/lib/verifier';

interface ReadmeBuilderProps {
  knowledge: ProjectKnowledge;
  markdown: string;
  onChangeMarkdown: (newMd: string) => void;
  options: ReadmeOptions;
  onChangeOptions: (opts: ReadmeOptions) => void;
  onRegenerate: () => Promise<void>;
  onTransformSection: (action: string, customInstruction?: string) => Promise<void>;
  isProcessing: boolean;
  onOpenCommit: () => void;
  onOpenHistory: () => void;
  onOpenConfig: () => void;
  onOpenSocialCard?: () => void;
  providerConfig: AIProviderConfig;
}

export function ReadmeBuilder({
  knowledge,
  markdown,
  onChangeMarkdown,
  options,
  onChangeOptions,
  onRegenerate,
  onTransformSection,
  isProcessing,
  onOpenCommit,
  onOpenHistory,
  onOpenConfig,
  onOpenSocialCard,
  providerConfig,
}: ReadmeBuilderProps) {
  const [rightView, setRightView] = useState<'preview' | 'audit' | 'raw'>('preview');
  const [mobileViewTab, setMobileViewTab] = useState<'split' | 'editor' | 'preview'>('split');
  const [copied, setCopied] = useState(false);
  const [customTransformText, setCustomTransformText] = useState('');
  const [showTransformMenu, setShowTransformMenu] = useState(false);

  // Compute live anti-hallucination verification
  const { validation, report } = useMemo(() => {
    return verifyReadmeMarkdown(markdown, knowledge);
  }, [markdown, knowledge]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'README.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Quick Markdown Snippet Insertions
  const insertSnippet = (snippet: string) => {
    onChangeMarkdown(markdown + '\n\n' + snippet);
  };

  const wordCount = useMemo(() => {
    return markdown.trim().split(/\s+/).filter(Boolean).length;
  }, [markdown]);

  const lineCount = useMemo(() => {
    return markdown.split('\n').length;
  }, [markdown]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#0d1117]">
      {/* Top Action & Toolbar */}
      <div className="border-b border-gray-800 bg-[#161b22] px-3 sm:px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0">
        {/* Left Side: Repo info & quick inserts */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 font-mono text-xs text-gray-200 shrink-0">
            <span className="font-bold text-white max-w-[140px] sm:max-w-[200px] truncate" title={knowledge.project.fullName}>
              {knowledge.project.fullName}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-blue-400 capitalize text-[11px] sm:text-xs">{options.style}</span>
          </div>

          <div className="h-4 w-[1px] bg-gray-800 shrink-0 hidden sm:block" />

          {/* Quick Markdown Inserts */}
          <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() =>
                insertSnippet(
                  `> [!NOTE]\n> **Important Update:** Follow these guidelines carefully.`
                )
              }
              className="text-[11px] px-2 py-1 rounded bg-gray-800/80 hover:bg-gray-800 text-gray-300 border border-gray-700/50 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              title="Insert GitHub Admonition Callout"
            >
              <Info className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">Callout</span>
            </button>

            <button
              onClick={() =>
                insertSnippet(
                  `\`\`\`mermaid\nflowchart TD\n    A[Client App] -->|HTTPS REST| B[API Gateway]\n    B --> C[(PostgreSQL DB)]\n    B --> D[Redis Cache]\n\`\`\``
                )
              }
              className="text-[11px] px-2 py-1 rounded bg-gray-800/80 hover:bg-gray-800 text-gray-300 border border-gray-700/50 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              title="Insert Mermaid Architecture Flowchart"
            >
              <Layers className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Mermaid</span>
            </button>

            <button
              onClick={() =>
                insertSnippet(
                  `| Variable | Description | Default |\n| :--- | :--- | :--- |\n| \`PORT\` | Service port | \`3000\` |\n| \`DATABASE_URL\` | Postgres connection string | - |`
                )
              }
              className="text-[11px] px-2 py-1 rounded bg-gray-800/80 hover:bg-gray-800 text-gray-300 border border-gray-700/50 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              title="Insert Markdown Table"
            >
              <Table className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Table</span>
            </button>

            <button
              onClick={() =>
                insertSnippet(
                  `<details>\n<summary><strong>Advanced Configuration & Tuning</strong></summary>\n\nDetailed walkthrough goes here.\n\n</details>`
                )
              }
              className="text-[11px] px-2 py-1 rounded bg-gray-800/80 hover:bg-gray-800 text-gray-300 border border-gray-700/50 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              title="Insert Collapsible Section"
            >
              <ChevronDown className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Collapsible</span>
            </button>

            {onOpenSocialCard && (
              <button
                onClick={onOpenSocialCard}
                className="text-[11px] px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                title="Design & Insert OpenGraph Social Card"
              >
                <Share2 className="w-3 h-3 text-indigo-400" />
                <span>Card</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: AI Transform, Commit, Export */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar justify-between sm:justify-end shrink-0">
          {/* Social Card Modal Launcher */}
          {onOpenSocialCard && (
            <button
              onClick={onOpenSocialCard}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-all shadow-sm shrink-0 cursor-pointer group"
              title="Generate OpenGraph Social Image & Metadata"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Social Card</span>
            </button>
          )}

          {/* AI Transform Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowTransformMenu(!showTransformMenu)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Refactor</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showTransformMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl p-3 z-50 space-y-2">
                <span className="text-[11px] font-semibold uppercase text-gray-400 block px-1">
                  AI Transformation Actions
                </span>

                <div className="space-y-1">
                  {[
                    { id: 'enhance-diagram', label: 'Upgrade Mermaid Architecture', desc: 'Add detailed component flow' },
                    { id: 'add-quickstart', label: 'Ensure Verified Quickstart', desc: 'Grounded in true manifest scripts' },
                    { id: 'add-troubleshooting', label: 'Add Troubleshooting Guide', desc: 'Port collisions & env errors' },
                    { id: 'add-benchmarks', label: 'Add Comparison & Benchmarks', desc: 'Markdown performance matrix' },
                    { id: 'shorten', label: 'Condense & Tighten Prose', desc: 'Ultra-concise without losing facts' },
                    { id: 'contributing', label: 'Add Conventional Contributing', desc: 'Branch & commit guidelines' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() => {
                        setShowTransformMenu(false);
                        onTransformSection(act.id);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-800 text-xs text-gray-200 transition-colors cursor-pointer"
                    >
                      <div className="font-medium text-indigo-300">{act.label}</div>
                      <div className="text-[10px] text-gray-500">{act.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Instruction */}
                <div className="pt-2 border-t border-gray-800">
                  <span className="text-[10px] text-gray-400 block mb-1">Custom Prompt:</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={customTransformText}
                      onChange={(e) => setCustomTransformText(e.target.value)}
                      placeholder="e.g. emphasize cloud deployment..."
                      className="w-full px-2.5 py-1 bg-[#0d1117] border border-gray-700 rounded text-xs text-gray-200 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (customTransformText.trim()) {
                          setShowTransformMenu(false);
                          onTransformSection('custom', customTransformText.trim());
                          setCustomTransformText('');
                        }
                      }}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium cursor-pointer"
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reconfigure Options */}
          <button
            onClick={onOpenConfig}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-colors shrink-0 cursor-pointer"
            title="Reconfigure style and sections"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-colors shrink-0 cursor-pointer"
            title="View snapshots and version history"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 transition-colors shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 transition-colors shrink-0 cursor-pointer"
            title="Download README.md"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* 1-Click GitHub Commit */}
          <button
            onClick={onOpenCommit}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Commit</span>
          </button>
        </div>
      </div>

      {/* Mobile-Only Pane Switcher Bar */}
      <div className="flex md:hidden items-center justify-between px-3 py-1.5 border-b border-gray-800 bg-[#161b22]/95 shrink-0">
        <div className="flex items-center bg-gray-900/90 p-0.5 rounded-lg border border-gray-800 text-xs w-full">
          <button
            onClick={() => setMobileViewTab('editor')}
            className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer ${
              mobileViewTab === 'editor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => setMobileViewTab('preview')}
            className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer ${
              mobileViewTab === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            onClick={() => setMobileViewTab('split')}
            className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer ${
              mobileViewTab === 'split'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Split Stack</span>
          </button>
        </div>
      </div>

      {/* Main Studio Editor: Responsive Split Pane */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto md:overflow-hidden">
        {/* Left Pane: Markdown Editor */}
        <div
          className={`${
            mobileViewTab === 'preview' ? 'hidden md:flex' : 'flex'
          } w-full md:w-1/2 flex-col border-b md:border-b-0 md:border-r border-gray-800 bg-[#0d1117] ${
            mobileViewTab === 'split' ? 'h-[360px] sm:h-[400px] md:h-full shrink-0 md:shrink' : 'flex-1 h-full min-h-[300px]'
          }`}
        >
          <div className="px-3 sm:px-4 py-2 border-b border-gray-800 bg-[#161b22]/50 flex items-center justify-between text-xs text-gray-400 font-mono shrink-0">
            <div className="flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>README.md (Raw Markdown)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span>{lineCount} lines</span>
              <span>{wordCount} words</span>
            </div>
          </div>

          <textarea
            value={markdown}
            onChange={(e) => onChangeMarkdown(e.target.value)}
            placeholder="Type or edit your README markdown here..."
            className="flex-1 w-full p-3 sm:p-4 bg-[#0d1117] text-gray-200 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed select-text overflow-y-auto"
            spellCheck={false}
          />
        </div>

        {/* Right Pane: Live GitHub Preview / Verification Audit */}
        <div
          className={`${
            mobileViewTab === 'editor' ? 'hidden md:flex' : 'flex'
          } w-full md:w-1/2 flex-col bg-[#0d1117] ${
            mobileViewTab === 'split' ? 'min-h-[420px] flex-1 md:h-full md:overflow-hidden' : 'flex-1 h-full min-h-0 md:overflow-hidden'
          }`}
        >
          {/* Header Controls for Right Pane */}
          <div className="px-3 sm:px-4 py-2 border-b border-gray-800 bg-[#161b22]/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-xs">
              <button
                onClick={() => setRightView('preview')}
                className={`px-2.5 sm:px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  rightView === 'preview'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>GitHub Preview</span>
              </button>

              <button
                onClick={() => setRightView('audit')}
                className={`px-2.5 sm:px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  rightView === 'audit'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ground Truth Audit</span>
                <span className="sm:hidden">Audit</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    validation.score >= 90
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : validation.score >= 70
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {validation.score}%
                </span>
              </button>

              <button
                onClick={() => setRightView('raw')}
                className={`px-2 sm:px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  rightView === 'raw'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Raw</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-gray-500">
              <span className="hidden sm:inline">Truthfulness:</span>
              <span
                className={`font-bold ${
                  validation.score >= 90
                    ? 'text-emerald-400'
                    : validation.score >= 70
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {validation.score}%
              </span>
            </div>
          </div>

          {/* Right Pane Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {rightView === 'preview' && (
              <div className="max-w-3xl mx-auto">
                <MarkdownRenderer content={markdown} />
              </div>
            )}

            {rightView === 'audit' && (
              <div className="max-w-3xl mx-auto space-y-5">
                {/* Score Summary Box */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/30 border border-blue-900/50 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-sm text-gray-100">
                        Codebase Verification Engine
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Compares every markdown command, script, dependency, and env var against verified repository facts.
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                      {validation.score}%
                    </span>
                    <span className="text-[10px] text-gray-400 block">Truth Score</span>
                  </div>
                </div>

                {/* Discrepancies if any */}
                {report.discrepancies.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flagged Inconsistencies & Recommendations</span>
                    </span>

                    {report.discrepancies.map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-300">{d.issue}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            {d.severity}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-[11px]">
                          <div>
                            <span className="text-gray-500 block">Codebase Fact:</span>
                            <code className="text-gray-200">{d.codebaseFact}</code>
                          </div>
                          <div>
                            <span className="text-gray-500 block">README Claim:</span>
                            <code className="text-rose-300">{d.readmeClaim}</code>
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
                          <span className="text-amber-200">Suggested Fix: {d.suggestedFix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Validation Items List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-gray-400 block">
                    Verified Ground Truth Checks
                  </span>

                  <div className="space-y-1.5">
                    {validation.items.map((it) => (
                      <div
                        key={it.id}
                        className="p-3 rounded-lg bg-[#161b22] border border-gray-800 flex items-start gap-2.5 text-xs"
                      >
                        {it.type === 'pass' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {it.type === 'warning' && (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        {it.type === 'error' && (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-gray-200">{it.message}</p>
                          {it.context && (
                            <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                              Section: {it.context}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightView === 'raw' && (
              <pre className="p-4 bg-[#161b22] rounded-xl border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto select-text leading-relaxed">
                <code>{markdown}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
