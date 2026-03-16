// nodes/databaseNode.js
import { useState, useEffect, useRef } from 'react';
import { Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';

const DB_PORTS = {
  PostgreSQL: '5432',
  MySQL:      '3306',
  MongoDB:    '27017',
  SQLite:     '',
  Redis:      '6379',
};

export const DatabaseNode = ({ id, data }) => {
  const [dbType,    setDbType]    = useState(data?.dbType    || 'PostgreSQL');
  const [host,      setHost]      = useState(data?.host      || '');
  const [port,      setPort]      = useState(data?.port      || '5432');
  const [dbName,    setDbName]    = useState(data?.dbName    || '');
  const [operation, setOperation] = useState(data?.operation || 'SELECT');
  const [rawQuery,  setRawQuery]  = useState(data?.rawQuery  || '');

  const textareaRef = useRef(null);

  // Auto-resize textarea when rawQuery changes
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [rawQuery]);

  const handleDbTypeChange = (e) => {
    setDbType(e.target.value);
    setPort(DB_PORTS[e.target.value] || '');
  };

  const isRaw = operation === 'RAW';

  const fields = [
    {
      id: 'dbType',
      type: 'select',
      label: 'Database',
      value: dbType,
      onChange: handleDbTypeChange,
      options: [
        { value: 'PostgreSQL', label: 'PostgreSQL' },
        { value: 'MySQL',      label: 'MySQL'      },
        { value: 'MongoDB',    label: 'MongoDB'    },
        { value: 'SQLite',     label: 'SQLite'     },
        { value: 'Redis',      label: 'Redis'      },
      ],
    },
    // SQLite has no host/port
    ...(dbType !== 'SQLite' ? [
      {
        id: 'host',
        type: 'text',
        label: 'Host',
        value: host,
        onChange: (e) => setHost(e.target.value),
        placeholder: 'localhost',
      },
      {
        id: 'port',
        type: 'text',
        label: 'Port',
        value: port,
        onChange: (e) => setPort(e.target.value),
        placeholder: DB_PORTS[dbType] || '',
      },
    ] : []),
    {
      id: 'dbName',
      type: 'text',
      label: dbType === 'Redis' ? 'Database Index' : 'Database Name',
      value: dbName,
      onChange: (e) => setDbName(e.target.value),
      placeholder: dbType === 'Redis' ? '0' : 'my_database',
    },
    {
      id: 'operation',
      type: 'select',
      label: 'Operation',
      value: operation,
      onChange: (e) => setOperation(e.target.value),
      options: [
        { value: 'SELECT', label: 'SELECT — Read'   },
        { value: 'INSERT', label: 'INSERT — Write'  },
        { value: 'UPDATE', label: 'UPDATE — Modify' },
        { value: 'DELETE', label: 'DELETE — Remove' },
        { value: 'RAW',    label: 'RAW Query'       },
      ],
    },
  ];

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-query`                        },
    { type: 'source', position: Position.Right, id: `${id}-result`, style: { top: '35%' } },
    { type: 'source', position: Position.Right, id: `${id}-error`,  style: { top: '65%' } },
  ];

  return (
    <NodeTemplate
      id={id}
      title="Database"
      icon="⊞"
      category="Storage"
      accentColor="#06b6d4"
      fields={fields}
      handles={handles}
      minWidth={260}
    >
      {/* ── Raw Query textarea — only shown when RAW is selected ── */}
      {isRaw && (
        <div className="flex flex-col gap-1 mt-1">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="field-label">SQL Query</span>
            <span className="text-[9px] font-mono text-cyan-500/70">RAW mode</span>
          </div>

          {/* Divider */}
          <div className="h-px bg-cyan-500/20" />

          {/* Auto-resizing textarea */}
          <textarea
            ref={textareaRef}
            value={rawQuery}
            onChange={e => setRawQuery(e.target.value)}
            placeholder={
`SELECT *
FROM users
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;`
            }
            className="field-textarea font-mono text-[11px] leading-5"
            style={{
              minHeight: '80px',
              resize: 'none',
              overflow: 'hidden',
              borderColor: '#06b6d440',
              background: '#06b6d408',
            }}
            spellCheck={false}
          />

          {/* Line count hint */}
          <div className="flex justify-end">
            <span className="text-[9px] text-muted font-mono">
              {rawQuery.split('\n').length} line{rawQuery.split('\n').length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* ── Handle labels ── */}
      <div className="flex justify-end gap-3 text-[10px] font-mono font-semibold mt-1">
        <span className="text-cyan-400">result ↗</span>
        <span className="text-rose-400">error ↘</span>
      </div>
    </NodeTemplate>
  );
};