import { AIModelId, AIProviderType, ChatMessage } from '../types';

export interface AIServiceRequest {
  provider: AIProviderType;
  model: AIModelId;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; text: string }>;
  customApiKey?: string;
  systemInstruction?: string;
  image?: {
    data: string;
    mimeType: string;
  };
  images?: Array<{
    data: string;
    mimeType: string;
    name?: string;
  }>;
  fileAttachments?: Array<{
    name: string;
    content: string;
    size?: number;
  }>;
}

export class AIService {
  static async sendMessage(request: AIServiceRequest): Promise<string> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Server error: ${res.status}` }));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      return data.reply || 'No response returned from AI provider.';
    } catch (err: any) {
      console.error('AIService Error:', err);
      throw err;
    }
  }

  static getSystemPromptForRole(role: 'general' | 'smali_patch' | 'security_audit' | 'error_fix'): string {
    switch (role) {
      case 'smali_patch':
        return `You are APKForge AI, an expert Android reverse engineer and Smali bytecode architect.
Your goal is to provide exact, production-grade Smali patches with correct register counts (.registers or .locals), accurate opcode syntax (e.g. const/4, invoke-static, sget-object), and branch labels. Always explain what registers are modified.`;
      case 'security_audit':
        return `You are APKForge AI Security Auditor. You specialize in OWASP Mobile Top 10, Android Keystore security, AndroidManifest vulnerabilities, exported components, and cryptographic pitfalls. Provide precise remediation steps and Smali/XML code diffs.`;
      case 'error_fix':
        return `You are an Android Build & Smali Assembly specialist. Analyze bytecode errors, missing method signatures, DEX index overflow, or AAPT2 resource linking issues and provide verified fixes.`;
      default:
        return `You are APKForge AI, a senior Android architect and reverse-engineering assistant. You assist with Smali, DEX bytecode, AndroidManifest, Gradle builds, Jetpack Compose, and Android Security.`;
    }
  }
}
