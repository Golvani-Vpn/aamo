import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  FileCode, 
  Download, 
  RotateCcw, 
  Copy, 
  Check, 
  Plus, 
  Minus, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Project, FileItem } from '../types';

interface DiffPatchViewProps {
  project: Project | null;
  onRestoreFile?: (path: string) => void;
  onRestoreAll?: () => void;
}

export const DiffPatchView: React.FC<DiffPatchViewProps> = ({ project, onRestoreFile, onRestoreAll }) => {
  const [selectedFileDiff, setSelectedFileDiff] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Collect all modified files
  const modifiedFiles = useMemo(() => {
    if (!project) return [];
    const results: FileItem[] = [];

    const traverse = (items: FileItem[]) => {
      for (const item of items) {
        if (item.type === 'file' && (item.isModified || (item.originalContent && item.content !== item.originalContent))) {
          results.push(item);
        }
        if (item.children) traverse(item.children);
      }
    };

    traverse(project.files);
    return results;
  }, [project]);

  const activeDiffFile = modifiedFiles.find((f) => f.path === selectedFileDiff) || modifiedFiles[0] || null;

  // Calculate line diff
  const diffLines = useMemo(() => {
    if (!activeDiffFile) return [];
    const orig = (activeDiffFile.originalContent || '').split('\n');
    const curr = (activeDiffFile.content || '').split('\n');

    const lines: { type: 'add' | 'remove' | 'same'; text: string; origNum?: number; currNum?: number }[] = [];
    let oIdx = 0;
    let cIdx = 0;

    // Simple line-by-line comparison
    while (oIdx < orig.length || cIdx < curr.length) {
      if (oIdx < orig.length && cIdx < curr.length && orig[oIdx] === curr[cIdx]) {
        lines.push({ type: 'same', text: orig[oIdx], origNum: oIdx + 1, currNum: cIdx + 1 });
        oIdx++;
        cIdx++;
      } else if (cIdx < curr.length && (!orig[oIdx] || orig.indexOf(curr[cIdx], oIdx) === -1)) {
        lines.push({ type: 'add', text: curr[cIdx], currNum: cIdx + 1 });
        cIdx++;
      } else if (oIdx < orig.length) {
        lines.push({ type: 'remove', text: orig[oIdx], origNum: oIdx + 1 });
        oIdx++;
      } else {
        lines.push({ type: 'same', text: '', origNum: oIdx, currNum: cIdx });
        oIdx++;
        cIdx++;
      }
    }

    return lines;
  }, [activeDiffFile]);

  // Generate unified patch string
  const unifiedPatch = useMemo(() => {
    if (modifiedFiles.length === 0) return '';
    let patch = `# APKForge AI Unified Patch Manifest\n# Project: ${project?.name} (${project?.packageName})\n# Timestamp: ${new Date().toISOString()}\n\n`;

    for (const f of modifiedFiles) {
      patch += `--- a/${f.path}\n+++ b/${f.path}\n@@ -1,${(f.originalContent || '').split('\n').length} +1,${(f.content || '').split('\n').length} @@\n`;
      const orig = (f.originalContent || '').split('\n');
      const curr = (f.content || '').split('\n');
      curr.forEach((line) => {
        if (!orig.includes(line)) {
          patch += `+ ${line}\n`;
        } else {
          patch += `  ${line}\n`;
        }
      });
      patch += '\n';
    }
    return patch;
  }, [modifiedFiles, project]);

  const handleDownloadPatch = () => {
    const blob = new Blob([unifiedPatch], { type: 'text/x-diff' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'patch'}-unified.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            Diff Inspector &amp; Unified Patch Manager
          </h1>
          <p className="text-xs text-slate-400">
            Compare all Smali, XML, and Manifest modifications against the original decompiled APK baseline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPatch}
            disabled={modifiedFiles.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-950/40"
          >
            <Download className="w-4 h-4" />
            <span>Export Unified .patch File</span>
          </button>
        </div>
      </div>

      {modifiedFiles.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-base font-bold text-white">No File Modifications Detected</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All Smali methods, XML resources, and AndroidManifest tags match the pristine decompiled baseline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Modified Files List (1 Col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl h-[580px] flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Modified Files</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {modifiedFiles.length}
              </span>
            </h2>

            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              {modifiedFiles.map((file) => (
                <div
                  key={file.path}
                  onClick={() => setSelectedFileDiff(file.path)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeDiffFile?.path === file.path
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono text-xs font-bold truncate">
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate mt-1">{file.path}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diff Viewer (3 Cols) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col h-[580px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-mono text-xs text-white">
                <span className="text-slate-400">Inspecting:</span>
                <span className="text-emerald-400 font-bold">{activeDiffFile?.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(unifiedPatch);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Patch'}</span>
                </button>
              </div>
            </div>

            {/* Diff Lines Table */}
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-y-auto font-mono text-xs select-text">
              {diffLines.map((line, idx) => {
                let rowBg = '';
                let textColor = 'text-slate-300';
                let sign = ' ';

                if (line.type === 'add') {
                  rowBg = 'bg-emerald-950/40 border-l-2 border-emerald-500';
                  textColor = 'text-emerald-300';
                  sign = '+';
                } else if (line.type === 'remove') {
                  rowBg = 'bg-rose-950/40 border-l-2 border-rose-500';
                  textColor = 'text-rose-300 line-through opacity-80';
                  sign = '-';
                }

                return (
                  <div key={idx} className={`flex items-start px-2 py-0.5 leading-relaxed ${rowBg}`}>
                    <span className="w-10 text-[10px] text-slate-600 select-none text-right pr-2">
                      {line.currNum || line.origNum || ''}
                    </span>
                    <span className="w-5 text-center font-bold select-none text-slate-500">{sign}</span>
                    <span className={`flex-1 whitespace-pre-wrap break-all ${textColor}`}>{line.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
