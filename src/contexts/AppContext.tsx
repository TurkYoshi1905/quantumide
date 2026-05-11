import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { User, Project, FileNode, Tab, AppSettings, ChatMessage } from "@/types";
import { dbSaveProjects, dbLoadProjects, dbSet, dbGet } from "@/lib/db";

const DEFAULT_PROJECT: Project = {
  id: 'proj-1',
  name: 'İlk Projem',
  files: [
    { id: 'f1', name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>QuantumIDE Projesi</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="container">\n    <h1>Merhaba, QuantumIDE!</h1>\n    <p>Yapay zeka destekli geliştirme ortamına hoş geldiniz.</p>\n    <button onclick="merhaba()">Tıkla</button>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>' },
    { id: 'f2', name: 'style.css', type: 'file', content: '* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  font-family: "Inter", sans-serif;\n  background: #0a0e1a;\n  color: #e2e8f0;\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.container {\n  text-align: center;\n  padding: 2rem;\n}\n\nh1 {\n  font-size: 2.5rem;\n  background: linear-gradient(135deg, #7c3aed, #10b981);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  margin-bottom: 1rem;\n}\n\np {\n  color: #94a3b8;\n  margin-bottom: 2rem;\n}\n\nbutton {\n  background: #7c3aed;\n  color: white;\n  border: none;\n  padding: 0.75rem 2rem;\n  border-radius: 0.5rem;\n  cursor: pointer;\n  font-size: 1rem;\n  transition: all 0.2s;\n}\n\nbutton:hover {\n  background: #6d28d9;\n  transform: translateY(-2px);\n}' },
    { id: 'f3', name: 'script.js', type: 'file', content: 'function merhaba() {\n  const mesaj = document.createElement("p");\n  mesaj.textContent = "QuantumIDE ile kodlamaya hoş geldiniz!";\n  mesaj.style.cssText = "color: #10b981; margin-top: 1rem; font-size: 1.2rem;";\n  document.querySelector(".container").appendChild(mesaj);\n}\n\nconsole.log("QuantumIDE - Yapay Zeka Destekli Geliştirme Ortamı");\n' },
    {
      id: 'folder-src', name: 'src', type: 'folder', children: [
        { id: 'f4', name: 'app.js', type: 'file', content: '// Ana uygulama mantığı\nconst App = {\n  init() {\n    console.log("Uygulama başlatılıyor...");\n    this.render();\n  },\n  render() {\n    console.log("Bileşenler render ediliyor...");\n  }\n};\n\nApp.init();\n' },
        { id: 'f5', name: 'utils.js', type: 'file', content: '// Yardımcı fonksiyonlar\nexport const formatDate = (date) => {\n  return new Intl.DateTimeFormat("tr-TR").format(date);\n};\n\nexport const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};\n' }
      ]
    }
  ]
};

const INIT_MESSAGE: ChatMessage = {
  id: 'init-1',
  role: 'assistant',
  content: 'Merhaba! Ben QuantumIDE yapay zeka asistanıyım.\n\nPuter hesabınızı **Ayarlar > AI Modelleri** bölümünden bağlayarak GPT-4o, Claude, Gemini ve daha fazlasını **ücretsiz** kullanabilirsiniz.\n\nNasıl yardımcı olabilirim?',
  timestamp: Date.now()
};

const DEFAULT_SETTINGS: AppSettings = {
  ai: { activeModel: 'gpt-4o', puterConnected: false },
  github: { connected: false, token: '' },
  editorFontSize: 14,
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
  createProject: (name: string) => void;
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
  const [projects, setProjectsState] = useState<Project[]>([DEFAULT_PROJECT]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTabState] = useState<Tab | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([INIT_MESSAGE]);
  const [glowingFiles, setGlowingFiles] = useState<GlowingFile>({});
  const [savedTab, setSavedTab] = useState<string | null>(null);

  // Debounce timer refs for IndexedDB writes
  const projectSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load everything from IndexedDB on mount
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
          : [DEFAULT_PROJECT];

        setProjectsState(loadedProjects);
        setActiveProjectState(loadedProjects[0] || null);
        setMessages(savedMessages.length > 0 ? savedMessages : [INIT_MESSAGE]);

        // Migrate old settings shape
        const merged: AppSettings = {
          ai: {
            activeModel: savedSettings?.ai?.activeModel || 'gpt-4o',
            puterConnected: savedSettings?.ai?.puterConnected || false,
          },
          github: savedSettings?.github || DEFAULT_SETTINGS.github,
          editorFontSize: savedSettings?.editorFontSize || 14,
        };
        setSettingsState(merged);
        setUserState(savedUser);
      } catch (e) {
        console.error('IndexedDB yüklenemedi, localStorage fallback kullanılıyor.', e);
        // Fallback to localStorage
        try {
          const sp = JSON.parse(localStorage.getItem('qide_projects') || 'null');
          if (sp) { setProjectsState(sp); setActiveProjectState(sp[0] || null); }
          const ss = JSON.parse(localStorage.getItem('qide_settings') || 'null');
          if (ss) setSettingsState(ss);
          const su = JSON.parse(localStorage.getItem('qide_user') || 'null');
          if (su) setUserState(su);
        } catch { /* ignore */ }
      } finally {
        setDbReady(true);
      }
    }
    initDB();
  }, []);

  // Check Puter auth status after DB ready
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

  // Debounced save helpers
  const debouncedSaveProjects = useCallback((updated: Project[]) => {
    if (projectSaveTimer.current) clearTimeout(projectSaveTimer.current);
    projectSaveTimer.current = setTimeout(() => {
      dbSaveProjects(updated);
    }, 400);
  }, []);

  const debouncedSaveMessages = useCallback((updated: ChatMessage[]) => {
    if (messageSaveTimer.current) clearTimeout(messageSaveTimer.current);
    messageSaveTimer.current = setTimeout(() => {
      dbSet('messages', updated);
    }, 400);
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    dbSet('user', u);
  }, []);

  const setPuterUser = useCallback((u: any) => {
    setPuterUserState(u);
  }, []);

  const setProjects = useCallback((p: Project[]) => {
    setProjectsState(p);
    debouncedSaveProjects(p);
  }, [debouncedSaveProjects]);

  const setActiveProject = useCallback((p: Project | null) => {
    setActiveProjectState(p);
  }, []);

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
      name,
      type,
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

  const createProject = useCallback((name: string) => {
    const ts = Date.now();
    const newProject: Project = {
      id: `proj-${ts}`,
      name,
      files: [
        { id: `f-${ts}-1`, name: 'index.html', type: 'file', content: `<!DOCTYPE html>\n<html lang="tr">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${name}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>${name}</h1>\n  <script src="script.js"></script>\n</body>\n</html>` },
        { id: `f-${ts}-2`, name: 'style.css', type: 'file', content: `body { font-family: sans-serif; background: #0a0e1a; color: #e2e8f0; padding: 2rem; }\nh1 { color: #7c3aed; }` },
        { id: `f-${ts}-3`, name: 'script.js', type: 'file', content: `console.log("${name} başlatıldı");` },
      ]
    };
    setProjectsState(prev => {
      const updated = [...prev, newProject];
      debouncedSaveProjects(updated);
      return updated;
    });
    setActiveProjectState(newProject);
  }, [debouncedSaveProjects]);

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
      createFile, deleteFile, renameFile, createProject,
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
