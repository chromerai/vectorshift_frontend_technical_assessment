// nodes/conditionNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';

export const ConditionNode = ({ id, data }) => {
  const [variable, setVariable] = useState(data?.variable || '');
  const [operator, setOperator] = useState(data?.operator || 'equals');
  const [value,    setValue]    = useState(data?.value    || '');

  const fields = [
    {
      id: 'variable',
      type: 'text',
      label: 'Variable',
      value: variable,
      onChange: (e) => setVariable(e.target.value),
      placeholder: 'e.g. response.status',
    },
    {
      id: 'operator',
      type: 'select',
      label: 'Operator',
      value: operator,
      onChange: (e) => setOperator(e.target.value),
      options: [
        { value: 'equals',     label: '== Equals'      },
        { value: 'not_equals', label: '!= Not Equals'  },
        { value: 'contains',   label: 'Contains'       },
        { value: 'greater',    label: '> Greater Than' },
        { value: 'less',       label: '< Less Than'    },
        { value: 'exists',     label: 'Exists'         },
      ],
    },
    {
      id: 'value',
      type: 'text',
      label: 'Value',
      value: value,
      onChange: (e) => setValue(e.target.value),
      placeholder: 'Compare value...',
    },
  ];

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-input`               },
    { type: 'source', position: Position.Right, id: `${id}-true`,  style: { top: '35%' } },
    { type: 'source', position: Position.Right, id: `${id}-false`, style: { top: '65%' } },
  ];

  return (
    <NodeTemplate
      title="Condition"
      icon="⋈"
      category="Logic"
      accentColor="#f43f5e"
      fields={fields}
      handles={handles}
      minWidth={230}
    >
      <div className="flex justify-end gap-3 text-[10px] font-mono font-semibold mt-1">
        <span className="text-emerald-400">true ↗</span>
        <span className="text-rose-400">false ↘</span>
      </div>
    </NodeTemplate>
  );
};