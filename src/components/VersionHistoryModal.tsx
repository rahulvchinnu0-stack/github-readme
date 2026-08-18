import React, { useState } from 'react';
import {
  X,
  History,
  RotateCcw,
  Eye,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ReadmeVersion } from '@/src/types/readme';
import { MarkdownRenderer } from '@/src/lib/markdown/renderer';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ReadmeVersion[];
  onRestoreVersion: (version: ReadmeVersion) => void;
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  versions,
  onRestoreVersion,
}: VersionHistoryModalProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    versions[0]?.id || ''
  );

  if (!isOpen) return null;

  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d1117] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-100">
                README Version History & Snapshots
              </h2>
              <p className="text-xs text-gray-400">
                Inspect previous generations, compare truthfulness scores, or roll back
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

        {/* 2-Column Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Version List */}
          <div className="w-full md:w-80 border-r border-gray-800 bg-[#0d1117] p-3 overflow-y-auto space-y-2 shrink-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-2 block">
              Snapshots ({versions.length})
            </span>

            {versions.map((ver, idx) => {
              const isSelected = ver.id === selectedVersionId;
              const dateStr = new Date(ver.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersionId(ver.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500'
                      : 'bg-[#161b22] border-gray-800 hover:border-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs font-mono">
                      {ver.label || `Version ${versions.length - idx}`}
                    </span>
                    {ver.score && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                        {ver.score}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 font-mono">
                    <span className="capitalize">{ver.style}</span>
                    <span>{dateStr}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Version Preview */}
          <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden">
            {selectedVersion ? (
              <>
                <div className="px-5 py-2.5 border-b border-gray-800 bg-[#161b22]/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                    <span>Previewing snapshot from {new Date(selectedVersion.timestamp).toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => {
                      onRestoreVersion(selectedVersion);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore to Editor</span>
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <MarkdownRenderer content={selectedVersion.markdown} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
                <p>No snapshots found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
