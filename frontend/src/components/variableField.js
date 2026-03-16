// src/components/VariableField.js
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { createEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { useStore } from '../store';
import { Portal } from '../lib/Portal';
import {
  MENTION_TYPE,
  withMentions,
  insertMention,
  serializeToText,
  deserializeFromText,
  detectMentionTrigger,
} from '../lib/slateUtils';

// ── Mention chip ──────────────────────────────────────────────────────────────
// AFTER:
const MentionChip = ({ attributes, children, element, color }) => {
  const nodes = useStore(state => state.nodes);
  
  // Find the input node by its id-based name (element.character = input_1 etc)
  const inputNode = nodes.find(n => 
    n.id.replace('customInput-', 'input_') === element.character
  );
  
  // Show current name if it exists, otherwise fall back to character
  const displayName = inputNode?.data?.name || element.character;

  return (
    <span
      {...attributes}
      contentEditable={false}
      className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-px rounded
                   font-mono text-[11px] font-bold select-none cursor-default"
      style={{ background: `${color}20`, border: `1px solid ${color}50`, color, verticalAlign: 'middle' }}
    >
      <span contentEditable={false}>
        {displayName}
        {children}
      </span>
    </span>
  );
};

// ── Slate editor ──────────────────────────────────────────────────────────────
const SlateEditor = ({ value, onChange, placeholder, color = '#6366f1', minHeight = 56, nodeId }) => {
  const dropdownRef   = useRef(null);
  const editableRef   = useRef(null);
  const [target,      setTarget]      = useState(null);
  const [search,      setSearch]      = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const nodes         = useStore(state => state.nodes);
  const edges         = useStore(state => state.edges);
  const onConnect     = useStore(state => state.onConnect);

  const inputNodes = useMemo(() =>
    nodes.filter(n => n.type === 'customInput'), [nodes]);

  const suggestions = useMemo(() =>
    inputNodes.filter(n => {
        const displayName = n.data?.name || n.id.replace('customInput-', 'input_');
        return displayName.toLowerCase().startsWith(search.toLowerCase());
    }).slice(0, 8),
    [inputNodes, search]
    );


  const editor = useMemo(() =>
    withMentions(withHistory(withReact(createEditor()))), []);

  const [slateValue, setSlateValue] = useState(() => deserializeFromText(value));
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      editor.children = deserializeFromText(value);
      editor.onChange();
    }
  }, [value]);

  // Position dropdown below cursor
  useEffect(() => {
    if (target && dropdownRef.current) {
      try {
        const domRange = ReactEditor.toDOMRange(editor, target);
        const rect     = domRange.getBoundingClientRect();
        dropdownRef.current.style.top  = `${rect.top  + window.pageYOffset + 24}px`;
        dropdownRef.current.style.left = `${rect.left + window.pageXOffset}px`;
      } catch (e) {}
    }
  }, [suggestions.length, editor, activeIndex, search, target]);

  // ── Auto-create edge using single center handle ───────────────────────────
  const createEdgeForMention = useCallback((varName, sourceNode) => {
    if (!sourceNode || !nodeId) return;

    const sourceHandle = `${sourceNode.id}-value`;
    const targetHandle = `${nodeId}-${varName}`;// single handle for ALL vars

    // Check duplicate by source + targetHandle combination
    const exists = edges.some(e =>
      e.source       === sourceNode.id &&
      e.target       === nodeId &&
      e.sourceHandle === sourceHandle &&
      e.targetHandle === targetHandle
    );
    if (exists) return;

    onConnect({ 
        source: sourceNode.id, sourceHandle, 
        target: nodeId, targetHandle, 
        data: { isVariableEdge: true }, 
        type: 'default', animated: false, 
        style: { stroke: color, strokeWidth: 2
        }});
  }, [nodeId, edges, onConnect]);

  // ── Handle mention selection ──────────────────────────────────────────────
  const handleSelect = useCallback((node) => {
    const varName = node.id.replace('customInput-', 'input_');
    insertMention(editor, varName, target);
    createEdgeForMention(varName, node);  // no setTimeout needed — single static handle
    setTarget(null);
    ReactEditor.focus(editor);

    setTimeout(() => {
        createEdgeForMention(varName, node);
    }, 10);
  }, [editor, target, createEdgeForMention]);

  // ── Editor change ─────────────────────────────────────────────────────────
  const handleChange = (newValue) => {
    setSlateValue(newValue);
    const plain = serializeToText(newValue);
    prevValue.current = plain;
    onChange(plain);
    const result = detectMentionTrigger(editor);
    if (result) { setTarget(result.target); setSearch(result.search); setActiveIndex(0); }
    else setTarget(null);
  };

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const onKeyDown = useCallback((e) => {
    if (!target || suggestions.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => i >= suggestions.length - 1 ? 0 : i + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => i <= 0 ? suggestions.length - 1 : i - 1);
        break;
      case 'Tab':
      case 'Enter':
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setTarget(null);
        break;
      default:
        break;
    }
  }, [target, suggestions, activeIndex, handleSelect]);

  const renderElement = useCallback((props) => {
    if (props.element.type === MENTION_TYPE)
      return <MentionChip {...props} color={color} />;
    return <p {...props.attributes} className="m-0">{props.children}</p>;
  }, [color]);

  const renderLeaf = useCallback(props => (
    <span {...props.attributes}>{props.children}</span>
  ), []);

  return (
    <div className="relative">
      <Slate editor={editor} initialValue={slateValue} onChange={handleChange}>
        <Editable
          ref={editableRef}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="field-textarea w-full"
          style={{ minHeight: `${minHeight}px`, lineHeight: '22px', outline: 'none', wordBreak: 'break-word' }}
        />

        {target && (
          <Portal>
            <div
              ref={dropdownRef}
              style={{ top: '-9999px', left: '-9999px', position: 'absolute', zIndex: 9999 }}
              className="bg-surface border border-border rounded-xl shadow-node overflow-hidden min-w-[180px]"
            >
              <div className="px-3 py-1.5 border-b border-border">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Input Nodes
                </span>
              </div>
              {suggestions.length === 0 ? (
                <p className="text-[11px] text-muted px-3 py-2">No input nodes found</p>
              ) : (
                suggestions.map((node, i) => {
                  const name = node.data?.name || node.id.replace('customInput-', 'input_');
                  const type = node.data?.inputType || 'Text';
                  return (
                    <div key={node.id}
                      onMouseDown={e => { e.preventDefault(); handleSelect(node); }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
                      style={{ background: i === activeIndex ? `${color}15` : 'transparent' }}
                    >
                      <span className="text-xs font-mono font-semibold"
                        style={{ color: i === activeIndex ? color : '#9ca3c8' }}>
                        {name}
                      </span>
                      <span className="text-[9px] px-1.5 py-px rounded-full font-semibold ml-2"
                        style={{ background: `${color}20`, color }}>
                        {type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Portal>
        )}
      </Slate>
    </div>
  );
};

// ── Single center handle for ALL variables ────────────────────────────────────
export const VariableHandles = ({ nodeId, vars, color = '#6366f1' }) => {
  if (!vars.length) return null;
  return vars.map((varName, index) => (
    <Handle
      key={`${nodeId}-${varName}`}
      type="target"
      position={Position.Left}
      id={`${nodeId}-${varName}`}
      isConnectable={false}
      style={{
        top:          `calc(50% + ${index}px)`,
        width:        '10px',
        height:       '10px',
        background:   '#0f1117',
        border:       `2px solid ${color}`,
        borderRadius: '0px',
      }}
    />
  ));
};

// ── VariableTextField ─────────────────────────────────────────────────────────
export const VariableTextField = ({ label, value, onChange, placeholder, color, nodeId }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="field-label">{label}</span>
      <span className="text-[9px] text-muted font-mono">
        type <span className="font-bold" style={{ color }}>{'{{'}</span> for inputs
      </span>
    </div>
    <SlateEditor value={value} onChange={onChange} placeholder={placeholder}
      color={color} nodeId={nodeId} />
  </div>
);