# REQ-P1-002: Web GUI Dashboard Design Document

> 🇯🇵 日本語版 (Japanese version): [REQ-P1-002-web-gui-design.md](./REQ-P1-002-web-gui-design.md)

## Overview

MUSUBI Web GUI Dashboard is a web application that lets you visualize and edit a project's specifications, workflow, and traceability in the browser.

### Goals

1. **Visualization**: View the MUSUBI project structure at a glance on a dashboard
2. **Traceability**: Display the relationships requirements → design → implementation → tests as a graph
3. **Real-time updates**: Reflect file changes immediately
4. **Editing**: Edit specifications in the browser

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      musubi-gui                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Frontend (React 18)                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │  Dashboard   │  │  Workflow    │  │  Traceability    │  │ │
│  │  │    Panel     │  │   Editor     │  │     Matrix       │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ Constitution │  │   Feature    │  │     Task         │  │ │
│  │  │    Viewer    │  │    Editor    │  │    Tracker       │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │ HTTP/WebSocket                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Backend (Express)                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │   REST API   │  │  WebSocket   │  │  File Watcher    │  │ │
│  │  │   /api/*     │  │    Server    │  │  (chokidar)      │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │   Project    │  │   Markdown   │  │   Validation     │  │ │
│  │  │   Scanner    │  │    Parser    │  │    Service       │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │   MUSUBI Project   │                        │
│                    │  steering/, storage/│                       │
│                    └────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## REST API Design

### Project

| Endpoint | Method | Description |
|---------------|----------|------|
| `/api/project` | GET | Get project information |
| `/api/project/validate` | POST | Validate project |

### Constitution

| Endpoint | Method | Description |
|---------------|----------|------|
| `/api/constitution` | GET | Get constitution |
| `/api/constitution` | PUT | Update constitution |

### Specifications

| Endpoint | Method | Description |
|---------------|----------|------|
| `/api/specs` | GET | List specifications |
| `/api/specs/:id` | GET | Specification details |
| `/api/specs/:id` | PUT | Update specification |
| `/api/specs/:id/tasks` | GET | List tasks |
| `/api/specs/:id/tasks/:taskId` | PUT | Update task |

### Traceability

| Endpoint | Method | Description |
|---------------|----------|------|
| `/api/traceability` | GET | Traceability matrix |
| `/api/traceability/graph` | GET | Graph data (for D3.js) |

### Workflow

| Endpoint | Method | Description |
|---------------|----------|------|
| `/api/workflow` | GET | Workflow state |
| `/api/workflow/stage` | PUT | Update stage |

## WebSocket Events

| Event | Direction | Description |
|---------|------|------|
| `file:changed` | Server→Client | File change notification |
| `spec:updated` | Server→Client | Specification update notification |
| `task:completed` | Server→Client | Task completion notification |
| `validation:result` | Server→Client | Validation result notification |

## Frontend Structure

```
gui/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── DashboardPanel.jsx
│   │   │   ├── ProjectSummary.jsx
│   │   │   └── QuickActions.jsx
│   │   ├── Constitution/
│   │   │   ├── ConstitutionViewer.jsx
│   │   │   └── ArticleCard.jsx
│   │   ├── Specs/
│   │   │   ├── SpecList.jsx
│   │   │   ├── SpecEditor.jsx
│   │   │   └── RequirementCard.jsx
│   │   ├── Tasks/
│   │   │   ├── TaskTracker.jsx
│   │   │   └── TaskItem.jsx
│   │   ├── Traceability/
│   │   │   ├── TraceMatrix.jsx
│   │   │   └── TraceGraph.jsx
│   │   └── Workflow/
│   │       ├── WorkflowEditor.jsx
│   │       └── StageNode.jsx
│   ├── hooks/
│   │   ├── useProject.js
│   │   ├── useWebSocket.js
│   │   └── useTraceability.js
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Backend Structure

```
src/
├── gui/
│   ├── server.js           # Express server
│   ├── routes/
│   │   ├── project.js
│   │   ├── constitution.js
│   │   ├── specs.js
│   │   ├── traceability.js
│   │   └── workflow.js
│   ├── services/
│   │   ├── project-scanner.js
│   │   ├── file-watcher.js
│   │   ├── markdown-parser.js
│   │   └── websocket.js
│   └── middleware/
│       ├── cors.js
│       └── error-handler.js
└── ...
```

## CLI Integration

### `musubi gui` Command

```bash
# Start the server
npx musubi gui

# Specify the port
npx musubi gui --port 8080

# Specify the project path
npx musubi gui --project ./my-project

# Read-only mode
npx musubi gui --readonly
```

## Implementation Phases

### Phase 1: Backend Foundation (Week 1)
- [ ] Express server setup
- [ ] Basic REST API endpoints
- [ ] Project scanner
- [ ] Static file serving

### Phase 2: Frontend Foundation (Week 2)
- [ ] Vite + React setup
- [ ] Tailwind CSS configuration
- [ ] Dashboard layout
- [ ] API client

### Phase 3: Real-Time Features (Week 3)
- [ ] WebSocket integration
- [ ] File watcher
- [ ] Real-time updates

### Phase 4: Advanced Features (Week 4)
- [ ] Traceability graph (D3.js)
- [ ] Specification editor
- [ ] Workflow editor

## Technology Selection Rationale

### React 18
- Rich ecosystem
- Component reusability
- Concurrent rendering support

### Tailwind CSS
- Utility-first
- Easy to customize
- Optimized bundle size

### Express.js
- Lightweight and fast
- Middleware ecosystem
- Easy WebSocket integration

### D3.js
- Powerful visualization capabilities
- Highly customizable
- Ideal for traceability graphs

### Vite
- Fast development server
- Based on ES Modules
- HMR support

## Success Criteria

| Criterion | Target |
|------|------|
| Initial load time | Within 2 seconds |
| File change reflection | Within 500ms |
| API response | Within 200ms |
| Browser support | Chrome, Firefox, Safari |

## Dependencies

### Backend
```json
{
  "express": "^4.18.0",
  "ws": "^8.14.0",
  "chokidar": "^3.5.0",
  "cors": "^2.8.5"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@tanstack/react-query": "^5.0.0",
  "d3": "^7.8.0",
  "tailwindcss": "^3.3.0"
}
```

### Development
```json
{
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0"
}
```
