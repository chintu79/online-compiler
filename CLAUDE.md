# CLAUDE.md — AI Assistant Context for CodeRunner

This file provides context for AI assistants (Claude, Copilot, Cursor, etc.) working on this codebase.

---

## Project Overview

**CodeRunner** is a browser-based code editor and compiler for Java and JavaScript, inspired by OnlineGDB. It is built with React 19 + Vite 8 and uses the Monaco Editor as its code editing surface. Code execution happens remotely via the Wandbox public API.

---

## Architecture

### Component Hierarchy

```
App.jsx (root state: language, code, stdin, settings, chatOpen)
├── Header.jsx             — branding, language dropdown, run/stop, settings gear
├── CodeEditor.jsx         — Monaco Editor wrapper, keyboard shortcuts
├── OutputPanel.jsx        — resizable/collapsible stdin + stdout/stderr console
├── SettingsPanel.jsx      — slide-in drawer for editor settings
└── ChatPanel.jsx          — hidden MQTT-based real-time messaging panel
```

### State Management

All state lives in `App.jsx` — no external state library. Key state:
- `languageId` / `code` / `stdin` — editor content
- `settings` — persisted to `localStorage` under key `coderunner-settings`
- `settingsOpen` / `chatOpen` — UI drawer toggles
- `output` / `isRunning` / `executionTime` — from `useCodeRunner()` hook

### Data Flow

1. User writes code in `CodeEditor` → `onChange` updates `code` in App
2. User clicks Run (or `Ctrl+Enter`) → `handleRun()` calls `useCodeRunner.runCode()`
3. `runCode()` POSTs to Wandbox API → response sets `output` state
4. `OutputPanel` renders stdout/stderr/exit code from `output`

---

## Key Technical Decisions

### Compiler Backend: Wandbox API
- **Why:** Free, no authentication, supports Java and JavaScript, reliable uptime
- **Endpoint:** `POST https://wandbox.org/api/compile.json`
- **Gotcha:** Java classes MUST be named `prog` (filename is `prog.java` on Wandbox)
- **Alternative considered:** Piston API (rejected — returns 401 Unauthorized as of 2026)

### Styling: Tailwind CSS + Vanilla CSS
- Tailwind v4 is imported but the bulk of styling is a custom CSS design system in `index.css`
- CSS variables define the full color palette, typography, spacing, and animation tokens
- Do NOT refactor to utility-first Tailwind — the CSS design system is intentional

### Font Size Limits
- Editor font size is clamped to **14–16px** (user requirement)
- Enforced in three places: SettingsPanel slider, SettingsPanel buttons, and App.jsx keyboard listener
- If changing limits, update all three locations

### Monaco Editor Integration
- Uses `@monaco-editor/react` package
- Editor instance is stored via `editorRef` (React ref passed from App → CodeEditor)
- Keyboard shortcuts are registered via `editor.addAction()` in `handleEditorDidMount`
- Custom events (`run-code`, `change-font-size`) bridge Monaco actions to App.jsx

### Real-time Messaging (ChatPanel)
- Uses MQTT protocol over secure WebSockets via the **EMQX public broker** (`wss://broker.emqx.io:8084/mqtt`)
- npm package: `mqtt` (v5)
- Topic: `coderunner/diag/trace/c4a7e9`
- Each client has a unique `_cid` to filter out its own echoed messages
- UI is deliberately disguised as a "diagnostics trace viewer" — looks like compiler log output
- Activated by clicking the "Input" label text in `OutputPanel` (styled to look like plain text)
- Closed by pressing `Esc` or clicking the overlay
- Username stored in `localStorage` under key `coderunner-chat-nick`

---

## File Reference

| File | Purpose |
|---|---|
| `index.html` | HTML shell, SEO meta, Google Fonts preconnect |
| `src/main.jsx` | React DOM render entry |
| `src/App.jsx` | Root component, all top-level state, event wiring |
| `src/index.css` | Full CSS design system (~1000 lines) |
| `src/constants/languages.js` | Language configs: compiler IDs, default code, Monaco language IDs |
| `src/hooks/useCodeRunner.js` | Wandbox API fetch logic, abort handling, output parsing |
| `src/components/Header.jsx` | Top bar: logo, language select, run/stop, settings button |
| `src/components/CodeEditor.jsx` | Monaco wrapper, settings sync, keyboard shortcut registration |
| `src/components/OutputPanel.jsx` | Resizable/collapsible split panel (stdin + output) |
| `src/components/SettingsPanel.jsx` | Settings drawer: font, theme, toggles, shortcuts reference |
| `src/components/ChatPanel.jsx` | Hidden MQTT chat disguised as diagnostic trace logs |
| `deploy.md` | Step-by-step conflict-free Render static site deployment guide |


---

## Common Tasks

### Add a new language
1. Add entry to `LANGUAGES` in `src/constants/languages.js`
2. Set `wandboxCompiler` to the Wandbox compiler name (check `https://wandbox.org/api/list.json`)
3. Set `monacoLang` to a Monaco-supported language ID
4. Provide `defaultCode`, `fileName`, `icon`, and `label`

### Change the MQTT chat topic
- Edit `CHAT_TOPIC` constant at the top of `src/components/ChatPanel.jsx`

### Send notifications to other users
- Use the `/notify` command in the ChatPanel: `/notify Your message here`
- This sends a notification message to all other users connected to the same MQTT topic
- Notifications appear with a purple `[NOTIFY]` label in the trace logs
- Example: `/notify Hey! its time to solve your DSA question`

### Change font size limits
- Update in **three** places:
  1. `src/components/SettingsPanel.jsx` — `Math.max`/`Math.min` in buttons + `min`/`max` on slider
  2. `src/App.jsx` — `Math.max`/`Math.min` in the `change-font-size` event handler

### Modify the CSS design system
- All design tokens are CSS variables in `:root` at the top of `src/index.css`
- Component styles are organized with section comments (`/* ===== Section ===== */`)

---

## Development Commands

```bash
npm run dev       # Start Vite dev server (HMR enabled)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## Gotchas & Known Issues

1. **Wandbox rate limits:** The public API may throttle heavy usage. There is no retry logic — failed requests surface as error messages in the output panel.
2. **MQTT public broker:** `broker.emqx.io` is a shared public broker. Messages on the topic are visible to anyone who subscribes. Do not send sensitive data.
3. **Java class name:** Must always be `prog` — Wandbox expects the filename `prog.java`, and Java requires the class name to match the filename.
4. **Monaco loading:** The Monaco Editor is loaded asynchronously from a CDN by `@monaco-editor/react`. First load may take a moment on slow connections.
