import React, { useState } from 'react';
import { 
  Binary, 
  FolderArchive, 
  Download, 
  Copy, 
  Check, 
  FileCode2, 
  CheckCircle2, 
  Terminal, 
  GitBranch,
  Folder,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ANDROID_SOURCE_REPOSITORY } from '../data/androidSourceRepository';
import { ZipExportService } from '../services/zipExportService';
import confetti from 'canvas-confetti';

export const SourceCodeRepoView: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentFile = ANDROID_SOURCE_REPOSITORY[selectedFileIndex] || ANDROID_SOURCE_REPOSITORY[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const zipBlob = await ZipExportService.exportAndroidStudioProjectZip();
      ZipExportService.downloadBlob(zipBlob, 'APKForgeAI-AndroidStudio-Project.zip');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const lines = currentFile.content.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Banner & Export Action */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">Production Android Studio Repository</h2>
              <span className="px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                Kotlin 2.0 + Compose
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Clean Architecture • Room SQLite • Hilt DI • Android Keystore • GitHub Actions CI/CD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-950/40 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating ZIP...' : 'Download Android Studio (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: File Tree & Code View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Repository File Tree */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full flex-shrink-0 select-none overflow-y-auto">
          <div className="p-3 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Project Files ({ANDROID_SOURCE_REPOSITORY.length})</span>
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          <div className="p-2 space-y-1">
            {ANDROID_SOURCE_REPOSITORY.map((file, idx) => {
              const isSelected = idx === selectedFileIndex;
              return (
                <div
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`p-2 rounded-lg cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="font-mono truncate">{file.path}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pl-5.5 truncate mt-0.5">{file.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          {/* File Header Bar */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-300 font-semibold">{currentFile.path}</span>
              <span className="text-slate-500 text-[11px] hidden md:inline">({currentFile.description})</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Container */}
          <div className="flex-1 flex overflow-auto font-mono text-xs text-slate-200">
            {/* Line numbers */}
            <div className="w-12 bg-slate-900/40 border-r border-slate-800/80 py-3 pr-3 text-right text-slate-600 select-none flex-shrink-0">
              {lines.map((_, i) => (
                <div key={i} className="leading-6 h-6">{i + 1}</div>
              ))}
            </div>

            {/* Code lines */}
            <pre className="p-3 leading-6 overflow-x-auto whitespace-pre flex-1 text-slate-300 select-text">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
