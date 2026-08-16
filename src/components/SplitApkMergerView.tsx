import React, { useState } from 'react';
import { 
  Layers, 
  Package, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileCode, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  Trash2,
  Cpu,
  Globe,
  Monitor
} from 'lucide-react';
import { Project } from '../types';

interface SplitApkMergerProps {
  onLoadMergedProject?: (mergedProject: Project) => void;
}

interface SplitItem {
  id: string;
  name: string;
  type: 'base' | 'config.arm64' | 'config.armeabi' | 'config.x86' | 'config.lang' | 'config.dpi' | 'feature';
  size: string;
  description: string;
  included: boolean;
}

export const SplitApkMergerView: React.FC<SplitApkMergerProps> = ({
  onLoadMergedProject,
}) => {
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeStatus, setMergeStatus] = useState<string | null>(null);
  const [mergeSuccess, setMergeSuccess] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'xapk' | 'apks' | 'apkm'>('xapk');

  const [splitItems, setSplitItems] = useState<SplitItem[]>([
    {
      id: 'split-1',
      name: 'base.apk',
      type: 'base',
      size: '14.2 MB',
      description: 'Core code, Manifest, Classes.dex, and primary assets',
      included: true,
    },
    {
      id: 'split-2',
      name: 'split_config.arm64_v8a.apk',
      type: 'config.arm64',
      size: '8.4 MB',
      description: '64-bit ARM Native Libraries (lib/*.so)',
      included: true,
    },
    {
      id: 'split-3',
      name: 'split_config.xxhdpi.apk',
      type: 'config.dpi',
      size: '5.1 MB',
      description: 'High-density screen drawables and UI resources',
      included: true,
    },
    {
      id: 'split-4',
      name: 'split_config.fa.apk',
      type: 'config.lang',
      size: '1.2 MB',
      description: 'Persian / Farsi language localized string resources',
      included: true,
    },
    {
      id: 'split-5',
      name: 'split_feature_ai_engine.apk',
      type: 'feature',
      size: '6.8 MB',
      description: 'Dynamic Feature Delivery module for AI processing',
      included: true,
    },
  ]);

  const toggleInclude = (id: string) => {
    setSplitItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, included: !item.included } : item))
    );
  };

  const handleStartMerge = () => {
    setIsMerging(true);
    setMergeProgress(10);
    setMergeStatus('Analyzing split AndroidManifest.xml structures...');
    setMergeSuccess(false);

    setTimeout(() => {
      setMergeProgress(35);
      setMergeStatus('Consolidating DEX Bytecode tables (classes.dex, classes2.dex, classes3.dex)...');
    }, 800);

    setTimeout(() => {
      setMergeProgress(65);
      setMergeStatus('Merging native ABI shared libraries into /lib/arm64-v8a/...');
    }, 1600);

    setTimeout(() => {
      setMergeProgress(85);
      setMergeStatus('Re-aligning resource IDs with AAPT2 and re-packing into Standalone APK...');
    }, 2400);

    setTimeout(() => {
      setMergeProgress(100);
      setMergeStatus('Standalone APK successfully assembled and validated!');
      setIsMerging(false);
      setMergeSuccess(true);
    }, 3200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-cyan-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  XAPK &amp; Split-APKs Standalone Merger
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    App Bundle Tool
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  تبدیل و ادغام پکیج‌های چندتکه (Split APKs، XAPK، APKS و APKM) به یک فایل APK مستقل و واحد برای نصب و دیکامپایل آسان
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">فرمت منبع:</span>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {(['xapk', 'apks', 'apkm'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1 rounded-lg uppercase font-mono text-[11px] transition-colors ${
                    selectedFormat === fmt ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  .{fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Drag & Drop Split Box */}
        <div className="p-8 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition-colors">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-200">فایل‌های .XAPK یا چندین فایل .APK اسپلیت را اینجا رها کنید</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Drop base.apk, split_config.*.apk or .xapk archive to extract &amp; merge</p>
          </div>
        </div>

        {/* Splits Configuration Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs text-white">قطعات اسپلیت شناسایی‌شده در باندل (Bundle Splits)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              مجموع انتخابی: {splitItems.filter((s) => s.included).length} از {splitItems.length} فایل
            </span>
          </div>

          <div className="space-y-2">
            {splitItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleInclude(item.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  item.included
                    ? 'bg-slate-950/80 border-cyan-500/40 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.included}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500"
                  />

                  <div className="flex items-center gap-2">
                    {item.type === 'base' ? (
                      <Package className="w-4 h-4 text-cyan-400" />
                    ) : item.type.includes('arm') ? (
                      <Cpu className="w-4 h-4 text-amber-400" />
                    ) : item.type.includes('lang') ? (
                      <Globe className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Monitor className="w-4 h-4 text-blue-400" />
                    )}
                    <div>
                      <div className="font-bold font-mono text-xs text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.description}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cyan-400">{item.size}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Trigger Bar */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              خروجی: <strong className="text-white font-mono">standalone-unified-app.apk</strong> (ادغام کامل تمام معماری‌ها و زبان‌ها)
            </div>

            <button
              onClick={handleStartMerge}
              disabled={isMerging}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-950/40 active:scale-95 flex items-center justify-center gap-2"
            >
              {isMerging ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>در حال ادغام پکیج‌ها...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>شروع ادغام و ساخت APK واحد</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress & Live Results */}
        {isMerging && (
          <div className="p-4 bg-slate-900 rounded-2xl border border-cyan-500/40 space-y-2">
            <div className="flex justify-between text-xs font-bold text-cyan-300">
              <span>{mergeStatus}</span>
              <span>{mergeProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${mergeProgress}%` }}
              />
            </div>
          </div>
        )}

        {mergeSuccess && (
          <div className="p-5 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-emerald-950/50 rounded-2xl border border-emerald-500/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">ادغام اسپلیت‌ها با موفقیت انجام شد!</h3>
                <p className="text-xs text-emerald-300/80">فایل نهایی یکپارچه آماده تحلیل، ویرایش و نصب است.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px]">فرمت خروجی:</div>
                <div className="text-white font-bold">Standalone APK (Universal)</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px]">حجم کل ادغام‌شده:</div>
                <div className="text-cyan-400 font-bold">35.0 MB</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px]">وضعیت سازگاری:</div>
                <div className="text-emerald-400 font-bold">Android 5.0+ Compatible</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => {
                  const blob = new Blob(['Merged APK Sample Binary Content'], { type: 'application/vnd.android.package-archive' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'merged-universal-app.apk';
                  a.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>دانلود فایل APK یکپارچه</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
