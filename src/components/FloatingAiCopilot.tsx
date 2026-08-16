import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  X, 
  Copy, 
  Check, 
  FileCode2, 
  MessageSquareCode,
  Paperclip,
  Image as ImageIcon,
  FileCode,
  UploadCloud
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AIModelId, AIProviderType, ChatMessage, FileItem, Project } from '../types';
import { AIService } from '../services/aiService';

interface FloatingAiCopilotProps {
  activeProject: Project | null;
  activeFile: FileItem | null;
  aiProvider: AIProviderType;
  setAiProvider: (p: AIProviderType) => void;
  aiModel: AIModelId;
  setAiModel: (m: AIModelId) => void;
  onApplyCodeToEditor?: (code: string) => void;
  onOpenFullChat: () => void;
}

interface AttachedImage {
  id: string;
  name: string;
  data: string;
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

export const FloatingAiCopilot: React.FC<FloatingAiCopilotProps> = ({
  activeProject,
  activeFile,
  aiProvider,
  setAiProvider,
  aiModel,
  setAiModel,
  onApplyCodeToEditor,
  onOpenFullChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'floating-init',
      role: 'assistant',
      content: 'سلام! من دستیار هوش مصنوعی **APKForge Copilot** هستم. می‌توانید سوالات، کدهای Smali، عکس‌ها و اسکرین‌شات‌ها، یا فایل‌های خود را پیوست و ارسال کنید!',
      timestamp: new Date().toLocaleTimeString(),
      modelUsed: 'gemini-2.5-flash',
    },
  ]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

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
              id: `copilot-img-${Date.now()}-${Math.random()}`,
              name: file.name,
              data: base64Data,
              mimeType: file.type || 'image/png',
              preview: URL.createObjectURL(file),
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: `copilot-file-${Date.now()}-${Math.random()}`,
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
    if ((!textToSend.trim() && attachedImages.length === 0 && attachedFiles.length === 0) || isLoading) return;

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
      id: `copilot-usr-${Date.now()}`,
      role: 'user',
      content: textToSend || (messageAttachments.length > 0 ? `[پیوست ${messageAttachments.length} فایل/تصویر]` : ''),
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
      let contextHeader = `Project: ${activeProject?.name || 'Decompiled APK'} (${activeProject?.packageName || 'com.example'})\n`;
      if (activeFile && activeFile.content) {
        contextHeader += `Current File: ${activeFile.path}\nContent:\n\`\`\`${activeFile.extension || 'smali'}\n${activeFile.content.slice(0, 3000)}\n\`\`\`\n`;
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

      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-ast-${Date.now()}`,
          role: 'assistant',
          content: aiReply,
          timestamp: new Date().toLocaleTimeString(),
          modelUsed: aiModel,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-err-${Date.now()}`,
          role: 'assistant',
          content: `خطا در ارتباط با ${aiProvider}: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
          modelUsed: aiModel,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-full shadow-2xl shadow-emerald-950/60 border border-emerald-300/40 transition-all hover:scale-105 active:scale-95 group select-none"
        >
          <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
          </div>
          <span className="text-xs tracking-wide">گفتگو با هوش مصنوعی (AI Copilot)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-950 animate-ping" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 relative ${
            isMinimized ? 'w-80 h-14' : 'w-96 sm:w-[460px] h-[580px]'
          }`}
        >
          {/* Drag & Drop Overlay */}
          {isDragging && !isMinimized && (
            <div className="absolute inset-0 z-50 bg-emerald-950/85 backdrop-blur-sm border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center space-y-2 pointer-events-none p-4 text-center">
              <UploadCloud className="w-12 h-12 text-emerald-400 animate-bounce" />
              <p className="text-sm font-bold text-white">فایل یا تصویر را رها کنید</p>
              <p className="text-[11px] text-emerald-300 font-mono">Drop code or image files here</p>
            </div>
          )}

          {/* Header */}
          <div className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">APKForge AI Copilot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {aiModel} • {activeFile ? activeFile.name : 'Decompiled APK'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'بزرگ‌نمایی' : 'کوچک‌نمایی'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullChat();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                title="رفتن به صفحه کامل چت"
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="بستن"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-950/60 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-emerald-600 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-1.5'
                        }`}
                      >
                        {/* Attachments preview */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {msg.attachments.map((att, attIdx) => (
                              <div
                                key={attIdx}
                                className={`flex items-center gap-1.5 p-1 rounded-md border text-[10px] ${
                                  isUser
                                    ? 'bg-emerald-700/70 border-emerald-400/40 text-white'
                                    : 'bg-slate-950 border-slate-800 text-slate-300'
                                }`}
                              >
                                {att.type === 'image' && att.url ? (
                                  <img src={att.url} alt={att.name} className="w-8 h-8 object-cover rounded" />
                                ) : (
                                  <FileCode className="w-3.5 h-3.5 text-cyan-300" />
                                )}
                                <span className="font-mono truncate max-w-[100px]">{att.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="prose prose-invert prose-xs max-w-none break-words">
                          <ReactMarkdown
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const codeStr = String(children).replace(/\n$/, '');
                                if (!inline) {
                                  return (
                                    <div className="my-1.5 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden font-mono text-[10px]">
                                      <div className="bg-slate-900/90 px-2 py-1 flex items-center justify-between border-b border-slate-800 text-slate-400">
                                        <span className="uppercase text-emerald-400 font-semibold">کد پچ</span>
                                        <div className="flex items-center gap-1.5">
                                          {onApplyCodeToEditor && (
                                            <button
                                              onClick={() => onApplyCodeToEditor(codeStr)}
                                              className="text-[10px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                                            >
                                              <FileCode2 className="w-2.5 h-2.5" />
                                              <span>اعمال در ادیتور</span>
                                            </button>
                                          )}
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(codeStr);
                                              setCopiedCodeId(codeStr.slice(0, 10));
                                              setTimeout(() => setCopiedCodeId(null), 2000);
                                            }}
                                            className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                                          >
                                            {copiedCodeId === codeStr.slice(0, 10) ? (
                                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                                            ) : (
                                              <Copy className="w-2.5 h-2.5" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                      <pre className="p-2 overflow-x-auto text-slate-200 leading-4">
                                        <code>{children}</code>
                                      </pre>
                                    </div>
                                  );
                                }
                                return (
                                  <code className="px-1 py-0.2 rounded bg-slate-800 text-emerald-300 font-mono text-[10px]" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        <div className="text-[9px] text-slate-500 text-left pt-0.5">{msg.timestamp}</div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    <span>در حال تحلیل و تولید پاسخ با {aiModel}...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1 overflow-x-auto select-none">
                <button
                  onClick={() => handleSend('لطفاً ساختار و آسیب‌پذیری‌های فایل فعال را تحلیل کن.')}
                  className="flex-shrink-0 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                >
                  تحلیل فایل جاری
                </button>
                <button
                  onClick={() => handleSend('یک هوک برای غیرفعال کردن بررسی Root در این متد بساز.')}
                  className="flex-shrink-0 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                >
                  بای‌پس Root
                </button>
                <button
                  onClick={() => handleSend('چطور SSL Pinning این اپلیکیشن را پچ کنم؟')}
                  className="flex-shrink-0 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                >
                  بای‌پس SSL
                </button>
              </div>

              {/* Input Bar with Attachment Previews */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-800 space-y-2">
                {/* Pending attachments preview */}
                {(attachedImages.length > 0 || attachedFiles.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 rounded-lg border border-slate-800 max-h-24 overflow-y-auto">
                    {attachedImages.map((img) => (
                      <div key={img.id} className="flex items-center gap-1.5 p-1 bg-slate-950 rounded border border-emerald-500/30">
                        <img src={img.preview} alt={img.name} className="w-6 h-6 object-cover rounded" />
                        <span className="text-[10px] text-slate-300 font-mono max-w-[80px] truncate">{img.name}</span>
                        <button
                          onClick={() => setAttachedImages((prev) => prev.filter((i) => i.id !== img.id))}
                          className="text-rose-400 hover:text-rose-200"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    {attachedFiles.map((f) => (
                      <div key={f.id} className="flex items-center gap-1.5 p-1 bg-slate-950 rounded border border-cyan-500/30">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-slate-300 font-mono max-w-[80px] truncate">{f.name}</span>
                        <button
                          onClick={() => setAttachedFiles((prev) => prev.filter((i) => i.id !== f.id))}
                          className="text-rose-400 hover:text-rose-200"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {/* Attach Image */}
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800 transition-colors"
                    title="پیوست تصویر یا اسکرین‌شات"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && processFileList(e.target.files)}
                    className="hidden"
                  />

                  {/* Attach File */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                    title="پیوست فایل کد، اسمانی یا متن"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".smali,.xml,.java,.kt,.txt,.json,.log,.gradle,.c,.cpp,.h,.js,.py,.dex,.so"
                    multiple
                    onChange={(e) => e.target.files && processFileList(e.target.files)}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || (!inputPrompt.trim() && attachedImages.length === 0 && attachedFiles.length === 0)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl transition-all active:scale-95 shadow-md flex-shrink-0"
                    title="ارسال پیام"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
