import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  MessageCircle,
  Copy,
  Check,
  AlertOctagon,
  Sparkles,
  Key,
  ShieldCheck,
} from 'lucide-react';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  usageCount: number;
  maxLimit: number;
  onOpenSettings: () => void;
}

export function UsageLimitModal({
  isOpen,
  onClose,
  usageCount,
  maxLimit,
  onOpenSettings,
}: UsageLimitModalProps) {
  const [copied, setCopied] = useState(false);
  const phoneNumber = '9538755904';
  const formattedPhone = '+91 9538755904';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#161b22] border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-[#161b22] to-[#161b22]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-100">
                Usage Limit Reached ({usageCount}/{maxLimit})
              </h2>
              <p className="text-xs text-amber-300/80">
                Free tier quota completed for this session
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
        <div className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-300 leading-relaxed">
              You have completed all <strong className="text-white">{maxLimit} free AI README generations</strong>.
            </p>
            <p className="text-xs text-gray-400">
              To unlock unlimited generations, higher token limits, and priority inference, contact the administrator directly:
            </p>
          </div>

          {/* Contact Highlight Box */}
          <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 text-center space-y-3 shadow-inner">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Direct Contact & Support
            </div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-amber-400 tracking-wider">
              {formattedPhone}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <a
                href={`tel:${phoneNumber}`}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>

              <a
                href={`https://wa.me/91${phoneNumber}?text=Hi%2C%20I%20would%20like%20to%20get%20more%20generations%20for%20README%20Architect`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-gray-700 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Alternative: Bring your own API key */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>Have your own API Key?</span>
              </span>
              <p className="text-[11px] text-gray-400">
                Supply your own OpenAI, Anthropic, or NVIDIA key for unlimited use.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs whitespace-nowrap ml-3"
            >
              Enter Key
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-800 bg-[#0d1117] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
