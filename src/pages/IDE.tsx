import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Sidebar from "@/components/Sidebar";
import EditorPanel from "@/components/EditorPanel";
import AIPanel from "@/components/AIPanel";

export default function IDE() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left: Sidebar */}
        <Panel defaultSize={18} minSize={12} maxSize={30}>
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

        {/* Center: Editor */}
        <Panel defaultSize={57} minSize={30}>
          <EditorPanel />
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
