import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Terminal, TerminalSquare } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import EditorPanel from "@/components/EditorPanel";
import AIPanel from "@/components/AIPanel";
import ShellPanel from "@/components/ShellPanel";

export default function IDE() {
  const [shellOpen, setShellOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left: Sidebar */}
        <Panel defaultSize={18} minSize={12} maxSize={30}>
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

        {/* Center: Editor + Shell */}
        <Panel defaultSize={57} minSize={30}>
          <div className="h-full flex flex-col">
            {/* Shell toggle toolbar */}
            <div className="flex items-center justify-end px-2 py-1 bg-sidebar border-b border-border shrink-0">
              <button
                onClick={() => setShellOpen(o => !o)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                  shellOpen
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={shellOpen ? 'Shell\'i kapat' : 'Shell\'i aç'}
              >
                {shellOpen ? <TerminalSquare size={12} /> : <Terminal size={12} />}
                <span>Shell</span>
              </button>
            </div>

            {/* Editor + Shell split */}
            <div className="flex-1 overflow-hidden">
              {shellOpen ? (
                <PanelGroup direction="vertical">
                  <Panel defaultSize={65} minSize={30}>
                    <EditorPanel />
                  </Panel>
                  <PanelResizeHandle className="h-px bg-border hover:bg-primary/50 transition-colors cursor-row-resize" />
                  <Panel defaultSize={35} minSize={20} maxSize={60}>
                    <ShellPanel onClose={() => setShellOpen(false)} />
                  </Panel>
                </PanelGroup>
              ) : (
                <EditorPanel />
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

        {/* Right: AI Panel */}
        <Panel defaultSize={25} minSize={18} maxSize={40}>
          <AIPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
}
