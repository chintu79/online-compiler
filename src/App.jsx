import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import SettingsPanel from './components/SettingsPanel';
import ChatPanel from './components/ChatPanel';
import { LANGUAGES, DEFAULT_LANGUAGE } from './constants/languages';
import { useCodeRunner } from './hooks/useCodeRunner';

const DEFAULT_SETTINGS = {
  fontSize: 15,
  theme: 'vs-dark',
  tabSize: 4,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  fontLigatures: true,
};

function App() {
  const [languageId, setLanguageId] = useState(DEFAULT_LANGUAGE);
  const [code, setCode] = useState(LANGUAGES[DEFAULT_LANGUAGE].defaultCode);
  const [stdin, setStdin] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage
    try {
      const saved = localStorage.getItem('coderunner-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const editorRef = useRef(null);

  const language = LANGUAGES[languageId];
  const { output, isRunning, executionTime, runCode, stopCode, clearOutput } = useCodeRunner();

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('coderunner-settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const handleRun = useCallback(() => {
    const currentCode = editorRef.current ? editorRef.current.getValue() : code;
    runCode(language, currentCode, stdin);
  }, [language, code, stdin, runCode]);

  const handleStop = useCallback(() => {
    stopCode();
  }, [stopCode]);

  const handleLanguageChange = useCallback((newLangId) => {
    setLanguageId(newLangId);
    setCode(LANGUAGES[newLangId].defaultCode);
    clearOutput();
  }, [clearOutput]);

  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);

  // Listen for Ctrl+Enter from editor
  useEffect(() => {
    const handler = () => handleRun();
    window.addEventListener('run-code', handler);
    return () => window.removeEventListener('run-code', handler);
  }, [handleRun]);

  // Listen for font size changes from editor (Ctrl+=/-)
  useEffect(() => {
    const handler = (e) => {
      const delta = e.detail;
      setSettings((prev) => ({
        ...prev,
        fontSize: Math.max(14, Math.min(16, prev.fontSize + delta)),
      }));
    };
    window.addEventListener('change-font-size', handler);
    return () => window.removeEventListener('change-font-size', handler);
  }, []);

  return (
    <div className="app">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        onStop={handleStop}
        isRunning={isRunning}
        onSettingsOpen={() => setSettingsOpen(true)}
      />
      <main className="main-content">
        <CodeEditor
          language={language}
          code={code}
          onChange={(value) => setCode(value || '')}
          editorRef={editorRef}
          settings={settings}
        />
        <OutputPanel
          output={output}
          stdin={stdin}
          onStdinChange={setStdin}
          executionTime={executionTime}
          isRunning={isRunning}
          onClear={clearOutput}
          onOpenChat={() => setChatOpen(true)}
        />
      </main>
      <SettingsPanel
        settings={settings}
        onSettingsChange={handleSettingsChange}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}

export default App;