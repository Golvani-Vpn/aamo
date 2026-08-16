import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Terminal, 
  Download, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Power, 
  Cpu, 
  Send, 
  Layers,
  Filter
} from 'lucide-react';
import { Project } from '../types';

interface AdbManagerViewProps {
  project: Project | null;
}

interface LogcatEntry {
  id: string;
  time: string;
  level: 'V' | 'D' | 'I' | 'W' | 'E';
  tag: string;
  pid: number;
  message: string;
}

export const AdbManagerView: React.FC<AdbManagerViewProps> = ({ project }) => {
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>('ALL');
  const [tagFilter, setTagFilter] = useState('');
  const [shellCommand, setShellCommand] = useState('pm list packages -3');
  const [shellOutput, setShellOutput] = useState('');

  const [logs, setLogs] = useState<LogcatEntry[]>([
    { id: '1', time: '10:14:02.102', level: 'I', tag: 'ActivityManager', pid: 1420, message: `Start proc 8219:${project?.packageName || 'com.secvault'}/u0a198 for activity .MainActivity` },
    { id: '2', time: '10:14:02.215', level: 'D', tag: 'APKForgeHook', pid: 8219, message: 'Dynamic Dalvik hook initialized successfully.' },
    { id: '3', time: '10:14:02.408', level: 'I', tag: 'SecVault', pid: 8219, message: 'Initializing cryptographic keystore provider...' },
    { id: '4', time: '10:14:02.780', level: 'W', tag: 'NetworkSecurityConfig', pid: 8219, message: 'Cleartext HTTP traffic permitted for target domain api.secvault.io' },
    { id: '5', time: '10:14:03.110', level: 'D', tag: 'CipherEngine', pid: 8219, message: 'SecretKeySpec initialized with algorithm: AES (128-bit)' },
  ]);

  // Simulate streaming logcat entries
  useEffect(() => {
    if (!deviceConnected) return;
    const interval = setInterval(() => {
      const randomTags = ['ActivityManager', 'CipherEngine', 'SecVault', 'OkHttp', 'StrictMode'];
      const randomTag = randomTags[Math.floor(Math.random() * randomTags.length)];
      const newEntry: LogcatEntry = {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        level: Math.random() > 0.8 ? 'W' : Math.random() > 0.9 ? 'E' : 'D',
        tag: randomTag,
        pid: 8219,
        message: `Heartbeat event in ${randomTag}: thread_id=${Math.floor(Math.random() * 500)} state=RUNNING`,
      };
      setLogs((prev) => [...prev.slice(-80), newEntry]);
    }, 4000);

    return () => clearInterval(interval);
  }, [deviceConnected]);

  const handleInstallApk = async () => {
    setIsInstalling(true);
    setInstallSuccess(false);
    setTimeout(() => {
      setIsInstalling(false);
      setInstallSuccess(true);
      setLogs((prev) => [
        ...prev,
        {
          id: `inst-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          level: 'I',
          tag: 'PackageManager',
          pid: 1420,
          message: `Success: Package ${project?.packageName} installed. Status: INSTALL_SUCCEEDED`,
        },
      ]);
    }, 2000);
  };

  const handleExecuteShell = () => {
    if (shellCommand.includes('pm list packages')) {
      setShellOutput(`package:${project?.packageName || 'com.secvault'}\npackage:com.android.settings\npackage:com.google.android.gms\npackage:com.topjohnwu.magisk`);
    } else if (shellCommand.includes('getprop')) {
      setShellOutput(`[ro.build.version.release]: [14]\n[ro.build.version.sdk]: [34]\n[ro.product.model]: [Pixel 8 Pro (Emulator)]\n[ro.product.cpu.abi]: [arm64-v8a]`);
    } else {
      setShellOutput(`$ ${shellCommand}\nExecution completed (exit code 0).`);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedLogLevel !== 'ALL' && log.level !== selectedLogLevel) return false;
    if (tagFilter && !log.tag.toLowerCase().includes(tagFilter.toLowerCase()) && !log.message.toLowerCase().includes(tagFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            ADB Bridge, 1-Click Install &amp; Live Logcat
          </h1>
          <p className="text-xs text-slate-400">
            Deploy patched APKs to physical/virtual test devices, run ADB shell commands, and stream live Logcat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallApk}
            disabled={isInstalling || !deviceConnected}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-950/40"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalling ? 'Installing to Device...' : 'Install APK via ADB'}</span>
          </button>
        </div>
      </div>

      {/* Device Info Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${deviceConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Google Pixel 8 Pro (Emulator-5554)</span>
              <span className="px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Online (ADB USB)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Android 14 (API 34) • Architecture: arm64-v8a • Root Access: Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceConnected(!deviceConnected)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              deviceConnected ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-emerald-600 text-slate-950'
            }`}
          >
            {deviceConnected ? 'Disconnect' : 'Connect ADB'}
          </button>
        </div>
      </div>

      {/* Main Grid: Logcat & ADB Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Logcat Stream (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[520px] shadow-xl">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-white">Live Logcat Stream</span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                placeholder="Filter tag/message..."
                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-[11px] font-mono text-slate-100 focus:outline-none w-36"
              />

              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                {['ALL', 'D', 'I', 'W', 'E'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLogLevel(lvl)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors ${
                      selectedLogLevel === lvl ? 'bg-emerald-600 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Log Stream */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[11px] bg-slate-950 rounded-xl my-2 border border-slate-800/80">
            {filteredLogs.map((log) => {
              let lvlColor = 'text-slate-400';
              if (log.level === 'W') lvlColor = 'text-amber-400';
              if (log.level === 'E') lvlColor = 'text-rose-400 font-bold';
              if (log.level === 'I') lvlColor = 'text-cyan-400';

              return (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-600 text-[10px] select-none">{log.time}</span>
                  <span className={`font-bold w-3 text-center ${lvlColor}`}>{log.level}</span>
                  <span className="text-emerald-400 font-semibold w-28 truncate select-none">[{log.tag}]</span>
                  <span className="text-slate-300 flex-1">{log.message}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Package Target: {project?.packageName}</span>
            <button onClick={() => setLogs([])} className="hover:text-slate-300">Clear Logcat</button>
          </div>
        </div>

        {/* Right: ADB Shell Console */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[520px] shadow-xl justify-between">
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs text-white">ADB Shell Terminal</span>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl p-3 font-mono text-xs text-slate-200 overflow-y-auto border border-slate-800/80 space-y-2">
              <div className="text-emerald-400">$ adb shell</div>
              {shellOutput && (
                <pre className="text-slate-300 whitespace-pre-wrap">{shellOutput}</pre>
              )}
            </div>
          </div>

          {/* Command Input */}
          <div className="pt-3 flex items-center gap-2">
            <input
              type="text"
              value={shellCommand}
              onChange={(e) => setShellCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteShell()}
              placeholder="adb shell command..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleExecuteShell}
              className="p-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
