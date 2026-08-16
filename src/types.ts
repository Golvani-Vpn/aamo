export type TabType = 
  | 'dashboard'
  | 'projects'
  | 'explorer'
  | 'editor'
  | 'javaview'
  | 'chat'
  | 'search'
  | 'frida'
  | 'graph'
  | 'deobfuscator'
  | 'secrethunter'
  | 'networkapi'
  | 'splitmerger'
  | 'adb'
  | 'hexeditor'
  | 'manifestdesigner'
  | 'diffpatch'
  | 'nativeanalyzer'
  | 'builder'
  | 'security'
  | 'repository'
  | 'settings';

export type AIProviderType = 'gemini' | 'deepseek';

export type AIModelId = 
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'deepseek-chat'
  | 'deepseek-reasoner';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  originalContent?: string;
  isModified?: boolean;
  size?: number;
  extension?: string;
  children?: FileItem[];
}

export interface Project {
  id: string;
  name: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  fileCount: number;
  smaliClassCount: number;
  sizeBytes: number;
  lastModified: string;
  createdDate: string;
  isBackupAvailable: boolean;
  files: FileItem[];
  vulnerabilitiesCount?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  imageUri?: string;
  attachments?: Array<{
    name: string;
    type: 'image' | 'file';
    url?: string;
    size?: string;
    previewText?: string;
  }>;
  codeBlocks?: Array<{
    language: string;
    code: string;
    fileName?: string;
  }>;
}

export interface BuildLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface BuildPipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  logs: string[];
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: 'MANIFEST' | 'SMALI' | 'PERMISSIONS' | 'CRYPTOGRAPHY' | 'NETWORK';
  description: string;
  location: string;
  affectedCode?: string;
  remediation: string;
  suggestedPatch?: string;
}

export interface KeystoreConfig {
  alias: string;
  password: string;
  keyPassword: string;
  validityYears: number;
  algorithm: 'RSA-2048' | 'RSA-4096' | 'EC-256';
  signatureScheme: {
    v1: boolean;
    v2: boolean;
    v3: boolean;
  };
  organizationName: string;
  countryCode: string;
}

export interface Snippet {
  id: string;
  title: string;
  description: string;
  category: 'smali' | 'xml' | 'hook' | 'bypass';
  targetType: 'smali' | 'xml' | 'manifest';
  code: string;
}

export interface AndroidRepositoryFile {
  path: string;
  content: string;
  language: 'kotlin' | 'groovy' | 'xml' | 'yaml' | 'markdown' | 'properties';
  description: string;
}
