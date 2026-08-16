import React, { useState } from 'react';
import { 
  Cpu, 
  Binary, 
  ShieldAlert, 
  ShieldCheck, 
  FileCode2, 
  Zap, 
  Terminal, 
  Copy, 
  Check, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Project } from '../types';

interface NativeAnalyzerViewProps {
  project: Project | null;
}

export const NativeAnalyzerView: React.FC<NativeAnalyzerViewProps> = ({ project }) => {
  const [selectedArch, setSelectedArch] = useState<'arm64-v8a' | 'armeabi-v7a' | 'x86_64'>('arm64-v8a');
  const [selectedLibrary, setSelectedLibrary] = useState('libsecvault_jni.so');
  const [copied, setCopied] = useState(false);
  const [generatedHook, setGeneratedHook] = useState('');

  // Sample native library data
  const nativeLibraries = [
    {
      name: 'libsecvault_jni.so',
      size: '148.2 KB',
      format: 'ELF64 (aarch64)',
      endian: 'Little Endian',
      abi: 'ARM64-v8a',
      compiler: 'Clang / NDK r25b',
      security: {
        pie: true,
        canary: true,
        nx: true,
        relro: 'FULL',
      },
      exportedJni: [
        {
          name: 'Java_com_secvault_MainActivity_verifyLicenseKey',
          signature: '(Ljava/lang/String;)Z',
          offset: '0x00004f20',
          description: 'Validates cryptographic hardware license key using native SHA-256 rounds.',
        },
        {
          name: 'Java_com_secvault_MainActivity_decryptSecretBuffer',
          signature: '([BI)[B',
          offset: '0x000052a0',
          description: 'Performs AES-GCM decryption in native C memory to prevent Dalvik memory dumps.',
        },
        {
          name: 'Java_com_secvault_MainActivity_detectEnvironmentTampering',
          signature: '()I',
          offset: '0x00005a10',
          description: 'Scans /proc/self/status for TracerPid > 0 and detects Frida port 27042.',
        },
      ],
      importedSymbols: [
        'ptrace (Anti-debugging attachment blocker)',
        'fopen (/proc/self/maps, /proc/self/status)',
        'strstr (detects frida-agent.so & substrate)',
        'AES_set_decrypt_key (OpenSSL LibCrypto)',
        '__android_log_print (Android log output)',
      ],
      antiDebugChecks: [
        { name: 'ptrace(PTRACE_TRACEME)', severity: 'HIGH', desc: 'Blocks JDWP & GDB attachment.' },
        { name: '/proc/self/status TracerPid scanning', severity: 'MEDIUM', desc: 'Detects background ptrace hooks.' },
        { name: 'Frida Unix Domain Socket check', severity: 'HIGH', desc: 'Scans /data/local/tmp for frida-server.' },
      ],
    },
    {
      name: 'libcrypto.so',
      size: '1.8 MB',
      format: 'ELF64 (aarch64)',
      endian: 'Little Endian',
      abi: 'ARM64-v8a',
      compiler: 'BoringSSL',
      security: {
        pie: true,
        canary: true,
        nx: true,
        relro: 'FULL',
      },
      exportedJni: [],
      importedSymbols: ['mprotect', 'sysconf', 'clock_gettime'],
      antiDebugChecks: [],
    },
  ];

  const activeLib = nativeLibraries.find((l) => l.name === selectedLibrary) || nativeLibraries[0];

  const handleGenerateNativeFridaHook = (funcName: string) => {
    const hook = `// Frida Native C/C++ Interceptor for ${activeLib.name} -> ${funcName}
Interceptor.attach(Module.findExportByName("${activeLib.name}", "${funcName}"), {
    onEnter: function (args) {
        console.log("[*] Intercepted Native Call: ${funcName}");
        // Java JNIEnv is args[0], jobject (this) is args[1], custom params start at args[2]
        console.log("    -> JNIEnv: " + args[0]);
        console.log("    -> this (jobject): " + args[1]);
    },
    onLeave: function (retval) {
        console.log("[*] ${funcName} returned: " + retval);
        // Force bypass license check or tamper detection
        retval.replace(1); // Return TRUE / Bypass
        console.log("[+] Replaced return value with: 1 (SUCCESS)");
    }
});`;
    setGeneratedHook(hook);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            Native ELF Shared Library &amp; JNI Symbol Analyzer
          </h1>
          <p className="text-xs text-slate-400">
            Inspect compiled C/C++ `.so` binaries, exported JNI bindings, ELF security flags (PIE, RELRO, Canary), and anti-tamper routines.
          </p>
        </div>

        {/* Arch Selector */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {['arm64-v8a', 'armeabi-v7a', 'x86_64'].map((arch) => (
            <button
              key={arch}
              onClick={() => setSelectedArch(arch as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedArch === arch ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {arch}
            </button>
          ))}
        </div>
      </div>

      {/* Library Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nativeLibraries.map((lib) => (
          <div
            key={lib.name}
            onClick={() => setSelectedLibrary(lib.name)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedLibrary === lib.name
                ? 'bg-amber-950/30 border-amber-500/50 ring-2 ring-amber-500/30'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">{lib.name}</span>
              <span className="text-[10px] font-mono text-slate-400">{lib.size}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span>{lib.format}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{lib.exportedJni.length} JNI Exports</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analysis Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: JNI Functions & Imported Symbols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exported JNI Functions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-cyan-400" />
                Exported JNI Functions ({activeLib.exportedJni.length})
              </h2>
              <span className="text-[11px] text-slate-500">Click &apos;Generate Frida Hook&apos; to intercept</span>
            </div>

            <div className="space-y-3">
              {activeLib.exportedJni.map((func) => (
                <div key={func.name} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 break-all">{func.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Offset: {func.offset}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-cyan-300">
                    Signature: <span className="text-slate-300">{func.signature}</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{func.description}</p>

                  <div className="pt-1">
                    <button
                      onClick={() => handleGenerateNativeFridaHook(func.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Generate C Interceptor Hook</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Imported Symbols & libc calls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Binary className="w-4 h-4 text-indigo-400" />
              Dynamic Symbols &amp; System Calls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeLib.importedSymbols.map((sym, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                  {sym}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Hardening Flags & Generated Hook */}
        <div className="space-y-6">
          {/* Binary Hardening Mitigations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Binary Hardening Flags
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Position Independent (PIE)</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Stack Canary (SSP)</span>
                <span className="text-emerald-400 font-bold">Protected</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">No-Execute Stack (NX)</span>
                <span className="text-emerald-400 font-bold">Enforced</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">RELRO Protection</span>
                <span className="text-emerald-400 font-bold">FULL</span>
              </div>
            </div>
          </div>

          {/* Generated Native Interceptor */}
          {generatedHook && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Generated Frida C Interceptor
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedHook);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
                <code>{generatedHook}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
