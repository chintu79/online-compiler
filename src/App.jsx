import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import SettingsPanel from './components/SettingsPanel';
import ChatPanel from './components/ChatPanel';
import { LANGUAGES, DEFAULT_LANGUAGE } from './constants/languages';
import { useCodeRunner } from './hooks/useCodeRunner';
import { useNotifications } from './hooks/useNotifications';

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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
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
  const { sendNotification } = useNotifications();

  const language = LANGUAGES[languageId];
  const { output, isRunning, executionTime, runCode, stopCode, clearOutput } = useCodeRunner();

  // Detect mobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('coderunner-settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Request notification permission on app load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
        fontSize: Math.max(10, Math.min(16, prev.fontSize + delta)),
      }));
    };
    window.addEventListener('change-font-size', handler);
    return () => window.removeEventListener('change-font-size', handler);
  }, []);

  // ESC to close chat (mobile only - desktop chat is always visible)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && chatOpen && isMobile) {
        setChatOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [chatOpen, isMobile]);

  return (
    <div className="app">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        onStop={handleStop}
        isRunning={isRunning}
        onSettingsOpen={() => setSettingsOpen(true)}
        onChatOpen={() => setChatOpen(!chatOpen)}
      />
      <main className="main-content">
        <CodeEditor
          language={language}
          code={code}
          onChange={(value) => setCode(value || '')}
          editorRef={editorRef}
          settings={settings}
          onOpenChat={() => setChatOpen(!chatOpen)}
        />
        <OutputPanel
          output={output}
          stdin={stdin}
          onStdinChange={setStdin}
          executionTime={executionTime}
          isRunning={isRunning}
          onClear={clearOutput}
          chatOpen={chatOpen}
          onChatToggle={() => setChatOpen(!chatOpen)}
        />
      </main>
      <SettingsPanel
        settings={settings}
        onSettingsChange={handleSettingsChange}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSendNotification={sendNotification}
      />
      {/* Mobile chat overlay - only shown on mobile */}
      {isMobile && (
        <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} isDrawer={true} />
      )}
    </div>
  );
}

export default App;