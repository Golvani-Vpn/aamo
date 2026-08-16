import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  FolderTree, 
  Code2, 
  Bot, 
  Hammer, 
  ShieldAlert, 
  Binary, 
  Sparkles,
  Coffee,
  Search,
  Zap,
  Network,
  Smartphone,
  FileText,
  Cpu,
  GitCompare,
  KeyRound,
  Globe,
  Layers
} from 'lucide-react';
import { TabType } from '../types';
import { useLanguage } from '../i18n';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  vulnerabilityCount: number;
  language?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  vulnerabilityCount,
}) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard' as TabType, label: t('tab_dashboard'), icon: LayoutDashboard },
    { id: 'projects' as TabType, label: t('tab_projects'), icon: FolderGit2 },
    { id: 'explorer' as TabType, label: t('tab_explorer'), icon: FolderTree },
    { id: 'editor' as TabType, label: t('tab_editor'), icon: Code2 },
    { id: 'javaview' as TabType, label: t('tab_javaview'), icon: Coffee, badge: 'JADX' },
    { id: 'manifestdesigner' as TabType, label: t('tab_manifestdesigner'), icon: FileText, badge: 'GUI' },
    { id: 'chat' as TabType, label: t('tab_chat'), icon: Bot, badge: 'AI Pro', highlightColor: 'amber' },
    { id: 'secrethunter' as TabType, label: t('tab_secrethunter'), icon: KeyRound, badge: 'KEYS' },
    { id: 'networkapi' as TabType, label: t('tab_networkapi'), icon: Globe, badge: 'API' },
    { id: 'splitmerger' as TabType, label: t('tab_splitmerger'), icon: Layers, badge: 'SPLIT' },
    { id: 'hexeditor' as TabType, label: t('tab_hexeditor'), icon: Binary, badge: 'HEX' },
    { id: 'search' as TabType, label: t('tab_search'), icon: Search },
    { id: 'frida' as TabType, label: t('tab_frida'), icon: Zap },
    { id: 'nativeanalyzer' as TabType, label: t('tab_native'), icon: Cpu, badge: 'ELF' },
    { id: 'graph' as TabType, label: t('tab_graph'), icon: Network },
    { id: 'deobfuscator' as TabType, label: t('tab_deobfuscator'), icon: Binary },
    { id: 'diffpatch' as TabType, label: t('tab_diffpatch'), icon: GitCompare, badge: 'DIFF' },
    { id: 'adb' as TabType, label: t('tab_adb'), icon: Smartphone },
    { id: 'builder' as TabType, label: t('tab_build'), icon: Hammer },
    { 
      id: 'security' as TabType, 
      label: t('tab_security'), 
      icon: ShieldAlert, 
      badgeCount: vulnerabilityCount 
    },
    { id: 'repository' as TabType, label: t('tab_repository'), icon: Binary, highlight: true },
  ];

  return (
    <aside className="w-16 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between flex-shrink-0 select-none z-20 overflow-y-auto">
      <div className="py-3 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAiTab = item.id === 'chat';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? isAiTab 
                    ? 'bg-gradient-to-r from-amber-500/25 to-emerald-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : isAiTab
                    ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${
                isActive ? 'text-emerald-400' : isAiTab ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
              }`} />
              <span className="hidden md:inline truncate">{item.label}</span>
              
              {item.badge && (
                <span className={`hidden md:inline-flex ml-auto text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                  isAiTab ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-cyan-300'
                }`}>
                  {item.badge}
                </span>
              )}

              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="hidden md:inline-flex ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.badgeCount}
                </span>
              )}

              {item.highlight && (
                <span className="hidden md:inline-flex ml-auto text-[9px] font-mono px-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Kotlin
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-slate-800/80 hidden md:block">
        <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {t('status_online')}
            </span>
            <span className="text-emerald-400 font-semibold">{t('status_online')}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">{t('engine_ready')}</p>
        </div>
      </div>
    </aside>
  );
};
