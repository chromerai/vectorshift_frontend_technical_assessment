// nodes/textNode.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { useStore } from '../store';
import { cn } from '../lib/utils';

const MIN_WIDTH  = 220;
const MIN_HEIGHT = 100;
const PADDING    = 32;
const HEADER_H   = 42;
const BODY_PAD   = 28;
const CHAR_WIDTH = 7.5;

const extractVariables = (text) => {
  const matches = [...text.matchAll(/\{\{(\w+)\}\}/g)];
  return [...new Map(matches.map((m) => [m[1], m[1]])).values()];
};

export const TextNode = ({ id, data }) => {
  const [currText,  setCurrText]  = useState(data?.text || '');
  const [nodeWidth, setNodeWidth] = useState(MIN_WIDTH);
  const [nodeHeight,setNodeHeight]= useState(MIN_HEIGHT);
  const [prevVars,  setPrevVars]  = useState([]);

  const updateNodeField = useStore(state => state.updateNodeField);
  const onEdgesChange   = useStore(state => state.onEdgesChange);
  const edges           = useStore(state => state.edges);

  const textareaRef = useRef(null);
  const variables   = extractVariables(currText);
  const newVars     = variables.filter(v => !prevVars.includes(v));

  // ── Auto-remove stale edges when variables change ──────────────────────────
  useEffect(() => {
    const currentHandleIds = variables.map(v => `${id}-${v}`);

    const staleEdges = edges.filter(e =>
      e.target === id &&
      e.targetHandle &&
      !currentHandleIds.includes(e.targetHandle)
    );

    if (staleEdges.length > 0) {
      onEdgesChange(staleEdges.map(e => ({ type: 'remove', id: e.id })));
    }
  }, [variables.join(',')]);

  // ── Resize ─────────────────────────────────────────────────────────────────
  const recalcSize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';

    const lines       = currText.split('\n');
    const longestLine = Math.max(...lines.map(l => l.length), 0);
    const newWidth    = Math.max((longestLine * CHAR_WIDTH) + PADDING + 32, MIN_WIDTH);

    const chipRowH  = variables.length > 0 ? 28 : 0;
    const newHeight = Math.max(el.scrollHeight + HEADER_H + BODY_PAD + chipRowH, MIN_HEIGHT);

    setNodeWidth(newWidth);
    setNodeHeight(newHeight);

    el.style.height = `${el.scrollHeight}px`;
  }, [currText, variables.length]);

  useEffect(() => {
    recalcSize();
    setPrevVars(variables);
  }, [currText]);

  useEffect(() => {
    recalcSize();
  }, []);

  // ── Handle text change — sync to store for validation ──────────────────────
  const handleTextChange = (e) => {
    const val = e.target.value;
    setCurrText(val);
    updateNodeField(id, 'text', val);
  };

  // ── Output handle ──────────────────────────────────────────────────────────
  const outputHandle = (
    <Handle
      type="source"
      position={Position.Right}
      id={`${id}-output`}
      style={{
        width: '10px', height: '10px',
        background: '#3b82f6',
        border: '2px solid #3b82f6',
        borderRadius: '50%',
      }}
    />
  );

  // ── Variable handles ───────────────────────────────────────────────────────
  const variableHandles = variables.map((varName, index) => {
    const topPercent = ((index + 1) / (variables.length + 1)) * 100;
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
          border: '2px solid #3b82f6',
          borderRadius: '50%',
          transition: 'top 0.2s ease',
        }}
      >
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2
                           text-[9px] font-mono font-bold
                           px-1.5 py-px rounded whitespace-nowrap pointer-events-none
                           text-blue-400 bg-blue-950 border border-blue-800">
          {varName}
        </span>
      </Handle>
    );
  });

  return (
    <NodeTemplate
      title="Text"
      icon="✦"
      category="Util"
      accentColor="#3b82f6"
      fields={[]}
      handles={[]}
      minWidth={nodeWidth}
      style={{
        minHeight: `${nodeHeight}px`,
        transition: 'min-width 0.1s ease, min-height 0.1s ease',
      }}
    >
      <label className="flex flex-col gap-1.5">

        {/* ── Label + hint ── */}
        <div className="flex items-center justify-between">
          <span className="field-label">Text</span>
          <span className="text-[9px] text-muted font-mono">
            use <span className="text-blue-400 font-bold">{'{{name}}'}</span> to add an input
          </span>
        </div>

        {/* ── Textarea ── */}
        <textarea
          ref={textareaRef}
          value={currText}
          onChange={handleTextChange}
          placeholder={'Type your text here...\nUse {{variable}} to create input handles\nPress Enter for new lines'}
          rows={1}
          className="field-textarea transition-all duration-100"
          style={{
            lineHeight: '20px',
            minHeight: '40px',
            overflow: 'hidden',
            resize: 'none',
          }}
        />

        {/* ── Variable chips ── */}
        {variables.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {variables.map((v) => (
              <span
                key={v}
                className={cn(
                  'var-chip font-mono border transition-all duration-300',
                  newVars.includes(v)
                    ? 'text-white bg-blue-500 border-blue-400 scale-110'
                    : 'text-blue-400 bg-blue-950 border-blue-800'
                )}
              >
                ⊕ {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}

        {/* ── Handle creation hint ── */}
        {variables.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg
                           bg-blue-500/5 border border-blue-500/20">
            <span className="text-blue-400 text-[10px]">←</span>
            <p className="text-[9px] text-blue-400/80 leading-relaxed">
              <span className="font-bold text-blue-400">{variables.length}</span>
              {' '}input handle{variables.length !== 1 ? 's' : ''} created on the left side
            </p>
          </div>
        )}

      </label>

      {outputHandle}
      {variableHandles}
    </NodeTemplate>
  );
};