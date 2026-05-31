import { useState, useRef, useCallback } from 'react';

const WANDBOX_API = 'https://wandbox.org/api/compile.json';

export function useCodeRunner() {
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const abortControllerRef = useRef(null);

  const runCode = useCallback(async (language, code, stdin = '') => {
    // Cancel any previous run
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsRunning(true);
    setOutput(null);
    setExecutionTime(null);

    const startTime = performance.now();

    try {
      const response = await fetch(WANDBOX_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          compiler: language.wandboxCompiler,
          code: code,
          stdin: stdin,
          'save': false,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`API Error: ${response.status} ${response.statusText}${errText ? ' - ' + errText : ''}`);
      }

      const data = await response.json();
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setExecutionTime(elapsed);

      // Build output object from Wandbox response
      const result = {
        stdout: data.program_output || '',
        stderr: data.program_error || '',
        compile: null,
        compileStdout: data.compiler_output || '',
        exitCode: Number(data.status) || 0,
        signal: data.signal || '',
      };

      // Handle compiler messages
      if (data.compiler_error) {
        result.compile = data.compiler_error;
      }
      if (data.compiler_message && !data.compiler_error) {
        result.compile = data.compiler_message;
      }

      setOutput(result);
    } catch (err) {
      if (err.name === 'AbortError') {
        setOutput({
          stdout: '',
          stderr: 'Execution cancelled by user.',
          exitCode: -1,
        });
      } else {
        setOutput({
          stdout: '',
          stderr: `Error: ${err.message}`,
          exitCode: -1,
        });
      }
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setExecutionTime(elapsed);
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, []);

  const stopCode = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearOutput = useCallback(() => {
    setOutput(null);
    setExecutionTime(null);
  }, []);

  return {
    output,
    isRunning,
    executionTime,
    runCode,
    stopCode,
    clearOutput,
  };
}
