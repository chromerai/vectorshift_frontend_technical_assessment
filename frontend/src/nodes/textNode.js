// src/nodes/textNode.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { useStore } from '../store';
import { extractVariables, useStaleEdgeRemoval } from '../lib/utils';
import { VarChips, VariableHandles } from '../components/variableField';

const MIN_WIDTH  = 220;
const MIN_HEIGHT = 100;
const CHAR_WIDTH = 7.5;

export const TextNode = ({ id, data }) => {
  const [currText,   setCurrText]   = useState(data?.text || '');
  const [nodeWidth,  setNodeWidth]  = useState(MIN_WIDTH);
  const [nodeHeight, setNodeHeight] = useState(MIN_HEIGHT);
  const [prevVars,   setPrevVars]   = useState([]);

  const updateNodeField = useStore(state => state.updateNodeField);
  const onEdgesChange   = useStore(state => state.onEdgesChange);
  const edges           = useStore(state => state.edges);

  const textareaRef = useRef(null);
  const variables   = extractVariables(currText);
  const newVars     = variables.filter(v => !prevVars.includes(v));

  useStaleEdgeRemoval(id, variables, edges, onEdgesChange);

  const recalcSize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const longestLine = Math.max(...currText.split('\n').map(l => l.length), 0);
    setNodeWidth(Math.max((longestLine * CHAR_WIDTH) + 64, MIN_WIDTH));
    setNodeHeight(Math.max(el.scrollHeight + 70 + (variables.length > 0 ? 28 : 0), MIN_HEIGHT));
    el.style.height = `${el.scrollHeight}px`;
  }, [currText, variables.length]);

  useEffect(() => { recalcSize(); setPrevVars(variables); }, [currText]);
  useEffect(() => { recalcSize(); }, []);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
    updateNodeField(id, 'text', e.target.value);
  };

  return (
    <NodeTemplate title="Text" icon="✦" category="Util" accentColor="#3b82f6"
      fields={[]} handles={[]} minWidth={nodeWidth}
      style={{ minHeight: `${nodeHeight}px`, transition: 'min-width 0.1s ease, min-height 0.1s ease' }}>

      <label className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="field-label">Text</span>
          <span className="text-[9px] text-muted font-mono">
            use <span className="text-blue-400 font-bold">{'{{name}}'}</span> to add an input
          </span>
        </div>
        <textarea ref={textareaRef} value={currText} onChange={handleTextChange}
          placeholder={'Type text here...\nUse {{variable}} to create input handles'}
          rows={1} className="field-textarea transition-all duration-100"
          style={{ lineHeight: '20px', minHeight: '40px', overflow: 'hidden', resize: 'none' }} />
        <VarChips vars={variables} color="#3b82f6" />
      </label>

      <Handle type="source" position={Position.Right} id={`${id}-output`}
        style={{ width: '10px', height: '10px', background: '#3b82f6', border: '2px solid #3b82f6', borderRadius: '50%' }} />
      <VariableHandles nodeId={id} vars={variables} color="#3b82f6" />
    </NodeTemplate>
  );
};