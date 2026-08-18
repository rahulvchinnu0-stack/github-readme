import React, { useState } from 'react';
import {
  FolderHeart,
  Search,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SavedProjectItem } from '@/src/types/readme';

interface SavedProjectsViewProps {
  projects: SavedProjectItem[];
  onOpenProject: (item: SavedProjectItem) => void;
  onDeleteProject: (id: string) => void;
  onStartNew: () => void;
}

export function SavedProjectsView({
  projects,
  onOpenProject,
  onDeleteProject,
  onStartNew,
}: SavedProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = projects.filter(
    (p) =>
      p.knowledge.project.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.knowledge.project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-blue-400" />
            <span>Saved Projects & Documentation Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Access previous repository analyses, generated READMEs, and ground truth audits
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze New Repository</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter saved repositories..."
          className="w-full pl-9 pr-4 py-2 bg-[#161b22] border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Projects Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const { project, verification } = item.knowledge;
            const updatedDate = new Date(item.lastUpdated).toLocaleDateString();

            return (
              <div
                key={item.id}
                className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-all space-y-4 group shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                      {project.fullName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(item.id);
                      }}
                      className="text-gray-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-500 font-mono pt-1">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {verification.truthfulnessScore}% Verified
                    </span>
                    <span>•</span>
                    <span className="capitalize">{item.options.style}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono">
                    Updated {updatedDate}
                  </span>

                  <button
                    onClick={() => onOpenProject(item)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#161b22]/50 border border-gray-800 rounded-2xl p-8 space-y-3">
          <FolderHeart className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-semibold text-gray-300">
            {projects.length === 0 ? 'No Saved Projects Yet' : 'No matching repositories found'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Analyze any public or private GitHub repository to generate structured documentation and track version snapshots.
          </p>
        </div>
      )}
    </div>
  );
}
