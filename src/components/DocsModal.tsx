import React from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  FileCheck2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d1117] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-100">
                Documentation & Architecture Grounding Pipeline
              </h2>
              <p className="text-xs text-gray-400">
                How README Architect prevents hallucinations and guarantees technically authentic docs
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>1. The Anti-Hallucination Grounding Rule</span>
            </h3>
            <p className="text-gray-400 text-xs">
              Traditional LLM documentation generators frequently invent non-existent CLI flags, wrong package managers (e.g. running <code>npm install</code> when the repo uses <code>pnpm</code> or <code>cargo</code>), and hallucinate fake environment variables.
            </p>
            <div className="p-3.5 rounded-xl bg-[#0d1117] border border-gray-800 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Package Manifest Grounding:</strong> Ingests <code>package.json</code>, <code>Cargo.toml</code>, <code>requirements.txt</code>, and <code>go.mod</code> before prompting the AI.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>True Script Extraction:</strong> Only outputs verifiable scripts found in the manifest (e.g. <code>npm run dev</code> vs <code>yarn start</code>).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Environment Variable Checking:</strong> Reads <code>.env.example</code> to catalog real configuration keys and secrets.</span>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>2. Mermaid.js Flowchart & Architecture Graphs</span>
            </h3>
            <p className="text-gray-400 text-xs">
              README Architect synthesizes valid GitHub-flavored Mermaid diagrams that render natively on GitHub.com:
            </p>
            <pre className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl font-mono text-[11px] text-indigo-300 overflow-x-auto">
              {`\`\`\`mermaid
flowchart TD
    Client[React/Next.js UI] -->|REST / API| Server[Express API Gateway]
    Server -->|ORM Queries| DB[(PostgreSQL Database)]
    Server -->|Caching| Cache[(Redis)]
\`\`\``}
            </pre>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-violet-400" />
              <span>3. GitHub Admonitions & Styling Standards</span>
            </h3>
            <p className="text-gray-400 text-xs">
              Supports GitHub's modern callout standard for highlighted notices and tips:
            </p>
            <div className="p-3 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg text-xs text-blue-200">
              <strong className="block text-[11px] uppercase tracking-wide">NOTE</strong>
              All generated badges use shields.io and respect user-selected themes (flat-square, for-the-badge).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-800 bg-[#0d1117] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-medium transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
