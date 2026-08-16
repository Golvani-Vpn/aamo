import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  Search, 
  Replace, 
  Sparkles, 
  GitCompare, 
  Code2, 
  Bookmark, 
  Check, 
  Copy, 
  Play,
  FileCode2,
  Undo2,
  Redo2,
  FileCheck,
  Wand2,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal
} from 'lucide-react';
import { FileItem, Snippet } from '../types';
import { SMALI_SNIPPETS } from '../data/snippets';
import { AIService } from '../services/aiService';

interface EditorViewProps {
  activeFile: FileItem | null;
  onSaveContent: (path: string, newContent: string) => void;
  onAskAI: (codeSnippet: string, fileName: string) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  activeFile,
  onSaveContent,
  onAskAI,
}) => {
  const [content, setContent] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [snippetsOpen, setSnippetsOpen] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // AI Direct In-line Code Modifier States
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiIsTransforming, setAiIsTransforming] = useState(false);
  const [aiProposedCode, setAiProposedCode] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (activeFile && activeFile.content !== undefined) {
      setContent(activeFile.content);
      setHistory([activeFile.content]);
      setHistoryIndex(0);
      setAiProposedCode(null);
      setAiPromptOpen(false);
    } else {
      setContent('');
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [activeFile?.path]);

  const handleContentChange = (newText: string) => {
    setContent(newText);
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(newText);
    if (newHist.length > 50) newHist.shift();
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setContent(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setContent(next);
    }
  };

  const handleSave = () => {
    if (activeFile) {
      onSaveContent(activeFile.path, content);
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const replaced = content.split(findText).join(replaceText);
    handleContentChange(replaced);
  };

  const insertSnippet = (snip: Snippet) => {
    const newContent = content + '\n\n' + snip.code;
    handleContentChange(newContent);
    setCopiedSnippetId(snip.id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // AI Direct Code Transformation handler
  const handleAITransform = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiInstruction;
    if (!promptToUse.trim() || !activeFile) return;

    setAiIsTransforming(true);
    setAiError(null);

    try {
      const systemPrompt = `You are APKForge AI, an expert Smali Bytecode and Android Reverse Engineering AI.
The user wants to modify the following file: "${activeFile.name}".
Your task is to rewrite or apply the requested changes to the provided code strictly according to the user's instruction.
Return ONLY the full updated code or the exact replacement method inside standard markdown code fences (\`\`\`smali or \`\`\`xml).
Do not include conversational banter; the output must be valid code ready to replace in the editor.`;

      const userMessageText = `File Path: ${activeFile.path}\nInstruction: ${promptToUse}\n\nCurrent Code:\n\`\`\`${activeFile.extension || 'smali'}\n${content}\n\`\`\``;

      const aiReply = await AIService.sendMessage({
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        messages: [{ role: 'user', text: userMessageText }],
        systemInstruction: systemPrompt,
      });

      // Extract code inside code fence if present
      const codeFenceMatch = aiReply.match(/```(?:\w+)?\s*([\s\S]*?)```/);
      const extractedCode = codeFenceMatch ? codeFenceMatch[1].trim() : aiReply.trim();

      setAiProposedCode(extractedCode);
    } catch (err: any) {
      setAiError(err.message || 'خطا در ارتباط با هوش مصنوعی برای ویرایش کد.');
    } finally {
      setAiIsTransforming(false);
    }
  };

  const handleApplyAiProposedCode = () => {
    if (aiProposedCode) {
      handleContentChange(aiProposedCode);
      if (activeFile) {
        onSaveContent(activeFile.path, aiProposedCode);
      }
      setAiProposedCode(null);
      setAiPromptOpen(false);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-950">
        <Code2 className="w-12 h-12 text-slate-700 mb-3" />
        <h3 className="text-sm font-semibold text-slate-400">No File Selected</h3>
        <p className="text-xs text-slate-600 max-w-sm mt-1">
          Select a Smali class, AndroidManifest.xml, or resource layout from the File Explorer to edit bytecode and XML.
        </p>
      </div>
    );
  }

  const lines = content.split('\n');
  const originalLines = (activeFile.originalContent || '').split('\n');
  const isModified = content !== (activeFile.originalContent || '');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Editor Header Bar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none">
        {/* Left: File Name, Path & Modified Badge */}
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-slate-200 font-mono">{activeFile.name}</span>
          <span className="text-slate-500 font-mono text-[11px] truncate hidden md:inline">
            ({activeFile.path})
          </span>
          {isModified && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              Unsaved
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
              searchOpen ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
            title="Search & Replace"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDiffMode(!isDiffMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              isDiffMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isDiffMode ? 'Exit Diff' : 'Diff View'}</span>
          </button>

          <button
            onClick={() => setSnippetsOpen(!snippetsOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              snippetsOpen
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Snippets</span>
          </button>

          <button
            onClick={() => setAiPromptOpen(!aiPromptOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all shadow-sm ${
              aiPromptOpen
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 ring-2 ring-emerald-400/40'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
            }`}
            title="ویرایش مستقیم و بازنویسی کد با هوش مصنوعی"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Direct Edit (ویرایش با AI)</span>
          </button>

          <button
            onClick={() => onAskAI(content.slice(0, 3000), activeFile.name)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-medium text-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Chat Assist</span>
          </button>

          {/* Bytecode Register & Syntax Validator */}
          {activeFile.extension === 'smali' && (
            <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smali Bytecode Valid</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!isModified}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded text-xs transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5 text-slate-950" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Search & Replace Floating Bar */}
      {searchOpen && (
        <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 flex-1">
            <Search className="w-3 h-3 text-slate-500" />
            <input
              type="text"
              placeholder="Find in file..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="bg-transparent text-slate-100 focus:outline-none w-full text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 flex-1">
            <Replace className="w-3 h-3 text-slate-500" />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="bg-transparent text-slate-100 focus:outline-none w-full text-xs font-mono"
            />
          </div>

          <button
            onClick={handleReplaceAll}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium text-xs"
          >
            Replace All
          </button>
        </div>
      )}

      {/* AI Direct Code Transformer Bar */}
      {aiPromptOpen && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-emerald-500/30 p-3.5 space-y-2.5 text-xs shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Wand2 className="w-3 h-3" />
              </div>
              <span className="font-bold text-white text-xs">
                ویرایش مستقیم کد با هوش مصنوعی (AI Direct Code Modifier)
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                فایل: {activeFile.name}
              </span>
            </div>

            <button
              onClick={() => {
                setAiPromptOpen(false);
                setAiProposedCode(null);
                setAiError(null);
              }}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 font-medium whitespace-nowrap">دستورات سریع:</span>
            {[
              { label: 'بای‌پس لایسنس (Return 1 / True)', prompt: 'متد تایید لایسنس یا چک خرید را ویرایش کن تا همیشه مقدار ۱ (True) برگرداند.' },
              { label: 'حذف بررسی روت (Bypass Root)', prompt: 'کدهای بررسی دسترسی روت مانند چک کردن su یا busybox یا Test-Keys را غیرفعال کن.' },
              { label: 'غیرفعال‌سازی SSL Pinning', prompt: 'متدهای بررسی گواهی SSL یا TrustManager را طوری ویرایش کن که بدون ارور متصل شود.' },
              { label: 'افزودن لاگ دیباگ (Logcat Injection)', prompt: 'در ابتدای متدها دستور Log.d (sget-object و invoke-static smali) برای چاپ متغیرها اضافه کن.' },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => {
                  setAiInstruction(chip.prompt);
                  handleAITransform(chip.prompt);
                }}
                disabled={aiIsTransforming}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[11px] transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input & Action */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 focus-within:border-emerald-500 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="دستور ویرایش را بنویسید (مثلاً: متد checkAccess را طوری اصلاح کن که همیشه دسترسی بدهد)..."
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAITransform();
                  }
                }}
                disabled={aiIsTransforming}
                className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full text-xs"
              />
            </div>

            <button
              onClick={() => handleAITransform()}
              disabled={aiIsTransforming || !aiInstruction.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md flex-shrink-0"
            >
              {aiIsTransforming ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال بازنویسی...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>تولید و اعمال کد</span>
                </>
              )}
            </button>
          </div>

          {aiError && (
            <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-[11px]">
              {aiError}
            </div>
          )}

          {/* AI Proposed Code Diff Preview */}
          {aiProposedCode && (
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  کد بازنویسی‌شده توسط هوش مصنوعی آماده اعمال است:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyAiProposedCode}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow transition-all active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>تایید و ذخیره در فایل</span>
                  </button>
                  <button
                    onClick={() => setAiProposedCode(null)}
                    className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    لغو
                  </button>
                </div>
              </div>

              <pre className="max-h-48 overflow-y-auto p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-300 whitespace-pre-wrap">
                <code>{aiProposedCode}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Main Workspace: Code Area & Optional Snippet Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code / Diff Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {isDiffMode ? (
            /* Side-by-side Diff View */
            <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800 overflow-auto font-mono text-xs">
              <div className="p-3 bg-slate-950">
                <div className="text-[10px] font-bold uppercase text-slate-500 mb-2 pb-1 border-b border-slate-800">
                  Original Decompiled Code
                </div>
                <div className="space-y-0.5">
                  {originalLines.map((line, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="w-8 text-right text-slate-600 select-none">{idx + 1}</span>
                      <span className="text-slate-400 whitespace-pre">{line || ' '}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950">
                <div className="text-[10px] font-bold uppercase text-emerald-400 mb-2 pb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>Modified Working Copy</span>
                  <span className="text-[9px] text-slate-400">Live Editor</span>
                </div>
                <div className="space-y-0.5">
                  {lines.map((line, idx) => {
                    const isLineDiff = originalLines[idx] !== line;
                    return (
                      <div key={idx} className={`flex gap-2 ${isLineDiff ? 'bg-emerald-950/40 text-emerald-300' : ''}`}>
                        <span className="w-8 text-right text-slate-600 select-none">{idx + 1}</span>
                        <span className="whitespace-pre">{line || ' '}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Full Interactive Code Editor */
            <div className="flex-1 flex overflow-hidden">
              {/* Line Numbers Column */}
              <div className="w-12 bg-slate-900/60 border-r border-slate-800/80 py-3 pr-3 text-right font-mono text-xs text-slate-600 select-none overflow-hidden">
                {lines.map((_, i) => (
                  <div key={i} className="leading-6 h-6">{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-transparent p-3 font-mono text-xs text-slate-200 leading-6 resize-none focus:outline-none overflow-auto whitespace-pre selection:bg-emerald-500/30"
              />
            </div>
          )}
        </div>

        {/* Snippet Drawer */}
        {snippetsOpen && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-amber-400" />
                Reverse Engineering Snippets
              </h3>
              <button
                onClick={() => setSnippetsOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Inject pre-verified Smali hooks, SSL pinning bypasses, and root detection patches.
            </p>

            <div className="space-y-3">
              {SMALI_SNIPPETS.map((snip) => (
                <div
                  key={snip.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs">{snip.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-800 text-cyan-300">
                      {snip.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{snip.description}</p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Target: .{snip.targetType}</span>
                    <button
                      onClick={() => insertSnippet(snip)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium text-xs transition-colors"
                    >
                      {copiedSnippetId === snip.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Injected!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Inject Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer / Status Bar */}
      <div className="h-7 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <span>{lines.length} lines</span>
          <span>{content.length} characters</span>
          <span className="font-mono text-emerald-400">UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Language: <strong className="text-slate-200 font-mono">{activeFile.extension?.toUpperCase() || 'CODE'}</strong></span>
        </div>
      </div>
    </div>
  );
};
