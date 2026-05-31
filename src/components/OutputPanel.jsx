import React, { useRef, useEffect, useState, useCallback } from 'react';

function OutputPanel({ output, stdin, onStdinChange, executionTime, isRunning, onClear }) {
  const outputEndRef = useRef(null);
  const panelRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(260);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  // Expand when new output arrives
  useEffect(() => {
    if (output && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [output]);

  // Resize handler
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = panelHeight;

    const handleMouseMove = (e) => {
      const delta = startY - e.clientY;
      const newHeight = Math.max(120, Math.min(window.innerHeight * 0.7, startHeight + delta));
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelHeight]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      ref={panelRef}
      className={`output-panel ${isCollapsed ? 'collapsed' : ''}`}
      style={isCollapsed ? { height: '36px' } : { height: `${panelHeight}px` }}
    >
      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          ref={resizeHandleRef}
          className={`resize-handle ${isResizing ? 'active' : ''}`}
          onMouseDown={handleMouseDown}
        >
          <div className="resize-handle-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {/* Collapsed header bar */}
      {isCollapsed ? (
        <div className="panel-header collapsed-header" onClick={toggleCollapse}>
          <div className="panel-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Terminal
            {output && (
              <span className={`collapsed-status ${output.exitCode === 0 ? 'success' : 'error'}`}>
                {output.exitCode === 0 ? '✓' : '✗'}
              </span>
            )}
          </div>
          <div className="panel-actions">
            {executionTime && (
              <span className="execution-time">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {executionTime}s
              </span>
            )}
            <button className="btn-icon btn-icon-sm" title="Expand Terminal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Expanded content */
        <div className="output-panel-content">
          {/* Stdin Section */}
          <div className="stdin-section">
            <div className="panel-header">
              <div className="panel-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                <span>Input</span>
              </div>
            </div>
            <textarea
              id="stdin-input"
              className="stdin-textarea"
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder={"Enter program input here...\nEach line is a separate input."}
              spellCheck={false}
            />
          </div>

          {/* Output Section */}
          <div className="output-section">
            <div className="panel-header">
              <div className="panel-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                Output
              </div>
              <div className="panel-actions">
                {executionTime && (
                  <span className="execution-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {executionTime}s
                  </span>
                )}
                <button className="btn-icon btn-icon-sm" onClick={onClear} title="Clear Output">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
                <button className="btn-icon btn-icon-sm" onClick={toggleCollapse} title="Collapse Terminal">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="output-console" id="output-console">
              {isRunning && (
                <div className="output-running">
                  <div className="loading-spinner small" />
                  <span>Executing code...</span>
                </div>
              )}

              {!output && !isRunning && (
                <div className="output-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  <span>Click <strong>Run</strong> to execute your code</span>
                  <span className="shortcut-hint">or press Ctrl + Enter</span>
                </div>
              )}

              {output && (
                <div className="output-content">
                  {output.compile && (
                    <div className="output-block compile">
                      <div className="output-label">Compilation:</div>
                      <pre>{output.compile}</pre>
                    </div>
                  )}

                  {output.stdout && (
                    <div className="output-block stdout">
                      <pre>{output.stdout}</pre>
                    </div>
                  )}

                  {output.stderr && (
                    <div className="output-block stderr">
                      <pre>{output.stderr}</pre>
                    </div>
                  )}

                  {output.exitCode !== undefined && (
                    <div className="output-block">
                      <p>=== Code Execution Successful ===</p>
                    </div>
                  )}
                  <div ref={outputEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutputPanel;
