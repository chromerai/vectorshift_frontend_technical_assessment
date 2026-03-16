//transformNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';

export const TransformNode = ({ id, data }) => {
  const [operation,  setOperation]  = useState(data?.operation  || 'JSON Parse');
  const [expression, setExpression] = useState(data?.expression || '');

  const fields = [
    {
      id: 'operation',
      type: 'select',
      label: 'Operation',
      value: operation,
      onChange: (e) => setOperation(e.target.value),
      options: [
        { value: 'JSON Parse',      label: 'JSON Parse'       },
        { value: 'JSON Stringify',  label: 'JSON Stringify'   },
        { value: 'Uppercase',       label: 'Uppercase'        },
        { value: 'Lowercase',       label: 'Lowercase'        },
        { value: 'Trim',            label: 'Trim Whitespace'  },
        { value: 'Custom',          label: 'Custom Expression'},
      ],
    },
    ...(operation === 'Custom' ? [{
      id: 'expression',
      type: 'textarea',
      label: 'JS Expression',
      value: expression,
      onChange: (e) => setExpression(e.target.value),
      placeholder: 'e.g. input.split(",").map(x => x.trim())',
      rows: 2,
    }] : []),
  ];

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-input`  },
    { type: 'source', position: Position.Right, id: `${id}-output` },
  ];

  return (
    <NodeTemplate
      id={id}
      title="Transform"
      icon="⟳"
      category="Data"
      accentColor="#8b5cf6"
      fields={fields}
      handles={handles}
      minWidth={230}
    />
  );
};