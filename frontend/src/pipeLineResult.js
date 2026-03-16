// PipelineResult.js
export const PipelineResult = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-[380px] shadow-node overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30
                             flex items-center justify-center text-sm">
              ◈
            </div>
            <h3 className="text-sm font-bold text-white">Pipeline Analysis</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white text-lg transition-colors">✕</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-5">
          <div className="flex flex-col items-center gap-1.5 bg-canvas rounded-xl p-3 border border-border">
            <span className="text-2xl font-bold text-white">{result.num_nodes}</span>
            <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">Nodes</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 bg-canvas rounded-xl p-3 border border-border">
            <span className="text-2xl font-bold text-white">{result.num_edges}</span>
            <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">Edges</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 bg-canvas rounded-xl p-3 border border-border">
            <span className={`text-2xl font-bold ${result.is_dag ? 'text-emerald-400' : 'text-rose-400'}`}>
              {result.is_dag ? '✓' : '✕'}
            </span>
            <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">Valid DAG</span>
          </div>
        </div>

        {/* DAG status message */}
        <div className={`mx-5 mb-5 px-3 py-2.5 rounded-lg border text-[11px] font-medium
          ${result.is_dag
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
          }`}>
          {result.is_dag
            ? '✓ Pipeline is a valid Directed Acyclic Graph — no cycles detected'
            : '✕ Pipeline contains cycles and is not a valid DAG'}
        </div>

        {/* Close button */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-sm font-semibold
                       bg-accent text-white hover:bg-accent-dark
                       transition-all duration-150"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};