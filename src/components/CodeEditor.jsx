import React, { useEffect } from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({ language, code, onChange, editorRef, settings }) {
  // Update editor options when settings change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        wordWrap: settings.wordWrap ? 'on' : 'off',
        minimap: { enabled: settings.minimap },
        lineNumbers: settings.lineNumbers ? 'on' : 'off',
        fontLigatures: settings.fontLigatures,
        tabSize: settings.tabSize,
      });
    }
  }, [settings, editorRef]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    // Add Ctrl+Enter shortcut for running code
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        window.dispatchEvent(new CustomEvent('run-code'));
      },
    });

    // Add Ctrl+= to increase font size
    editor.addAction({
      id: 'increase-font',
      label: 'Increase Font Size',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal],
      run: () => {
        window.dispatchEvent(new CustomEvent('change-font-size', { detail: 1 }));
      },
    });

    // Add Ctrl+- to decrease font size
    editor.addAction({
      id: 'decrease-font',
      label: 'Decrease Font Size',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus],
      run: () => {
        window.dispatchEvent(new CustomEvent('change-font-size', { detail: -1 }));
      },
    });

    // Apply initial settings
    editor.updateOptions({
      fontSize: settings.fontSize,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: settings.fontLigatures,
      minimap: { enabled: settings.minimap },
      scrollBeyondLastLine: false,
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
      bracketPairColorization: { enabled: true },
      wordWrap: settings.wordWrap ? 'on' : 'off',
      tabSize: settings.tabSize,
      automaticLayout: true,
    });
  }

  return (
    <div className="editor-container">
      <div className="editor-tab-bar">
        <div className="editor-tab active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <span>{language.fileName}</span>
        </div>
        <div className="editor-info">
          <span className="font-size-indicator" title="Font Size">{settings.fontSize}px</span>
          <span className="lang-badge">{language.icon}</span>
        </div>
      </div>
      <Editor
        height="100%"
        language={language.monacoLang}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme={settings.theme}
        loading={
          <div className="editor-loading">
            <div className="loading-spinner" />
            <span>Loading editor...</span>
          </div>
        }
      />
    </div>
  );
}

export default CodeEditor;
