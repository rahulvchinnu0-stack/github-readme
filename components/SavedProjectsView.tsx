'use client';

import React from 'react';
import {
  History,
  Code2,
  Layers,
  Trash2,
  Download,
  ExternalLink,
  Star,
  GitBranch,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { ProjectKnowledge, ReadmeOptions } from '@/types/readme';

export interface SavedProjectItem {
  id: string;
  knowledge: ProjectKnowledge;
  markdown: string;
  options: ReadmeOptions;
  lastUpdated: number;
}

interface SavedProjectsViewProps {
  projects: SavedProjectItem[];
  onOpenProject: (item: SavedProjectItem) => void;
  onDeleteProject: (id: string) => void;
  onNewAnalysis: () => void;
}

export const SavedProjectsView: React.FC<SavedProjectsViewProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onNewAnalysis,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            Saved Repositories & Generated READMEs
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Access your previously analyzed codebases and custom generated documentation.
          </p>
        </div>

        <button
          onClick={onNewAnalysis}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Analyze New Repo</span>
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((item) => {
            const { project, verification } = item.knowledge;
            return (
              <div
                key={item.id}
                className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-xl flex flex-col justify-between group hover:border-blue-500/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      {project.avatarUrl ? (
                        <img src={project.avatarUrl} alt="" className="w-8 h-8 rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-xs">
                          {project.repo.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                          {project.fullName}
                        </h3>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" /> {project.currentBranch}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteProject(item.id)}
                      className="text-gray-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete saved project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 my-2.5">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 my-3">
                    <span className="px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-gray-300">
                      {project.language}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 capitalize">
                      {item.options.style} Style
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {verification.verifiedScore}% Verified
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#30363d]/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-500">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => onOpenProject(item)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Open in Studio</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#161b22]/40 rounded-2xl border border-dashed border-[#30363d] space-y-3">
          <History className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Saved Projects Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Analyze any public or private GitHub repository to generate documentation and save it to your dashboard.
          </p>
          <button
            onClick={onNewAnalysis}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
          >
            <span>Analyze Your First Repo</span>
          </button>
        </div>
      )}
    </div>
  );
};
