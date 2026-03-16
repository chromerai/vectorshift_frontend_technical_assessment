// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      console.log("connection: " +  JSON.stringify(connection))

      const sourceNode = get().nodes.find(n => n.id === connection.source);
      const targetNode = get().nodes.find(n => n.id === connection.target);
      const isVar = connection.data?.isVariableEdge;
      
      if (sourceNode?.type === 'customInput' && 
          !isVar &&
          (targetNode?.type === 'text' || targetNode?.type === 'llm')) return;
      set({
        edges: addEdge({
          ...connection,
          type:      isVar ? 'default' : 'smoothstep',  // curved for var, smoothstep for others
          animated:  isVar ? false : true,               // solid for var, dashed for others
          deletable: isVar ? false : true,
          style:     isVar ? { stroke: connection.style?.stroke || '#6366f1', strokeWidth: 2 } : { stroke: '#818cf8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
        }, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            // Create a NEW node object — don't mutate the existing one
            return { ...node, data: { ...node.data, [fieldName]: fieldValue } };
          }
          return node;
        }),
      });
    },

    deleteNode: (nodeId) => {
      set({
        nodes: get().nodes.filter((node) => node.id !== nodeId),
        edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      });
    },
  }));
