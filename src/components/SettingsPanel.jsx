import React from 'react';

const THEMES = [
  { id: 'vs-dark', label: 'Dark (Default)' },
  { id: 'vs', label: 'Light' },
  { id: 'hc-black', label: 'High Contrast' },
];

const TAB_SIZES = [2, 4, 8];

function SettingsPanel({ settings, onSettingsChange, isOpen, onClose, onSendNotification }) {
  if (!isOpen) return null;

  const update = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleFontIncrease = () => {
    const newFontSize = Math.min(16, settings.fontSize + 1);
    update('fontSize', newFontSize);

    // Send notification
    if (onSendNotification) {
      onSendNotification(`Solve your DSA questions faster with WebCompiler.`);
    }
  };

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-header">
          <h2 className="settings-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </h2>
          <button className="btn-icon" onClick={onClose} title="Close Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-body">
          {/* Font Size */}
          <div className="settings-group">
            <label className="settings-label">Font Size</label>
            <div className="settings-row">
              <button
                className="btn-icon"
                onClick={() => update('fontSize', Math.max(10, settings.fontSize - 1))}
                title="Decrease Font Size"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <span className="settings-value">{settings.fontSize}px</span>
              <button
                className="btn-icon"
                onClick={handleFontIncrease}
                title="Increase Font Size"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <input
                type="range"
                min="10"
                max="16"
                value={settings.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
                className="settings-slider"
              />
            </div>
          </div>

          {/* Theme */}
          <div className="settings-group">
            <label className="settings-label">Editor Theme</label>
            <div className="select-wrapper settings-select">
              <select
                value={settings.theme}
                onChange={(e) => update('theme', e.target.value)}
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <svg className="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Tab Size */}
          <div className="settings-group">
            <label className="settings-label">Tab Size</label>
            <div className="settings-chips">
              {TAB_SIZES.map((size) => (
                <button
                  key={size}
                  className={`settings-chip ${settings.tabSize === size ? 'active' : ''}`}
                  onClick={() => update('tabSize', size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="settings-group">
            <label className="settings-label">Editor Options</label>

            <div className="settings-toggle-row">
              <span>Word Wrap</span>
              <button
                className={`toggle ${settings.wordWrap ? 'active' : ''}`}
                onClick={() => update('wordWrap', !settings.wordWrap)}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="settings-toggle-row">
              <span>Minimap</span>
              <button
                className={`toggle ${settings.minimap ? 'active' : ''}`}
                onClick={() => update('minimap', !settings.minimap)}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="settings-toggle-row">
              <span>Line Numbers</span>
              <button
                className={`toggle ${settings.lineNumbers ? 'active' : ''}`}
                onClick={() => update('lineNumbers', !settings.lineNumbers)}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            <div className="settings-toggle-row">
              <span>Font Ligatures</span>
              <button
                className={`toggle ${settings.fontLigatures ? 'active' : ''}`}
                onClick={() => update('fontLigatures', !settings.fontLigatures)}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="settings-group">
            <label className="settings-label">Keyboard Shortcuts</label>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <span>Run Code</span>
                <kbd>Ctrl + Enter</kbd>
              </div>
              <div className="shortcut-item">
                <span>Increase Font</span>
                <kbd>Ctrl + =</kbd>
              </div>
              <div className="shortcut-item">
                <span>Decrease Font</span>
                <kbd>Ctrl + -</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPanel;
