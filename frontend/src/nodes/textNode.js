// src/nodes/textNode.js
import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { useStore } from '../store';
import { extractVariables, useStaleEdgeRemoval } from '../lib/utils';
import { VariableTextField, VariableHandles } from '../components/variableField';

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '');

  const updateNodeField = useStore(state => state.updateNodeField);
  const onEdgesChange   = useStore(state => state.onEdgesChange);
  const edges           = useStore(state => state.edges);
  const variables       = extractVariables(currText);

  useStaleEdgeRemoval(id, variables, edges, onEdgesChange);

  const handleChange = (val) => {
    setCurrText(val);
    updateNodeField(id, 'text', val);
  };

  return (
    <NodeTemplate title="Text" icon="✦" category="Util" accentColor="#3b82f6"
      fields={[]} handles={[]} minWidth={240}>

      <VariableTextField
        label="Text"
        value={currText}
        onChange={handleChange}
        placeholder="Type text here... use {{ to insert an input"
        color="#3b82f6"
      />

      <Handle type="source" position={Position.Right} id={`${id}-output`}
        style={{ width: '10px', height: '10px', background: '#3b82f6', border: '2px solid #3b82f6', borderRadius: '50%' }} />
      <VariableHandles nodeId={id} vars={variables} color="#3b82f6" />
    </NodeTemplate>
  );
};