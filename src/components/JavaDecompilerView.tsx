import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  Copy, 
  Check, 
  FileCode2, 
  RefreshCw, 
  Layers, 
  Cpu,
  Coffee
} from 'lucide-react';
import { FileItem, Project } from '../types';
import { AIService } from '../services/aiService';

interface JavaDecompilerViewProps {
  activeFile: FileItem | null;
  project: Project | null;
  onAskAI: (snippet: string, name: string) => void;
}

export const JavaDecompilerView: React.FC<JavaDecompilerViewProps> = ({
  activeFile,
  project,
  onAskAI,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDecompiling, setIsDecompiling] = useState(false);
  const [javaCode, setJavaCode] = useState<string>('');

  // Generate pseudo-Java decompilation from Smali or trigger AI Decompiler
  const generateJavaFromSmali = (smali: string): string => {
    if (!smali) return '// No Smali file loaded.';
    
    // Convert common Smali structures to readable Java
    const lines = smali.split('\n');
    let javaOutput = `package ${project?.packageName || 'com.example'};\n\n`;
    javaOutput += `import android.content.Context;\nimport android.content.SharedPreferences;\nimport android.util.Log;\nimport java.security.MessageDigest;\nimport javax.crypto.Cipher;\n\n`;

    let inMethod = false;
    let currentMethodName = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('.class')) {
        const className = trimmed.split(' ').pop()?.replace(/;/g, '').split('/').pop() || 'DecompiledClass';
        javaOutput += `/**\n * Decompiled by APKForge Java Engine (JADX-AI Standard)\n * Source Smali: ${activeFile?.path || 'bytecode'}\n */\npublic class ${className} {\n`;
      } else if (trimmed.startsWith('.field')) {
        const parts = trimmed.split(' ');
        const fieldName = parts[parts.length - 1].split(':')[0];
        const fieldType = parts[parts.length - 1].split(':')[1] || 'Object';
        javaOutput += `    private ${mapSmaliTypeToJava(fieldType)} ${fieldName};\n`;
      } else if (trimmed.startsWith('.method')) {
        inMethod = true;
        const methodSig = trimmed.replace('.method', '').trim();
        javaOutput += `\n    // Method descriptor: ${methodSig}\n    public void ${extractMethodName(methodSig)}() {\n`;
      } else if (trimmed.startsWith('.end method')) {
        inMethod = false;
        javaOutput += `    }\n`;
      } else if (inMethod && trimmed.startsWith('const-string')) {
        const match = trimmed.match(/"([^"]+)"/);
        if (match) {
          javaOutput += `        String constVal = "${match[1]}";\n`;
        }
      } else if (inMethod && trimmed.startsWith('invoke-')) {
        javaOutput += `        // Bytecode invocation: ${trimmed}\n`;
      } else if (inMethod && trimmed.startsWith('return-void')) {
        javaOutput += `        return;\n`;
      }
    }

    javaOutput += `}\n`;
    return javaOutput;
  };

  const mapSmaliTypeToJava = (t: string) => {
    if (!t) return 'Object';
    if (t === 'Z') return 'boolean';
    if (t === 'I') return 'int';
    if (t === 'J') return 'long';
    if (t === 'F') return 'float';
    if (t === 'D') return 'double';
    if (t === 'Ljava/lang/String;') return 'String';
    return t.replace(/^L/, '').replace(/;/g, '').replace(/\//g, '.');
  };

  const extractMethodName = (sig: string) => {
    const withoutAccess = sig.replace(/(public|private|protected|static|final|native|synchronized)/g, '').trim();
    return withoutAccess.split('(')[0] || 'executeMethod';
  };

  const handleAiDecompile = async () => {
    if (!activeFile?.content) return;
    setIsDecompiling(true);
    try {
      const response = await AIService.sendMessage({
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            text: `Convert this exact Dalvik Smali bytecode into clean, idiomatic Java/Kotlin source code:\n\n\`\`\`smali\n${activeFile.content.slice(0, 3500)}\n\`\`\``,
          },
        ],
        systemInstruction: 'You are an expert JADX-style Java decompiler. Output only clean, syntactically correct Java/Kotlin code with clear comments.',
      });
      setJavaCode(response);
    } catch (err: any) {
      alert(`Decompilation error: ${err.message}`);
    } finally {
      setIsDecompiling(false);
    }
  };

  const currentDisplayCode = javaCode || (activeFile?.content ? generateJavaFromSmali(activeFile.content) : '// Select a Smali file to view Java representation.');
  const lines = currentDisplayCode.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Banner */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-white">Java / Kotlin High-Level Decompiler</span>
            <span className="text-[11px] text-slate-400 ml-2 font-mono">
              ({activeFile?.name || 'No file selected'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAiDecompile}
            disabled={isDecompiling || !activeFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDecompiling ? 'Decompiling with AI...' : 'Full AI Decompile to Java'}</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(currentDisplayCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Java'}</span>
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 flex overflow-auto font-mono text-xs text-slate-200">
        <div className="w-12 bg-slate-900/40 border-r border-slate-800/80 py-3 pr-3 text-right text-slate-600 select-none flex-shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-6 h-6">{i + 1}</div>
          ))}
        </div>

        <pre className="p-3 leading-6 overflow-x-auto whitespace-pre flex-1 text-slate-300 select-text">
          <code>{currentDisplayCode}</code>
        </pre>
      </div>
    </div>
  );
};
