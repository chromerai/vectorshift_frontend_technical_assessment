// inputNode.js
// nodes/inputNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate';
import { useStore } from '../store';

export const InputNode = ({ id, data }) => {
  // id-based identifier — never changes, used for handles + validation
  const inputId = id.replace('customInput-', 'input_');

  // display name — user can change freely, purely cosmetic
  const [name,        setName]        = useState(data?.name        || inputId);
  const [inputType,   setInputType]   = useState(data?.inputType   || 'Text');
  const [description, setDescription] = useState(data?.description || '');

  const updateNodeField = useStore(state => state.updateNodeField);

  const TYPE_ICONS = {
    Text: '✦', File: '⊞', Image: '◫',
    Audio: '◉', Number: '#', Boolean: '⊙',
  };

  const fields = [
    {
      id: 'name',
      type: 'text',
      label: 'Name',
      value: name,
      onChange: (e) => {
        setName(e.target.value);
        updateNodeField(id, 'name', e.target.value); // cosmetic only
      },
      placeholder: inputId,
    },
    {
      id: 'description',
      type: 'text',
      label: 'Description',
      value: description,
      onChange: (e) => setDescription(e.target.value),
      placeholder: 'What does this input do?',
    },
    {
      id: 'type',
      type: 'select',
      label: 'Type',
      value: inputType,
      onChange: (e) => setInputType(e.target.value),
      options: [
        { value: 'Text',    label: '✦  Text'    },
        { value: 'File',    label: '⊞  File'    },
        { value: 'Image',   label: '◫  Image'   },
        { value: 'Audio',   label: '◉  Audio'   },
        { value: 'Number',  label: '#  Number'  },
        { value: 'Boolean', label: '⊙  Boolean' },
      ],
    },
  ];

  const handles = [
    { type: 'source', position: Position.Right, id: `${id}-value` },
  ];

  return (
    <NodeTemplate
      id={id}
      title="Input"
      icon="⬇"
      category="I/O"
      accentColor="#10b981"
      fields={fields}
      handles={handles}
      minWidth={230}
    >
      {/* ID badge — always shows the stable input_N identifier */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-muted">
          Pass data of different types into your workflow
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#10b98120', color: '#10b981' }}>
            {inputId}
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#10b98120', color: '#10b981' }}>
            {TYPE_ICONS[inputType]} {inputType}
          </span>
        </div>
      </div>
    </NodeTemplate>
  );
};