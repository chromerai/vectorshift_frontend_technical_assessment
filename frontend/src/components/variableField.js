// src/components/VariableField.js
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { createEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { useStore } from '../store';
import {
  MENTION_TYPE,
  serializeToText,
  deserializeFromText,
  insertMention,
  isAfterDoubleBrace,
} from '../lib/slateUtils';

// ── Mention chip — rendered inline inside the editor ─────────────────────────
const MentionChip = ({ attributes, children, element, inputNodes, color }) => {
  const inputNode = inputNodes.find(n => {
    const name = n.data?.inputName || n.id.replace('customInput-', 'input_');
    return name === element.varName;
  });
  const typeName = inputNode?.data?.inputType || 'Text';

  return (
    <span
      {...attributes}
      contentEditable={false}
      className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-px rounded font-mono text-[11px] font-bold select-none"
      style={{
        background: `${color}20`,
        border: `1px solid ${color}50`,
        color,
        verticalAlign: 'middle',
      }}
    >
      {element.varName}
      <span className="text-[9px] opacity-60 font-normal">· {typeName}</span>
      {children}
    </span>
  );
};

// ── Autocomplete dropdown ─────────────────────────────────────────────────────
const MentionDropdown = ({ inputNodes, onSelect, color }) => {
  if (!inputNodes.length) return (
    <div className="absolute z-50 mt-1 bg-surface border border-border rounded-lg shadow-node p-2">
      <p className="text-[11px] text-muted px-2">No Input nodes found</p>
    </div>
  );

  return (
    <div className="absolute z-50 mt-1 bg-surface border border-border rounded-lg shadow-node overflow-hidden min-w-[180px]">
      <div className="px-2 py-1.5 border-b border-border">
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Input Nodes</span>
      </div>
      {inputNodes.map(node => {
        const name = node.data?.inputName || node.id.replace('customInput-', 'input_');
        const type = node.data?.inputType || 'Text';
        return (
          <button
            key={node.id}
            onMouseDown={e => { e.preventDefault(); onSelect(name); }}
            className="w-full flex items-center justify-between px-3 py-2
                         hover:bg-white/5 transition-colors text-left"
          >
            <span className="text-xs font-mono font-semibold text-white">{name}</span>
            <span className="text-[9px] px-1.5 py-px rounded-full font-semibold ml-2"
              style={{ background: `${color}20`, color }}>
              {type}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ── Slate editor with mention support ────────────────────────────────────────
const SlateEditor = ({ value, onChange, placeholder, color = '#6366f1', minHeight = 56 }) => {
  const inputNodes = useStore(state => state.nodes.filter(n => n.type === 'customInput'));
  const [showDropdown, setShowDropdown] = useState(false);
  const editorRef  = useRef(null);
  const editor     = useMemo(() => withHistory(withReact(createEditor())), []);
  const [slateValue, setSlateValue] = useState(() => deserializeFromText(value));
  const prevValue  = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      editor.children = deserializeFromText(value);
      editor.onChange();
    }
  }, [value]);

  const handleChange = (newValue) => {
    setSlateValue(newValue);
    const plain = serializeToText(newValue);
    prevValue.current = plain;
    onChange(plain);
    setShowDropdown(isAfterDoubleBrace(editor));
  };

  const handleSelect = (varName) => {
    insertMention(editor, varName);
    setShowDropdown(false);
    ReactEditor.focus(editor);
  };

  const renderElement = useCallback((props) => {
    if (props.element.type === MENTION_TYPE) {
      return <MentionChip {...props} inputNodes={inputNodes} color={color} />;
    }
    return <p {...props.attributes} className="m-0">{props.children}</p>;
  }, [inputNodes, color]);

  const renderLeaf = useCallback((props) => (
    <span {...props.attributes}>{props.children}</span>
  ), []);

  return (
    <div className="relative" ref={editorRef}>
      <Slate editor={editor} initialValue={slateValue} onChange={handleChange}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={placeholder}
          onKeyDown={e => e.key === 'Escape' && setShowDropdown(false)}
          className="field-textarea w-full"
          style={{ minHeight: `${minHeight}px`, lineHeight: '22px', outline: 'none', wordBreak: 'break-word' }}
        />
      </Slate>
      {showDropdown && (
        <MentionDropdown inputNodes={inputNodes} onSelect={handleSelect} color={color} />
      )}
    </div>
  );
};

// ── Variable handles (left side) ─────────────────────────────────────────────
export const VariableHandles = ({ nodeId, vars, color = '#6366f1' }) =>
  vars.map((varName, index) => {
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

// ── VariableTextField — label + hint + SlateEditor ────────────────────────────
// Used by both textNode and llmNode
export const VariableTextField = ({ label, value, onChange, placeholder, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="field-label">{label}</span>
      <span className="text-[9px] text-muted font-mono">
        type <span className="font-bold" style={{ color }}>{'{{'}</span> for inputs
      </span>
    </div>
    <SlateEditor value={value} onChange={onChange} placeholder={placeholder} color={color} />
  </div>
);