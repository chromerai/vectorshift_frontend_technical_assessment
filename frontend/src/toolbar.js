// toolbar.js
import { useState, useMemo } from 'react';
import { DraggableNode } from './draggableNode';
import { SettingsPanel } from './settingsPanel';
import { createContext, useContext } from 'react';
// ── All nodes organised by category ──────────────────────────────────────────
// Each LLM provider is its own draggable node in the AI tab
const ALL_NODES = [
  // Start
  { type: 'customInput',  label: 'Input',     icon: '⬇', accentColor: '#10b981', category: 'Start'},
  { type: 'customOutput', label: 'Output',    icon: '⬆', accentColor: '#f59e0b', category: 'Start'},
  { type: 'text',         label: 'Text',      icon: '✦', accentColor: '#3b82f6', category: 'Start'},
  { type: 'note',         label: 'Note',      icon: '◎', accentColor: '#facc15', category: 'Start'},
  // AI — one entry per provider, all map to the same 'llm' node type but carry a defaultProvider
  { type: 'llm', defaultProvider: 'openai',    label: 'OpenAI',    icon: 'O', accentColor: '#10b981', category: 'AI'},
  { type: 'llm', defaultProvider: 'anthropic', label: 'Anthropic', icon: 'A', accentColor: '#f59e0b', category: 'AI'},
  { type: 'llm', defaultProvider: 'google',    label: 'Google',    icon: 'G', accentColor: '#3b82f6', category: 'AI'},
  { type: 'llm', defaultProvider: 'xai',       label: 'xAI',       icon: 'X', accentColor: '#a855f7', category: 'AI'},
  { type: 'llm', defaultProvider: 'aws',       label: 'AWS',       icon: 'W', accentColor: '#f97316', category: 'AI'},
  { type: 'llm', defaultProvider: 'custom',    label: 'Custom',    icon: '?', accentColor: '#8b5cf6', category: 'AI'},
  // Logic
  { type: 'condition',    label: 'Condition', icon: '⋈', accentColor: '#f43f5e', category: 'Logic'},
  { type: 'timer',        label: 'Timer',     icon: '◷', accentColor: '#f97316', category: 'Logic'},
  // Data
  { type: 'transform',    label: 'Transform', icon: '⟳', accentColor: '#8b5cf6', category: 'Data'},
  { type: 'database',     label: 'Database',  icon: '⊞', accentColor: '#06b6d4', category: 'Data'},
  { type: 'supabase', label: 'Supabase', icon: 'S', accentColor: '#3ecf8e', category: 'Data' },
  // Integrations
  { type: 'api',          label: 'API',       icon: '⊕', accentColor: '#0ea5e9', category: 'Integrations'},
  
];

const CATEGORIES = ['Start', 'AI', 'Logic', 'Data', 'Integrations'];


export const ToolbarContext = createContext({ collapsed: false, setCollapsed: () => {} });

export const PipelineToolbar = () => {
  const [activeCategory, setActiveCategory] = useState('Start');
  const [search,         setSearch]         = useState('');
  const [showSettings,   setShowSettings]   = useState(false);
  const { collapsed, setCollapsed }         = useContext(ToolbarContext);

  // ── Smart search: when typing, search ALL nodes regardless of tab ──
  // Auto-switch tab to show where the result lives if results span one category
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      // No search — show active tab only
      return ALL_NODES.filter(n => n.category === activeCategory);
    }
    // Searching — ignore tab, search everything
    const results = ALL_NODES.filter(n =>
      n.label.toLowerCase().includes(q)
    );
    return results;
  }, [activeCategory, search]);

  // When user clears search, make sure active tab is valid
  const handleSearch = (val) => {
    setSearch(val);
  };

  // Auto-switch tab to the category of the first result when searching
  const searchResultCategories = useMemo(() => {
    if (!search.trim()) return [];
    return [...new Set(filtered.map(n => n.category))];
  }, [filtered, search]);

  if (collapsed) return null;

  return (
    <>
      <header className="flex flex-col bg-surface border-b border-border z-10 flex-shrink-0
                           transition-all duration-200">

        {/* ── Top row: brand + search + settings + collapse ── */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-1 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center
                             text-white text-sm font-bold shadow-glow">V</div>
            <span className="text-sm font-bold tracking-tight text-white">VectorShift</span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs">⌕</span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search all nodes..."
              className="w-full bg-canvas border border-border rounded-lg
                           pl-7 pr-7 py-1.5 text-xs text-white placeholder-muted
                           outline-none focus:border-accent/50 transition-all duration-150"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-white text-xs"
              >✕</button>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
                         text-muted hover:text-white hover:border-accent/40 hover:bg-accent/10
                         text-xs font-semibold transition-all duration-150 flex-shrink-0"
          >
            <span>⚙</span>
            <span>Settings</span>
          </button>

          {/* Collapse button */}
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse panel"
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-border
                         text-muted hover:text-white hover:border-rose-500/40 hover:bg-rose-500/10
                         text-xs transition-all duration-150 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* ── Search result hint ── */}
        {search.trim() && (
          <div className="px-4 pb-1 flex items-center gap-2">
            <span className="text-[10px] text-muted">
              {filtered.length === 0
                ? 'No nodes found'
                : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} across: `}
            </span>
            {searchResultCategories.map(cat => (
              <span key={cat} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full
                                           bg-accent/15 text-accent-light border border-accent/20">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* ── Category tabs — hidden while searching ── */}
        {!search.trim() && (
          <div className="flex items-center gap-0.5 px-4 pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={[
                  'px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150',
                  activeCategory === cat
                    ? 'bg-accent/15 text-accent-light border border-accent/30'
                    : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Node grid ── */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto
                         scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-h-[80px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-2 gap-1">
              <span className="text-xs text-muted">No nodes found for "{search}"</span>
              <button
                onClick={() => setSearch('')}
                className="text-[10px] text-accent-light hover:underline"
              >Clear search</button>
            </div>
          ) : (
            filtered.map((n, i) => (
              <DraggableNode key={`${n.type}-${n.defaultProvider || i}`} {...n} showDescription />
            ))
          )}
        </div>
      </header>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};