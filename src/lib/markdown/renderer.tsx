import React, { useState } from 'react';
import {
  Copy,
  Check,
  Info,
  Lightbulb,
  AlertTriangle,
  Flame,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
} from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p>No README content to preview yet.</p>
      </div>
    );
  }

  // Parse lines into tokens
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let codeBlockIndex = 0;

  let inTable = false;
  let tableLines: string[] = [];
  let tableIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block delimiters
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, '').trim();
        codeBlockLines = [];
        codeBlockIndex = i;
        continue;
      } else {
        // End of code block
        inCodeBlock = false;
        const fullCode = codeBlockLines.join('\n');
        renderedElements.push(
          <CodeBlockItem
            key={`code-${codeBlockIndex}`}
            language={codeBlockLang}
            code={fullCode}
          />
        );
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Table detection
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableLines = [line];
        tableIndex = i;
      } else {
        tableLines.push(line);
      }
      continue;
    } else if (inTable) {
      inTable = false;
      renderedElements.push(
        <MarkdownTable key={`table-${tableIndex}`} lines={tableLines} />
      );
      tableLines = [];
    }

    // Empty lines
    if (line.trim() === '') {
      renderedElements.push(<div key={`empty-${i}`} className="h-4" />);
      continue;
    }

    // GitHub Admonitions / Callouts (e.g. > [!NOTE])
    if (line.trim().startsWith('> [!')) {
      const typeMatch = line.match(/> \[!([A-Z]+)\]/i);
      const type = typeMatch ? typeMatch[1].toUpperCase() : 'NOTE';
      const calloutLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith('>')) {
        calloutLines.push(lines[j].replace(/^>\s*/, ''));
        j++;
      }
      i = j - 1;
      renderedElements.push(
        <AdmonitionBlock key={`admonition-${i}`} type={type} content={calloutLines.join(' ')} />
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1
          key={`h1-${i}`}
          className="text-2xl sm:text-3xl font-bold text-gray-100 mt-6 mb-3 pb-2 border-b border-gray-800 flex items-center gap-2"
        >
          {parseInlineMarkdown(line.substring(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2
          key={`h2-${i}`}
          className="text-xl sm:text-2xl font-semibold text-gray-100 mt-5 mb-2.5 pb-1.5 border-b border-gray-800/60 flex items-center gap-2"
        >
          {parseInlineMarkdown(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3
          key={`h3-${i}`}
          className="text-lg sm:text-xl font-medium text-gray-200 mt-4 mb-2"
        >
          {parseInlineMarkdown(line.substring(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      renderedElements.push(
        <h4
          key={`h4-${i}`}
          className="text-base sm:text-lg font-medium text-gray-300 mt-3 mb-1.5"
        >
          {parseInlineMarkdown(line.substring(5))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      renderedElements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-blue-500/60 bg-blue-500/5 px-4 py-2 my-2 text-gray-300 italic rounded-r"
        >
          {parseInlineMarkdown(line.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().substring(2);
      // Checkbox list
      if (text.startsWith('[ ] ') || text.startsWith('[x] ')) {
        const isChecked = text.startsWith('[x] ');
        const itemText = text.substring(4);
        renderedElements.push(
          <div key={`task-${i}`} className="flex items-center gap-2 py-0.5 ml-2 text-gray-200">
            <input
              type="checkbox"
              readOnly
              checked={isChecked}
              className="rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-0"
            />
            <span>{parseInlineMarkdown(itemText)}</span>
          </div>
        );
        continue;
      }

      renderedElements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-gray-300 my-1 leading-relaxed">
          {parseInlineMarkdown(text)}
        </li>
      );
      continue;
    }

    // Ordered List
    const orderedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (orderedMatch) {
      renderedElements.push(
        <div key={`oli-${i}`} className="flex items-start gap-2 ml-4 my-1 text-gray-300 leading-relaxed">
          <span className="font-semibold text-gray-400 select-none min-w-[20px]">{orderedMatch[1]}.</span>
          <div>{parseInlineMarkdown(orderedMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      renderedElements.push(<hr key={`hr-${i}`} className="border-gray-800 my-6" />);
      continue;
    }

    // Standard Paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="text-gray-300 leading-relaxed my-2 text-sm sm:text-base">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  // Flush remaining table if open
  if (inTable && tableLines.length > 0) {
    renderedElements.push(
      <MarkdownTable key={`table-end`} lines={tableLines} />
    );
  }

  return (
    <div className="readme-preview-content space-y-1 font-sans text-gray-200 select-text">
      {renderedElements}
    </div>
  );
}

// Inline Markdown Parser
function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Render images / badges: [![alt](src)](link) or ![alt](src)
  const imageRegex = /\[?!\[([^\]]*)\]\(([^)]+)\)\]?(\(([^)]+)\))?/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderBasicFormatting(text.substring(lastIndex, match.index)));
    }

    const alt = match[1];
    const src = match[2];
    const link = match[4];

    const img = (
      <img
        key={`img-${match.index}`}
        src={src}
        alt={alt}
        className="inline-block my-1 rounded"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );

    if (link) {
      parts.push(
        <a
          key={`link-img-${match.index}`}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mr-1.5"
        >
          {img}
        </a>
      );
    } else {
      parts.push(<span key={`span-img-${match.index}`} className="mr-1.5">{img}</span>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(renderBasicFormatting(text.substring(lastIndex)));
  }

  return parts.length > 0 ? parts : text;
}

function renderBasicFormatting(raw: string): React.ReactNode {
  // Replace links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const tokens: React.ReactNode[] = [];
  let lastPos = 0;
  let m: RegExpExecArray | null;

  while ((m = linkRegex.exec(raw)) !== null) {
    if (m.index > lastPos) {
      tokens.push(formatInlineCodeAndBold(raw.substring(lastPos, m.index)));
    }
    const label = m[1];
    const url = m[2];
    tokens.push(
      <a
        key={`a-${m.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 inline-flex items-center gap-0.5"
      >
        {label}
        {url.startsWith('http') && <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />}
      </a>
    );
    lastPos = m.index + m[0].length;
  }

  if (lastPos < raw.length) {
    tokens.push(formatInlineCodeAndBold(raw.substring(lastPos)));
  }

  return tokens.length > 0 ? tokens : raw;
}

function formatInlineCodeAndBold(text: string): React.ReactNode {
  const codeRegex = /`([^`]+)`/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(formatBoldAndItalic(text.substring(last, match.index)));
    }
    parts.push(
      <code
        key={`code-${match.index}`}
        className="px-1.5 py-0.5 bg-gray-800 text-pink-400 border border-gray-700/60 rounded text-xs sm:text-sm font-mono"
      >
        {match[1]}
      </code>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(formatBoldAndItalic(text.substring(last)));
  }

  return parts.length > 0 ? parts : text;
}

function formatBoldAndItalic(text: string): React.ReactNode {
  // Simple bold **text** and italic *text*
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.substring(last, match.index));
    }
    parts.push(
      <strong key={`b-${match.index}`} className="font-semibold text-gray-100">
        {match[1]}
      </strong>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.substring(last));
  }

  return parts.length > 0 ? parts : text;
}

// Code Block Component with Copy
function CodeBlockItem({ language, code }: { language: string; code: string; key?: React.Key }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (language === 'mermaid') {
    return <MermaidVisualizer code={code} />;
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-800 bg-[#161b22] my-3">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0d1117] border-b border-gray-800 text-xs text-gray-400 font-mono">
        <span>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-gray-200 transition-colors text-xs px-2 py-0.5 rounded bg-gray-800/60 hover:bg-gray-800 border border-gray-700/40"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs sm:text-sm font-mono text-gray-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Mermaid Visualizer / Architecture Diagram
function MermaidVisualizer({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-indigo-900/40 bg-indigo-950/20 rounded-xl my-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/30 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-medium">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Architecture & Workflow Diagram</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className="text-xs text-indigo-300/80 hover:text-indigo-200 px-2 py-0.5 rounded bg-indigo-900/30 hover:bg-indigo-900/50"
          >
            {showCode ? 'View Visual' : 'View Source'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-indigo-300/80 hover:text-indigo-200 px-2 py-0.5 rounded bg-indigo-900/30 hover:bg-indigo-900/50"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {showCode ? (
        <pre className="p-4 text-xs font-mono text-indigo-200 bg-[#0d1117] overflow-x-auto">
          <code>{code}</code>
        </pre>
      ) : (
        <div className="p-5 flex flex-col items-center justify-center bg-[#0d1117]/80 min-h-[140px]">
          {/* Visual stylized representation of the flowchart nodes */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-full">
            {code
              .split('\n')
              .filter((l) => l.includes('-->') || l.includes('->') || l.includes('['))
              .slice(0, 6)
              .map((line, idx) => {
                const nodeLabel = line.replace(/[{}\[\]()]/g, '').trim();
                if (!nodeLabel) return null;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 px-3.5 py-1.5 rounded-lg text-xs font-mono text-blue-200 shadow-sm"
                  >
                    <span>{nodeLabel}</span>
                  </div>
                );
              })}
          </div>
          <p className="text-[11px] text-gray-500 mt-4 font-mono">
            Renders automatically with GitHub Mermaid & Live preview engine.
          </p>
        </div>
      )}
    </div>
  );
}

// GitHub Callouts / Admonitions
function AdmonitionBlock({ type, content }: { type: string; content: string; key?: React.Key }) {
  const styles: Record<string, { border: string; bg: string; text: string; icon: React.ReactNode }> = {
    NOTE: {
      border: 'border-blue-500',
      bg: 'bg-blue-500/10',
      text: 'text-blue-300',
      icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
    },
    TIP: {
      border: 'border-emerald-500',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      icon: <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    IMPORTANT: {
      border: 'border-purple-500',
      bg: 'bg-purple-500/10',
      text: 'text-purple-300',
      icon: <Flame className="w-4 h-4 text-purple-400 shrink-0" />,
    },
    WARNING: {
      border: 'border-amber-500',
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    },
    CAUTION: {
      border: 'border-rose-500',
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
    },
  };

  const style = styles[type] || styles.NOTE;

  return (
    <div className={`my-3 p-3.5 rounded-r-lg border-l-4 ${style.border} ${style.bg} flex items-start gap-2.5`}>
      <div className="mt-0.5">{style.icon}</div>
      <div className="text-xs sm:text-sm">
        <span className={`font-semibold tracking-wide uppercase text-xs block mb-0.5 ${style.text}`}>
          {type}
        </span>
        <div className="text-gray-300 leading-relaxed">{content}</div>
      </div>
    </div>
  );
}

// Markdown Table Renderer
function MarkdownTable({ lines }: { lines: string[]; key?: React.Key }) {
  if (lines.length < 2) return null;

  const parseRow = (rowStr: string) => {
    return rowStr
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-gray-800 bg-[#161b22]/70">
      <table className="min-w-full text-left text-xs sm:text-sm text-gray-200 divide-y divide-gray-800">
        <thead className="bg-[#0d1117] text-gray-300 font-semibold">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3.5 py-2.5">
                {parseInlineMarkdown(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-gray-800/30 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2">
                  {parseInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
