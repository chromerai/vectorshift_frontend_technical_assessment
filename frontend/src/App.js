// App.js
import './index.css';
import { useState } from 'react';
import { PipelineToolbar, ToolbarContext } from './toolbar';
import { PipelineUI }   from './ui';
import { SubmitButton } from './submit';

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ToolbarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas relative">

        {/* Toolbar — hidden when collapsed */}
        {!collapsed && <PipelineToolbar />}

        {/* Canvas */}
        <div className="relative flex-1 w-full overflow-hidden" style={{ minHeight: 0 }}>
          <PipelineUI />

          {/* Expand button — only shows when toolbar is collapsed */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="Open node panel"
              className="absolute top-3 left-3 z-20
                           flex items-center gap-2 px-3 py-2 rounded-xl
                           bg-surface border border-border
                           text-xs font-semibold text-soft
                           hover:text-white hover:border-accent/40 hover:bg-accent/10
                           transition-all duration-150 shadow-node"
            >
              <span className="text-accent-light font-bold">V</span>
              <span>Open Nodes</span>
              <span className="text-muted">▼</span>
            </button>
          )}
        </div>

        <SubmitButton />
      </div>
    </ToolbarContext.Provider>
  );
}

export default App;
