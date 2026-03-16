// src/submit.js
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { useState, useMemo } from 'react';
import { cn, validateVariables } from './lib/utils';
import { RunnerModal } from './components/RunnerModal';
import { PipelineResult } from './pipeLineResult';

const selector = (state) => ({ nodes: state.nodes, edges: state.edges });

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result,    setResult]    = useState(null);

  const inputNodes = useMemo(() => nodes.filter(n => n.type === 'customInput'), [nodes]);

  const validationErrors = useMemo(() => {
    const errors = [];
    nodes.filter(n => n.type === 'text').forEach(node => {
      errors.push(...validateVariables(node.id, [node.data?.text || ''], edges, nodes, 'Text node'));
    });
    nodes.filter(n => n.type === 'llm').forEach(node => {
      errors.push(...validateVariables(node.id,
        [node.data?.systemPrompt || '', node.data?.userQuery || ''],
        edges, nodes, 'LLM node'));
    });
    return errors;
  }, [nodes, edges]);

  const handleRun = async (inputValues) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, inputs: inputValues }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setShowModal(false);
      setResult(data);
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
            <span className="text-[11px] text-soft font-medium">{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-light" />
            <span className="text-[11px] text-soft font-medium">{edges.length} edge{edges.length !== 1 ? 's' : ''}</span>
          </div>
          {inputNodes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-soft font-medium">{inputNodes.length} input{inputNodes.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[11px] text-rose-400 font-medium">{validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Run button */}
        <button onClick={() => {
                                  if (nodes.length === 0) return;
                                  console.log('edges:', edges.map(e => ({
                                    source: e.source,
                                    target: e.target,
                                    targetHandle: e.targetHandle,
                                    sourceHandle: e.sourceHandle
                                  })));
                                  setShowModal(true);
                                }} 
          disabled={nodes.length === 0}
          className={cn('flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white tracking-wide transition-all duration-150',
            validationErrors.length > 0 ? 'bg-rose-500 hover:bg-rose-600' : 'bg-accent hover:bg-accent-dark hover:shadow-glow',
            'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none')}>
          <span className="text-xs">{validationErrors.length > 0 ? '⚠' : '▶'}</span>
          <span>{validationErrors.length > 0 ? 'Fix Issues' : 'Run Pipeline'}</span>
        </button>
      </footer>

      {showModal && (
        <RunnerModal inputNodes={inputNodes} validationErrors={validationErrors}
          onClose={() => setShowModal(false)} onRun={handleRun} loading={loading} />
      )}
      <PipelineResult result={result} onClose={() => setResult(null)} />
    </>
  );
};