// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useEffect } from 'react';

// ── Tailwind class merger ─────────────────────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ── Extract {{variables}} from text ──────────────────────────────────────────
export const extractVariables = (text) => {
  const matches = [...text.matchAll(/\{\{(\w+)\}\}/g)];
  return [...new Map(matches.map(m => [m[1], m[1]])).values()];
};

// ── Validate {{variables}} against connected Input nodes ─────────────────────
export const validateVariables = (nodeId, texts, edges, nodes, nodeLabel) => {
  const errors    = [];
  const combined  = texts.join(' ');
  const uniqueVars = [...new Set([...combined.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]))];

  uniqueVars.forEach(varName => {
    const expectedHandle = `${nodeId}-${varName}`;
    const connectedEdge  = edges.find(e => e.target === nodeId && e.targetHandle === expectedHandle);

    if (!connectedEdge) {
      errors.push({ nodeId, variable: varName, reason: `No input connected to {{${varName}}} in ${nodeLabel}` });
      return;
    }

    const sourceNode = nodes.find(n => n.id === connectedEdge.source);
    if (!sourceNode || sourceNode.type !== 'customInput') {
      errors.push({ nodeId, variable: varName, reason: `{{${varName}}} in ${nodeLabel} must be connected to an Input node` });
      return;
    }

    const inputName = sourceNode.data?.inputName || sourceNode.id.replace('customInput-', 'input_');
    if (inputName !== varName) {
      errors.push({ nodeId, variable: varName, reason: `Input node is named "${inputName}" but must be named "${varName}" to match {{${varName}}} in ${nodeLabel}` });
    }
  });

  return errors;
};

// ── Remove stale edges when variable handles change ───────────────────────────
export const useStaleEdgeRemoval = (nodeId, activeVars, edges, onEdgesChange) => {
  useEffect(() => {
    const currentHandleIds = activeVars.map(v => `${nodeId}-${v}`);
    const staleEdges = edges.filter(e =>
      e.target === nodeId && e.targetHandle && !currentHandleIds.includes(e.targetHandle)
    );
    if (staleEdges.length > 0) {
      onEdgesChange(staleEdges.map(e => ({ type: 'remove', id: e.id })));
    }
  }, [activeVars.join(',')]);
};