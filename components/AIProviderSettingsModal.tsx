'use client';

import React, { useState } from 'react';
import {
  AIProviderConfig,
  AIProviderType,
} from '@/types/readme';
import {
  PROVIDER_CATALOG,
} from '@/lib/ai/providers';
import {
  Settings,
  X,
  Key,
  Globe,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AIProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onSaveConfig: (cfg: AIProviderConfig) => void;
}

export const AIProviderSettingsModal: React.FC<AIProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [currentConfig, setCurrentConfig] = useState<AIProviderConfig>({ ...config });
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    model?: string;
  } | null>(null);

  if (!isOpen) return null;

  const providerMeta = PROVIDER_CATALOG[currentConfig.provider];

  const handleProviderSelect = (providerKey: AIProviderType) => {
    const meta = PROVIDER_CATALOG[providerKey];
    setCurrentConfig({
      provider: providerKey,
      model: meta.defaultModel,
      apiKey: '',
      endpoint: meta.defaultEndpoint || '',
    });
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: currentConfig }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig(currentConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Provider & Model Settings</h2>
              <p className="text-xs text-gray-400">
                Choose your AI engine for generating & refining README files
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Provider Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5">
              Select AI Engine
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {(Object.keys(PROVIDER_CATALOG) as AIProviderType[]).map((key) => {
                const info = PROVIDER_CATALOG[key];
                const isSelected = currentConfig.provider === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleProviderSelect(key)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                        : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-gray-200 hover:border-gray-500'
                    }`}
                  >
                    <span className="font-bold text-xs block text-white truncate">{info.name}</span>
                    <span className="text-[10px] text-gray-500 mt-1 line-clamp-1">{info.defaultModel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-4 bg-[#0d1117] p-4 rounded-xl border border-[#30363d]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-400" />
                Configuring {providerMeta.name}
              </span>
              <span className="text-[11px] text-gray-400">{providerMeta.description}</span>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1 font-medium">Model</label>
              <select
                value={currentConfig.model}
                onChange={(e) => setCurrentConfig({ ...currentConfig, model: e.target.value })}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {providerMeta.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.recommended ? '⭐ (Recommended)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key */}
            {providerMeta.requiresApiKey && (
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-medium flex items-center justify-between">
                  <span>API Key</span>
                  <span className="text-[10px] text-gray-500">Stored safely in client session</span>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={currentConfig.apiKey || ''}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, apiKey: e.target.value })}
                    placeholder={`Enter your ${providerMeta.name} API key`}
                    className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 pr-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Custom Endpoint / Ollama Endpoint */}
            {(providerMeta.requiresEndpoint || currentConfig.provider === 'nvidia') && (
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-medium">
                  API Endpoint Base URL
                </label>
                <input
                  type="text"
                  value={currentConfig.endpoint || ''}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, endpoint: e.target.value })}
                  placeholder={providerMeta.defaultEndpoint || 'http://localhost:11434/v1'}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            )}

            {/* Test Connection Button & Status */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                id="test-ai-connection-btn"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="bg-[#21262d] hover:bg-[#30363d] text-gray-200 hover:text-white border border-[#30363d] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : 'text-amber-400'}`} />
                <span>{isTesting ? 'Testing Ping...' : 'Test Connection'}</span>
              </button>

              {testResult && (
                <div
                  className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg ${
                    testResult.success
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[#21262d]"
          >
            Cancel
          </button>
          <button
            id="save-ai-settings-btn"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
