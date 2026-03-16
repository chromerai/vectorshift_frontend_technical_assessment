// src/nodes/llmNode.js
import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { useStore } from '../store';
import { cn, extractVariables, useStaleEdgeRemoval } from '../lib/utils';
import { VariableTextField, VariableHandles } from '../components/variableField';

const PROVIDERS = {
  openai:    { label: 'OpenAI',    color: '#10b981', short: 'O', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  anthropic: { label: 'Anthropic', color: '#f59e0b', short: 'A', models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
  google:    { label: 'Google',    color: '#3b82f6', short: 'G', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  xai:       { label: 'xAI',       color: '#a855f7', short: 'X', models: ['grok-2', 'grok-beta'] },
  aws:       { label: 'AWS',       color: '#f97316', short: 'W', models: ['titan-text-express', 'titan-text-lite'] },
  custom:    { label: 'Custom',    color: '#8b5cf6', short: '?', models: ['custom'] },
};

export const LLMNode = ({ id, data }) => {
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
  const onEdgesChange   = useStore(state => state.onEdgesChange);
  const edges           = useStore(state => state.edges);

  const systemVars = extractVariables(systemPrompt);
  const userVars   = extractVariables(userQuery);
  const allVars    = [...new Map([...systemVars, ...userVars].map(v => [v, v])).values()];

  useStaleEdgeRemoval(id, allVars, edges, onEdgesChange);

  const handleSystemChange = (val) => { setSystemPrompt(val); updateNodeField(id, 'systemPrompt', val); };
  const handleUserChange   = (val) => { setUserQuery(val);    updateNodeField(id, 'userQuery',    val); };

  return (
    <NodeTemplate title={sel ? `LLM · ${sel.label}` : 'LLM'} icon={sel?.short || '◈'}
      category="AI" accentColor={color} fields={[]}
      handles={[{ type: 'source', position: Position.Right, id: `${id}-response` }]}
      minWidth={320}>

      {/* Model selector */}
      <div className="flex flex-col gap-1.5">
        <span className="field-label">Model</span>
        <div className="flex items-center gap-2">
          {provider === 'custom'
            ? <input type="text" value={customModel} onChange={e => setCustomModel(e.target.value)}
                placeholder="e.g. llama3:8b" className="field-input flex-1 text-[11px] font-mono" />
            : <select value={model} onChange={e => setModel(e.target.value)} className="field-select flex-1 text-[11px]">
                {(sel?.models || []).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
          }
          <button onClick={() => setShowParams(p => !p)}
            className={cn('px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-150',
              showParams ? '' : 'border-border text-muted hover:text-white')}
            style={showParams ? { borderColor: `${color}60`, background: `${color}20`, color } : {}}>
            ⚙ Params
          </button>
        </div>

        {showParams && (
          <div className="bg-canvas rounded-lg border border-border p-2.5 flex gap-3">
            <label className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between">
                <span className="field-label mb-0">Temperature</span>
                <span className="text-[10px] font-mono" style={{ color }}>{temperature}</span>
              </div>
              <input type="number" value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                min="0" max="2" step="0.1" className="field-input text-xs font-mono" />
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between">
                <span className="field-label mb-0">Max Tokens</span>
                <span className="text-[10px] font-mono" style={{ color }}>{maxTokens}</span>
              </div>
              <input type="number" value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))}
                min="256" max="8192" step="256" className="field-input text-xs font-mono" />
            </label>
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      <VariableTextField
        label="System Prompt"
        value={systemPrompt}
        onChange={handleSystemChange}
        placeholder="You are a helpful assistant... type {{ to insert an input"
        color={color}
      />

      <VariableTextField
        label="User Query"
        value={userQuery}
        onChange={handleUserChange}
        placeholder="Answer this question... type {{ to insert an input"
        color={color}
      />

      <VariableHandles nodeId={id} vars={allVars} color={color} />

      <div className="flex justify-end">
        <span className="text-[10px] font-mono font-semibold" style={{ color }}>response →</span>
      </div>
    </NodeTemplate>
  );
};