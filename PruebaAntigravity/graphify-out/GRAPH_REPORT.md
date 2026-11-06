# Graph Report - PruebaAntigravity  (2026-11-05)

## Corpus Check
- 13 files · ~9,936 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: .example 1, (none) 1)

## Summary
- 73 nodes · 81 edges · 8 communities (7 shown, 1 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- test_script.py
- package.json
- server.js
- 🧪 4. Pruebas de Endpoints con `curl`
- sessions.js
- dropi.js
- dependencies

## God Nodes (most connected - your core abstractions)
1. `DropiVault Backend 🚀` - 6 edges
2. `🧪 4. Pruebas de Endpoints con `curl`` - 6 edges
3. `getSession()` - 4 edges
4. `scripts` - 3 edges
5. `getOrders()` - 3 edges
6. `getOrderById()` - 3 edges
7. `requireSession()` - 2 edges
8. `cookie-parser` - 2 edges
9. `cors` - 2 edges
10. `express` - 2 edges

## Surprising Connections (you probably didn't know these)
- `📝 5. Tareas Pendientes (TODOs de Dropi)` --references--> `getOrderById()`  [INFERRED]
  dropivault-backend/README.md → dropivault-backend/services/dropi.js
- `requireSession()` --calls--> `getSession()`  [EXTRACTED]
  dropivault-backend/middleware/auth.js → dropivault-backend/services/sessions.js

## Import Cycles
- None detected.

## Communities (8 total, 1 thin omitted)

### Community 0 - "test_script.py"
Cohesion: 0.22
Nodes (6): Arithmetic Smoke Test, SmokeTest, test_basic_arithmetic, Test Framework, unittest, SmokeTest

### Community 1 - "package.json"
Cohesion: 0.12
Nodes (15): author, description, keywords, license, main, name, scripts, dev (+7 more)

### Community 2 - "server.js"
Cohesion: 0.15
Nodes (7): { createSession, getSession, deleteSession }, dropiService, fs, PAIS_WHITELIST, path, whatsappService, helmet

### Community 3 - "🧪 4. Pruebas de Endpoints con `curl`"
Cohesion: 0.17
Nodes (11): 📦 1. Instalación de dependencias, ⚙️ 2. Configuración de Variables de Entorno, 🏃 3. Ejecución del Servidor, 🧪 4. Pruebas de Endpoints con `curl`, 📝 5. Tareas Pendientes (TODOs de Dropi), A. Health Check, B. Iniciar Sesión (Modo Demo / Sin contraseña), C. Consultar Órdenes (Requiere la cookie de sesión) (+3 more)

### Community 4 - "sessions.js"
Cohesion: 0.24
Nodes (7): { getSession }, requireSession(), createSession(), crypto, deleteSession(), getSession(), sessions

### Community 5 - "dropi.js"
Cohesion: 0.60
Nodes (3): getOrderById(), getOrders(), normalizeDropiOrder()

### Community 6 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, cookie-parser, cors, dotenv, express, express-rate-limit, helmet

## Knowledge Gaps
- **3 isolated node(s):** `dotenv`, `Arithmetic Smoke Test`, `Test Framework`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 45 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getOrderById()` connect `dropi.js` to `🧪 4. Pruebas de Endpoints con `curl``?**
  _High betweenness centrality (0.235) - this node is a cross-community bridge._
- **What connects `dotenv`, `Arithmetic Smoke Test`, `Test Framework` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Why does `📝 5. Tareas Pendientes (TODOs de Dropi)` connect `🧪 4. Pruebas de Endpoints con `curl`` to `dropi.js`?**
  _High betweenness centrality (0.219) - this node is a cross-community bridge._