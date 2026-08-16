import React from 'react';
import { 
  FileCode2, 
  ShieldAlert, 
  Hammer, 
  Binary, 
  Sparkles, 
  UploadCloud, 
  Layers, 
  Zap, 
  ArrowRight,
  FolderArchive,
  Activity,
  Code2,
  Lock,
  Globe,
  Radio
} from 'lucide-react';
import { Project, TabType } from '../types';
import { useLanguage } from '../i18n';

interface DashboardProps {
  activeProject: Project | null;
  setActiveTab: (tab: TabType) => void;
  onImportClick: () => void;
  onOpenProject: (id: string) => void;
  projectsList: Project[];
  vulnerabilitiesCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeProject,
  setActiveTab,
  onImportClick,
  onOpenProject,
  projectsList,
  vulnerabilitiesCount,
}) => {
  const { t, dir } = useLanguage();

  const totalVulns = 
    vulnerabilitiesCount.critical + 
    vulnerabilitiesCount.high + 
    vulnerabilitiesCount.medium + 
    vulnerabilitiesCount.low;

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 text-slate-100 ${dir === 'rtl' ? 'font-sans' : ''}`}>
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t('dash_suite_badge')}
              </span>
              <span className="text-xs text-slate-400 font-mono">{t('dash_keystore_badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              APKForge <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AI Studio</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              {t('dash_hero_desc')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onImportClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{t('dash_import_apk')}</span>
            </button>

            <button
              onClick={() => setActiveTab('repository')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium rounded-xl text-xs transition-all active:scale-95"
            >
              <FolderArchive className="w-4 h-4 text-indigo-400" />
              <span>{t('dash_studio_repo')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{t('dash_active_pkg')}</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-slate-100 truncate font-mono">
            {activeProject ? activeProject.packageName : t('no_project')}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400">v{activeProject?.versionName || '1.0.0'}</span>
            <span>• {t('dash_min_sdk')} {activeProject?.minSdk || 26}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{t('dash_total_files')}</span>
            <FileCode2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {activeProject?.fileCount || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {activeProject?.smaliClassCount || 0} Smali Bytecode
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{t('dash_security_issues')}</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {totalVulns}
          </div>
          <div className="text-[11px] text-slate-400">
            {vulnerabilitiesCount.critical} Critical • {vulnerabilitiesCount.high} High
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">{t('status_online')}</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {t('engine_ready')}
          </div>
          <div className="text-[11px] text-slate-400">
            Gemini &amp; DeepSeek Pro
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Action Cards & Active Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Action Workflows */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {t('dash_quick_tools')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Smali Editor */}
            <div 
              onClick={() => setActiveTab('editor')}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4.5 cursor-pointer transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-emerald-300 flex items-center justify-between">
                  {t('tab_editor')}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('dash_tool_editor_desc')}
                </p>
              </div>
            </div>

            {/* Card 2: AI Engineer */}
            <div 
              onClick={() => setActiveTab('chat')}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4.5 cursor-pointer transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-300 flex items-center justify-between">
                  {t('tab_chat')}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('ai_desc')}
                </p>
              </div>
            </div>

            {/* Card 3: Security Scanner */}
            <div 
              onClick={() => setActiveTab('security')}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 rounded-xl p-4.5 cursor-pointer transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-rose-300 flex items-center justify-between">
                  {t('tab_security')}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('sec_hunter_desc')}
                </p>
              </div>
            </div>

            {/* Card 4: Build & Sign */}
            <div 
              onClick={() => setActiveTab('builder')}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4.5 cursor-pointer transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 flex items-center justify-between">
                  {t('tab_build')}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('dash_tool_builder_desc')}
                </p>
              </div>
            </div>

            {/* Card 5: Secret & Key Hunter */}
            <div 
              onClick={() => setActiveTab('secrethunter')}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4.5 cursor-pointer transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-300 flex items-center justify-between">
                  {t('tab_secrethunter')}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('dash_tool_secrets_desc')}
                </p>
              </div>
            </div>

            {/* Card 6: Network Interceptor */}
            <div 
              onClick={() => setActiveTab('networkapi')}
              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4.5 cursor-pointer transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-blue-300 flex items-center justify-between">
                  {t('tab_networkapi')}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('dash_tool_network_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Projects Tray */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t('tab_projects')} ({projectsList.length})
              </h3>
              <button 
                onClick={() => setActiveTab('projects')}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                {t('dash_open_project')}
              </button>
            </div>

            <div className="space-y-2">
              {projectsList.map((p) => {
                const isCurrent = activeProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onOpenProject(p.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                        <Binary className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{p.packageName}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 hidden sm:inline">{p.fileCount} files</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        API {p.minSdk}-{p.targetSdk}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {t('proj_active')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Active Workspace & Security Breakdown */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            {t('dash_project_overview')}
          </h2>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400">{t('dash_security_issues')}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                vulnerabilitiesCount.critical > 0 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {vulnerabilitiesCount.critical > 0 ? 'Critical' : 'Secure'}
              </span>
            </div>

            {/* Severity list */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Critical
                </span>
                <span className="font-mono font-bold text-rose-400">{vulnerabilitiesCount.critical}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  High Risk
                </span>
                <span className="font-mono font-bold text-amber-400">{vulnerabilitiesCount.high}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Medium Risk
                </span>
                <span className="font-mono font-bold text-blue-400">{vulnerabilitiesCount.medium}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  Low / Info
                </span>
                <span className="font-mono font-bold text-slate-400">{vulnerabilitiesCount.low}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('security')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('tab_security')}</span>
            </button>
          </div>

          {/* Android Studio Export Banner */}
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                <Binary className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-200">Android Studio Repository</h4>
                <p className="text-[11px] text-slate-400">Production Kotlin &amp; Gradle</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Clean Architecture, Hilt DI, Room DB, WorkManager, Android Keystore, CI/CD.
            </p>
            <button
              onClick={() => setActiveTab('repository')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all flex items-center justify-center gap-1.5"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>{t('export_zip')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
