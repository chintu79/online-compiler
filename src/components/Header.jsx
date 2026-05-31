import React from 'react';
import { LANGUAGE_LIST } from '../constants/languages';

function Header({ language, onLanguageChange, onRun, onStop, isRunning, onSettingsOpen }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-text">WebCompiler</span>
        </div>

        <div className="divider" />

        <div className="language-selector">
          <label htmlFor="language-select" className="selector-label">Language:</label>
          <div className="select-wrapper">
            <select
              id="language-select"
              value={language.id}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={isRunning}
            >
              {LANGUAGE_LIST.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
            <svg className="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      <div className="header-right">
        {isRunning && (
          <div className="status-badge running">
            <span className="status-dot" />
            Running...
          </div>
        )}

        <button
          id="run-btn"
          className="btn btn-run"
          onClick={onRun}
          disabled={isRunning}
          title="Run Code (Ctrl+Enter)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Run
        </button>

        <button
          id="stop-btn"
          className="btn btn-stop"
          onClick={onStop}
          disabled={!isRunning}
          title="Stop Execution"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
          Stop
        </button>

        <div className="divider" />

        <button
          id="settings-btn"
          className="btn-icon"
          onClick={onSettingsOpen}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Header;
