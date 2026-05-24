export interface User {
  id: string;
  name: string;
  email: string;
  puterUsername?: string;
  supabaseId?: string;
  emailVerified?: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

export interface Project {
  id: string;
  name: string;
  files: FileNode[];
  githubRepo?: string;
}

export interface Tab {
  fileId: string;
  projectId: string;
  name: string;
  glowing?: boolean;
}

export type AIModel = string;

export interface PuterAIModel {
  id: string;
  label: string;
  provider: string;
  color: string;
}

export type ApiProvider = 'anthropic' | 'google' | 'openai' | 'perplexity' | 'vercel' | 'mistral' | 'deepseek';

export interface ApiKeyEntry {
  id: string;
  provider: ApiProvider;
  key: string;
  label?: string;
  addedAt: number;
  valid?: boolean | null;
}

export interface AISettings {
  activeModel: string;
  puterConnected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isTyping?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface GitHubSettings {
  connected: boolean;
  token: string;
  username?: string;
}

export interface AppSettings {
  ai: AISettings;
  github: GitHubSettings;
  editorFontSize: number;
  apiKeys: ApiKeyEntry[];
  systemPrompt: string;
  activeKeyId: string | null;
}
