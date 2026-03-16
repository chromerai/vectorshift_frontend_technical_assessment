# Workflow Pipeline Builder

A visual workflow pipeline builder that lets you design complex data processing workflows through a drag-and-drop interface. Built with React on the frontend and FastAPI on the backend.

---

## Overview

The pipeline builder lets you connect nodes together to define how data flows through your system — from input sources, through LLM processing, to output destinations. The backend validates that your pipeline forms a valid Directed Acyclic Graph (DAG) before execution.

---

## Key Features

- **Drag-and-Drop Interface** — Add nodes from the toolbar and connect them on the canvas
- **Multiple Node Types** — Input, Output, LLM (OpenAI, Anthropic, Google, xAI, AWS, Custom), Text, API, Condition, Transform, Database, Supabase, Timer, Note
- **Dynamic Text Node** — Auto-resizes as you type; `{{variable}}` syntax creates live input handles
- **LLM Configuration** — Select provider and model, configure system prompt and user query inline
- **Pipeline Validation** — Checks that all `{{variables}}` in Text nodes are connected to correctly named Input nodes before running
- **DAG Validation** — Backend checks that the pipeline contains no cycles
- **Environment Variables** — Settings panel to manage API keys and secrets
- **Collapsible Toolbar** — Hide the node panel to maximise canvas space

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, ReactFlow, Tailwind CSS, Zustand |
| Backend | Python 3.11, FastAPI, Pydantic |
| Communication | REST API with CORS support |

---

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.css
│   │   ├── toolbar.js
│   │   ├── ui.js
│   │   ├── submit.js
│   │   ├── store.js
│   │   ├── draggableNode.js
│   │   ├── SettingsPanel.js
│   │   ├── PipelineResult.js
│   │   ├── lib/
│   │   │   └── utils.js
│   │   └── nodes/
│   │       ├── NodeTemplate.js
│   │       ├── inputNode.js
│   │       ├── outputNode.js
│   │       ├── llmNode.js
│   │       ├── textNode.js
│   │       ├── apiNode.js
│   │       ├── conditionNode.js
│   │       ├── transformNode.js
│   │       ├── databaseNode.js
│   │       ├── supabaseNode.js
│   │       ├── timerNode.js
│   │       └── noteNode.js
│   ├── tailwind.config.js
│   └── package.json
└── backend/
    ├── main.py
```

---

## Setup

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on **http://localhost:3000**

### Backend

Requires Python 3.11+

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on **http://localhost:8000**

---

## How to Use

1. **Add nodes** — Drag any node from the toolbar onto the canvas
2. **Connect nodes** — Drag from an output handle (right side) to an input handle (left side)
3. **Configure nodes** — Click into any field inside a node to edit it
4. **Text variables** — In a Text node, type `{{variable_name}}` to create a new input handle; connect an Input node whose name matches the variable
5. **LLM nodes** — Select a provider, pick a model, write your system prompt and user query; use `{{variable}}` in prompts to wire in dynamic inputs
6. **Run** — Click **Run Pipeline** to validate and submit; fill in any Input node values in the modal that appears
7. **Settings** — Click ⚙ Settings in the toolbar to add API keys and environment variables

---

## API

### `POST /pipelines/parse`

Accepts the pipeline graph and returns validation results.

**Request:**
```json
{
  "nodes": [...],
  "edges": [...]
}
```

**Response:**
```json
{
  "num_nodes": 3,
  "num_edges": 2,
  "is_dag": true
}
```

---

## Limitations

- Pipeline execution is not implemented — the backend validates structure only
- Renaming a `{{variable}}` in a Text node removes the connected edge; the user must reconnect manually
- Environment variables set in the Settings panel are not persisted between sessions