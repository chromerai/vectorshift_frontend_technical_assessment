// src/components/VariableField.js
// Shared components for nodes that support {{variable}} syntax
import { useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '../lib/utils';

// ── Auto-resizing textarea ────────────────────────────────────────────────────
export const AutoTextarea = ({ value, onChange, placeholder, minHeight = 56 }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={2}
      className="field-textarea w-full"
      style={{ minHeight: `${minHeight}px`, lineHeight: '20px', resize: 'none', overflow: 'hidden' }}
    />
  );
};

// ── Variable chips ────────────────────────────────────────────────────────────
export const VarChips = ({ vars, color = '#6366f1' }) => {
  if (!vars.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {vars.map(v => (
        <span key={v}
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border"
          style={{ color, background: `${color}15`, borderColor: `${color}30` }}>
          {`{{${v}}}`}
        </span>
      ))}
    </div>
  );
};

// ── Variable handles (left side) ─────────────────────────────────────────────
export const VariableHandles = ({ nodeId, vars, color = '#6366f1' }) => {
  return vars.map((varName, index) => {
    const topPercent = ((index + 1) / (vars.length + 1)) * 100;
    return (
      <Handle
        key={`${nodeId}-${varName}`}
        type="target"
        position={Position.Left}
        id={`${nodeId}-${varName}`}
        style={{
          top: `${topPercent}%`,
          width: '10px', height: '10px',
          background: '#0f1117',
          border: `2px solid ${color}`,
          borderRadius: '50%',
          transition: 'top 0.2s ease',
        }}
      >
        <span
          className="absolute right-3.5 top-1/2 -translate-y-1/2
                       text-[9px] font-mono font-bold px-1.5 py-px rounded
                       whitespace-nowrap pointer-events-none"
          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {varName}
        </span>
      </Handle>
    );
  });
};

// ── Variable field — label + textarea + chips combined ───────────────────────
export const VariableTextField = ({ label, value, onChange, placeholder, vars, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="field-label">{label}</span>
      <span className="text-[9px] text-muted font-mono">
        {'{{var}}'} for inputs
      </span>
    </div>
    <AutoTextarea value={value} onChange={onChange} placeholder={placeholder} />
    <VarChips vars={vars} color={color} />
  </div>
);