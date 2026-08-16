import React, { useRef, useState } from 'react';
import { 
  FolderGit2, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Copy, 
  RotateCcw, 
  CheckCircle2, 
  Binary, 
  Layers, 
  Calendar, 
  HardDrive, 
  ShieldAlert,
  Sparkles,
  FileCode2
} from 'lucide-react';
import { Project } from '../types';
import { APKEngine } from '../services/apkEngine';

interface ProjectsViewProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onBackupProject: (id: string) => void;
  onRestoreBackup: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onBackupProject,
  onRestoreBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processApkFile(file);
    }
  };

  const processApkFile = async (file: File) => {
    try {
      setIsUploading(true);
      const newProject = await APKEngine.importApkFile(file);
      onCreateProject(newProject);
      onSelectProject(newProject.id);
    } catch (err: any) {
      alert(`Failed to import APK: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processApkFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            APK Project Workspaces
          </h1>
          <p className="text-xs text-slate-400">
            Manage decompiled Android applications, drafts, backups, and Smali bytecode environments.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-950/40 active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{isUploading ? 'Extracting & Decompiling...' : 'Import .APK File'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".apk"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-emerald-400 bg-emerald-950/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-emerald-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Drag &amp; Drop APK file here, or click to browse
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports standard Android packages (.apk), multidex packages, and resource bundles.
            </p>
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          return (
            <div
              key={proj.id}
              className={`bg-slate-900 border rounded-xl p-5 space-y-4 transition-all relative ${
                isActive
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                    <Binary className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white truncate max-w-[180px]">{proj.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">{proj.packageName}</p>
                  </div>
                </div>

                {isActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/40 p-2.5 rounded-lg">
                <div>
                  <span className="text-slate-400 block text-[10px]">API Target</span>
                  <span className="font-medium font-mono text-slate-200">API {proj.minSdk} - {proj.targetSdk}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Version</span>
                  <span className="font-medium font-mono text-slate-200">v{proj.versionName} ({proj.versionCode})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Decompiled Files</span>
                  <span className="font-medium text-slate-200">{proj.fileCount} items</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Smali Classes</span>
                  <span className="font-medium text-slate-200">{proj.smaliClassCount} classes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onBackupProject(proj.id)}
                    title="Create Snapshot Backup"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRestoreBackup(proj.id)}
                    title="Restore Original Decompilation"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    title="Delete Project & Purge Cache"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onSelectProject(proj.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                  }`}
                >
                  {isActive ? 'Current Workspace' : 'Open Workspace'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
