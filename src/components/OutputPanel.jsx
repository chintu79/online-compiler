import React, { useRef, useEffect, useState, useCallback } from 'react';
import ChatPanel from './ChatPanel';

function OutputPanel({ output, stdin, onStdinChange, executionTime, isRunning, onClear, onChatToggle, chatOpen }) {
  const outputEndRef = useRef(null);
  const panelRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const logsResizeRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(260);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [logsWidth, setLogsWidth] = useState(300);
  const [logsCollapsed, setLogsCollapsed] = useState(true);
  const [isLogsResizing, setIsLogsResizing] = useState(false);
  const [inputCollapsed, setInputCollapsed] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

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

  // Detect mobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ctrl+P to toggle terminal collapse (desktop only)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'p' || e.key === 'ArrowDown' && !isMobile) {
        e.preventDefault();
        setLogsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

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

  // Logs resize handler
  const handleLogsMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLogsResizing(true);
    const startX = e.clientX;
    const startWidth = logsWidth;

    const handleMouseMove = (e) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth - delta));
      setLogsWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsLogsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [logsWidth]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleLogs = () => {
    setLogsCollapsed((prev) => !prev);
  };

  const toggleInput = () => {
    setInputCollapsed((prev) => !prev);
  };

  const toggleOutput = () => {
    setOutputCollapsed((prev) => !prev);
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
        <div className={`output-panel-content ${inputCollapsed && outputCollapsed ? 'logs-expanded' : ''}`}>
          {/* Stdin Section */}
          <div className="stdin-section" style={inputCollapsed ? { width: '36px', minWidth: '36px', maxWidth: '36px' } : {}}>
            <div className="panel-header" style={{ flexDirection: inputCollapsed ? 'column' : 'row', gap: inputCollapsed ? '8px' : '0' }}>
              <div className="panel-title" style={{ cursor: 'pointer' }} onClick={toggleInput}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                {!inputCollapsed && <span>Input</span>}
              </div>
              <div className="panel-actions">
                <button className="btn-icon btn-icon-sm" onClick={toggleInput} title={inputCollapsed ? 'Expand Input' : 'Collapse Input'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {inputCollapsed ? (
                      <polyline points="15 18 9 12 15 6" />
                    ) : (
                      <polyline points="9 18 15 12 9 6" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            {!inputCollapsed && (
              <textarea
                id="stdin-input"
                className="stdin-textarea"
                value={stdin}
                onChange={(e) => onStdinChange(e.target.value)}
                placeholder={"Enter program input here...\nEach line is a separate input."}
                spellCheck={false}
              />
            )}
          </div>

          {/* Output Section */}
          <div className="output-section" style={outputCollapsed ? { width: '36px', minWidth: '36px', maxWidth: '36px' } : {}}>
            <div className="panel-header" style={{ flexDirection: outputCollapsed ? 'column' : 'row', gap: outputCollapsed ? '8px' : '0' }}>
              <div className="panel-title" style={{ cursor: 'pointer' }} onClick={toggleOutput}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                {!outputCollapsed && <span>Output</span>}
              </div>
              <div className="panel-actions">
                {executionTime && !outputCollapsed && (
                  <span className="execution-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {executionTime}s
                  </span>
                )}
                {!outputCollapsed && (
                  <button className="btn-icon btn-icon-sm" onClick={onClear} title="Clear Output">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
                <button className="btn-icon btn-icon-sm" onClick={toggleOutput} title={outputCollapsed ? 'Expand Output' : 'Collapse Output'}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {outputCollapsed ? (
                      <polyline points="15 18 9 12 15 6" />
                    ) : (
                      <polyline points="9 18 15 12 9 6" />
                    )}
                  </svg>
                </button>
                <button className="btn-icon btn-icon-sm" onClick={toggleCollapse} title="Collapse Terminal (Ctrl+P)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>

            {!outputCollapsed && (
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
            )}
          </div>

          {/* Logs Section - Chat Panel (Desktop only, hidden on mobile) */}
          {!isMobile && (
            <div className="logs-section" style={logsCollapsed ? { width: '36px', minWidth: '36px' } : { flex: inputCollapsed && outputCollapsed ? 1 : undefined, width: inputCollapsed && outputCollapsed ? 'auto' : `${logsWidth}px` }}>
              <div className="panel-header">
                <div className="panel-title" onClick={toggleLogs}>
                  <span>Logs</span>
                </div>
                <div className="panel-actions">
                  <button className="btn-icon btn-icon-sm" onClick={toggleLogs} title={logsCollapsed ? 'Expand Logs' : 'Collapse Logs'}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {logsCollapsed ? (
                        <polyline points="15 18 9 12 15 6" />
                      ) : (
                        <polyline points="9 18 15 12 9 6" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              {!logsCollapsed && (
                <>
                  {/* Desktop: Embedded ChatPanel */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent' }}>
                    <ChatPanel isOpen={true} onClose={onChatToggle} embedded={true} />
                  </div>
                  {/* Logs resize handle */}
                  <div
                    ref={logsResizeRef}
                    className={`logs-resize-handle ${isLogsResizing ? 'active' : ''}`}
                    onMouseDown={handleLogsMouseDown}
                  >
                    <div className="resize-handle-dots vertical">
                      <span /><span /><span />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OutputPanel;