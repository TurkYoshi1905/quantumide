// @refresh reset
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { User, Project, FileNode, Tab, AppSettings, ChatMessage, Conversation } from "@/types";
import { dbSaveProjects, dbLoadProjects, dbSet, dbGet } from "@/lib/db";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai";
import {
  getSupabase, supabaseGetSession, supabaseSaveProjects,
  supabaseLoadAllData, supabaseSaveConversations, supabaseSaveSettings,
} from "@/lib/supabase";

const makeInitConversation = (): Conversation => ({
  id: `conv-${Date.now()}`,
  title: 'Yeni Sohbet',
  messages: [{
    id: 'init-1',
    role: 'assistant',
    content: 'Merhaba! Ben QuantumIDE yapay zeka asistanıyım.\n\nAyarlar bölümünden API anahtarınızı ekleyerek veya Puter hesabınızı bağlayarak AI modellerini kullanabilirsiniz.\n\nNasıl yardımcı olabilirim?',
    timestamp: Date.now()
  }],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const DEFAULT_SETTINGS: AppSettings = {
  ai: { activeModel: 'gpt-4o', puterConnected: false },
  github: { connected: false, token: '' },
  editorFontSize: 14,
  apiKeys: [],
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  activeKeyId: null,
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
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  createConversation: () => Conversation;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (msgId: string, updates: Partial<ChatMessage>) => void;
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
  const [conversations, setConversationsState] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string>('');
  const [glowingFiles, setGlowingFiles] = useState<GlowingFile>({});
  const [savedTab, setSavedTab] = useState<string | null>(null);

  const projectSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabaseUserId = useRef<string | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0] || null;
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    async function initDB() {
      try {
        const [savedProjects, savedMessages, savedSettings, savedUser] = await Promise.all([
          dbLoadProjects(),
          dbGet<ChatMessage[]>('messages', []),
          dbGet<AppSettings>('settings', DEFAULT_SETTINGS),
          dbGet<User | null>('user', null),
        ]);

        const savedConvs = await dbGet<Conversation[]>('conversations', []);

        const loadedProjects = (savedProjects as Project[]).length > 0
          ? (savedProjects as Project[])
          : [];

        setProjectsState(loadedProjects);
        setActiveProjectState(loadedProjects[0] || null);

        const merged: AppSettings = {
          ai: {
            activeModel: savedSettings?.ai?.activeModel || 'gpt-4o',
            puterConnected: savedSettings?.ai?.puterConnected || false,
          },
          github: savedSettings?.github || DEFAULT_SETTINGS.github,
          editorFontSize: savedSettings?.editorFontSize || 14,
          apiKeys: savedSettings?.apiKeys || [],
          systemPrompt: savedSettings?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
          activeKeyId: savedSettings?.activeKeyId ?? null,
        };
        setSettingsState(merged);
        setUserState(savedUser);

        let convs: Conversation[] = Array.isArray(savedConvs) && savedConvs.length > 0
          ? savedConvs
          : [];

        // Migrate old flat messages to first conversation
        if (convs.length === 0) {
          const initConv = makeInitConversation();
          if ((savedMessages as ChatMessage[]).length > 0) {
            initConv.messages = savedMessages as ChatMessage[];
            initConv.title = 'Sohbet 1';
          }
          convs = [initConv];
        }

        setConversationsState(convs);
        setActiveConversationIdState(convs[0].id);

        // Try Supabase load if session exists
        const session = await supabaseGetSession();
        if (session?.user) {
          supabaseUserId.current = session.user.id;
          const cloudData = await supabaseLoadAllData(session.user.id);
          if (cloudData) {
            if (cloudData.projects?.length > 0) {
              setProjectsState(cloudData.projects);
              setActiveProjectState(cloudData.projects[0]);
            }
            if (cloudData.conversations?.length > 0) {
              setConversationsState(cloudData.conversations);
              setActiveConversationIdState(cloudData.conversations[0].id);
            }
            if (cloudData.settings) {
              const cs: AppSettings = {
                ai: cloudData.settings.ai || merged.ai,
                github: cloudData.settings.github || merged.github,
                editorFontSize: cloudData.settings.editorFontSize || 14,
                apiKeys: cloudData.settings.apiKeys || [],
                systemPrompt: cloudData.settings.systemPrompt || DEFAULT_SYSTEM_PROMPT,
                activeKeyId: cloudData.settings.activeKeyId ?? null,
              };
              setSettingsState(cs);
            }
          }
        }
      } catch (e) {
        console.error('DB yüklenemedi, localStorage fallback.', e);
        try {
          const sp = JSON.parse(localStorage.getItem('qide_projects') || 'null');
          if (sp) { setProjectsState(sp); setActiveProjectState(sp[0] || null); }
          const ss = JSON.parse(localStorage.getItem('qide_settings') || 'null');
          if (ss) setSettingsState({ ...DEFAULT_SETTINGS, ...ss });
          const su = JSON.parse(localStorage.getItem('qide_user') || 'null');
          if (su) setUserState(su);
        } catch { /* ignore */ }
        const initConv = makeInitConversation();
        setConversationsState([initConv]);
        setActiveConversationIdState(initConv.id);
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

  // Keep activeProject in sync with projects state (real-time file updates)
  useEffect(() => {
    if (activeProject) {
      const updated = projects.find(p => p.id === activeProject.id);
      if (updated && updated !== activeProject) {
        setActiveProjectState(updated);
      }
    }
  }, [projects, activeProject]);

  const debouncedSaveProjects = useCallback((updated: Project[]) => {
    if (projectSaveTimer.current) clearTimeout(projectSaveTimer.current);
    projectSaveTimer.current = setTimeout(() => {
      dbSaveProjects(updated);
      if (supabaseUserId.current) supabaseSaveProjects(supabaseUserId.current, updated);
    }, 400);
  }, []);

  const debouncedSaveConversations = useCallback((updated: Conversation[]) => {
    if (convSaveTimer.current) clearTimeout(convSaveTimer.current);
    convSaveTimer.current = setTimeout(() => {
      dbSet('conversations', updated);
      if (supabaseUserId.current) supabaseSaveConversations(supabaseUserId.current, updated);
    }, 400);
  }, []);

  const debouncedSaveSettings = useCallback((updated: AppSettings) => {
    if (settingsSaveTimer.current) clearTimeout(settingsSaveTimer.current);
    settingsSaveTimer.current = setTimeout(() => {
      dbSet('settings', updated);
      if (supabaseUserId.current) supabaseSaveSettings(supabaseUserId.current, updated);
    }, 400);
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    dbSet('user', u);
    if (u?.supabaseId) {
      supabaseUserId.current = u.supabaseId;
    } else {
      supabaseUserId.current = null;
    }
  }, []);

  const setPuterUser = useCallback((u: any) => { setPuterUserState(u); }, []);

  const setProjects = useCallback((p: Project[]) => {
    setProjectsState(p);
    debouncedSaveProjects(p);
  }, [debouncedSaveProjects]);

  const setActiveProject = useCallback((p: Project | null) => { setActiveProjectState(p); }, []);

  const updateSettings = useCallback((s: AppSettings) => {
    setSettingsState(s);
    debouncedSaveSettings(s);
  }, [debouncedSaveSettings]);

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

  // ── Conversation management ───────────────────────────────────────────────

  const setActiveConversationId = useCallback((id: string) => {
    setActiveConversationIdState(id);
  }, []);

  const createConversation = useCallback((): Conversation => {
    const conv = makeInitConversation();
    conv.title = `Sohbet ${Date.now().toString().slice(-4)}`;
    setConversationsState(prev => {
      const updated = [conv, ...prev];
      debouncedSaveConversations(updated);
      return updated;
    });
    setActiveConversationIdState(conv.id);
    return conv;
  }, [debouncedSaveConversations]);

  const deleteConversation = useCallback((id: string) => {
    setConversationsState(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (updated.length === 0) {
        const newConv = makeInitConversation();
        updated.push(newConv);
        setActiveConversationIdState(newConv.id);
      } else if (id === activeConversationId) {
        setActiveConversationIdState(updated[0].id);
      }
      debouncedSaveConversations(updated);
      return updated;
    });
  }, [activeConversationId, debouncedSaveConversations]);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversationsState(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, title } : c);
      debouncedSaveConversations(updated);
      return updated;
    });
  }, [debouncedSaveConversations]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setConversationsState(prev => {
      const updated = prev.map(c => {
        if (c.id !== activeConversationId) return c;
        const newMessages = [...c.messages, msg];
        const title = c.title === 'Yeni Sohbet' && c.messages.length <= 1 && msg.role === 'user'
          ? msg.content.slice(0, 40).replace(/\n/g, ' ')
          : c.title;
        return { ...c, messages: newMessages, title, updatedAt: Date.now() };
      });
      debouncedSaveConversations(updated);
      return updated;
    });
  }, [activeConversationId, debouncedSaveConversations]);

  const updateMessage = useCallback((msgId: string, updates: Partial<ChatMessage>) => {
    setConversationsState(prev => {
      const updated = prev.map(c => {
        if (c.id !== activeConversationId) return c;
        return { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, ...updates } : m), updatedAt: Date.now() };
      });
      debouncedSaveConversations(updated);
      return updated;
    });
  }, [activeConversationId, debouncedSaveConversations]);

  const clearMessages = useCallback(() => {
    setConversationsState(prev => {
      const initMsg: ChatMessage = {
        id: 'init-1', role: 'assistant',
        content: 'Merhaba! Ben QuantumIDE yapay zeka asistanıyım.\n\nNasıl yardımcı olabilirim?',
        timestamp: Date.now()
      };
      const updated = prev.map(c =>
        c.id === activeConversationId ? { ...c, messages: [initMsg], updatedAt: Date.now() } : c
      );
      debouncedSaveConversations(updated);
      return updated;
    });
  }, [activeConversationId, debouncedSaveConversations]);

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
      conversations, activeConversationId, setActiveConversationId,
      createConversation, deleteConversation, renameConversation,
      messages, addMessage, updateMessage, clearMessages,
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
