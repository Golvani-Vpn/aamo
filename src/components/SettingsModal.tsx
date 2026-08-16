import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  Check, 
  AlertCircle, 
  Lock, 
  Save, 
  RotateCcw,
  Cpu
} from 'lucide-react';
import { KeystoreConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  setGeminiKey: (k: string) => void;
  deepseekKey: string;
  setDeepseekKey: (k: string) => void;
  keystore: KeystoreConfig;
  setKeystore: (k: KeystoreConfig) => void;
  onClearCache: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  geminiKey,
  setGeminiKey,
  deepseekKey,
  setDeepseekKey,
  keystore,
  setKeystore,
  onClearCache,
}) => {
  const [activeTab, setActiveTab] = useState<'api' | 'keystore' | 'storage'>('api');
  const [geminiInput, setGeminiInput] = useState(geminiKey);
  const [deepseekInput, setDeepseekInput] = useState(deepseekKey);
  const [tempKeystore, setTempKeystore] = useState<KeystoreConfig>({ ...keystore });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiKey(geminiInput);
    setDeepseekKey(deepseekInput);
    setKeystore(tempKeystore);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">APKForge Studio Configuration</h2>
              <p className="text-[11px] text-slate-400">Manage client-side AI keys, Keystores, and cache</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'api'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Provider Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('keystore')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'keystore'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>APK Signing Keystore</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'storage'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Storage &amp; Cache</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Google Gemini API Key
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">Encrypted Client Keystore</span>
                </div>
                <input
                  type="password"
                  value={geminiInput}
                  onChange={(e) => setGeminiInput(e.target.value)}
                  placeholder="Optional custom key (Leave empty to use default injected key)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Used for Gemini 2.5 Flash, Gemini 2.5 Pro, and Vision decompilation analysis.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    DeepSeek API Key
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Direct API Request</span>
                </div>
                <input
                  type="password"
                  value={deepseekInput}
                  onChange={(e) => setDeepseekInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Used for DeepSeek-Chat V3 and DeepSeek-Reasoner R1.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'keystore' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Key Alias</label>
                  <input
                    type="text"
                    value={tempKeystore.alias}
                    onChange={(e) => setTempKeystore({ ...tempKeystore, alias: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Validity (Years)</label>
                  <input
                    type="number"
                    value={tempKeystore.validityYears}
                    onChange={(e) => setTempKeystore({ ...tempKeystore, validityYears: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Keystore Password</label>
                  <input
                    type="password"
                    value={tempKeystore.password}
                    onChange={(e) => setTempKeystore({ ...tempKeystore, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Key Password</label>
                  <input
                    type="password"
                    value={tempKeystore.keyPassword}
                    onChange={(e) => setTempKeystore({ ...tempKeystore, keyPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Signature Scheme toggles */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 block text-xs">APK Signature Schemes</span>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempKeystore.signatureScheme.v1}
                      onChange={(e) => setTempKeystore({
                        ...tempKeystore,
                        signatureScheme: { ...tempKeystore.signatureScheme, v1: e.target.checked }
                      })}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span>V1 (JAR Digest)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempKeystore.signatureScheme.v2}
                      onChange={(e) => setTempKeystore({
                        ...tempKeystore,
                        signatureScheme: { ...tempKeystore.signatureScheme, v2: e.target.checked }
                      })}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span>V2 (APK Scheme)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempKeystore.signatureScheme.v3}
                      onChange={(e) => setTempKeystore({
                        ...tempKeystore,
                        signatureScheme: { ...tempKeystore.signatureScheme, v3: e.target.checked }
                      })}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span>V3 (Key Rotation)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-semibold text-slate-200">Cache &amp; Session Cleanup</h4>
                <p className="text-[11px] text-slate-400">
                  Delete decompiled temporary directories, AAPT intermediate caches, and session drafts.
                </p>
                <button
                  onClick={() => {
                    onClearCache();
                    alert('Temporary build caches and decompiled artifacts purged.');
                  }}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-medium rounded-lg text-xs transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge All Temp Cache Files</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
          >
            Close
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-950/40"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
