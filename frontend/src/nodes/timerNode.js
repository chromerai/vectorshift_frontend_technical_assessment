// nodes/timerNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';

export const TimerNode = ({ id, data }) => {
  const [delay,   setDelay]   = useState(data?.delay   ?? 1000);
  const [unit,    setUnit]    = useState(data?.unit     || 'ms');
  const [retries, setRetries] = useState(data?.retries  ?? 0);
  const [enabled, setEnabled] = useState(data?.enabled  ?? true);

  const fields = [
    {
      id: 'enabled',
      type: 'toggle',
      label: 'Enabled',
      value: enabled,
      onChange: (val) => setEnabled(val),
    },
    {
      id: 'delay',
      type: 'number',
      label: 'Delay',
      value: delay,
      onChange: (e) => setDelay(Number(e.target.value)),
      min: 0,
    },
    {
      id: 'unit',
      type: 'select',
      label: 'Unit',
      value: unit,
      onChange: (e) => setUnit(e.target.value),
      options: [
        { value: 'ms', label: 'Milliseconds' },
        { value: 's',  label: 'Seconds'      },
        { value: 'm',  label: 'Minutes'      },
      ],
    },
    {
      id: 'retries',
      type: 'range',
      label: 'Max Retries',
      value: retries,
      onChange: (e) => setRetries(Number(e.target.value)),
      min: 0,
      max: 10,
    },
  ];

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-trigger` },
    { type: 'source', position: Position.Right, id: `${id}-done`    },
  ];

  return (
    <NodeTemplate
      title="Timer"
      icon="◷"
      category="Control"
      accentColor="#f97316"
      fields={fields}
      handles={handles}
      minWidth={230}
    />
  );
};