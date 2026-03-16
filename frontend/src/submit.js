// submit.js
import { useStore } from './store';
import { PipelineResult } from './pipeLineResult';
import { shallow } from 'zustand/shallow';
import { useState, useMemo } from 'react';
import { cn } from './lib/utils';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

// ── Runner Modal ──────────────────────────────────────────────────────────────
const RunnerModal = ({ inputNodes, validationErrors, onClose, onRun, loading }) => {
  const [inputValues, setInputValues] = useState(() => {
    const init = {};
    inputNodes.forEach(n => {
      const name = n.data?.inputName || n.id.replace('customInput-', 'input_');
      init[n.id] = { name, type: n.data?.inputType || 'Text', value: '' };
    });
    return init;
  });


  const updateValue = (id, value) => {
    setInputValues(prev => ({ ...prev, [id]: { ...prev[id], value } }));
  };

  const allFilled  = Object.values(inputValues).every(v => v.value.trim() !== '');
  const hasInputs  = inputNodes.length > 0;
  const hasErrors  = validationErrors.length > 0;

  // Block run if there are validation errors OR inputs not filled
  const canRun = !hasErrors && (!hasInputs || allFilled);

  const TYPE_ICON = {
    Text: '✦', File: '⊞', Image: '◫',
    Audio: '◉', Number: '#', Boolean: '⊙',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-[500px] shadow-node overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm border',
              hasErrors
                ? 'bg-rose-500/20 border-rose-500/30'
                : 'bg-accent/20 border-accent/30'
            )}>
              {hasErrors ? '⚠' : '▶'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Run Pipeline</h3>
              <p className="text-[11px] text-muted mt-0.5">
                {hasErrors
                  ? `${validationErrors.length} issue${validationErrors.length !== 1 ? 's' : ''} must be fixed before running`
                  : hasInputs
                    ? `Provide values for ${inputNodes.length} input node${inputNodes.length !== 1 ? 's' : ''}`
                    : 'No input nodes — pipeline will run immediately'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white text-lg transition-colors">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">

          {/* ── Validation errors section ── */}
          {hasErrors && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Pipeline Issues
                </span>
                <div className="flex-1 h-px bg-rose-500/20" />
                <span className="text-[10px] text-rose-400 font-bold">
                  {validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}
                </span>
              </div>

              {validationErrors.map((err, i) => (
                <div key={i}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg
                               bg-rose-500/5 border border-rose-500/25">
                  <span className="text-rose-400 text-xs mt-px flex-shrink-0">⚠</span>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] text-rose-300 font-semibold">
                      Variable{' '}
                      <span className="font-mono bg-rose-500/20 px-1.5 py-px rounded text-rose-200">
                        {`{{${err.variable}}}`}
                      </span>
                      {' '}is not connected
                    </p>
                    <p className="text-[10px] text-rose-400/70">
                      Connect an Input node to the{' '}
                      <span className="font-mono">{err.variable}</span>{' '}
                      handle on the Text node, or remove the variable from the text.
                    </p>
                  </div>
                </div>
              ))}

              {/* Divider between errors and inputs */}
              {hasInputs && <div className="h-px bg-border mt-1" />}
            </div>
          )}

          {/* ── Input fields section ── */}
          {!hasInputs && !hasErrors ? (
            <div className="flex items-start gap-2 px-3 py-3 rounded-lg bg-accent/5 border border-accent/20">
              <span className="text-sm mt-px">💡</span>
              <p className="text-[11px] text-soft leading-relaxed">
                This pipeline has no Input nodes. The pipeline structure will be
                analysed and validated without any input data.
              </p>
            </div>
          ) : hasInputs ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Input Values
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {Object.entries(inputValues).map(([id, input]) => {
                const isEmpty = input.value.trim() === '';
                return (
                  <div key={id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-400">
                          {TYPE_ICON[input.type] || '✦'}
                        </span>
                        <span className="text-xs font-semibold text-white font-mono">
                          {input.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-px rounded-full font-semibold"
                          style={{ background: '#10b98120', color: '#10b981' }}>
                          {input.type}
                        </span>
                      </div>
                      {isEmpty
                        ? <span className="text-[9px] text-rose-400 font-semibold">required</span>
                        : <span className="text-[9px] text-emerald-400 font-semibold">✓ filled</span>
                      }
                    </div>

                    {input.type === 'Text' ? (
                      <textarea
                        value={input.value}
                        onChange={e => updateValue(id, e.target.value)}
                        placeholder={`Enter value for ${input.name}...`}
                        rows={2}
                        className={cn(
                          'field-textarea text-xs transition-all duration-150',
                          isEmpty ? 'border-rose-500/30' : 'border-emerald-500/30'
                        )}
                      />
                    ) : (
                      <input
                        type={input.type === 'Number' ? 'number' : 'text'}
                        value={input.value}
                        onChange={e => updateValue(id, e.target.value)}
                        placeholder={`Enter ${input.type.toLowerCase()} for ${input.name}...`}
                        className={cn(
                          'field-input text-xs transition-all duration-150',
                          isEmpty ? 'border-rose-500/30' : 'border-emerald-500/30'
                        )}
                      />
                    )}
                  </div>
                );
              })}

              {/* All filled banner */}
              {!hasErrors && allFilled && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                                 bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <p className="text-[11px] text-emerald-400">
                    All inputs provided — ready to run
                  </p>
                </div>
              )}

              {/* Not all filled banner */}
              {!hasErrors && hasInputs && !allFilled && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                                 bg-rose-500/5 border border-rose-500/20">
                  <span className="text-rose-400 text-xs">⚠</span>
                  <p className="text-[11px] text-rose-400">
                    All inputs must be filled before running
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-muted
                         hover:text-white border border-border transition-all duration-150">
            Cancel
          </button>

          <button
            onClick={() => onRun(inputValues)}
            disabled={loading || !canRun}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold',
              'bg-accent text-white transition-all duration-150',
              'hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-glow',
              'active:translate-y-0 active:scale-[0.98]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'disabled:hover:translate-y-0 disabled:hover:shadow-none'
            )}
          >
            {loading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analysing...</span>
              </>
            ) : (
              <>
                <span className="text-xs">▶</span>
                <span>Run Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Submit Button ─────────────────────────────────────────────────────────────
export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);

  const inputNodes = useMemo(() =>
    nodes.filter(n => n.type === 'customInput'),
    [nodes]
  );

  // ── Validation ──────────────────────────────────────────────────────────────
  const validationErrors = useMemo(() => {
  const errors = [];
  const textNodes = nodes.filter(n => n.type === 'text');

  textNodes.forEach(node => {
    const text       = node.data?.text || '';
    const vars       = [...text.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
    const uniqueVars = [...new Set(vars)];

    uniqueVars.forEach(varName => {
      const expectedHandle = `${node.id}-${varName}`;
      const connectedEdge  = edges.find(
        e => e.target === node.id && e.targetHandle === expectedHandle
      );

      if (!connectedEdge) {
        errors.push({ nodeId: node.id, variable: varName,
          reason: `No input node connected to {{${varName}}}` });
        return;
      }

      const sourceNode = nodes.find(n => n.id === connectedEdge.source);
      if (!sourceNode || sourceNode.type !== 'customInput') {
        errors.push({ nodeId: node.id, variable: varName,
          reason: `{{${varName}}} must be connected to an Input node` });
        return;
      }

      const inputName = sourceNode.data?.inputName
        || sourceNode.id.replace('customInput-', 'input_');

      if (inputName !== varName) {
        errors.push({ nodeId: node.id, variable: varName,
          reason: `Input node is named "${inputName}" but must be named "${varName}"` });
      }
    });
  });

  return errors;
}, [nodes, edges]);

  // ── Open modal ──────────────────────────────────────────────────────────────
  const handleButtonClick = () => {
  if (nodes.length === 0) return;
  console.log('edges:', JSON.stringify(edges, null, 2));
  console.log('text nodes:', nodes.filter(n => n.type === 'text').map(n => n.data));
  setShowModal(true);
};

  // ── Run ─────────────────────────────────────────────────────────────────────
  const handleRun = async (inputValues) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, inputs: inputValues }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const { num_nodes, num_edges, is_dag } = await response.json();

      setResult({ num_nodes, num_edges, is_dag });
      setShowModal(false);
    } catch (err) {
      alert(`Failed to reach the backend.\n\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <footer className="h-14 flex items-center justify-between px-5 py-3
                          bg-surface border-t border-border flex-shrink-0 z-10 relative
                          shadow-[0_-1px_0_rgba(255,255,255,0.04)]">

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-soft font-medium">
              {nodes.length} node{nodes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-light" />
            <span className="text-[11px] text-soft font-medium">
              {edges.length} edge{edges.length !== 1 ? 's' : ''}
            </span>
          </div>
          {inputNodes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-soft font-medium">
                {inputNodes.length} input{inputNodes.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {/* Validation error indicator in footer */}
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[11px] text-rose-400 font-medium">
                {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Run button */}
        <button
          onClick={handleButtonClick}
          disabled={nodes.length === 0}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold',
            'text-white tracking-wide transition-all duration-150',
            validationErrors.length > 0
              ? 'bg-rose-500 hover:bg-rose-600'
              : 'bg-accent hover:bg-accent-dark hover:shadow-glow',
            'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'disabled:hover:translate-y-0 disabled:hover:shadow-none'
          )}
        >
          <span className="text-xs">
            {validationErrors.length > 0 ? '⚠' : '▶'}
          </span>
          <span>
            {validationErrors.length > 0 ? 'Fix Issues' : 'Run Pipeline'}
          </span>
        </button>
      </footer>

      {showModal && (
        <RunnerModal
          inputNodes={inputNodes}
          validationErrors={validationErrors}
          onClose={() => setShowModal(false)}
          onRun={handleRun}
          loading={loading}
        />
      )}

      <PipelineResult
        result={result}
        onClose={() => setResult(null)}
      />
    </>
  );
};