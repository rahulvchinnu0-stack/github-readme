'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import confetti from 'canvas-confetti';
import {
  ProjectKnowledge,
  ValidationResult,
  AIProviderConfig,
  ReadmeVersion,
} from '@/types/readme';
import {
  Code2,
  Eye,
  Columns,
  Sparkles,
  Download,
  Copy,
  Check,
  Github,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Wand2,
  GitCommit,
  CheckCircle2,
  FileCode2,
  Maximize2,
  History,
  Layers,
} from 'lucide-react';

// Dynamically import Monaco Editor to avoid SSR window issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface ReadmeBuilderProps {
  markdown: string;
  onChangeMarkdown: (md: string) => void;
  knowledge: ProjectKnowledge;
  validation: ValidationResult | null;
  onValidate: () => Promise<void>;
  onRegenerate: () => void;
  onOpenCommitModal: () => void;
  onOpenVersionsModal: () => void;
  onSaveVersion: (note?: string) => void;
  providerConfig: AIProviderConfig;
  onTransformSection: (actionType: any, instruction?: string) => Promise<void>;
  isTransforming: boolean;
}

export const ReadmeBuilder: React.FC<ReadmeBuilderProps> = ({
  markdown,
  onChangeMarkdown,
  knowledge,
  validation,
  onValidate,
  onRegenerate,
  onOpenCommitModal,
  onOpenVersionsModal,
  onSaveVersion,
  providerConfig,
  onTransformSection,
  isTransforming,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [copied, setCopied] = useState(false);
  const [showValidatorDrawer, setShowValidatorDrawer] = useState(true);
  const [showTransformMenu, setShowTransformMenu] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPromptModal, setShowCustomPromptModal] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${knowledge.project.repo || 'README'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = (codeStr: string, id: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-[#0d1117] text-white">
      {/* Top Studio Action Bar */}
      <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: View Modes & Repo info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
            <span className="text-gray-400 font-normal">Editing:</span>
            <span className="text-blue-400">{knowledge.project.fullName}</span>
            <code className="text-[10px] px-1.5 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-gray-400">
              README.md
            </code>
          </div>

          <div className="h-4 w-px bg-[#30363d] hidden sm:block" />

          {/* View Mode Buttons */}
          <div className="flex items-center bg-[#0d1117] p-0.5 rounded-lg border border-[#30363d] text-xs">
            <button
              id="view-mode-split-btn"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'split' ? 'bg-[#21262d] text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
              title="Split 50/50 View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>

            <button
              id="view-mode-editor-btn"
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'editor' ? 'bg-[#21262d] text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
              title="Monaco Editor Only"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Editor</span>
            </button>

            <button
              id="view-mode-preview-btn"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'preview' ? 'bg-[#21262d] text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
              title="Live Markdown Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Preview</span>
            </button>
          </div>
        </div>

        {/* Right: Actions (AI Transforms, Validation, Export, Commit) */}
        <div className="flex items-center gap-2">
          {/* AI Quick Transforms Dropdown */}
          <div className="relative">
            <button
              id="ai-transforms-menu-btn"
              onClick={() => setShowTransformMenu(!showTransformMenu)}
              disabled={isTransforming}
              className="bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isTransforming ? 'animate-spin' : ''}`} />
              <span>AI Refine</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showTransformMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-500">
                  Precision Transformations
                </div>

                <button
                  onClick={() => {
                    setShowTransformMenu(false);
                    onTransformSection('make_professional');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-[#21262d] flex items-center gap-2"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Refactor to Professional Docs</span>
                </button>

                <button
                  onClick={() => {
                    setShowTransformMenu(false);
                    onTransformSection('make_creative');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-[#21262d] flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Enhance Visuals & Style</span>
                </button>

                <button
                  onClick={() => {
                    setShowTransformMenu(false);
                    onTransformSection('add_mermaid');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-[#21262d] flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inject Mermaid Architecture</span>
                </button>

                <button
                  onClick={() => {
                    setShowTransformMenu(false);
                    onTransformSection('add_animations');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-[#21262d] flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Add Typing Banners & Animations</span>
                </button>

                <button
                  onClick={() => {
                    setShowTransformMenu(false);
                    onTransformSection('simplify');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-[#21262d] flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Condense & Make Minimal</span>
                </button>

                <button
                  onClick={() => {
                    setShowTransformMenu(false);
                    onTransformSection('fix_accuracy');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-[#21262d] flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strict Anti-Hallucination Audit</span>
                </button>

                <div className="border-t border-[#30363d] my-1" />

                <button
                  onClick={() => {
                    setShowTransformMenu(false);
                    setShowCustomPromptModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-indigo-300 hover:bg-[#21262d] flex items-center gap-2"
                >
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Custom AI Instruction...</span>
                </button>
              </div>
            )}
          </div>

          {/* Regenerate */}
          <button
            id="builder-regenerate-btn"
            onClick={onRegenerate}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition-colors cursor-pointer"
            title="Re-configure & Regenerate"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Versions Snapshot */}
          <button
            id="builder-versions-btn"
            onClick={onOpenVersionsModal}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition-colors cursor-pointer"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Copy Button */}
          <button
            id="builder-copy-markdown-btn"
            onClick={handleCopyMarkdown}
            className="bg-[#21262d] hover:bg-[#30363d] text-gray-200 hover:text-white border border-[#30363d] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          >
            {copied ? (
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

          {/* Download Button */}
          <button
            id="builder-download-btn"
            onClick={handleDownloadMarkdown}
            className="bg-[#21262d] hover:bg-[#30363d] text-gray-200 hover:text-white border border-[#30363d] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            title="Download README.md"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Commit to GitHub Button */}
          <button
            id="builder-commit-github-btn"
            onClick={onOpenCommitModal}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit to GitHub</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Monaco Editor / Markdown Preview) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Monaco Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2 border-r border-[#30363d]' : 'w-full'
            } h-full bg-[#0d1117] flex flex-col`}
          >
            <div className="px-4 py-1.5 bg-[#161b22]/70 border-b border-[#30363d]/50 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-mono">Markdown Source</span>
              <span>{markdown.split('\n').length} lines • {markdown.length} chars</span>
            </div>

            <div className="flex-1 relative">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                theme="vs-dark"
                value={markdown}
                onChange={(val) => onChangeMarkdown(val || '')}
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: 'line',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                }}
              />
            </div>
          </div>
        )}

        {/* Right: Live GitHub Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            } h-full bg-[#0d1117] flex flex-col overflow-hidden`}
          >
            <div className="px-4 py-1.5 bg-[#161b22]/70 border-b border-[#30363d]/50 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-blue-400" />
                Live GitHub Preview (GitHub Native Rendering)
              </span>
              <span>Visual Mode</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="max-w-4xl mx-auto github-markdown bg-[#0d1117] text-[#c9d1d9]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // Enhanced code block styling with 1-click copy
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const codeId = Math.random().toString(36).substring(7);

                      if (!inline && match) {
                        return (
                          <div className="relative group my-4 rounded-xl overflow-hidden border border-[#30363d]">
                            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-[#30363d] text-[11px] text-gray-400 font-mono">
                              <span>{match[1]}</span>
                              <button
                                onClick={() => handleCopyCode(codeString, codeId)}
                                className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedCodeId === codeId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <pre className="p-4 bg-[#0d1117] overflow-x-auto text-xs font-mono text-gray-200 leading-relaxed">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        );
                      }
                      return (
                        <code className="px-1.5 py-0.5 rounded bg-[#161b22] text-[#58a6ff] text-xs font-mono border border-[#30363d]/60" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // GitHub blockquote alerts styling
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 bg-[#161b22]/60 px-4 py-2 my-4 rounded-r-lg text-gray-300">
                          {children}
                        </blockquote>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4 border border-[#30363d] rounded-xl">
                          <table className="w-full text-left text-xs border-collapse">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="p-2.5 bg-[#161b22] border-b border-[#30363d] font-bold text-gray-200">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="p-2.5 border-b border-[#30363d]/60 text-gray-300">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Quality & Anti-Hallucination Drawer */}
      <div className="bg-[#161b22] border-t border-[#30363d] shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowValidatorDrawer(!showValidatorDrawer)}
              className="flex items-center gap-2 text-xs font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-Hallucination Quality Audit</span>
              {showValidatorDrawer ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>

            {validation && (
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  Score: {validation.overallScore}/100
                </span>
                <span className="text-gray-400 hidden sm:inline">
                  Accuracy: <strong className="text-gray-200">{validation.scores.technicalAccuracy}%</strong>
                </span>
                <span className="text-gray-400 hidden sm:inline">
                  Coverage: <strong className="text-gray-200">{validation.scores.documentationCoverage}%</strong>
                </span>
                <span className="text-gray-400 hidden sm:inline">
                  Risk: <strong className={validation.scores.hallucinationRisk === 'Low' ? 'text-emerald-400' : 'text-amber-400'}>{validation.scores.hallucinationRisk}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="re-validate-btn"
              onClick={onValidate}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2.5 py-1 rounded hover:bg-[#21262d] transition-colors cursor-pointer"
            >
              Re-Audit
            </button>
          </div>
        </div>

        {/* Expanded Audit Details */}
        {showValidatorDrawer && validation && (
          <div className="px-4 pb-3 pt-1 border-t border-[#30363d]/50 max-h-36 overflow-y-auto space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {validation.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                    issue.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : issue.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{issue.title}</span>
                    <p className="text-[11px] opacity-80 mt-0.5">{issue.description}</p>
                  </div>

                  {issue.type !== 'success' && (
                    <button
                      onClick={() => onTransformSection('custom', issue.fixSuggestion)}
                      className="shrink-0 text-[10px] font-bold px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                    >
                      Fix with AI
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Prompt Modal */}
      {showCustomPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                Custom AI Instruction
              </h3>
              <button
                onClick={() => setShowCustomPromptModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Provide exact natural language instructions for how you want the AI to refine or format your README.
            </p>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Add a section on troubleshooting Docker build errors, format the environment table with descriptions, or add a quick benchmark table..."
              rows={4}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomPromptModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#21262d]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCustomPromptModal(false);
                  onTransformSection('custom', customPrompt);
                  setCustomPrompt('');
                }}
                disabled={!customPrompt.trim() || isTransforming}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply AI Transformation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
