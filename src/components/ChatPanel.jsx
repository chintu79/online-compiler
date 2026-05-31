import React, { useState, useEffect, useRef, useCallback } from 'react';
import mqtt from 'mqtt';

// Public EMQX MQTT broker over secure WebSockets — free, no auth, enterprise-grade
const BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const CHAT_TOPIC = 'coderunner/diag/trace/c4a7e9';

function ChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('coderunner-chat-nick') || `dev_${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const clientIdRef = useRef(`cr_${Math.random().toString(36).substring(2, 10)}`);

  const addLog = useCallback((level, module, text) => {
    const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setMessages((prev) => [...prev, { time: now, level, module, text }]);
  }, []);

  // Startup logs
  useEffect(() => {
    if (messages.length === 0) {
      const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
      setMessages([
        { time: now, level: 'INFO', module: 'system', text: 'Initializing compiler diagnostics daemon...' },
        { time: now, level: 'INFO', module: 'system', text: 'Listening on port 8443 (SSL/TLS active)' },
        { time: now, level: 'INFO', module: 'db_connector', text: 'Established pool connection to postgresql://local-db/prod_meta' },
        { time: now, level: 'DEBUG', module: 'scheduler', text: 'cron_task: "cleanup_temp_files" completed in 14ms' },
        { time: now, level: 'INFO', module: 'system', text: 'Daemon status: OK. Ready for trace collection.' },
      ]);
    }
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // MQTT connection lifecycle
  useEffect(() => {
    if (!isOpen) {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const client = mqtt.connect(BROKER_URL, {
      clientId: clientIdRef.current,
      clean: true,
      connectTimeout: 8000,
      reconnectPeriod: 3000,
    });

    clientRef.current = client;

    client.on('connect', () => {
      setIsConnected(true);
      addLog('INFO', 'net_relay', `Connection established. Subscribed as [${username}]`);
      client.subscribe(CHAT_TOPIC, { qos: 0 });
    });

    client.on('message', (_topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        // Ignore own messages (we already show them locally)
        if (data._cid === clientIdRef.current) return;
        if (data.user && data.payload) {
          addLog('DEBUG', 'trace_rx', `{ "user": "${data.user}", "payload": ${JSON.stringify(data.payload)} }`);
        }
      } catch {
        addLog('WARN', 'raw_packet', payload.toString());
      }
    });

    client.on('error', (err) => {
      addLog('ERROR', 'net_relay', `Connection error: ${err.message}`);
    });

    client.on('close', () => {
      setIsConnected(false);
    });

    client.on('reconnect', () => {
      addLog('WARN', 'net_relay', 'Attempting reconnection...');
    });

    return () => {
      client.end(true);
      clientRef.current = null;
    };
  }, [isOpen, username, addLog]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const val = inputValue.trim();
    if (!val) return;

    if (val.startsWith('/')) {
      const parts = val.split(' ');
      const cmd = parts[0].toLowerCase();

      if (cmd === '/nick' && parts[1]) {
        const newNick = parts.slice(1).join(' ').trim();
        setUsername(newNick);
        localStorage.setItem('coderunner-chat-nick', newNick);
        addLog('INFO', 'system', `Nickname updated locally to: [${newNick}]`);
      } else if (cmd === '/clear') {
        setMessages([]);
        addLog('INFO', 'system', 'Logs cleared.');
      } else if (cmd === '/quit') {
        onClose();
      } else if (cmd === '/help') {
        addLog('INFO', 'help', 'Available parameters: /nick [name], /clear, /quit, /help');
      } else {
        addLog('ERROR', 'system', `Unknown debugger parameter: ${cmd}`);
      }
    } else {
      // Publish chat message via MQTT
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish(
          CHAT_TOPIC,
          JSON.stringify({ user: username, payload: val, _cid: clientIdRef.current }),
          { qos: 0 }
        );
      }
      addLog('DEBUG', 'trace_tx', `{ "user": "${username}", "event": "msg_sent", "payload": ${JSON.stringify(val)} }`);
    }

    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="chat-overlay" onClick={onClose} />
      <div className="chat-panel terminal-theme">
        <div className="chat-header">
          <div className="chat-title font-mono">
            <span className={`terminal-dot ${isConnected ? 'green' : 'red'}`} />
            <span>diagnostics.log — Trace Viewer</span>
          </div>
          <div className="chat-header-actions">
            <span className="escape-hint">ESC to exit</span>
            <button className="chat-close-btn" onClick={onClose} title="Close Diagnostics">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="chat-body font-mono">
          <div className="terminal-logs">
            {messages.map((m, idx) => (
              <div key={idx} className={`log-line level-${m.level.toLowerCase()}`}>
                <span className="log-time">[{m.time}]</span>{' '}
                <span className="log-level">[{m.level}]</span>{' '}
                <span className="log-module">{m.module}:</span>{' '}
                <span className="log-text">{m.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="terminal-prompt">
            <span className="prompt-symbol">pdb&gt;</span>
            <input
              ref={inputRef}
              type="text"
              className="prompt-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleCommand}
              placeholder="type message or /help..."
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatPanel;
