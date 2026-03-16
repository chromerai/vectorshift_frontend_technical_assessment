// SettingsPanel.js
import { useState } from 'react';
import { cn } from './lib/utils';

export const SettingsPanel = ({ onClose }) => {
  const [vars,     setVars]     = useState([{ key: '', value: '', show: false }]);
  const [saved,    setSaved]    = useState(false);

  const addVar = () => {
    setVars(prev => [...prev, { key: '', value: '', show: false }]);
  };

  const removeVar = (index) => {
    setVars(prev => prev.filter((_, i) => i !== index));
  };

  const updateVar = (index, field, value) => {
    setVars(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[480px] shadow-node overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30
                             flex items-center justify-center text-sm">⚙</div>
            <div>
              <h3 className="text-sm font-bold text-white">Settings</h3>
              <p className="text-[11px] text-muted">Add your environment variables and API keys</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white text-lg">✕</button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-2 max-h-[55vh] overflow-y-auto">

          {/* Column headers */}
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-muted">Name</span>
            <span className="flex-[2] text-[10px] font-bold uppercase tracking-wider text-muted">Value</span>
            <div className="w-6" />
          </div>

          {/* Variable rows */}
          {vars.map((v, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <input
                type="text"
                value={v.key}
                onChange={e => updateVar(i, 'key', e.target.value)}
                placeholder="VARIABLE_NAME"
                className="field-input flex-1 font-mono text-[11px]"
              />
              <div className="relative flex-[2]">
                <input
                  type={v.show ? 'text' : 'password'}
                  value={v.value}
                  onChange={e => updateVar(i, 'value', e.target.value)}
                  placeholder="value..."
                  className="field-input w-full font-mono text-[11px] pr-8"
                />
                <button
                  onClick={() => updateVar(i, 'show', !v.show)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-white text-[11px] transition-colors"
                >
                  {v.show ? '○' : '●'}
                </button>
              </div>
              <button
                onClick={() => removeVar(i)}
                className="opacity-0 group-hover:opacity-100 text-rose-400
                             hover:text-rose-300 text-xs transition-all w-6 text-center"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add row button */}
          <button
            onClick={addVar}
            className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed
                         border-border text-muted hover:text-white hover:border-accent/40
                         text-xs font-semibold transition-all duration-150 w-full justify-center"
          >
            + Add Variable
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <p className="text-[10px] text-muted">
            Variables are scoped to this pipeline
          </p>
          <button
            onClick={handleSave}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
              saved
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'bg-accent text-white hover:bg-accent-dark'
            )}
          >
            {saved ? '✓ Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};