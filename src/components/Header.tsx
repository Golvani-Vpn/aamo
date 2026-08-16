import React from 'react';
import { 
  Hammer, 
  Settings as SettingsIcon, 
  Sparkles, 
  FolderArchive,
  Globe
} from 'lucide-react';
import { AIModelId, AIProviderType, Project, TabType } from '../types';
import { LanguageCode, SUPPORTED_LANGUAGES, useLanguage } from '../i18n';

interface HeaderProps {
  activeProject: Project | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  aiProvider: AIProviderType;
  setAiProvider: (provider: AIProviderType) => void;
  aiModel: AIModelId;
  setAiModel: (model: AIModelId) => void;
  onOpenSettings: () => void;
  onQuickBuild: () => void;
  onExportAndroidStudioZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProject,
  activeTab,
  setActiveTab,
  aiProvider,
  setAiProvider,
  aiModel,
  setAiModel,
  onOpenSettings,
  onQuickBuild,
  onExportAndroidStudioZip,
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-slate-100 select-none z-30">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
            <Hammer className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">APKForge<span className="text-emerald-400"> AI</span></span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {t('version_pro')}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">
              {t('app_subtitle')}
            </p>
          </div>
        </div>

        {/* Current Active Project Capsule */}
        {activeProject ? (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-md border border-slate-700/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200">{activeProject.name}</span>
            <span className="text-slate-400 font-mono">({activeProject.packageName})</span>
            <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              API {activeProject.minSdk}-{activeProject.targetSdk}
            </span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-800/40 rounded-md text-xs text-slate-400">
            <span>{t('no_project')}</span>
          </div>
        )}
      </div>

      {/* Center/Right Controls: Language Dropdown, AI Provider, Quick Build, Download Android Studio Zip */}
      <div className="flex items-center gap-2">
        {/* Language Selector Dropdown (کشویی تغییر زبان) */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs hover:border-emerald-500/40 transition-colors shadow-sm">
          <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-transparent text-slate-100 focus:outline-none cursor-pointer text-xs font-semibold pr-1"
            title={t('language_select')}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-100 py-1.5">
                {lang.flag} {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        {/* AI Engine Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={`${aiProvider}:${aiModel}`}
            onChange={(e) => {
              const [prov, mod] = e.target.value.split(':') as [AIProviderType, AIModelId];
              setAiProvider(prov);
              setAiModel(mod);
            }}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-medium"
          >
            <optgroup label="Google Gemini">
              <option value="gemini:gemini-2.5-flash" className="bg-slate-800 text-white">Gemini 2.5 Flash</option>
              <option value="gemini:gemini-2.5-pro" className="bg-slate-800 text-white">Gemini 2.5 Pro</option>
            </optgroup>
            <optgroup label="DeepSeek AI">
              <option value="deepseek:deepseek-chat" className="bg-slate-800 text-white">DeepSeek V3 (Chat)</option>
              <option value="deepseek:deepseek-reasoner" className="bg-slate-800 text-white">DeepSeek R1 (Reasoner)</option>
            </optgroup>
          </select>
        </div>

        {/* 1-Click Android Studio Repo Export */}
        <button
          onClick={onExportAndroidStudioZip}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all shadow-sm active:scale-95"
          title="Download 100% Production Android Studio Project ZIP"
        >
          <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
          <span className="truncate">{t('export_zip')}</span>
        </button>

        {/* Build & Sign Action */}
        <button
          onClick={onQuickBuild}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-900/30 active:scale-95"
        >
          <Hammer className="w-3.5 h-3.5 text-slate-950" />
          <span className="hidden sm:inline">{t('build_sign')}</span>
          <span className="sm:hidden">{t('build_short')}</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title={t('settings_title')}
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
