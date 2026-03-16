// ui.js
import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode }     from './nodes/inputNode';
import { LLMNode }       from './nodes/llmNode';
import { OutputNode }    from './nodes/outputNode';
import { TextNode }      from './nodes/textNode';
import { APINode }       from './nodes/apiNode';
import { ConditionNode } from './nodes/conditionNode';
import { TransformNode } from './nodes/transformNode';
import { NoteNode }      from './nodes/noteNode';
import { TimerNode }     from './nodes/timerNode';
import { DatabaseNode } from './nodes/dataBaseNode';
import { SupabaseNode } from './nodes/supaBaseNode';

import 'reactflow/dist/style.css';

const gridSize   = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
  customInput:  InputNode,
  llm:          LLMNode,
  customOutput: OutputNode,
  text:         TextNode,
  api:          APINode,
  condition:    ConditionNode,
  transform:    TransformNode,
  note:         NoteNode,
  timer:        TimerNode,
  database:     DatabaseNode,
  supabase:     SupabaseNode,
};

const NODE_COLORS = {
  customInput:  '#10b981',
  llm:          '#6366f1',
  customOutput: '#f59e0b',
  text:         '#3b82f6',
  api:          '#0ea5e9',
  condition:    '#f43f5e',
  transform:    '#8b5cf6',
  note:         '#facc15',
  timer:        '#f97316',
  database:     '#06b6d4',
  supabase:     '#3ecf8e',
};

const selector = (state) => ({
  nodes:         state.nodes,
  edges:         state.edges,
  getNodeID:     state.getNodeID,
  addNode:       state.addNode,
  deleteNode:    state.deleteNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect:     state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper    = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode,      setSelectedNode]      = useState(null);

  const {
    nodes, edges,
    getNodeID, addNode, deleteNode,
    onNodesChange, onEdgesChange, onConnect,
  } = useStore(selector, shallow);

  const getInitNodeData = (nodeID, type) => ({ id: nodeID, nodeType: type });

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const raw    = event?.dataTransfer?.getData('application/reactflow');
    if (!raw) return;

    const { nodeType: type, defaultProvider } = JSON.parse(raw);
    if (!type) return;

    const position = reactFlowInstance.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const nodeID = getNodeID(type);
    addNode({ id: nodeID, type, position, data: { ...getInitNodeData(nodeID, type), defaultProvider } });
  }, [reactFlowInstance]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Track which node is selected
  const onSelectionChange = useCallback(({ nodes: selected }) => {
    setSelectedNode(selected.length === 1 ? selected[0] : null);
  }, []);

  // Delete selected node + its connected edges
  const handleDelete = useCallback(() => {
    if (!selectedNode) return;
    deleteNode(selectedNode.id);
    setSelectedNode(null);
  }, [selectedNode, deleteNode]);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100%' }}
      className="relative"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        deleteKeyCode="Delete"
        edgesFocusable={true}
        defaultEdgeOptions={{
          style: { stroke: '#6366f1', strokeWidth: 2 },
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#2e3250"
          gap={gridSize}
          size={1.5}
        />
        <Controls />
        <MiniMap
          nodeColor={(n) => NODE_COLORS[n.type] || '#4b5280'}
          maskColor="rgba(15,17,23,0.75)"
          style={{ borderRadius: '10px',}}
        />
      </ReactFlow>

      {/* ── Delete button — only shows when a node is selected ── */}
      {selectedNode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10
                         flex items-center gap-2
                         bg-surface border border-border
                         rounded-xl px-3 py-2 shadow-node">
          <span className="text-xs text-soft font-medium">
            Selected: <span className="text-white font-semibold">{selectedNode.type}</span>
          </span>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg
                       bg-rose-500/10 border border-rose-500/30 text-rose-400
                       text-xs font-semibold
                       hover:bg-rose-500/20 hover:border-rose-500/60
                       transition-all duration-150
                       active:scale-95"
          >
            <span>✕</span>
            <span>Delete Node</span>
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center
                         pointer-events-none select-none gap-3">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border
                           flex items-center justify-center text-3xl opacity-40">
            V
          </div>
          <p className="text-sm font-semibold text-muted">Drag nodes to build your pipeline</p>
          <p className="text-xs text-muted/60">Connect nodes to define the data flow</p>
        </div>
      )}
    </div>
  );
};