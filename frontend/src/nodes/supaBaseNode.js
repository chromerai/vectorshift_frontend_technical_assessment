// nodes/supabaseNode.js
import { useState, useEffect, useRef } from 'react';
import { Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';

export const SupabaseNode = ({ id, data }) => {
  const [table,     setTable]     = useState(data?.table     || '');
  const [operation, setOperation] = useState(data?.operation || 'SELECT');
  const [rawQuery,  setRawQuery]  = useState(data?.rawQuery  || '');

  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [rawQuery]);

  const isRaw = operation === 'RAW';

  // Placeholder examples per operation type
  const PLACEHOLDERS = {
    SELECT: `supabase\n  .from('${table || 'users'}')\n  .select('*')\n  .eq('status', 'active')\n  .limit(10)`,
    INSERT: `supabase\n  .from('${table || 'users'}')\n  .insert([{ name: 'Alice', age: 30 }])`,
    UPDATE: `supabase\n  .from('${table || 'users'}')\n  .update({ status: 'inactive' })\n  .eq('id', 1)`,
    DELETE: `supabase\n  .from('${table || 'users'}')\n  .delete()\n  .eq('id', 1)`,
    RPC:    `supabase\n  .rpc('my_function', { param1: 'value' })`,
    RAW:    `supabase\n  .from('${table || 'orders'}')\n  .select('*, users(name, email)')\n  .eq('status', 'pending')\n  .order('created_at', { ascending: false })\n  .limit(20)`,
  };

  const fields = [
    {
      id: 'table',
      type: 'text',
      label: 'Table',
      value: table,
      onChange: (e) => setTable(e.target.value),
      placeholder: 'e.g. users',
    },
    {
      id: 'operation',
      type: 'select',
      label: 'Operation',
      value: operation,
      onChange: (e) => setOperation(e.target.value),
      options: [
        { value: 'SELECT', label: 'SELECT — Read'        },
        { value: 'INSERT', label: 'INSERT — Write'       },
        { value: 'UPDATE', label: 'UPDATE — Modify'      },
        { value: 'DELETE', label: 'DELETE — Remove'      },
        { value: 'RPC',    label: 'RPC — Function call'  },
        { value: 'RAW',    label: 'RAW — Custom query'   },
      ],
    },
  ];

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-input`                         },
    { type: 'source', position: Position.Right, id: `${id}-result`, style: { top: '35%' } },
    { type: 'source', position: Position.Right, id: `${id}-error`,  style: { top: '65%' } },
  ];

  return (
    <NodeTemplate
      title="Supabase"
      icon="S"
      category="Data"
      accentColor="#3ecf8e"
      fields={fields}
      handles={handles}
      minWidth={260}
    >
      {/* ── Credentials tip ── */}
      <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
        style={{ background: '#3ecf8e0f', border: '1px solid #3ecf8e25' }}>
        <span className="text-[11px] mt-px flex-shrink-0">💡</span>
        <p className="text-[10px] leading-relaxed" style={{ color: '#3ecf8e99' }}>
          Add <span className="font-mono font-bold" style={{ color: '#3ecf8e' }}>SUPABASE_URL</span> and{' '}
          <span className="font-mono font-bold" style={{ color: '#3ecf8e' }}>SUPABASE_ANON_KEY</span> in{' '}
          <span className="font-semibold text-white">Settings → Variables</span> before running.
        </p>
      </div>

      {/* ── Query textarea — shown for all operations ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="field-label">
            {isRaw ? 'Custom Query' : `${operation} Query`}
          </span>
          <span className="text-[9px] font-mono" style={{ color: '#3ecf8e70' }}>
            supabase-js
          </span>
        </div>

        <div className="h-px" style={{ background: '#3ecf8e20' }} />

        <textarea
          ref={textareaRef}
          value={rawQuery}
          onChange={e => setRawQuery(e.target.value)}
          placeholder={PLACEHOLDERS[operation]}
          className="field-textarea font-mono text-[11px] leading-5"
          style={{
            minHeight: '80px',
            resize: 'none',
            overflow: 'hidden',
            borderColor: '#3ecf8e30',
            background: '#3ecf8e08',
          }}
          spellCheck={false}
        />

        <div className="flex items-center justify-between">
          <span className="text-[9px]" style={{ color: '#3ecf8e60' }}>
            Write using the Supabase JS client API
          </span>
          <span className="text-[9px] text-muted font-mono">
            {rawQuery.split('\n').length} line{rawQuery.split('\n').length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Handle labels ── */}
      <div className="flex justify-end gap-3 text-[10px] font-mono font-semibold">
        <span style={{ color: '#3ecf8e' }}>result ↗</span>
        <span className="text-rose-400">error ↘</span>
      </div>
    </NodeTemplate>
  );
};