// nodes/conditionNode.js
import { useState, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { useStore } from '../store';
import { cn } from '../lib/utils';
 
const OPERATORS = [
  { value: 'equals',     label: '== Equals'      },
  { value: 'not_equals', label: '!= Not Equals'  },
  { value: 'contains',   label: 'Contains'       },
  { value: 'greater',    label: '> Greater Than' },
  { value: 'less',       label: '< Less Than'    },
  { value: 'exists',     label: 'Exists'         },
];
 
const DEFAULT_CONDITION = () => ({
  id:       Date.now(),
  operator: 'equals',
  value:    '',
});
 
// ── Single condition row ──────────────────────────────────────────────────────
const ConditionRow = ({ condition, index, nodeId, onUpdate, onRemove, canRemove, edges, nodes }) => {
  const inputHandleId = `${nodeId}-input-${condition.id}`;
 
  const connectedNode = useMemo(() => {
    const edge = edges.find(e => e.target === nodeId && e.targetHandle === inputHandleId);
    if (!edge) return null;
    return nodes.find(n => n.id === edge.source) || null;
  }, [edges, nodes, inputHandleId]);
 
  const connectedLabel = useMemo(() => {
    if (!connectedNode) return null;
    const nid    = connectedNode.id;
    const labels = {
      customInput: connectedNode.data?.name || connectedNode.id.replace('customInput-', 'input_'),
      text:        'Text',
      llm:         connectedNode.data?.defaultProvider ? `LLM · ${connectedNode.data.defaultProvider}` : 'LLM',
      transform:   'Transform',
      api:         'API',
      database:    'Database',
      supabase:    'Supabase',
      timer:       'Timer',
    };
    return labels[connectedNode.type] || `${connectedNode.type} (${nid})`;
  }, [connectedNode]);
 
  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-border bg-canvas relative">
 
      {/* Remove button */}
      {canRemove && (
        <button
          onClick={() => onRemove(condition.id)}
          className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center
                       rounded text-muted hover:text-rose-400 hover:bg-rose-500/10
                       text-[10px] transition-all duration-150"
        >
          ✕
        </button>
      )}
 
      {/* Input connection display */}
      <div className="flex flex-col gap-1">
        <span className="field-label">Input {index + 1}</span>
        <div className={cn(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-150',
          connectedNode ? 'border-rose-500/40 bg-rose-500/10' : 'border-border bg-surface'
        )}>
          <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0',
            connectedNode ? 'bg-emerald-400' : 'bg-border')} />
          <span className={cn('text-xs font-mono', connectedNode ? 'font-semibold text-white' : 'text-muted')}>
            {connectedNode ? connectedLabel : 'connect a node →'}
          </span>
        </div>
      </div>
 
      {/* Operator + Value */}
      <div className="flex gap-2">
        <select
          value={condition.operator}
          onChange={e => onUpdate(condition.id, 'operator', e.target.value)}
          className="field-select flex-1 text-[11px]"
        >
          {OPERATORS.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
        {condition.operator !== 'exists' && (
          <input
            type="text"
            value={condition.value}
            onChange={e => onUpdate(condition.id, 'value', e.target.value)}
            placeholder="value..."
            className="field-input flex-1 text-[11px]"
          />
        )}
      </div>
 
      {/* True/False output labels */}
      <div className="flex justify-end gap-3 text-[9px] font-mono font-semibold">
        <span className="text-emerald-400">true ↗</span>
        <span className="text-rose-400">false ↘</span>
      </div>
 
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id={inputHandleId}
        style={{ top: '50%', width: '10px', height: '10px',
          background: '#0f1117', border: '2px solid #f43f5e', borderRadius: '50%' }}
      />
 
      {/* True handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${nodeId}-true-${condition.id}`}
        style={{ top: '35%', width: '10px', height: '10px',
          background: '#10b981', border: '2px solid #10b981', borderRadius: '50%' }}
      />
 
      {/* False handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${nodeId}-false-${condition.id}`}
        style={{ top: '65%', width: '10px', height: '10px',
          background: '#f43f5e', border: '2px solid #f43f5e', borderRadius: '50%' }}
      />
    </div>
  );
};
 
// ── Main ConditionNode ────────────────────────────────────────────────────────
export const ConditionNode = ({ id, data }) => {
  const [conditions, setConditions] = useState(
    data?.conditions || [DEFAULT_CONDITION()]
  );
  const [logic, setLogic] = useState(data?.logic || 'AND');
 
  const edges = useStore(state => state.edges);
  const nodes = useStore(state => state.nodes);
 
  const addCondition = () => {
    setConditions(prev => [...prev, DEFAULT_CONDITION()]);
  };
 
  const removeCondition = (condId) => {
    setConditions(prev => prev.filter(c => c.id !== condId));
  };
 
  const updateCondition = (condId, field, value) => {
    setConditions(prev => prev.map(c => c.id === condId ? { ...c, [field]: value } : c));
  };
 
  return (
    <NodeTemplate
      id={id}
      title="Condition"
      icon="⋈"
      category="Logic"
      accentColor="#f43f5e"
      fields={[]}
      handles={[]}
      minWidth={260}
      style={{ overflow: 'visible' }}
    >
      {/* AND / OR toggle */}
      {conditions.length > 1 && (
        <div className="flex items-center gap-2 mb-1">
          <span className="field-label mb-0">Match</span>
          <div className="flex rounded-lg overflow-hidden border border-border">
            {['AND', 'OR'].map(op => (
              <button
                key={op}
                onClick={() => setLogic(op)}
                className={cn(
                  'px-3 py-1 text-[10px] font-bold transition-all duration-150',
                  logic === op
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'text-muted hover:text-white'
                )}
              >
                {op}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted">conditions</span>
        </div>
      )}
 
      {/* Condition rows */}
      <div className="flex flex-col gap-2">
        {conditions.map((condition, index) => (
          <ConditionRow
            key={condition.id}
            condition={condition}
            index={index}
            nodeId={id}
            onUpdate={updateCondition}
            onRemove={removeCondition}
            canRemove={conditions.length > 1}
            edges={edges}
            nodes={nodes}
          />
        ))}
      </div>
 
      {/* Add condition button */}
      <button
        onClick={addCondition}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                     border border-dashed border-border text-muted
                     hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/5
                     text-[11px] font-semibold transition-all duration-150 mt-1"
      >
        <span>+</span>
        <span>Add Condition</span>
      </button>
    </NodeTemplate>
  );
};