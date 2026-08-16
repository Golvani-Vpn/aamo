import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Copy, 
  Sparkles, 
  Code, 
  Radio, 
  Layers, 
  Wifi, 
  Lock
} from 'lucide-react';
import { Project, FileItem } from '../types';

interface ManifestDesignerViewProps {
  project: Project | null;
  onSaveContent?: (path: string, newContent: string) => void;
}

export const ManifestDesignerView: React.FC<ManifestDesignerViewProps> = ({ project, onSaveContent }) => {
  // Visual flags
  const [debuggable, setDebuggable] = useState(true);
  const [allowBackup, setAllowBackup] = useState(false);
  const [usesCleartextTraffic, setUsesCleartextTraffic] = useState(true);
  const [hardwareAccelerated, setHardwareAccelerated] = useState(true);
  const [largeHeap, setLargeHeap] = useState(false);
  const [sslProxyBypass, setSslProxyBypass] = useState(true);

  // Package & SDK
  const [packageName, setPackageName] = useState(project?.packageName || 'com.secvault.android');
  const [minSdk, setMinSdk] = useState(project?.minSdk || 24);
  const [targetSdk, setTargetSdk] = useState(project?.targetSdk || 34);
  const [versionCode, setVersionCode] = useState(project?.versionCode || 104);
  const [versionName, setVersionName] = useState(project?.versionName || '1.4.0');

  // Permissions
  const [permissions, setPermissions] = useState<string[]>([
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.RECEIVE_BOOT_COMPLETED',
    'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
    'android.permission.USE_BIOMETRIC',
  ]);
  const [newPermission, setNewPermission] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Common permission templates
  const popularPermissions = [
    'android.permission.CAMERA',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.RECORD_AUDIO',
    'android.permission.SYSTEM_ALERT_WINDOW',
    'android.permission.SCHEDULE_EXACT_ALARM',
    'android.permission.REQUEST_INSTALL_PACKAGES',
  ];

  const handleAddPermission = (perm: string) => {
    if (perm && !permissions.includes(perm)) {
      setPermissions([...permissions, perm]);
    }
  };

  const handleRemovePermission = (perm: string) => {
    setPermissions(permissions.filter((p) => p !== perm));
  };

  // Generate XML
  const generatedManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}"
    android:versionCode="${versionCode}"
    android:versionName="${versionName}">

    <uses-sdk
        android:minSdkVersion="${minSdk}"
        android:targetSdkVersion="${targetSdk}" />

    <!-- Declared Application Permissions -->
${permissions.map((p) => `    <uses-permission android:name="${p}" />`).join('\n')}

    <application
        android:name=".SecVaultApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:debuggable="${debuggable}"
        android:allowBackup="${allowBackup}"
        android:usesCleartextTraffic="${usesCleartextTraffic}"
        android:hardwareAccelerated="${hardwareAccelerated}"
        android:largeHeap="${largeHeap}"
        ${sslProxyBypass ? 'android:networkSecurityConfig="@xml/network_security_config"' : ''}
        android:theme="@style/Theme.SecVault">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".DebugAuthActivity"
            android:exported="true" />

        <service
            android:name=".SyncVaultService"
            android:exported="false"
            android:foregroundServiceType="dataSync" />

        <receiver
            android:name=".BootReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`;

  const handleSaveToProject = () => {
    if (onSaveContent) {
      onSaveContent('AndroidManifest.xml', generatedManifestXml);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Visual AndroidManifest Designer &amp; Policy Configurator
          </h1>
          <p className="text-xs text-slate-400">
            Configure package metadata, application security policies, and modern Android 14/15 permissions visually.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToProject}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-950/40"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved to AndroidManifest.xml!' : 'Apply & Save to Project'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Interactive Toggles & Form */}
        <div className="space-y-6">
          {/* Security & Runtime Policy Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security &amp; Debugging Flags
            </h2>

            <div className="space-y-3">
              {/* Debuggable */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">android:debuggable</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${debuggable ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                      {debuggable ? 'Attaching JDWP Allowed' : 'Production Strict'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Enables Java Debug Wire Protocol (JDWP) and Smali breakpoints.</p>
                </div>
                <button onClick={() => setDebuggable(!debuggable)} className="text-cyan-400 hover:text-cyan-300">
                  {debuggable ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                </button>
              </div>

              {/* Cleartext HTTP */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">android:usesCleartextTraffic</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${usesCleartextTraffic ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {usesCleartextTraffic ? 'HTTP Allowed' : 'HTTPS Only'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Permits non-encrypted cleartext HTTP traffic across sockets.</p>
                </div>
                <button onClick={() => setUsesCleartextTraffic(!usesCleartextTraffic)} className="text-cyan-400 hover:text-cyan-300">
                  {usesCleartextTraffic ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                </button>
              </div>

              {/* AllowBackup */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">android:allowBackup</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${allowBackup ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                      {allowBackup ? 'ADB Backup Active' : 'Secure (Disabled)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Allows dumping app database/shared_prefs via adb backup.</p>
                </div>
                <button onClick={() => setAllowBackup(!allowBackup)} className="text-cyan-400 hover:text-cyan-300">
                  {allowBackup ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                </button>
              </div>

              {/* SSL Proxy Certificate Config Bypass */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">Trust Custom User Certificates (Burp/Charles)</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${sslProxyBypass ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                      {sslProxyBypass ? 'Bypass Active' : 'Off'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Injects networkSecurityConfig trusting installed proxy CA certificates.</p>
                </div>
                <button onClick={() => setSslProxyBypass(!sslProxyBypass)} className="text-cyan-400 hover:text-cyan-300">
                  {sslProxyBypass ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Declared Permissions Manager */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Lock className="w-4 h-4 text-amber-400" />
              Android Permission Manager ({permissions.length})
            </h2>

            {/* Input to add */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                placeholder="e.g. android.permission.CAMERA"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => {
                  handleAddPermission(newPermission.trim());
                  setNewPermission('');
                }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick add popular */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Quick Add Popular:</span>
              <div className="flex flex-wrap gap-1.5">
                {popularPermissions.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleAddPermission(p)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    + {p.replace('android.permission.', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* List of active permissions */}
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {permissions.map((p) => (
                <div key={p} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-emerald-400 truncate">{p}</span>
                  <button onClick={() => handleRemovePermission(p)} className="text-slate-500 hover:text-rose-400 ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live XML Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                Synchronized AndroidManifest.xml Output
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedManifestXml);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy XML'}</span>
              </button>
            </div>

            <pre className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre">
              <code>{generatedManifestXml}</code>
            </pre>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Package: {packageName}</span>
            <span>Target SDK: {targetSdk} (Android 14)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
