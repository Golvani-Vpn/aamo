import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Image as ImageIcon, 
  Paperclip,
  FileCode, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  FileCode2, 
  UploadCloud,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AIModelId, AIProviderType, ChatMessage, FileItem, Project } from '../types';
import { AIService } from '../services/aiService';

interface ChatViewProps {
  activeProject: Project | null;
  activeFile: FileItem | null;
  aiProvider: AIProviderType;
  setAiProvider: (p: AIProviderType) => void;
  aiModel: AIModelId;
  setAiModel: (m: AIModelId) => void;
  onApplyCodeToEditor?: (code: string) => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

interface AttachedImage {
  id: string;
  name: string;
  data: string; // Base64
  mimeType: string;
  preview: string;
}

interface AttachedFile {
  id: string;
  name: string;
  content: string;
  size: number;
  extension: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  activeProject,
  activeFile,
  aiProvider,
  setAiProvider,
  aiModel,
  setAiModel,
  onApplyCodeToEditor,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **APKForge AI**, your dedicated Android architect and reverse engineering assistant.

I can help you:
- **Decompile & Analyze APK architecture** (Manifest permissions, components, DEX bytecode)
- **Explain and write Smali bytecode** (Registers, opcodes, method hooks)
- **Audit Security & Vulnerabilities** (OWASP Mobile, Insecure Exported Components, Cleartext HTTP)
- **Generate Smali Hooks & Bypasses** (Root detection bypass, SSL pinning, dynamic logging)
- **Troubleshoot Build Failures** (AAPT2 resource issues, DEX index overflow, signing errors)

You can attach **images/screenshots** or upload **code files (.smali, .xml, .java, .txt, .log, etc.)** directly using the buttons below or by dragging and dropping them into this chat!`,
      timestamp: new Date().toLocaleTimeString(),
      modelUsed: 'gemini-2.5-flash',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      setInputPrompt(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const processFileList = async (files: FileList | File[]) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const resultStr = event.target?.result as string;
          const base64Data = resultStr.split(',')[1];
          setAttachedImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random()}`,
              name: file.name,
              data: base64Data,
              mimeType: file.type || 'image/png',
              preview: URL.createObjectURL(file),
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        // Text / Code file
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${Math.random()}`,
              name: file.name,
              content: content || '',
              size: file.size,
              extension: ext,
            },
          ]);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFileList(e.dataTransfer.files);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() && attachedImages.length === 0 && attachedFiles.length === 0) return;

    const messageAttachments = [
      ...attachedImages.map((img) => ({
        name: img.name,
        type: 'image' as const,
        url: img.preview,
      })),
      ...attachedFiles.map((f) => ({
        name: f.name,
        type: 'file' as const,
        size: `${(f.size / 1024).toFixed(1)} KB`,
        previewText: f.content.slice(0, 100),
      })),
    ];

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend || (messageAttachments.length > 0 ? `[Attached ${messageAttachments.length} file(s)]` : ''),
      timestamp: new Date().toLocaleTimeString(),
      imageUri: attachedImages[0]?.preview,
      attachments: messageAttachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');

    const currentImages = [...attachedImages];
    const currentFiles = [...attachedFiles];
    setAttachedImages([]);
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      // Build contextual system prompt
      let contextHeader = `Project: ${activeProject?.name || 'Unknown APK'} (${activeProject?.packageName || 'com.example'})\n`;
      if (activeFile && activeFile.content) {
        contextHeader += `Currently Active File: ${activeFile.path}\nFile Content:\n\`\`\`${activeFile.extension || 'smali'}\n${activeFile.content.slice(0, 3500)}\n\`\`\`\n`;
      }

      const systemPrompt = AIService.getSystemPromptForRole('general') + '\n\n' + contextHeader;

      const aiReply = await AIService.sendMessage({
        provider: aiProvider,
        model: aiModel,
        messages: messages.concat(userMessage).map((m) => ({
          role: m.role,
          text: m.content,
        })),
        systemInstruction: systemPrompt,
        images: currentImages.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
          name: img.name,
        })),
        fileAttachments: currentFiles.map((f) => ({
          name: f.name,
          content: f.content,
          size: f.size,
        })),
      });

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString(),
        modelUsed: aiModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `**Error:** Failed to communicate with ${aiProvider} (${aiModel}): ${err.message}\n\nPlease verify your API key in **Settings**.`,
          timestamp: new Date().toLocaleTimeString(),
          modelUsed: aiModel,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Analyze APK', prompt: 'Please provide a comprehensive architectural and security analysis of this decompiled APK project.' },
    { label: 'Explain Code', prompt: `Please explain the registers, logic flow, and execution path of the active file (${activeFile?.name || 'smali class'}).` },
    { label: 'Find Errors', prompt: 'Audit this code for Smali register mismatch, missing class descriptors, DEX overflow, or security vulnerabilities.' },
    { label: 'Generate Patch', prompt: 'Generate a clean Smali patch or hook to modify the method behavior safely.' },
    { label: 'Review Changes', prompt: 'Review my modifications and verify if the bytecode will compile with standard smali/aapt2.' },
  ];

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative"
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-emerald-950/80 backdrop-blur-sm border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <UploadCloud className="w-16 h-16 text-emerald-400 animate-bounce" />
          <p className="text-base font-bold text-white">عکس، اسکرین‌شات یا فایل‌های کد را اینجا رها کنید</p>
          <p className="text-xs text-emerald-300 font-mono">Drop Smali, Java, XML, or Image files to attach</p>
        </div>
      )}

      {/* Chat Header Bar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-200">AI Reverse Engineer</span>
            <span className="text-[11px] text-slate-400 ml-2 font-mono">
              Model: <strong className="text-emerald-400">{aiModel}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                {/* Attachments preview */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mb-2.5 flex flex-wrap gap-2">
                    {msg.attachments.map((att, attIdx) => (
                      <div
                        key={attIdx}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] ${
                          isUser
                            ? 'bg-emerald-700/60 border-emerald-400/40 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        {att.type === 'image' && att.url ? (
                          <img src={att.url} alt={att.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <FileCode className="w-4 h-4 text-emerald-300" />
                        )}
                        <div className="font-mono text-[10px] truncate max-w-[140px]">
                          <div className="truncate font-semibold">{att.name}</div>
                          {att.size && <div className="text-[9px] opacity-75">{att.size}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legacy Image preview if any */}
                {!msg.attachments && msg.imageUri && (
                  <div className="mb-2">
                    <img
                      src={msg.imageUri}
                      alt="Uploaded screenshot"
                      className="max-h-48 rounded-lg border border-slate-700 object-contain"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-invert prose-xs max-w-none break-words">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        if (!inline) {
                          return (
                            <div className="my-2 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden font-mono text-[11px]">
                              <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-800 text-slate-400 text-[10px]">
                                <span className="font-semibold uppercase text-emerald-400">
                                  {match ? match[1] : 'code'}
                                </span>
                                <div className="flex items-center gap-2">
                                  {onApplyCodeToEditor && (
                                    <button
                                      onClick={() => onApplyCodeToEditor(codeString)}
                                      className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                                      title="Apply to active editor file"
                                    >
                                      <FileCode2 className="w-3 h-3 text-emerald-400" />
                                      <span>Apply to Editor</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(codeString);
                                      setCopiedBlockId(codeString.slice(0, 15));
                                      setTimeout(() => setCopiedBlockId(null), 2000);
                                    }}
                                    className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                                  >
                                    {copiedBlockId === codeString.slice(0, 15) ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span>Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <pre className="p-3 overflow-x-auto text-slate-200 leading-5">
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        }
                        return (
                          <code className="px-1 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[11px]" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && <span className="font-mono text-emerald-400">{msg.modelUsed}</span>}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold flex-shrink-0 mt-1">
                  U
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Analyzing Smali bytecode &amp; processing attached files...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto select-none">
        {quickActions.map((qa, i) => (
          <button
            key={i}
            onClick={() => handleSend(qa.prompt)}
            disabled={isLoading}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-emerald-300 font-medium transition-all active:scale-95"
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* Input Area with Attached Files & Images */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
        {/* Pending Attached Images & Files Bar */}
        {(attachedImages.length > 0 || attachedFiles.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 max-h-32 overflow-y-auto">
            {attachedImages.map((img) => (
              <div key={img.id} className="relative group flex items-center gap-2 p-1.5 bg-slate-900 rounded-lg border border-emerald-500/30">
                <img src={img.preview} alt={img.name} className="w-8 h-8 object-cover rounded" />
                <span className="text-[11px] text-slate-300 font-mono max-w-[100px] truncate">{img.name}</span>
                <button
                  onClick={() => setAttachedImages((prev) => prev.filter((i) => i.id !== img.id))}
                  className="p-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {attachedFiles.map((file) => (
              <div key={file.id} className="relative group flex items-center gap-2 p-1.5 bg-slate-900 rounded-lg border border-cyan-500/30">
                <FileCode className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div className="text-[11px] font-mono text-slate-300 max-w-[120px] truncate">
                  <div className="truncate font-semibold">{file.name}</div>
                  <div className="text-[9px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  onClick={() => setAttachedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                  className="p-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attach Image Button */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 transition-colors flex items-center gap-1 text-xs"
            title="پیوست عکس و اسکرین‌شات (Attach Image/Screenshot)"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && processFileList(e.target.files)}
            className="hidden"
          />

          {/* Attach Document/Code File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-colors flex items-center gap-1 text-xs"
            title="پیوست فایل کد، اسمانی، مانیفست یا متن (Attach Code/Smali/XML File)"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".smali,.xml,.java,.kt,.txt,.json,.log,.gradle,.c,.cpp,.h,.js,.py,.dex,.so"
            multiple
            onChange={(e) => e.target.files && processFileList(e.target.files)}
            className="hidden"
          />

          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="پیام یا سوال خود را بنویسید (می‌توانید عکس یا فایل کد را هم رها یا پیوست کنید)..."
            rows={2}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none font-sans placeholder-slate-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!inputPrompt.trim() && attachedImages.length === 0 && attachedFiles.length === 0)}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-950/40 active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
