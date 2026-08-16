/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectsView } from './components/ProjectsView';
import { FileManager } from './components/FileManager';
import { EditorView } from './components/EditorView';
import { JavaDecompilerView } from './components/JavaDecompilerView';
import { ChatView } from './components/ChatView';
import { GlobalSearchView } from './components/GlobalSearchView';
import { FridaHookGeneratorView } from './components/FridaHookGeneratorView';
import { ComponentGraphView } from './components/ComponentGraphView';
import { DeobfuscatorView } from './components/DeobfuscatorView';
import { AdbManagerView } from './components/AdbManagerView';
import { ApkBuilderView } from './components/ApkBuilderView';
import { SecurityScannerView } from './components/SecurityScannerView';
import { SourceCodeRepoView } from './components/SourceCodeRepoView';
import { SettingsModal } from './components/SettingsModal';
import { FloatingAiCopilot } from './components/FloatingAiCopilot';
import { HexEditorView } from './components/HexEditorView';
import { ManifestDesignerView } from './components/ManifestDesignerView';
import { NativeAnalyzerView } from './components/NativeAnalyzerView';
import { DiffPatchView } from './components/DiffPatchView';
import { SecretHunterView } from './components/SecretHunterView';
import { NetworkSandboxView } from './components/NetworkSandboxView';
import { SplitApkMergerView } from './components/SplitApkMergerView';
import { 
  AIModelId, 
  AIProviderType, 
  FileItem, 
  KeystoreConfig, 
  Project, 
  SecurityVulnerability, 
  TabType 
} from './types';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { SecurityScanner } from './services/securityScanner';
import { ZipExportService } from './services/zipExportService';
import confetti from 'canvas-confetti';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('apkforge_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SAMPLE_PROJECTS;
      }
    }
    return SAMPLE_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || SAMPLE_PROJECTS[0].id;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>('smali/com/secvault/MainActivity.smali');
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | null>(null);

  // AI & Model Settings
  const [aiProvider, setAiProvider] = useState<AIProviderType>('gemini');
  const [aiModel, setAiModel] = useState<AIModelId>('gemini-2.5-flash');
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem('apkforge_gemini_key') || '');
  const [deepseekKey, setDeepseekKey] = useState<string>(() => localStorage.getItem('apkforge_deepseek_key') || '');

  // Keystore Settings
  const [keystore, setKeystore] = useState<KeystoreConfig>({
    alias: 'apkforge_release',
    password: 'apkforge_secure_pass',
    keyPassword: 'apkforge_secure_pass',
    validityYears: 30,
    algorithm: 'RSA-2048',
    signatureScheme: {
      v1: true,
      v2: true,
      v3: true,
    },
    organizationName: 'APKForge AI Security Labs',
    countryCode: 'US',
  });

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sync projects to localStorage
  useEffect(() => {
    localStorage.setItem('apkforge_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (geminiKey) localStorage.setItem('apkforge_gemini_key', geminiKey);
    if (deepseekKey) localStorage.setItem('apkforge_deepseek_key', deepseekKey);
  }, [geminiKey, deepseekKey]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Find active file
  const findFileByPath = (items: FileItem[], path: string): FileItem | null => {
    for (const item of items) {
      if (item.path === path && item.type === 'file') return item;
      if (item.children) {
        const found = findFileByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const activeFile = activeProject && selectedFilePath 
    ? findFileByPath(activeProject.files, selectedFilePath) 
    : null;

  // Vulnerability counts
  const vulnerabilities = activeProject ? SecurityScanner.scanProject(activeProject) : [];
  const vulnCounts = {
    critical: vulnerabilities.filter((v) => v.severity === 'CRITICAL').length,
    high: vulnerabilities.filter((v) => v.severity === 'HIGH').length,
    medium: vulnerabilities.filter((v) => v.severity === 'MEDIUM').length,
    low: vulnerabilities.filter((v) => v.severity === 'LOW').length,
  };

  // Handlers
  const handleSaveContent = (path: string, newContent: string) => {
    if (!activeProject) return;

    const updateRecursive = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.path === path && item.type === 'file') {
          return {
            ...item,
            content: newContent,
            isModified: true,
          };
        }
        if (item.children) {
          return {
            ...item,
            children: updateRecursive(item.children),
          };
        }
        return item;
      });
    };

    const updatedFiles = updateRecursive(activeProject.files);
    const updatedProjects = projects.map((p) =>
      p.id === activeProject.id
        ? { ...p, files: updatedFiles, lastModified: new Date().toLocaleTimeString() }
        : p
    );
    setProjects(updatedProjects);
  };

  const handleCreateFile = (parentPath: string, fileName: string) => {
    if (!activeProject) return;
    const newPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    const ext = fileName.split('.').pop() || 'smali';

    const newFileItem: FileItem = {
      id: `f-${Date.now()}`,
      name: fileName,
      path: newPath,
      type: 'file',
      extension: ext,
      content: ext === 'smali' 
        ? `.class public L${newPath.replace('.smali', '').replace(/\//g, '/')};\n.super Ljava/lang/Object;\n\n.method public constructor <init>()V\n    .registers 1\n    invoke-direct {p0}, Ljava/lang/Object;-><init>()V\n    return-void\n.end method`
        : `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>`,
      originalContent: '',
      isModified: true,
      size: 512,
    };

    const insertRecursive = (items: FileItem[]): FileItem[] => {
      if (!parentPath) return [...items, newFileItem];
      return items.map((item) => {
        if (item.path === parentPath && item.type === 'folder') {
          return {
            ...item,
            children: [...(item.children || []), newFileItem],
          };
        }
        if (item.children) {
          return {
            ...item,
            children: insertRecursive(item.children),
          };
        }
        return item;
      });
    };

    const updatedFiles = insertRecursive(activeProject.files);
    const updatedProjects = projects.map((p) =>
      p.id === activeProject.id
        ? { ...p, files: updatedFiles, fileCount: p.fileCount + 1 }
        : p
    );
    setProjects(updatedProjects);
    setSelectedFilePath(newPath);
    setActiveTab('editor');
  };

  const handleDeleteFile = (path: string) => {
    if (!activeProject) return;
    const deleteRecursive = (items: FileItem[]): FileItem[] => {
      return items
        .filter((item) => item.path !== path)
        .map((item) => ({
          ...item,
          children: item.children ? deleteRecursive(item.children) : undefined,
        }));
    };

    const updatedFiles = deleteRecursive(activeProject.files);
    const updatedProjects = projects.map((p) =>
      p.id === activeProject.id ? { ...p, files: updatedFiles, fileCount: Math.max(1, p.fileCount - 1) } : p
    );
    setProjects(updatedProjects);
    if (selectedFilePath === path) setSelectedFilePath(null);
  };

  const handleCreateProject = (newProj: Project) => {
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setActiveTab('dashboard');
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) {
      alert('Cannot delete the last active project.');
      return;
    }
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    if (activeProjectId === id) {
      setActiveProjectId(updated[0].id);
    }
  };

  const handleBackupProject = (id: string) => {
    alert(`Snapshot backup created for ${activeProject?.name || id}`);
  };

  const handleRestoreBackup = (id: string) => {
    if (!activeProject) return;
    const resetFilesRecursive = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.type === 'file' && item.originalContent !== undefined) {
          return { ...item, content: item.originalContent, isModified: false };
        }
        if (item.children) {
          return { ...item, children: resetFilesRecursive(item.children) };
        }
        return item;
      });
    };

    const restored = resetFilesRecursive(activeProject.files);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, files: restored } : p))
    );
    alert('Project restored to original decompiled baseline.');
  };

  const handleExportAndroidStudioZip = async () => {
    try {
      const zipBlob = await ZipExportService.exportAndroidStudioProjectZip();
      ZipExportService.downloadBlob(zipBlob, 'APKForgeAI-AndroidStudio-Project.zip');
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleAskAIFromEditor = (codeSnippet: string, fileName: string) => {
    setInitialChatPrompt(`Please inspect this Smali / XML code from ${fileName} and advise on optimizations or vulnerabilities:\n\n\`\`\`smali\n${codeSnippet}\n\`\`\``);
    setActiveTab('chat');
  };

  const handleRemediateWithAI = (vuln: SecurityVulnerability) => {
    setInitialChatPrompt(`I need a patch for the following security vulnerability found by APKForge AI:
**Vulnerability:** ${vuln.title} (${vuln.severity})
**Location:** ${vuln.location}
**Code:** \`${vuln.affectedCode || ''}\`
**Guideline:** ${vuln.remediation}

Please provide the exact Smali / XML replacement patch.`);
    setActiveTab('chat');
  };

  const handleApplyCodeToEditor = (code: string) => {
    if (activeFile) {
      handleSaveContent(activeFile.path, code);
      setActiveTab('editor');
      alert(`Applied code to ${activeFile.name}`);
    } else {
      alert('Please select an active file in the Editor first.');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-text">
      {/* Top Header */}
      <Header
        activeProject={activeProject}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aiProvider={aiProvider}
        setAiProvider={setAiProvider}
        aiModel={aiModel}
        setAiModel={setAiModel}
        onOpenSettings={() => setSettingsOpen(true)}
        onQuickBuild={() => setActiveTab('builder')}
        onExportAndroidStudioZip={handleExportAndroidStudioZip}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          vulnerabilityCount={vulnCounts.critical + vulnCounts.high}
        />

        {/* Dynamic Center Workspace */}
        <main className="flex-1 flex overflow-hidden bg-slate-950">
          {activeTab === 'dashboard' && (
            <div className="flex-1 overflow-y-auto">
              <Dashboard
                activeProject={activeProject}
                setActiveTab={setActiveTab}
                onImportClick={() => setActiveTab('projects')}
                onOpenProject={(id) => {
                  setActiveProjectId(id);
                  setActiveTab('explorer');
                }}
                projectsList={projects}
                vulnerabilitiesCount={vulnCounts}
              />
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="flex-1 overflow-y-auto">
              <ProjectsView
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={(id) => {
                  setActiveProjectId(id);
                  setActiveTab('explorer');
                }}
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
                onBackupProject={handleBackupProject}
                onRestoreBackup={handleRestoreBackup}
              />
            </div>
          )}

          {(activeTab === 'explorer' || activeTab === 'editor') && (
            <div className="flex-1 flex overflow-hidden">
              <FileManager
                files={activeProject ? activeProject.files : []}
                selectedFilePath={selectedFilePath}
                onSelectFile={(file) => {
                  setSelectedFilePath(file.path);
                  setActiveTab('editor');
                }}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
              />
              <EditorView
                activeFile={activeFile}
                onSaveContent={handleSaveContent}
                onAskAI={handleAskAIFromEditor}
              />
            </div>
          )}

          {activeTab === 'javaview' && (
            <JavaDecompilerView
              activeFile={activeFile}
              project={activeProject}
              onAskAI={handleAskAIFromEditor}
            />
          )}

          {activeTab === 'manifestdesigner' && (
            <div className="flex-1 overflow-y-auto">
              <ManifestDesignerView
                project={activeProject}
                onSaveContent={handleSaveContent}
              />
            </div>
          )}

          {activeTab === 'hexeditor' && (
            <div className="flex-1 overflow-y-auto">
              <HexEditorView
                project={activeProject}
                activeFile={activeFile}
                onSaveContent={handleSaveContent}
              />
            </div>
          )}

          {activeTab === 'nativeanalyzer' && (
            <div className="flex-1 overflow-y-auto">
              <NativeAnalyzerView
                project={activeProject}
              />
            </div>
          )}

          {activeTab === 'diffpatch' && (
            <div className="flex-1 overflow-y-auto">
              <DiffPatchView
                project={activeProject}
                onRestoreFile={(path) => handleSaveContent(path, activeFile?.originalContent || '')}
              />
            </div>
          )}

          {activeTab === 'chat' && (
            <ChatView
              activeProject={activeProject}
              activeFile={activeFile}
              aiProvider={aiProvider}
              setAiProvider={setAiProvider}
              aiModel={aiModel}
              setAiModel={setAiModel}
              onApplyCodeToEditor={handleApplyCodeToEditor}
              initialPrompt={initialChatPrompt}
              onClearInitialPrompt={() => setInitialChatPrompt(null)}
            />
          )}

          {activeTab === 'secrethunter' && (
            <div className="flex-1 overflow-y-auto">
              <SecretHunterView
                project={activeProject}
                onOpenFileInEditor={(path) => {
                  setSelectedFilePath(path);
                  setActiveTab('editor');
                }}
                onAskAIWithSecret={(secret, ctx) => {
                  setInitialChatPrompt(`Please analyze and remediate this finding: ${ctx}\nValue: ${secret}`);
                  setActiveTab('chat');
                }}
              />
            </div>
          )}

          {activeTab === 'networkapi' && (
            <div className="flex-1 overflow-y-auto">
              <NetworkSandboxView
                project={activeProject}
                onOpenFileInEditor={(path) => {
                  setSelectedFilePath(path);
                  setActiveTab('editor');
                }}
              />
            </div>
          )}

          {activeTab === 'splitmerger' && (
            <div className="flex-1 overflow-y-auto">
              <SplitApkMergerView />
            </div>
          )}

          {activeTab === 'search' && (
            <div className="flex-1 overflow-y-auto">
              <GlobalSearchView
                project={activeProject}
                onOpenFileInEditor={(path) => {
                  setSelectedFilePath(path);
                  setActiveTab('editor');
                }}
              />
            </div>
          )}

          {activeTab === 'frida' && (
            <div className="flex-1 overflow-y-auto">
              <FridaHookGeneratorView project={activeProject} />
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="flex-1 overflow-y-auto">
              <ComponentGraphView project={activeProject} />
            </div>
          )}

          {activeTab === 'deobfuscator' && (
            <div className="flex-1 overflow-y-auto">
              <DeobfuscatorView />
            </div>
          )}

          {activeTab === 'adb' && (
            <div className="flex-1 overflow-y-auto">
              <AdbManagerView project={activeProject} />
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="flex-1 overflow-y-auto">
              <ApkBuilderView
                project={activeProject}
                keystore={keystore}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex-1 overflow-y-auto">
              <SecurityScannerView
                project={activeProject}
                onRemediateWithAI={handleRemediateWithAI}
              />
            </div>
          )}

          {activeTab === 'repository' && (
            <SourceCodeRepoView />
          )}
        </main>
      </div>

      {/* Global Floating AI Copilot Chat Window (Always accessible across all tabs) */}
      <FloatingAiCopilot
        activeProject={activeProject}
        activeFile={activeFile}
        aiProvider={aiProvider}
        setAiProvider={setAiProvider}
        aiModel={aiModel}
        setAiModel={setAiModel}
        onApplyCodeToEditor={handleApplyCodeToEditor}
        onOpenFullChat={() => setActiveTab('chat')}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        geminiKey={geminiKey}
        setGeminiKey={setGeminiKey}
        deepseekKey={deepseekKey}
        setDeepseekKey={setDeepseekKey}
        keystore={keystore}
        setKeystore={setKeystore}
        onClearCache={() => {
          localStorage.removeItem('apkforge_projects');
          setProjects(SAMPLE_PROJECTS);
          setActiveProjectId(SAMPLE_PROJECTS[0].id);
        }}
      />
    </div>
  );
}
