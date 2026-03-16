// nodes/llmNode.js
import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { cn } from '../lib/utils';

const PROVIDERS = {
  openai:    { label: 'OpenAI',    color: '#10b981', short: 'O', envKey: 'OPENAI_API_KEY',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  anthropic: { label: 'Anthropic', color: '#f59e0b', short: 'A', envKey: 'ANTHROPIC_API_KEY',
    models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
  google:    { label: 'Google',    color: '#3b82f6', short: 'G', envKey: 'GOOGLE_API_KEY',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  xai:       { label: 'xAI',       color: '#a855f7', short: 'X', envKey: 'XAI_API_KEY',
    models: ['grok-2', 'grok-beta'] },
  aws:       { label: 'AWS',       color: '#f97316', short: 'W', envKey: 'AWS_ACCESS_KEY',
    models: ['titan-text-express', 'titan-text-lite'] },
  custom:    { label: 'Custom',    color: '#8b5cf6', short: '?', envKey: 'CUSTOM_API_KEY',
    models: ['custom'] },
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
    <textarea ref={ref} value={value} onChange={onChange} placeholder={placeholder} rows={2}
      className="field-textarea w-full"
      style={{ minHeight: '56px', lineHeight: '20px', resize: 'none', overflow: 'hidden' }}
    />
  );
};

const VarChips = ({ vars }) => {
  if (!vars.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {vars.map(v => (
        <span key={v} className="text-[9px] font-mono font-bold px-1.5 py-0.5
                                   bg-indigo-950 border border-indigo-800 text-indigo-400 rounded-full">
          {`{{${v}}}`}
        </span>
      ))}
    </div>
  );
};

export const LLMNode = ({ id, data }) => {
  // If dragged from a specific provider card, pre-select that provider
  const [provider,     setProvider]     = useState(data?.defaultProvider || null);
  const [model,        setModel]        = useState(
    data?.defaultProvider ? PROVIDERS[data.defaultProvider]?.models[0] : ''
  );
  const [customModel,  setCustomModel]  = useState('');
  const [temperature,  setTemperature]  = useState(0.7);
  const [maxTokens,    setMaxTokens]    = useState(1024);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userQuery,    setUserQuery]    = useState('');
  const [showParams,   setShowParams]   = useState(false);

  const systemVars = extractVars(systemPrompt);
  const userVars   = extractVars(userQuery);
  const allVars    = [...new Map([...systemVars, ...userVars].map(v => [v, v])).values()];

  const sel = provider ? PROVIDERS[provider] : null;
  const modelLabel = provider === 'custom'
    ? (customModel || 'Custom')
    : model;

  return (
    <NodeTemplate
      title={provider ? `LLM · ${sel.label}` : 'LLM'}
      icon={provider ? sel.short : '◈'}
      category="AI"
      accentColor={sel?.color || '#6366f1'}
      fields={[]}
      handles={[{ type: 'source', position: Position.Right, id: `${id}-response` }]}
      minWidth={320}
    >
      {/* ── Provider selector ── */}
      <div className="flex flex-col gap-1.5">
        <span className="field-label">Provider & Model</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PROVIDERS).map(([key, val]) => (
            <button key={key}
              onClick={() => { setProvider(key); setModel(val.models[0]); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all duration-150"
              style={provider === key
                ? { borderColor: `${val.color}60`, background: `${val.color}20`, color: val.color }
                : { borderColor: '#2e3250', color: '#4b5280' }
              }
            >
              <div className="w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold"
                style={{ background: `${val.color}25`, color: val.color }}>{val.short}</div>
              {val.label}
            </button>
          ))}
        </div>

        {/* Model + params */}
        {provider && (
          <div className="flex items-center gap-2">
            {provider === 'custom' ? (
              <input type="text" value={customModel} onChange={e => setCustomModel(e.target.value)}
                placeholder="e.g. llama3:8b" className="field-input flex-1 text-[11px] font-mono" />
            ) : (
              <select value={model} onChange={e => setModel(e.target.value)} className="field-select flex-1 text-[11px]">
                {PROVIDERS[provider].models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
            <button onClick={() => setShowParams(p => !p)}
              className={cn('px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-150',
                showParams ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-400' : 'border-border text-muted hover:text-white'
              )}>⚙ Params</button>
          </div>
        )}

        {/* Params panel */}
        {provider && showParams && (
          <div className="bg-canvas rounded-lg border border-border p-2.5 flex gap-3">
            <label className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between">
                <span className="field-label mb-0">Temp</span>
                <span className="text-[10px] font-mono text-indigo-400">{temperature}</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))} className="accent-indigo-500 w-full" />
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between">
                <span className="field-label mb-0">Max Tokens</span>
                <span className="text-[10px] font-mono text-indigo-400">{maxTokens}</span>
              </div>
              <input type="range" min="256" max="8192" step="256" value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))} className="accent-indigo-500 w-full" />
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
        <AutoTextarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful assistant. {{context}}" />
        <VarChips vars={systemVars} />
      </div>

      {/* ── User Query ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="field-label">User Query</span>
          <span className="text-[9px] text-muted font-mono">{'{{var}}'} for inputs</span>
        </div>
        <AutoTextarea value={userQuery} onChange={e => setUserQuery(e.target.value)}
          placeholder="Answer this: {{user_input}}" />
        <VarChips vars={userVars} />
      </div>

      {/* ── Dynamic variable handles ── */}
      {allVars.map((varName, index) => {
        const topPercent = ((index + 1) / (allVars.length + 1)) * 100;
        return (
          <Handle key={`${id}-${varName}`} type="target" position={Position.Left}
            id={`${id}-${varName}`}
            style={{ top: `${topPercent}%`, width: '10px', height: '10px',
              background: '#0f1117', border: `2px solid ${sel?.color || '#6366f1'}`, borderRadius: '50%' }}
          >
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2
                               text-[9px] font-mono font-bold px-1.5 py-px rounded whitespace-nowrap pointer-events-none"
              style={{ color: sel?.color || '#6366f1', background: `${sel?.color || '#6366f1'}15`,
                border: `1px solid ${sel?.color || '#6366f1'}30` }}>
              {varName}
            </span>
          </Handle>
        );
      })}

      {/* ── Output label ── */}
      <div className="flex justify-end">
        <span className="text-[10px] font-mono font-semibold" style={{ color: sel?.color || '#6366f1' }}>
          response →
        </span>
      </div>
    </NodeTemplate>
  );
};