// outputNode.js

// nodes/outputNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.outputName || id.replace('customOutput-', 'output_')
  );
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  const fields = [
    {
      id: 'name',
      type: 'text',
      label: 'Name',
      value: currName,
      onChange: (e) => setCurrName(e.target.value),
      placeholder: 'output_name',
    },
    {
      id: 'type',
      type: 'select',
      label: 'Type',
      value: outputType,
      onChange: (e) => setOutputType(e.target.value),
      options: [
        { value: 'Text',  label: 'Text'  },
        { value: 'Image', label: 'Image' },
      ],
    },
  ];

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-value` },
  ];

  return (
    <NodeTemplate
      title="Output"
      icon="⬆"
      category="I/O"
      accentColor="#f59e0b"
      fields={fields}
      handles={handles}
    />
  );
};