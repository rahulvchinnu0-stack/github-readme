import React, { useState } from 'react';
import {
  X,
  Cpu,
  Sparkles,
  Sliders,
  Check,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';
import {
  AIProviderConfig,
  AIProviderType,
} from '@/src/types/readme';
import { AVAILABLE_MODELS } from '@/src/lib/ai/providers';

interface AIProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onSaveConfig: (newConfig: AIProviderConfig) => void;
}

export function AIProviderSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: AIProviderSettingsModalProps) {
  const [currentProvider, setCurrentProvider] = useState<AIProviderType>(config.provider);
  const [selectedModel, setSelectedModel] = useState<string>(config.model);
  const [temperature, setTemperature] = useState<number>(config.temperature ?? 0.3);
  const [customKey, setCustomKey] = useState<string>(config.apiKey || '');
  const [customEndpoint, setCustomEndpoint] = useState<string>(config.endpoint || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider: currentProvider,
      model: selectedModel,
      apiKey: customKey.trim() || undefined,
      endpoint: customEndpoint.trim() || undefined,
      temperature,
    });
    onClose();
  };

  const modelsForProvider = AVAILABLE_MODELS[currentProvider] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-100">
                AI Provider & Model Settings
              </h2>
              <p className="text-xs text-gray-400">
                Select your preferred LLM intelligence engine and inference parameters
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Primary NVIDIA NIM Quick Toggle Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-[#161b22] to-indigo-950/30 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                NV
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-300">NVIDIA NIM AI Engine</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    meta/muse-glimmer-30b
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Endpoint: <span className="font-mono text-gray-300">https://integrate.api.nvidia.com/v1</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCurrentProvider('nvidia');
                setSelectedModel('meta/muse-glimmer-30b');
                setTemperature(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentProvider === 'nvidia'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-bold'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {currentProvider === 'nvidia' ? 'Active Engine' : 'Set as Primary'}
            </button>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Select Inference Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(
                [
                  { id: 'nvidia', name: 'NVIDIA NIM (Meta Muse)' },
                  { id: 'gemini', name: 'Google Gemini' },
                  { id: 'openai', name: 'OpenAI GPT' },
                  { id: 'anthropic', name: 'Anthropic Claude' },
                  { id: 'deepseek', name: 'DeepSeek' },
                  { id: 'ollama', name: 'Ollama (Local)' },
                  { id: 'custom', name: 'Custom OpenAI API' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCurrentProvider(p.id);
                    const defModel = AVAILABLE_MODELS[p.id]?.[0]?.id || 'custom-model';
                    setSelectedModel(defModel);
                  }}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                    currentProvider === p.id
                      ? p.id === 'nvidia'
                        ? 'bg-emerald-600/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-blue-600/10 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                      : 'bg-[#0d1117] border-gray-800 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Available Models
            </label>
            <div className="space-y-2">
              {modelsForProvider.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-[#0d1117] border-gray-800 hover:border-gray-700 text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs">{m.name}</span>
                        {m.recommended && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {m.description}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-gray-500 shrink-0 ml-2">
                      {m.contextWindow}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="font-medium text-gray-300">
                Creativity & Temperature ({temperature})
              </span>
              <span className="text-gray-500 font-mono">
                {temperature <= 0.3 ? 'Deterministic & Precise' : 'Creative'}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Custom Endpoint / API Key if not default Gemini */}
          {currentProvider !== 'gemini' && (
            <div className="p-4 bg-[#0d1117] rounded-xl border border-gray-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>
                  {currentProvider === 'nvidia'
                    ? 'NVIDIA NIM API Configuration (Optional Override)'
                    : 'Custom Provider Credentials'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">
                  {currentProvider === 'nvidia' ? 'NVIDIA API Key (nvapi-...)' : 'API Key / Token'}
                </label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder={
                    currentProvider === 'nvidia'
                      ? 'nvapi-xxxxxxxxxxxxxxxxxxxxxxxx (Leave blank to use preconfigured server key)'
                      : 'sk-...'
                  }
                  className="w-full px-3 py-1.5 bg-[#161b22] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none placeholder:text-gray-600"
                />
              </div>

              {(currentProvider === 'custom' || currentProvider === 'nvidia') && (
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    API Base URL / Endpoint
                  </label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder={
                      currentProvider === 'nvidia'
                        ? 'https://integrate.api.nvidia.com/v1'
                        : 'https://api.openai.com/v1'
                    }
                    className="w-full px-3 py-1.5 bg-[#161b22] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none font-mono placeholder:text-gray-600"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-[#0d1117] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
