// nodes/noteNode.js
import { useState } from 'react';
import { NodeTemplate } from './nodeTemplate';

export const NoteNode = ({ id, data }) => {
  const [noteText, setNoteText] = useState(data?.note  || '');
  const [color,    setColor]    = useState(data?.color || '#facc15');

  const fields = [
    {
      id: 'color',
      type: 'color',
      label: 'Color',
      value: color,
      onChange: (e) => setColor(e.target.value),
    },
    {
      id: 'note',
      type: 'textarea',
      label: 'Note',
      value: noteText,
      onChange: (e) => setNoteText(e.target.value),
      placeholder: 'Add a note about this step...',
      rows: 4,
    },
  ];

  return (
    <NodeTemplate
      id={id}
      title="Note"
      icon="◎"
      category="Util"
      accentColor={color}
      fields={fields}
      handles={[]}
      minWidth={200}
      className="opacity-90"
    />
  );
};