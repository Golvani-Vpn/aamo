import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  FileCode2, 
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Wand2
} from 'lucide-react';
import { Project, SecurityVulnerability } from '../types';
import { SecurityScanner } from '../services/securityScanner';

interface SecurityScannerViewProps {
  project: Project | null;
  onRemediateWithAI: (vuln: SecurityVulnerability) => void;
}

export const SecurityScannerView: React.FC<SecurityScannerViewProps> = ({
  project,
  onRemediateWithAI,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <ShieldAlert className="w-12 h-12 text-slate-700 mb-3" />
        <h3 className="text-sm font-semibold text-slate-400">No Active Project</h3>
        <p className="text-xs text-slate-600 max-w-sm mt-1">
          Open a project from the Projects tab to audit AndroidManifest.xml and Smali bytecode for vulnerabilities.
        </p>
      </div>
    );
  }

  const vulnerabilities = SecurityScanner.scanProject(project);

  const filteredVulns = selectedSeverity === 'ALL'
    ? vulnerabilities
    : vulnerabilities.filter((v) => v.severity === selectedSeverity);

  const criticalCount = vulnerabilities.filter((v) => v.severity === 'CRITICAL').length;
  const highCount = vulnerabilities.filter((v) => v.severity === 'HIGH').length;
  const mediumCount = vulnerabilities.filter((v) => v.severity === 'MEDIUM').length;
  const lowCount = vulnerabilities.filter((v) => v.severity === 'LOW').length;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border border-slate-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Security &amp; Vulnerability Audit
          </h1>
          <p className="text-xs text-slate-400">
            Automated static analysis of {project.name} against OWASP Mobile Top 10 &amp; Android Security benchmarks.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedSeverity === sev
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Scoreboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-rose-400">Critical Risks</span>
          <div className="text-2xl font-bold text-rose-400">{criticalCount}</div>
          <p className="text-[11px] text-slate-400">Immediate exploitation possible</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-amber-400">High Risks</span>
          <div className="text-2xl font-bold text-amber-400">{highCount}</div>
          <p className="text-[11px] text-slate-400">Significant security impact</p>
        </div>

        <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-blue-400">Medium Risks</span>
          <div className="text-2xl font-bold text-blue-400">{mediumCount}</div>
          <p className="text-[11px] text-slate-400">Configuration weaknesses</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Low / Informational</span>
          <div className="text-2xl font-bold text-slate-300">{lowCount}</div>
          <p className="text-[11px] text-slate-400">Best practice violations</p>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-4">
        {filteredVulns.length > 0 ? (
          filteredVulns.map((vuln) => (
            <div
              key={vuln.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityBadge(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                    {vuln.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-100">{vuln.title}</h3>
                </div>

                <button
                  onClick={() => onRemediateWithAI(vuln)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-medium text-xs transition-all active:scale-95 self-start sm:self-auto"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate AI Fix</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{vuln.description}</p>

              {/* Location & Code */}
              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 space-y-1.5 font-mono text-xs">
                <div className="text-[11px] text-slate-500">Location: <span className="text-slate-300">{vuln.location}</span></div>
                {vuln.affectedCode && (
                  <pre className="text-rose-300 bg-rose-950/20 p-2 rounded border border-rose-900/30 overflow-x-auto whitespace-pre">
                    <code>{vuln.affectedCode}</code>
                  </pre>
                )}
              </div>

              {/* Remediation Advice */}
              <div className="bg-slate-850/60 rounded-lg p-3 border border-slate-800 space-y-1 text-xs">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Remediation Guideline:
                </div>
                <p className="text-slate-300 leading-relaxed">{vuln.remediation}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No Vulnerabilities Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No matching security issues under the &ldquo;{selectedSeverity}&rdquo; filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
