// src/nodes/textNode.js
import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { useStore } from '../store';
import { extractVariables, useStaleEdgeRemoval } from '../lib/utils';
import { VariableTextField, VariableHandles } from '../components/variableField';

export const TextNode = ({ id, data }) => {
  const [variables, setVariables] = useState(() => extractVariables(data?.text || ''));

  const updateNodeInternals = useUpdateNodeInternals();
  const updateNodeField = useStore(state => state.updateNodeField);

  const onEdgesChange = useStore(state => state.onEdgesChange);
  const edges         = useStore(state => state.edges);

  const handleChange = (val) => {
    setVariables(extractVariables(val));
    updateNodeField(id, 'text', val);
  };

  useStaleEdgeRemoval(id, variables, edges, onEdgesChange);

  useEffect(() => {
    updateNodeInternals(id);
  }, [variables]);

  return (
    <NodeTemplate id={id} title="Text" icon="✦" category="Util" accentColor="#3b82f6"
      fields={[]} handles={[]} minWidth={240}
      style={{ overflow: 'visible' }}>

      <VariableTextField
        label="Text"
        value={data?.text || ''}
        onChange={handleChange}
        placeholder="Type text here... use {{ to insert an input"
        color="#3b82f6"
        nodeId={id}
      />

      <Handle type="target" position={Position.Left} id={`${id}-input`}
        style={{ top: '15%', width: '10px', height: '10px',
          background: '#0f1117', border: '2px solid #3b82f6', borderRadius: '50%' }} />

      <Handle type="source" position={Position.Right} id={`${id}-output`}
        style={{ width: '10px', height: '10px', background: '#3b82f6',
          border: '2px solid #3b82f6', borderRadius: '50%' }} />
      <VariableHandles nodeId={id} vars={variables} color="#3b82f6" />
    </NodeTemplate>
  );
};