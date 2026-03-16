// nodes/llmNode.js
import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { useStore } from '../store';
import { cn, useStaleEdgeRemoval } from '../lib/utils';

const PROVIDERS = {
  openai:    { label: 'OpenAI',    color: '#10b981', short: 'O', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  anthropic: { label: 'Anthropic', color: '#f59e0b', short: 'A', models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
  google:    { label: 'Google',    color: '#3b82f6', short: 'G', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash'] },
  xai:       { label: 'xAI',       color: '#a855f7', short: 'X', models: ['grok-2', 'grok-beta'] },
  aws:       { label: 'AWS',       color: '#f97316', short: 'W', models: ['titan-text-express', 'titan-text-lite'] },
  custom:    { label: 'Custom',    color: '#8b5cf6', short: '?', models: ['custom'] },
};

const extractVars = (text) => {
  const matches = [...text.matchAll(/\{\{(\w+)\}\}/g)];
  return [...new Map(matches.map(m => [m[1], m[1]])).values()];
};

const AutoTextarea = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref} value={value} onChange={onChange}
      placeholder={placeholder} rows={2}
      className="field-textarea w-full"
      style={{ minHeight: '56px', lineHeight: '20px', resize: 'none', overflow: 'hidden' }}
    />
  );
};

const VarChips = ({ vars, color }) => {
  if (!vars.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {vars.map(v => (
        <span key={v}
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border"
          style={{ color, background: `${color}15`, borderColor: `${color}30` }}>
          {`{{${v}}}`}
        </span>
      ))}
    </div>
  );
};

export const LLMNode = ({ id, data }) => {
  // Lock provider to what was dragged — no switching inside the node
  const provider = data?.defaultProvider || null;
  const sel      = provider ? PROVIDERS[provider] : null;
  const color    = sel?.color || '#6366f1';

  const [model,        setModel]        = useState(sel?.models[0] || '');
  const [customModel,  setCustomModel]  = useState('');
  const [temperature,  setTemperature]  = useState(0.7);
  const [maxTokens,    setMaxTokens]    = useState(1024);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userQuery,    setUserQuery]    = useState('');
  const [showParams,   setShowParams]   = useState(false);

  const updateNodeField = useStore(state => state.updateNodeField);

  const systemVars = extractVars(systemPrompt);
  const userVars   = extractVars(userQuery);
  const allVars    = [...new Map([...systemVars, ...userVars].map(v => [v, v])).values()];
  const onEdgesChange = useStore(state => state.onEdgesChange);
  const edges         = useStore(state => state.edges);

  const handleSystemChange = (e) => {
    setSystemPrompt(e.target.value);
    updateNodeField(id, 'systemPrompt', e.target.value);
  };

  const handleUserQueryChange = (e) => {
    setUserQuery(e.target.value);
    updateNodeField(id, 'userQuery', e.target.value);
  };

  useStaleEdgeRemoval(id, allVars, edges, onEdgesChange);

  return (
    <NodeTemplate
      title={sel ? `LLM · ${sel.label}` : 'LLM'}
      icon={sel ? sel.short : '◈'}
      category="AI"
      accentColor={color}
      fields={[]}
      handles={[{ type: 'source', position: Position.Right, id: `${id}-response` }]}
      minWidth={320}
    >
      {/* ── Model selector ── */}
      <div className="flex flex-col gap-1.5">
        <span className="field-label">Model</span>
        <div className="flex items-center gap-2">
          {provider === 'custom' ? (
            <input
              type="text" value={customModel}
              onChange={e => setCustomModel(e.target.value)}
              placeholder="e.g. llama3:8b"
              className="field-input flex-1 text-[11px] font-mono"
            />
          ) : (
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="field-select flex-1 text-[11px]"
            >
              {(sel?.models || []).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          {/* Params toggle */}
          <button
            onClick={() => setShowParams(p => !p)}
            className={cn(
              'px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-150',
              showParams
                ? 'border-opacity-40 bg-opacity-15 text-white'
                : 'border-border text-muted hover:text-white'
            )}
            style={showParams ? { borderColor: `${color}60`, background: `${color}20`, color } : {}}
          >
            ⚙ Params
          </button>
        </div>

        {/* Params panel */}
        {showParams && (
          <div className="bg-canvas rounded-lg border border-border p-2.5 flex gap-3">
            <label className="flex flex-col gap-1 flex-1">
              <span className="field-label mb-0">Temperature</span>
              <input
                type="number"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                min="0" max="2" step="0.1"
                className="field-input text-xs font-mono"
              />
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <span className="field-label mb-0">Max Tokens</span>
              <input
                type="number"
                value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))}
                min="256" max="8192" step="256"
                className="field-input text-xs font-mono"
              />
            </label>
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* ── System Prompt ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="field-label">System Prompt</span>
          <span className="text-[9px] text-muted font-mono">{'{{var}}'} for inputs</span>
        </div>
        <AutoTextarea
          value={systemPrompt}
          onChange={handleSystemChange}
          placeholder="You are a helpful assistant. {{context}}"
        />
        <VarChips vars={systemVars} color={color} />
      </div>

      {/* ── User Query ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="field-label">User Query</span>
          <span className="text-[9px] text-muted font-mono">{'{{var}}'} for inputs</span>
        </div>
        <AutoTextarea
          value={userQuery}
          onChange={handleUserQueryChange}
          placeholder="Answer this: {{user_input}}"
        />
        <VarChips vars={userVars} color={color} />
      </div>

      {/* ── Dynamic variable handles ── */}
      {allVars.map((varName, index) => {
        const topPercent = ((index + 1) / (allVars.length + 1)) * 100;
        return (
          <Handle
            key={`${id}-${varName}`}
            type="target"
            position={Position.Left}
            id={`${id}-${varName}`}
            style={{
              top: `${topPercent}%`,
              width: '10px', height: '10px',
              background: '#0f1117',
              border: `2px solid ${color}`,
              borderRadius: '50%',
            }}
          >
            <span
              className="absolute right-3.5 top-1/2 -translate-y-1/2
                           text-[9px] font-mono font-bold px-1.5 py-px rounded
                           whitespace-nowrap pointer-events-none"
              style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
            >
              {varName}
            </span>
          </Handle>
        );
      })}

      {/* ── Output label ── */}
      <div className="flex justify-end">
        <span className="text-[10px] font-mono font-semibold" style={{ color }}>
          response →
        </span>
      </div>
    </NodeTemplate>
  );
};