import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Server, 
  Database, 
  Key,
  ExternalLink
} from 'lucide-react';
import { Project } from '../types';

interface ComponentGraphViewProps {
  project: Project | null;
}

export const ComponentGraphView: React.FC<ComponentGraphViewProps> = ({ project }) => {
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Components extracted from project
  const components = [
    {
      id: 'c-1',
      type: 'Activity',
      name: '.MainActivity',
      exported: true,
      permission: null,
      intentFilters: ['android.intent.action.MAIN', 'android.intent.category.LAUNCHER'],
      risk: 'INFO',
      description: 'Primary application entrypoint launched by the system launcher.',
    },
    {
      id: 'c-2',
      type: 'Activity',
      name: '.DebugAuthActivity',
      exported: true,
      permission: null,
      intentFilters: ['com.secvault.ACTION_DEBUG_AUTH'],
      risk: 'CRITICAL',
      description: 'Exported debug authorization interface allowing arbitrary intent injection without permissions.',
    },
    {
      id: 'c-3',
      type: 'Service',
      name: '.SyncVaultService',
      exported: false,
      permission: 'com.secvault.permission.VAULT_ACCESS',
      intentFilters: [],
      risk: 'SECURE',
      description: 'Background vault synchronization daemon protected by custom signature permission.',
    },
    {
      id: 'c-4',
      type: 'Receiver',
      name: '.BootReceiver',
      exported: true,
      permission: 'android.permission.RECEIVE_BOOT_COMPLETED',
      intentFilters: ['android.intent.action.BOOT_COMPLETED'],
      risk: 'MEDIUM',
      description: 'Autostart broadcast receiver triggered upon device power-on.',
    },
    {
      id: 'c-5',
      type: 'Provider',
      name: '.SecureKeyProvider',
      exported: false,
      permission: null,
      intentFilters: [],
      risk: 'SECURE',
      description: 'Local SQLite ContentProvider storing AES encrypted user secrets.',
    },
  ];

  const permissions = [
    { name: 'android.permission.INTERNET', level: 'Normal', desc: 'Allows HTTP/HTTPS socket communication.' },
    { name: 'android.permission.RECEIVE_BOOT_COMPLETED', level: 'Normal', desc: 'Allows automatic background launch after device reboot.' },
    { name: 'android.permission.READ_EXTERNAL_STORAGE', level: 'Dangerous', desc: 'Allows reading files from shared storage.' },
    { name: 'android.permission.USE_BIOMETRIC', level: 'Normal', desc: 'Allows fingerprint/face hardware authentication.' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'Activity': return Activity;
      case 'Service': return Server;
      case 'Receiver': return Radio;
      case 'Provider': return Database;
      default: return Layers;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'border-rose-500 bg-rose-950/30 text-rose-300';
      case 'MEDIUM': return 'border-amber-500 bg-amber-950/30 text-amber-300';
      case 'SECURE': return 'border-emerald-500 bg-emerald-950/30 text-emerald-300';
      default: return 'border-cyan-500 bg-cyan-950/30 text-cyan-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          Application Architecture &amp; Component Flow Graph
        </h1>
        <p className="text-xs text-slate-400">
          Visual mapping of AndroidManifest components, IPC entry points, Intent Filters, and permission boundaries.
        </p>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Component Nodes */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Manifest Component Hierarchy ({project?.packageName})
            </h2>
            <span className="text-[11px] text-slate-500">Click any component to inspect IPC details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {components.map((comp) => {
              const CompIcon = getIcon(comp.type);
              const isSelected = selectedNode?.id === comp.id;

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedNode(comp)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${getRiskColor(comp.risk)} ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CompIcon className="w-4 h-4" />
                      <span className="font-bold text-xs">{comp.type}</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900/80">
                      {comp.risk}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-semibold mt-2 text-white truncate">
                    {comp.name}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                    <span>Exported: <strong className={comp.exported ? 'text-rose-400' : 'text-emerald-400'}>{comp.exported ? 'YES' : 'NO'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Component Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Key className="w-4 h-4 text-amber-400" />
              Component Inspector
            </h2>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 text-[10px] block">Full Identifier</label>
                  <span className="font-mono text-cyan-300 font-bold">{selectedNode.name}</span>
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] block">Type &amp; Export Status</label>
                  <span className="text-slate-200">{selectedNode.type} • {selectedNode.exported ? 'Publicly Exported (Accessible by external apps)' : 'Private Internal Component'}</span>
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] block">Description</label>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{selectedNode.description}</p>
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] block">Intent Filters</label>
                  <div className="space-y-1 mt-1 font-mono text-[10px]">
                    {selectedNode.intentFilters.length > 0 ? (
                      selectedNode.intentFilters.map((f: string, i: number) => (
                        <div key={i} className="bg-slate-950 px-2 py-1 rounded text-emerald-400 border border-slate-800">
                          {f}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500">None (Explicit intent only)</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select any component on the left graph to inspect intent filters and attack surface.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Declared Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Declared Android Permissions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissions.map((p, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-emerald-400">{p.name}</span>
                <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                  p.level === 'Dangerous' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {p.level}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
