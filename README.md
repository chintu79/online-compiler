# CodeRunner — Online Java & JavaScript Compiler

A feature-rich, browser-based code editor and compiler inspired by OnlineGDB. Write, compile, and run **Java** and **JavaScript** code directly in your browser — no setup required.

![Built with React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-Powered-0078d4)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### Code Editor
- **Monaco Editor** — the same engine that powers VS Code, with full syntax highlighting, IntelliSense, bracket colorization, and smooth animations
- **Multi-language support** — switch between Java (`OpenJDK 22`) and JavaScript (`Node.js 20`) with one click
- **Cloud compilation** — code is compiled and executed server-side via the [Wandbox API](https://wandbox.org/) — free, no API key required

### Terminal & Output
- **Resizable output panel** — drag the top edge to resize the terminal between 120px and 70% viewport height
- **Collapsible console** — collapse the terminal to a slim 36px status bar; auto-expands when new output arrives
- **Stdin support** — dedicated input pane for providing program input (stdin)
- **Execution metrics** — shows elapsed time and exit code with color-coded status indicators

### Settings & Customization
- **Slide-in settings panel** — accessible via the ⚙️ gear icon in the header
- **Font size** — adjustable between 14–16px via slider, buttons, or keyboard shortcuts
- **Editor theme** — Dark (default), Light, and High Contrast
- **Tab size** — 2, 4, or 8 spaces
- **Toggles** — word wrap, minimap, line numbers, font ligatures
- **Persistent settings** — all preferences saved to `localStorage`

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Run code |
| `Ctrl + =` | Increase font size |
| `Ctrl + -` | Decrease font size |
| `Esc` | Close settings / panels |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/java-code-editor.git
cd java-code-editor

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🏗️ Project Structure

```
java-code-editor/
├── index.html                   # HTML entry point with SEO meta tags & Google Fonts
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── public/                      # Static assets
└── src/
    ├── main.jsx                 # React DOM entry point
    ├── App.jsx                  # Root component — state management & layout orchestration
    ├── index.css                # Complete design system (CSS variables, layout, components)
    ├── components/
    │   ├── Header.jsx           # Branding, language selector, run/stop buttons, settings icon
    │   ├── CodeEditor.jsx       # Monaco Editor wrapper with dynamic settings & keyboard shortcuts
    │   ├── OutputPanel.jsx      # Resizable/collapsible stdin + stdout/stderr terminal panel
    │   ├── SettingsPanel.jsx    # Slide-in drawer with font, theme, and editor toggle controls
    │   └── ChatPanel.jsx        # Hidden real-time diagnostic trace viewer
    ├── constants/
    │   └── languages.js         # Language definitions (compiler IDs, defaults, file names)
    └── hooks/
        └── useCodeRunner.js     # Wandbox API integration — run, stop, and capture output
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Styling** | Tailwind CSS 4 + Vanilla CSS design system |
| **Compiler Backend** | [Wandbox API](https://wandbox.org/api/compile.json) (free, no auth) |
| **Fonts** | Inter (UI) + JetBrains Mono (code) via Google Fonts |
| **Real-time Messaging** | MQTT over WebSockets via [EMQX Public Broker](https://broker.emqx.io) |

---

## 🌐 API Reference

### Wandbox Compile API

**Endpoint:** `POST https://wandbox.org/api/compile.json`

**Request body:**
```json
{
  "compiler": "nodejs-20.17.0",
  "code": "console.log('hello');",
  "stdin": "",
  "save": false
}
```

**Response:**
```json
{
  "program_output": "hello\n",
  "program_error": "",
  "compiler_output": "",
  "compiler_error": "",
  "status": 0,
  "signal": ""
}
```

**Supported compilers:**
| Language | Compiler ID |
|---|---|
| JavaScript | `nodejs-20.17.0` |
| Java | `openjdk-jdk-22+36` |

> **Note:** Java source files must use the class name `prog` to match Wandbox's expected filename `prog.java`.

---

## 🎨 Design System

The UI uses a custom CSS design system with CSS variables defined in `src/index.css`:

- **Color palette:** GitHub Dark-inspired (`--bg-primary: #0d1117`, `--accent-blue: #388bfd`, etc.)
- **Typography:** Inter for UI, JetBrains Mono for code
- **Animations:** `fadeIn`, `slideIn`, `slideInLeft`, `pulse-dot`, `spin`
- **Responsive:** Mobile-friendly breakpoints at 768px

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
