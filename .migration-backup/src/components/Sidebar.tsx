import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, FolderOpen, Folder, FileText, ChevronRight, ChevronDown,
  Plus, Trash2, Edit3, Github, Settings, LogOut,
  FolderPlus, FilePlus, ArrowLeft, MoreVertical
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { FileNode, Project } from "@/types";
import { useLocation } from "wouter";
import NewProjectModal from "./NewProjectModal";

function fileColor(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return { html: 'text-orange-400', css: 'text-blue-400', js: 'text-yellow-400',
    ts: 'text-blue-500', tsx: 'text-blue-400', jsx: 'text-yellow-400',
    json: 'text-green-400', md: 'text-gray-400', py: 'text-green-500',
  }[ext] || 'text-gray-400';
}

interface FileTreeNodeProps {
  node: FileNode;
  project: Project;
  depth: number;
  onContextMenu: (e: React.MouseEvent, fileId: string, projectId: string, isFolder: boolean) => void;
}

function FileTreeNode({ node, project, depth, onContextMenu }: FileTreeNodeProps) {
  const [open, setOpen] = useState(true);
  const { openFile, activeTab, glowingFiles } = useApp();
  const isActive = activeTab?.fileId === node.id;
  const isGlowing = glowingFiles[node.id];

  return (
    <div>
      <motion.div
        className={`flex items-center gap-1.5 py-1 cursor-pointer rounded-md mx-1 group relative
          ${isActive ? 'bg-primary/20 text-primary' : 'text-sidebar-foreground hover:bg-white/5'}
          ${isGlowing ? 'file-glow' : ''}`}
        style={{ paddingLeft: `${(depth + 1) * 14 + 4}px`, paddingRight: '8px' }}
        onClick={() => { if (node.type === 'folder') setOpen(o => !o); else openFile(node, project); }}
        onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, node.id, project.id, node.type === 'folder'); }}
        animate={isGlowing ? { boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 16px rgba(124,58,237,0.7)', '0 0 0px rgba(124,58,237,0)'] } : {}}
        transition={{ duration: 1 }}
      >
        {node.type === 'folder' ? (
          <>
            <span className="text-gray-400 w-3 shrink-0">{open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}</span>
            {open ? <FolderOpen size={13} className="text-yellow-400 shrink-0" /> : <Folder size={13} className="text-yellow-400 shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <FileText size={13} className={`${fileColor(node.name)} shrink-0`} />
          </>
        )}
        <span className="text-xs truncate flex-1">{node.name}</span>
      </motion.div>
      <AnimatePresence>
        {node.type === 'folder' && open && node.children && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
            {node.children.map(child => (
              <FileTreeNode key={child.id} node={child} project={project} depth={depth + 1} onContextMenu={onContextMenu} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({ project, isActive, onClick, onDelete, onRename }: {
  project: Project; isActive: boolean;
  onClick: () => void; onDelete: () => void; onRename: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const fileCount = (function count(files: FileNode[]): number {
    return files.reduce((n, f) => n + (f.type === 'file' ? 1 : count(f.children || [])), 0);
  })(project.files);

  return (
    <div className="relative px-2 mb-1">
      <motion.div
        whileHover={{ x: 2 }}
        onClick={onClick}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer border transition-all group
          ${isActive
            ? 'bg-primary/15 border-primary/30 text-foreground'
            : 'bg-white/3 border-white/5 text-muted-foreground hover:bg-white/6 hover:border-white/10 hover:text-foreground'}`}
      >
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isActive ? 'bg-primary/20' : 'bg-white/5'}`}>
          <Folder size={14} className={isActive ? 'text-primary' : 'text-yellow-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{project.name}</div>
          <div className="text-xs text-muted-foreground">{fileCount} dosya</div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); setShowMenu(m => !m); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all shrink-0"
        >
          <MoreVertical size={12} />
        </button>
      </motion.div>

      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-2 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-xl py-1 min-w-36"
            >
              <button onClick={() => { onRename(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/5 text-foreground">
                <Edit3 size={11} /> Yeniden Adlandır
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-destructive/10 text-destructive">
                <Trash2 size={11} /> Sil
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ContextMenuState { visible: boolean; x: number; y: number; fileId: string | null; projectId: string | null; isFolder: boolean }

export default function Sidebar() {
  const { user, setUser, projects, setProjects, activeProject, setActiveProject, deleteProject, createFile, deleteFile, renameFile, openFile } = useApp();

  const [view, setView] = useState<'projects' | 'files'>('projects');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, fileId: null, projectId: null, isFolder: false });
  const [showNewProject, setShowNewProject] = useState(false);
  const [renaming, setRenaming] = useState<{ fileId: string; projectId: string; name: string } | null>(null);
  const [renamingProject, setRenamingProject] = useState<{ id: string; name: string } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState<{ projectId: string; parentId: string | null; type: 'file' | 'folder' } | null>(null);
  const [, setLocation] = useLocation();

  const closeContext = () => setContextMenu(c => ({ ...c, visible: false }));

  const handleContextMenu = (e: React.MouseEvent, fileId: string, projectId: string, isFolder: boolean) => {
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, fileId, projectId, isFolder });
  };

  const handleDelete = () => {
    if (contextMenu.fileId && contextMenu.projectId) deleteFile(contextMenu.projectId, contextMenu.fileId);
    closeContext();
  };

  const handleRename = () => {
    if (contextMenu.fileId && contextMenu.projectId) {
      const project = projects.find(p => p.id === contextMenu.projectId);
      const findFile = (files: FileNode[], id: string): FileNode | null => {
        for (const f of files) { if (f.id === id) return f; if (f.children) { const found = findFile(f.children, id); if (found) return found; } }
        return null;
      };
      const file = project ? findFile(project.files, contextMenu.fileId) : null;
      setRenaming({ fileId: contextMenu.fileId, projectId: contextMenu.projectId, name: file?.name || '' });
    }
    closeContext();
  };

  const openProject = (project: Project) => {
    setActiveProject(project);
    setView('files');
    const firstFile = (function findFirst(files: FileNode[]): FileNode | null {
      for (const f of files) { if (f.type === 'file') return f; if (f.children) { const found = findFirst(f.children); if (found) return found; } }
      return null;
    })(project.files);
    if (firstFile) openFile(firstFile, project);
  };

  const handleProjectCreated = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
      setView('files');
    }
  };

  const renameProjectLocal = (projectId: string, newName: string) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, name: newName } : p));
    if (activeProject?.id === projectId) setActiveProject({ ...activeProject, name: newName });
  };

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden" onClick={closeContext}>
      {/* Logo */}
      <div className="p-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center quantum-border">
            <Code2 size={16} className="text-primary" />
          </div>
          <span className="font-bold text-sm tracking-wider text-foreground">QuantumIDE</span>
        </div>
      </div>

      {/* User */}
      <div className="p-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">{user?.name || 'Misafir'}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email || 'Giriş yapılmadı'}</div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setLocation('/settings')} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Ayarlar"><Settings size={12} /></button>
            {user && <button onClick={() => { setUser(null); setLocation('/login'); }} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Çıkış"><LogOut size={12} /></button>}
          </div>
        </div>
      </div>

      {/* Project / File views */}
      <AnimatePresence mode="wait">
        {view === 'projects' && (
          <motion.div key="projects" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.15 }} className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projeler</span>
              <div className="flex gap-1">
                <button onClick={() => setShowNewProject(true)} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" title="Yeni Proje"><Plus size={12} /></button>
                <button onClick={() => setLocation('/settings')} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" title="GitHub"><Github size={12} /></button>
              </div>
            </div>

            {renamingProject && (
              <div className="px-2 mb-2">
                <input
                  autoFocus
                  value={renamingProject.name}
                  onChange={e => setRenamingProject(p => p ? { ...p, name: e.target.value } : null)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && renamingProject.name.trim()) { renameProjectLocal(renamingProject.id, renamingProject.name.trim()); setRenamingProject(null); }
                    if (e.key === 'Escape') setRenamingProject(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-muted border border-primary rounded-lg outline-none text-foreground"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-1">
              {projects.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <FolderPlus size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Henüz proje yok.</p>
                  <button onClick={() => setShowNewProject(true)} className="text-xs text-primary hover:underline">Yeni proje oluştur</button>
                </div>
              )}
              {projects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  isActive={activeProject?.id === p.id}
                  onClick={() => openProject(p)}
                  onDelete={() => deleteProject(p.id)}
                  onRename={() => setRenamingProject({ id: p.id, name: p.name })}
                />
              ))}
            </div>
          </motion.div>
        )}

        {view === 'files' && activeProject && (
          <motion.div key="files" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.15 }} className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex items-center gap-2 px-2 py-2 border-b border-sidebar-border shrink-0">
              <button onClick={() => setView('projects')} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <ArrowLeft size={13} />
              </button>
              <Folder size={13} className="text-yellow-400 shrink-0" />
              <span className="text-xs font-semibold text-foreground flex-1 truncate">{activeProject.name}</span>
              <button
                onClick={() => setShowNewFile({ projectId: activeProject.id, parentId: null, type: 'file' })}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
                title="Yeni Dosya"
              ><FilePlus size={11} /></button>
              <button
                onClick={() => setShowNewFile({ projectId: activeProject.id, parentId: null, type: 'folder' })}
                className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
                title="Yeni Klasör"
              ><FolderPlus size={11} /></button>
            </div>

            {showNewFile && showNewFile.projectId === activeProject.id && !showNewFile.parentId && (
              <div className="px-2 py-1.5 border-b border-sidebar-border">
                <input
                  autoFocus
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newFileName.trim()) { createFile(showNewFile.projectId, showNewFile.parentId, newFileName.trim(), showNewFile.type); setNewFileName(''); setShowNewFile(null); }
                    if (e.key === 'Escape') { setShowNewFile(null); setNewFileName(''); }
                  }}
                  placeholder={showNewFile.type === 'file' ? 'dosya.js' : 'klasor-adi'}
                  className="w-full px-2 py-1 text-xs bg-muted border border-primary rounded outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-1">
              {activeProject.files.length === 0 && (
                <div className="px-3 py-6 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Proje boş.</p>
                  <button onClick={() => setShowNewFile({ projectId: activeProject.id, parentId: null, type: 'file' })} className="text-xs text-primary hover:underline">Dosya ekle</button>
                </div>
              )}
              {activeProject.files.map(file =>
                renaming?.fileId === file.id ? (
                  <div key={file.id} className="px-2 mb-1">
                    <input
                      autoFocus value={renaming.name}
                      onChange={e => setRenaming(prev => prev ? { ...prev, name: e.target.value } : null)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && renaming.name.trim()) { renameFile(renaming.projectId, renaming.fileId, renaming.name.trim()); setRenaming(null); }
                        if (e.key === 'Escape') setRenaming(null);
                      }}
                      className="w-full px-2 py-1 text-xs bg-muted border border-primary rounded outline-none text-foreground"
                    />
                  </div>
                ) : (
                  <FileTreeNode key={file.id} node={file} project={activeProject} depth={0} onContextMenu={handleContextMenu} />
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}
            className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl overflow-hidden py-1 min-w-36"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={e => e.stopPropagation()}
          >
            {contextMenu.isFolder && (
              <>
                <button onClick={() => { setShowNewFile({ projectId: contextMenu.projectId!, parentId: contextMenu.fileId, type: 'file' }); closeContext(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-white/5"><FilePlus size={12} /> Yeni Dosya</button>
                <button onClick={() => { setShowNewFile({ projectId: contextMenu.projectId!, parentId: contextMenu.fileId, type: 'folder' }); closeContext(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-white/5"><FolderPlus size={12} /> Yeni Klasör</button>
                <div className="border-t border-border my-1" />
              </>
            )}
            <button onClick={handleRename} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-white/5"><Edit3 size={12} /> Yeniden Adlandır</button>
            <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"><Trash2 size={12} /> Sil</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Project Modal */}
      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}
