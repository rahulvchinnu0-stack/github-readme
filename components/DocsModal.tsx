'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  X,
  ShieldCheck,
  Cpu,
  GitBranch,
  Terminal,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'engine' | 'ai' | 'badges'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">System Documentation & Guide</h2>
              <p className="text-xs text-gray-400">
                Learn how repo parsing, anti-hallucination verification, and multi-provider AI operate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 border-b border-[#30363d] flex items-center gap-2 bg-[#0d1117]">
          {[
            { id: 'overview', label: 'Architecture Overview', icon: Layers },
            { id: 'engine', label: 'Anti-Hallucination Engine', icon: ShieldCheck },
            { id: 'ai', label: 'Multi-AI Providers', icon: Cpu },
            { id: 'badges', label: 'Badges & Diagrams', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-gray-300 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Deep Repository Intelligence Pipeline</h3>
              <p>
                Unlike generic LLM wrappers that fabricate installation commands, this application analyzes genuine GitHub AST trees, dependencies, scripts, environment files, Dockerfiles, and CI workflows before generating documentation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-1.5">
                  <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-white text-xs">Direct GitHub Ingestion</h4>
                  <p className="text-[11px] text-gray-400">
                    Reads git tree, manifests (package.json, cargo, requirements), docker-compose, and sample code structures.
                  </p>
                </div>

                <div className="p-3.5 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-1.5">
                  <div className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-white text-xs">Knowledge Distillation</h4>
                  <p className="text-[11px] text-gray-400">
                    Builds verified package commands, actual env variable signatures, and directory blueprints.
                  </p>
                </div>

                <div className="p-3.5 bg-[#0d1117] rounded-xl border border-[#30363d] space-y-1.5">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-white text-xs">Strict Verification Check</h4>
                  <p className="text-[11px] text-gray-400">
                    Every generated snippet is audited against real repo facts with a live 0-100% truthfulness score.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engine' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                How the Truthfulness & Verification Engine Works
              </h3>
              <p>
                Hallucinations happen when an AI guesses standard npm/pip packages or fake environment variables that do not exist in your codebase.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="font-bold text-white text-xs mb-1">1. Exact Manifest Verification</h4>
                  <p className="text-[11px] text-gray-400">
                    Package names mentioned in badges and tech stacks are validated against extracted manifests (<code className="text-blue-300 font-mono">package.json</code>, <code className="text-blue-300 font-mono">requirements.txt</code>, <code className="text-blue-300 font-mono">Cargo.toml</code>, etc.).
                  </p>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="font-bold text-white text-xs mb-1">2. Run Script & Command Match</h4>
                  <p className="text-[11px] text-gray-400">
                    Installation and launch instructions are compared with verified package managers (pnpm, yarn, bun, npm, cargo, pip, poetry, go, gradle).
                  </p>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="font-bold text-white text-xs mb-1">3. Environment Variable Integrity</h4>
                  <p className="text-[11px] text-gray-400">
                    Required secrets and flags listed in the <code className="text-emerald-300 font-mono">Environment Variables</code> table match real keys found in <code className="text-emerald-300 font-mono">.env.example</code> or codebase files.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                Multi-Provider AI Architecture
              </h3>
              <p>
                Switch flexibly between world-leading frontier reasoning models based on your preferred style, speed, and privacy requirements:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="font-bold text-white text-xs">Google Gemini (Default)</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Powered by <strong>Gemini 2.5 Flash</strong> and <strong>Gemini 2.5 Pro</strong> for massive codebase context ingestion and deep structural synthesis.
                  </p>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="font-bold text-white text-xs">OpenAI</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Supports <strong>GPT-4o</strong> and <strong>GPT-4o-mini</strong> for concise developer tone and sharp technical summaries.
                  </p>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="font-bold text-white text-xs">Anthropic Claude</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Supports <strong>Claude 3.5 Sonnet</strong> for elegant technical writing, lucid prose, and comprehensive system documentation.
                  </p>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                  <h4 className="font-bold text-white text-xs">Local & Open Source</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Connect local Ollama (Llama 3.3, DeepSeek-R1) or OpenRouter for completely private, zero-data-sharing generation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Badges, Mermaid Diagrams & Export Formats
              </h3>
              <p>
                Customise styling from minimal enterprise to neon badges and interactive diagrams:
              </p>

              <div className="space-y-2.5">
                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs">Badge Styles</span>
                    <p className="text-[11px] text-gray-400">Shields.io, Badgen, Simple Icons flat-square, for-the-badge, social</p>
                  </div>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs">Interactive Architecture Diagrams</span>
                    <p className="text-[11px] text-gray-400">Auto-generated Mermaid.js sequence & graph flowcharts representing your runtime pipeline</p>
                  </div>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs">1-Click GitHub Direct Commit</span>
                    <p className="text-[11px] text-gray-400">Push to main or staging branch with custom commit message without leaving the editor</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
