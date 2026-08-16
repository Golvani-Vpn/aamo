import React, { useState } from 'react';
import { 
  Sparkles, 
  Binary, 
  Key, 
  RotateCcw, 
  Copy, 
  Check, 
  FileCode2, 
  Wand2, 
  Layers,
  ArrowDown
} from 'lucide-react';
import { AIService } from '../services/aiService';

export const DeobfuscatorView: React.FC = () => {
  // String Decoder states
  const [encodedText, setEncodedText] = useState('aHR0cHM6Ly9hcGkuc2VjdXJldmF1bHQuaW8vdjEvYXV0aA==');
  const [decodeType, setDecodeType] = useState<'base64' | 'hex' | 'xor' | 'url'>('base64');
  const [xorKey, setXorKey] = useState('0x5A');
  const [decodedResult, setDecodedResult] = useState('');

  // AI Identifier Restorer states
  const [obfuscatedCode, setObfuscatedCode] = useState(`.method public static a(Ljava/lang/String;[B)Z
    .registers 5
    .param p0, "a"
    .param p1, "b"
    const-string v0, "SHA-256"
    invoke-static {v0}, Ljava/security/MessageDigest;->getInstance(Ljava/lang/String;)Ljava/security/MessageDigest;
    move-result-object v1
    invoke-virtual {p0}, Ljava/lang/String;->getBytes()[B
    move-result-object v2
    invoke-virtual {v1, v2}, Ljava/security/MessageDigest;->digest([B)[B
    move-result-object v3
    invoke-static {v3, p1}, Ljava/util/Arrays;->equals([B[B)Z
    move-result v4
    return v4
.end method`);
  const [deobfuscatedCode, setDeobfuscatedCode] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDecode = () => {
    try {
      if (decodeType === 'base64') {
        setDecodedResult(atob(encodedText.trim()));
      } else if (decodeType === 'hex') {
        const cleanHex = encodedText.replace(/[^0-9A-Fa-f]/g, '');
        let str = '';
        for (let i = 0; i < cleanHex.length; i += 2) {
          str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
        }
        setDecodedResult(str);
      } else if (decodeType === 'url') {
        setDecodedResult(decodeURIComponent(encodedText));
      } else if (decodeType === 'xor') {
        const keyNum = parseInt(xorKey, 16) || 0x5a;
        let str = '';
        for (let i = 0; i < encodedText.length; i++) {
          str += String.fromCharCode(encodedText.charCodeAt(i) ^ keyNum);
        }
        setDecodedResult(str);
      }
    } catch (err: any) {
      setDecodedResult(`[Decoding error: ${err.message}]`);
    }
  };

  const handleAiRestoreIdentifiers = async () => {
    if (!obfuscatedCode.trim()) return;
    setIsRestoring(true);
    try {
      const response = await AIService.sendMessage({
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            text: `Analyze this obfuscated Android code (ProGuard/R8). Restore meaningful class, method, and variable names, and provide clear decompiled output:\n\n\`\`\`smali\n${obfuscatedCode}\n\`\`\``,
          },
        ],
        systemInstruction: 'You are an elite Android reverse engineer and ProGuard de-obfuscator. Return renamed and clarified code with detailed comments explaining the true purpose of the logic.',
      });
      setDeobfuscatedCode(response);
    } catch (err: any) {
      alert(`De-obfuscation error: ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Binary className="w-5 h-5 text-indigo-400" />
          String De-obfuscator &amp; AI Identifier Restorer
        </h1>
        <p className="text-xs text-slate-400">
          Decode encrypted strings, XOR-based arrays, and use AI to restore ProGuard/R8 obfuscated names.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive String Decoder */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                String &amp; Hex Cipher Decoder
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Client-side instant</span>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'base64', label: 'Base64' },
                { id: 'hex', label: 'Hex String' },
                { id: 'xor', label: 'XOR Key' },
                { id: 'url', label: 'URL Dec' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDecodeType(t.id as any)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    decodeType === t.id
                      ? 'bg-emerald-600 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {decodeType === 'xor' && (
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">XOR Key (Hex, e.g. 0x5A)</label>
                <input
                  type="text"
                  value={xorKey}
                  onChange={(e) => setXorKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Encrypted / Obfuscated String Input</label>
              <textarea
                value={encodedText}
                onChange={(e) => setEncodedText(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleDecode}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-950/30"
            >
              Decode String
            </button>

            {decodedResult && (
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Decoded Output:</span>
                <p className="font-mono text-xs text-white break-all">{decodedResult}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI ProGuard Identifier Restorer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                AI ProGuard / R8 Name Restorer
              </h2>
              <span className="text-[10px] text-indigo-400 font-mono">Gemini 2.5</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Obfuscated Smali Method / Class</label>
              <textarea
                value={obfuscatedCode}
                onChange={(e) => setObfuscatedCode(e.target.value)}
                rows={7}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <button
              onClick={handleAiRestoreIdentifiers}
              disabled={isRestoring}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRestoring ? 'Analyzing Logic & Restoring Names...' : 'Restore Meaningful Identifiers'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Deobfuscation Result Window */}
      {deobfuscatedCode && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs text-indigo-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Restored &amp; Clarified Source Representation
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(deobfuscatedCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Result</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
            <code>{deobfuscatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
