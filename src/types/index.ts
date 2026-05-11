export interface User {
  id: string;
  name: string;
  email: string;
  puterUsername?: string;
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

export interface GitHubSettings {
  connected: boolean;
  token: string;
  username?: string;
}

export interface AppSettings {
  ai: AISettings;
  github: GitHubSettings;
  editorFontSize: number;
}
