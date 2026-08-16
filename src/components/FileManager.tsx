import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode2, 
  FileText, 
  FileJson, 
  Search, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Binary,
  Layers,
  Sparkles,
  FileBox,
  FileCheck
} from 'lucide-react';
import { FileItem } from '../types';

interface FileManagerProps {
  files: FileItem[];
  selectedFilePath: string | null;
  onSelectFile: (file: FileItem) => void;
  onCreateFile: (parentPath: string, fileName: string) => void;
  onDeleteFile: (path: string) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  selectedFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'smali' | 'xml' | 'res' | 'assets'>('all');
  const [expandedFolders, setExpandedFolders] = useState<{ [path: string]: boolean }>({
    'smali': true,
    'smali/com': true,
    'smali/com/secvault': true,
    'res': true,
    'res/values': true,
    'res/layout': true,
  });

  const [newFileDialog, setNewFileDialog] = useState<{ isOpen: boolean; parentPath: string; fileName: string }>({
    isOpen: false,
    parentPath: '',
    fileName: '',
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const getFileIcon = (fileName: string, ext?: string) => {
    if (fileName.toLowerCase() === 'androidmanifest.xml') return <FileCheck className="w-4 h-4 text-emerald-400" />;
    if (ext === 'smali') return <FileCode2 className="w-4 h-4 text-cyan-400" />;
    if (ext === 'xml') return <FileText className="w-4 h-4 text-amber-400" />;
    if (ext === 'json') return <FileJson className="w-4 h-4 text-emerald-400" />;
    return <FileBox className="w-4 h-4 text-slate-400" />;
  };

  const renderTree = (items: FileItem[], level = 0) => {
    return items.map((item) => {
      // Filtering check
      if (searchTerm) {
        const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const hasMatchingChild = item.children && thisHasMatch(item.children, searchTerm);
        if (!matchesName && !hasMatchingChild) return null;
      }

      if (filterType === 'smali' && item.type === 'file' && item.extension !== 'smali') return null;
      if (filterType === 'xml' && item.type === 'file' && item.extension !== 'xml') return null;

      if (item.type === 'folder') {
        const isExpanded = expandedFolders[item.path] ?? false;
        return (
          <div key={item.path} className="select-none">
            <div
              onClick={() => toggleFolder(item.path)}
              style={{ paddingLeft: `${level * 14 + 8}px` }}
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-800/60 rounded cursor-pointer text-xs text-slate-300 transition-colors group"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
              )}
              <span className="font-medium text-slate-200 truncate">{item.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewFileDialog({ isOpen: true, parentPath: item.path, fileName: '' });
                }}
                className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded text-slate-400"
                title="New file in folder"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {isExpanded && item.children && (
              <div>{renderTree(item.children, level + 1)}</div>
            )}
          </div>
        );
      }

      // File rendering
      const isSelected = selectedFilePath === item.path;
      return (
        <div
          key={item.path}
          onClick={() => onSelectFile(item)}
          style={{ paddingLeft: `${level * 14 + 18}px` }}
          className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-xs transition-colors group ${
            isSelected
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          {getFileIcon(item.name, item.extension)}
          <span className="truncate">{item.name}</span>

          {item.isModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Modified" />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile(item.path);
            }}
            className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 rounded text-slate-500"
            title="Delete file"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    });
  };

  const thisHasMatch = (items: FileItem[], term: string): boolean => {
    return items.some((i) => {
      if (i.name.toLowerCase().includes(term.toLowerCase())) return true;
      if (i.children) return thisHasMatch(i.children, term);
      return false;
    });
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full flex-shrink-0 select-none">
      {/* Search and Filters */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Decompiled Workspace
          </span>
          <button
            onClick={() => setNewFileDialog({ isOpen: true, parentPath: '', fileName: '' })}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded transition-colors"
            title="Create root file"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
          <input
            type="text"
            placeholder="Search smali, xml, assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-850 border border-slate-700/80 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
          {(['all', 'smali', 'xml'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                filterType === t
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tree view */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {files.length > 0 ? (
          renderTree(files)
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No files in workspace
          </div>
        )}
      </div>

      {/* New File Modal */}
      {newFileDialog.isOpen && (
        <div className="p-3 bg-slate-850 border-t border-slate-800 space-y-2">
          <div className="text-xs font-semibold text-slate-200">
            New File in {newFileDialog.parentPath || 'root'}
          </div>
          <input
            type="text"
            placeholder="e.g. InjectedHelper.smali"
            value={newFileDialog.fileName}
            onChange={(e) => setNewFileDialog({ ...newFileDialog, fileName: e.target.value })}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newFileDialog.fileName.trim()) {
                onCreateFile(newFileDialog.parentPath, newFileDialog.fileName.trim());
                setNewFileDialog({ isOpen: false, parentPath: '', fileName: '' });
              }
            }}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setNewFileDialog({ isOpen: false, parentPath: '', fileName: '' })}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (newFileDialog.fileName.trim()) {
                  onCreateFile(newFileDialog.parentPath, newFileDialog.fileName.trim());
                  setNewFileDialog({ isOpen: false, parentPath: '', fileName: '' });
                }
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
