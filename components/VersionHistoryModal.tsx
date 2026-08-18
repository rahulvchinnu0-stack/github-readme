'use client';

import React, { useState } from 'react';
import { ReadmeVersion } from '@/types/readme';
import {
  History,
  X,
  RotateCcw,
  Download,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Eye,
} from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ReadmeVersion[];
  currentVersionId: string;
  onRestoreVersion: (version: ReadmeVersion) => void;
  onSaveCurrentVersion: (label?: string) => void;
  onDeleteVersion: (id: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  currentVersionId,
  onRestoreVersion,
  onSaveCurrentVersion,
  onDeleteVersion,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<ReadmeVersion | null>(
    versions.find((v) => v.id === currentVersionId) || versions[0] || null
  );
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  if (!isOpen) return null;

  const handleSaveSnapshot = () => {
    onSaveCurrentVersion(snapshotLabel.trim() || undefined);
    setSnapshotLabel('');
    setShowSaveInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Version History & Snapshots</h2>
              <p className="text-xs text-gray-400">
                Track, compare, and restore generated iterations of your documentation
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

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Version List */}
          <div className="w-1/3 border-r border-[#30363d] flex flex-col bg-[#0d1117]">
            <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Snapshots ({versions.length})
              </span>

              <button
                onClick={() => setShowSaveInput(!showSaveInput)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save New</span>
              </button>
            </div>

            {showSaveInput && (
              <div className="p-3 bg-[#161b22] border-b border-[#30363d] space-y-2">
                <input
                  type="text"
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  placeholder="Snapshot label (e.g. Added Mermaid diagram)"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSaveSnapshot}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-1 rounded-lg text-xs font-bold"
                >
                  Create Snapshot
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto divide-y divide-[#30363d]/60">
              {versions.map((ver, idx) => {
                const isSelected = selectedVersion?.id === ver.id;
                const isCurrent = currentVersionId === ver.id;
                return (
                  <div
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/10 border-l-2 border-blue-500' : 'hover:bg-[#161b22]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">
                        {ver.label || `Iteration ${versions.length - idx}`}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                      <span className="capitalize">{ver.style} Style</span>
                      {ver.score && <span>Score: {ver.score}/100</span>}
                    </div>

                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Version Preview */}
          <div className="w-2/3 flex flex-col bg-[#161b22] overflow-hidden">
            {selectedVersion ? (
              <>
                <div className="px-4 py-2.5 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{selectedVersion.label || 'Snapshot'}</span>
                    <span className="text-gray-400 text-[11px] ml-2">
                      ({selectedVersion.markdown.split('\n').length} lines)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onRestoreVersion(selectedVersion);
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to Editor</span>
                    </button>

                    {versions.length > 1 && (
                      <button
                        onClick={() => onDeleteVersion(selectedVersion.id)}
                        className="p-1 text-gray-400 hover:text-rose-400 rounded"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-[#0d1117]/60 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedVersion.markdown}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                Select a version from the left panel to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
