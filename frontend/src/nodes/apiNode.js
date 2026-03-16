// nodes/apiNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { NodeTemplate } from './nodeTemplate'

export const APINode = ({ id, data }) => {
  const [url,      setUrl]      = useState(data?.url      || '');
  const [method,   setMethod]   = useState(data?.method   || 'GET');
  const [authType, setAuthType] = useState(data?.authType || 'None');

  const fields = [
    {
      id: 'url',
      type: 'text',
      label: 'Endpoint URL',
      value: url,
      onChange: (e) => setUrl(e.target.value),
      placeholder: 'https://api.example.com/...',
    },
    {
      id: 'method',
      type: 'select',
      label: 'Method',
      value: method,
      onChange: (e) => setMethod(e.target.value),
      options: [
        { value: 'GET',    label: 'GET'    },
        { value: 'POST',   label: 'POST'   },
        { value: 'PUT',    label: 'PUT'    },
        { value: 'DELETE', label: 'DELETE' },
      ],
    },
    {
      id: 'auth',
      type: 'select',
      label: 'Auth',
      value: authType,
      onChange: (e) => setAuthType(e.target.value),
      options: [
        { value: 'None',   label: 'None'         },
        { value: 'Bearer', label: 'Bearer Token'  },
        { value: 'APIKey', label: 'API Key'       },
        { value: 'Basic',  label: 'Basic Auth'    },
      ],
    },
  ];

  const handles = [
    { type: 'target', position: Position.Left,  id: `${id}-body`,     style: { top: '40%' } },
    { type: 'target', position: Position.Left,  id: `${id}-headers`,  style: { top: '65%' } },
    { type: 'source', position: Position.Right, id: `${id}-response`, style: { top: '40%' } },
    { type: 'source', position: Position.Right, id: `${id}-error`,    style: { top: '65%' } },
  ];

  return (
    <NodeTemplate
      title="API Call"
      icon="⊕"
      category="Network"
      accentColor="#0ea5e9"
      fields={fields}
      handles={handles}
      minWidth={240}
    />
  )
};