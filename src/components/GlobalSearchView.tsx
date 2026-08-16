import React, { useState } from 'react';
import { 
  Search, 
  FileCode2, 
  ArrowRight, 
  Filter, 
  Code2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { FileItem, Project } from '../types';

interface GlobalSearchViewProps {
  project: Project | null;
  onOpenFileInEditor: (filePath: string) => void;
}

interface SearchMatch {
  filePath: string;
  fileName: string;
  lineNumber: number;
  lineContent: string;
}

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  project,
  onOpenFileInEditor,
}) => {
  const [searchTerm, setSearchTerm] = useState('const-string');
  const [isRegex, setIsRegex] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const flattenFiles = (items: FileItem[]): FileItem[] => {
    let list: FileItem[] = [];
    for (const item of items) {
      if (item.type === 'file' && item.content) {
        list.push(item);
      }
      if (item.children) {
        list = list.concat(flattenFiles(item.children));
      }
    }
    return list;
  };

  const handleSearch = () => {
    if (!project || !searchTerm.trim()) return;

    const files = flattenFiles(project.files);
    const matches: SearchMatch[] = [];

    let regex: RegExp | null = null;
    if (isRegex) {
      try {
        regex = new RegExp(searchTerm, isCaseSensitive ? 'g' : 'gi');
      } catch {
        alert('Invalid Regular Expression');
        return;
      }
    }

    for (const file of files) {
      if (!file.content) continue;
      const lines = file.content.split('\n');

      lines.forEach((line, idx) => {
        let isMatch = false;
        if (regex) {
          isMatch = regex.test(line);
          regex.lastIndex = 0; // reset state
        } else {
          isMatch = isCaseSensitive
            ? line.includes(searchTerm)
            : line.toLowerCase().includes(searchTerm.toLowerCase());
        }

        if (isMatch) {
          matches.push({
            filePath: file.path,
            fileName: file.name,
            lineNumber: idx + 1,
            lineContent: line.trim(),
          });
        }
      });
    }

    setResults(matches);
    setHasSearched(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-400" />
          Global Project Search (Smali, XML &amp; Resources)
        </h1>
        <p className="text-xs text-slate-400">
          Fast full-text and Regex search across all decompiled bytecode classes and XML resources.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-700">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search string, opcode (e.g., const-string, invoke-virtual, apiKey, token)..."
              className="w-full bg-transparent text-xs text-slate-100 font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-emerald-950/40"
          >
            Search Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 text-xs select-none">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={isRegex}
              onChange={(e) => setIsRegex(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500"
            />
            <span>Regex Mode</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={isCaseSensitive}
              onChange={(e) => setIsCaseSensitive(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500"
            />
            <span>Match Case</span>
          </label>

          {/* Quick Filter Prompts */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-slate-500">Quick Filters:</span>
            {['const-string', 'invoke-direct', 'exported="true"', 'http://', 'AES'].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setSearchTerm(q);
                  setIsRegex(false);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Summary */}
      {hasSearched && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Found <strong className="text-emerald-400">{results.length}</strong> occurrence(s) across project files.</span>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-2">
        {results.map((match, idx) => (
          <div
            key={idx}
            onClick={() => onOpenFileInEditor(match.filePath)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-850 group"
          >
            <div className="space-y-1 overflow-hidden pr-4">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="font-semibold text-xs text-slate-200 font-mono">{match.fileName}</span>
                <span className="text-[10px] text-slate-500 font-mono">({match.filePath})</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                  Line {match.lineNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono pl-5.5 truncate bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                {match.lineContent}
              </p>
            </div>

            <button className="flex items-center gap-1 text-xs text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0">
              <span>Open File</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
