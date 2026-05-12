import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { User, Project, FileNode, Tab, AppSettings, ChatMessage } from "@/types";
import { dbSaveProjects, dbLoadProjects, dbSet, dbGet } from "@/lib/db";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai";

const INIT_MESSAGE: ChatMessage = {
  id: 'init-1',
  role: 'assistant',
  content: 'Merhaba! Ben QuantumIDE yapay zeka asistanıyım.\n\nAyarlar bölümünden API anahtarınızı ekleyerek veya Puter hesabınızı bağlayarak AI modellerini kullanabilirsiniz.\n\nNasıl yardımcı olabilirim?',
  timestamp: Date.now()
};

const DEFAULT_SETTINGS: AppSettings = {
  ai: { activeModel: 'gpt-4o', puterConnected: false },
  github: { connected: false, token: '' },
  editorFontSize: 14,
  apiKeys: [],
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
};

interface GlowingFile { [fileId: string]: boolean }

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  puterUser: any;
  setPuterUser: (u: any) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  tabs: Tab[];
  activeTab: Tab | null;
  openFile: (file: FileNode, project: Project) => void;
  closeTab: (fileId: string) => void;
  setActiveTab: (tab: Tab) => void;
  updateFileContent: (fileId: string, projectId: string, content: string) => void;
  saveActiveFile: () => void;
  createFile: (projectId: string, parentId: string | null, name: string, type: 'file' | 'folder') => void;
  deleteFile: (projectId: string, fileId: string) => void;
  renameFile: (projectId: string, fileId: string, newName: string) => void;
  createProject: (name: string, files?: FileNode[]) => Project;
  deleteProject: (projectId: string) => void;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  glowingFiles: GlowingFile;
  setGlowingFile: (fileId: string, value: boolean) => void;
  savedTab: string | null;
  setSavedTab: (id: string | null) => void;
  dbReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dbReady, setDbReady] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [puterUser, setPuterUserState] = useState<any>(null);
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTabState] = useState<Tab | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([INIT_MESSAGE]);
  const [glowingFiles, setGlowingFiles] = useState<GlowingFile>({});
  const [savedTab, setSavedTab] = useState<string | null>(null);

  const projectSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function initDB() {
      try {
        const [savedProjects, savedMessages, savedSettings, savedUser] = await Promise.all([
          dbLoadProjects(),
          dbGet<ChatMessage[]>('messages', [INIT_MESSAGE]),
          dbGet<AppSettings>('settings', DEFAULT_SETTINGS),
          dbGet<User | null>('user', null),
        ]);

        const loadedProjects = (savedProjects as Project[]).length > 0
          ? (savedProjects as Project[])
          : [];

        setProjectsState(loadedProjects);
        setActiveProjectState(loadedProjects[0] || null);
        setMessages(savedMessages.length > 0 ? savedMessages : [INIT_MESSAGE]);

        const merged: AppSettings = {
          ai: {
            activeModel: savedSettings?.ai?.activeModel || 'gpt-4o',
            puterConnected: savedSettings?.ai?.puterConnected || false,
          },
          github: savedSettings?.github || DEFAULT_SETTINGS.github,
          editorFontSize: savedSettings?.editorFontSize || 14,
          apiKeys: savedSettings?.apiKeys || [],
          systemPrompt: savedSettings?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
        };
        setSettingsState(merged);
        setUserState(savedUser);
      } catch (e) {
        console.error('IndexedDB yüklenemedi, localStorage fallback.', e);
        try {
          const sp = JSON.parse(localStorage.getItem('qide_projects') || 'null');
          if (sp) { setProjectsState(sp); setActiveProjectState(sp[0] || null); }
          const ss = JSON.parse(localStorage.getItem('qide_settings') || 'null');
          if (ss) setSettingsState({ ...DEFAULT_SETTINGS, ...ss });
          const su = JSON.parse(localStorage.getItem('qide_user') || 'null');
          if (su) setUserState(su);
        } catch { /* ignore */ }
      } finally {
        setDbReady(true);
      }
    }
    initDB();
  }, []);

  useEffect(() => {
    if (!dbReady) return;
    const checkPuter = async () => {
      const puter = (window as any).puter;
      if (!puter?.auth) return;
      try {
        const isSignedIn = await puter.auth.isSignedIn();
        if (isSignedIn) {
          const info = await puter.auth.getUser();
          setPuterUserState(info);
          setSettingsState(prev => {
            const updated = { ...prev, ai: { ...prev.ai, puterConnected: true } };
            dbSet('settings', updated);
            return updated;
          });
        }
      } catch { /* Puter not ready */ }
    };
    setTimeout(checkPuter, 800);
  }, [dbReady]);

  const debouncedSaveProjects = useCallback((updated: Project[]) => {
    if (projectSaveTimer.current) clearTimeout(projectSaveTimer.current);
    projectSaveTimer.current = setTimeout(() => { dbSaveProjects(updated); }, 400);
  }, []);

  const debouncedSaveMessages = useCallback((updated: ChatMessage[]) => {
    if (messageSaveTimer.current) clearTimeout(messageSaveTimer.current);
    messageSaveTimer.current = setTimeout(() => { dbSet('messages', updated); }, 400);
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    dbSet('user', u);
  }, []);

  const setPuterUser = useCallback((u: any) => { setPuterUserState(u); }, []);

  const setProjects = useCallback((p: Project[]) => {
    setProjectsState(p);
    debouncedSaveProjects(p);
  }, [debouncedSaveProjects]);

  const setActiveProject = useCallback((p: Project | null) => { setActiveProjectState(p); }, []);

  const updateSettings = useCallback((s: AppSettings) => {
    setSettingsState(s);
    dbSet('settings', s);
  }, []);

  const openFile = useCallback((file: FileNode, project: Project) => {
    if (file.type === 'folder') return;
    setActiveProjectState(project);
    const existing = tabs.find(t => t.fileId === file.id);
    if (existing) { setActiveTabState(existing); return; }
    const newTab: Tab = { fileId: file.id, projectId: project.id, name: file.name };
    setTabs(prev => [...prev, newTab]);
    setActiveTabState(newTab);
  }, [tabs]);

  const closeTab = useCallback((fileId: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.fileId !== fileId);
      if (activeTab?.fileId === fileId) setActiveTabState(next[next.length - 1] || null);
      return next;
    });
  }, [activeTab]);

  const setActiveTab = useCallback((tab: Tab) => { setActiveTabState(tab); }, []);

  const updateFileContent = useCallback((fileId: string, projectId: string, content: string) => {
    setProjectsState(prev => {
      const update = (files: FileNode[]): FileNode[] =>
        files.map(f => f.id === fileId ? { ...f, content } : { ...f, children: f.children ? update(f.children) : undefined });
      const updated = prev.map(p => p.id === projectId ? { ...p, files: update(p.files) } : p);
      debouncedSaveProjects(updated);
      return updated;
    });
  }, [debouncedSaveProjects]);

  const saveActiveFile = useCallback(() => {
    if (activeTab) {
      setSavedTab(activeTab.fileId);
      setTimeout(() => setSavedTab(null), 600);
    }
  }, [activeTab]);

  const createFile = useCallback((projectId: string, parentId: string | null, name: string, type: 'file' | 'folder') => {
    const newFile: FileNode = {
      id: `f-${Date.now()}`,
      name, type,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined
    };
    setProjectsState(prev => {
      const addToFiles = (files: FileNode[]): FileNode[] => {
        if (!parentId) return [...files, newFile];
        return files.map(f => {
          if (f.id === parentId) return { ...f, children: [...(f.children || []), newFile] };
          return { ...f, children: f.children ? addToFiles(f.children) : undefined };
        });
      };
      const updated = prev.map(p => p.id === projectId ? { ...p, files: addToFiles(p.files) } : p);
      debouncedSaveProjects(updated);
      return updated;
    });
    setGlowingFiles(prev => ({ ...prev, [newFile.id]: true }));
    setTimeout(() => setGlowingFiles(prev => ({ ...prev, [newFile.id]: false })), 1200);
  }, [debouncedSaveProjects]);

  const deleteFile = useCallback((projectId: string, fileId: string) => {
    setProjectsState(prev => {
      const removeFile = (files: FileNode[]): FileNode[] =>
        files.filter(f => f.id !== fileId).map(f => ({ ...f, children: f.children ? removeFile(f.children) : undefined }));
      const updated = prev.map(p => p.id === projectId ? { ...p, files: removeFile(p.files) } : p);
      debouncedSaveProjects(updated);
      return updated;
    });
    setTabs(prev => prev.filter(t => t.fileId !== fileId));
    if (activeTab?.fileId === fileId) setActiveTabState(null);
  }, [activeTab, debouncedSaveProjects]);

  const renameFile = useCallback((projectId: string, fileId: string, newName: string) => {
    setProjectsState(prev => {
      const rename = (files: FileNode[]): FileNode[] =>
        files.map(f => f.id === fileId ? { ...f, name: newName } : { ...f, children: f.children ? rename(f.children) : undefined });
      const updated = prev.map(p => p.id === projectId ? { ...p, files: rename(p.files) } : p);
      debouncedSaveProjects(updated);
      return updated;
    });
    setTabs(prev => prev.map(t => t.fileId === fileId ? { ...t, name: newName } : t));
  }, [debouncedSaveProjects]);

  const createProject = useCallback((name: string, files: FileNode[] = []): Project => {
    const ts = Date.now();
    const newProject: Project = { id: `proj-${ts}`, name, files };
    setProjectsState(prev => {
      const updated = [...prev, newProject];
      debouncedSaveProjects(updated);
      return updated;
    });
    setActiveProjectState(newProject);
    return newProject;
  }, [debouncedSaveProjects]);

  const deleteProject = useCallback((projectId: string) => {
    setProjectsState(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      debouncedSaveProjects(updated);
      if (activeProject?.id === projectId) {
        setActiveProjectState(updated[0] || null);
      }
      return updated;
    });
    setTabs(prev => prev.filter(t => t.projectId !== projectId));
  }, [activeProject, debouncedSaveProjects]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => {
      const updated = [...prev, msg];
      debouncedSaveMessages(updated);
      return updated;
    });
  }, [debouncedSaveMessages]);

  const clearMessages = useCallback(() => {
    const reset = [INIT_MESSAGE];
    setMessages(reset);
    dbSet('messages', reset);
  }, []);

  const setGlowingFile = useCallback((fileId: string, value: boolean) => {
    setGlowingFiles(prev => ({ ...prev, [fileId]: value }));
  }, []);

  useEffect(() => {
    if (dbReady && projects.length > 0 && !activeProject) {
      setActiveProjectState(projects[0]);
    }
  }, [projects, activeProject, dbReady]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      puterUser, setPuterUser,
      projects, setProjects,
      activeProject, setActiveProject,
      tabs, activeTab, openFile, closeTab, setActiveTab,
      updateFileContent, saveActiveFile,
      createFile, deleteFile, renameFile, createProject, deleteProject,
      settings, updateSettings,
      messages, addMessage, clearMessages,
      glowingFiles, setGlowingFile,
      savedTab, setSavedTab,
      dbReady,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
