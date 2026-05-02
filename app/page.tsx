'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { evaluate, format } from 'mathjs';

interface HistoryEntry {
  expr: string;
  result: string;
  timestamp: number;
}

const APPS = ['CALC', 'GRAPHER', 'EQUA', 'CALCUL', 'PYTHON', 'PARTICLE', 'BRIDGE', 'SETTINGS'];

export default function CalculatorPage() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [activeApp, setActiveApp] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [shiftMode, setShiftMode] = useState(false);
  const [alphaMode, setAlphaMode] = useState(false);
  const [ans, setAns] = useState('0');
  const [precision, setPrecision] = useState(10);
  const [error, setError] = useState('');
  const exprRef = useRef<HTMLDivElement>(null);

  // Auto-scroll expression
  useEffect(() => {
    if (exprRef.current) {
      exprRef.current.scrollLeft = exprRef.current.scrollWidth;
    }
  }, [expression]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showHistory) {
        if (e.key === 'Escape') setShowHistory(false);
        return;
      }
      const key = e.key;
      if (/^[0-9.]$/.test(key)) return press(key);
      if (['+', '-', '*', '/', '(', ')', '^', '%'].includes(key)) return press(key);
      if (key === 'Enter' || key === '=') { e.preventDefault(); press('='); }
      if (key === 'Backspace') press('DEL');
      if (key === 'Escape') { setExpression(''); setResult(''); setError(''); }
      if (key === 'h' || key === 'H') setShowHistory(true);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expression, showHistory]);

  const evaluateExpr = useCallback((expr: string): string => {
    try {
      setError('');
      if (!expr.trim()) return '';
      // Replace display symbols with mathjs syntax
      let evalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√\(([^)]+)\)/g, 'sqrt($1)')
        .replace(/√(\d+)/g, 'sqrt($1)')
        .replace(/\^\(-1\)/g, '^(-1)')
        .replace(/Ans/g, ans)
        .replace(/sin\u207b\u00b9/g, 'asin')
        .replace(/cos\u207b\u00b9/g, 'acos')
        .replace(/tan\u207b\u00b9/g, 'atan')
        .replace(/ln/g, 'log')
        .replace(/log/g, 'log10')
        .replace(/\u00b2/g, '^2')
        .replace(/\u00b3/g, '^3');

      const scope: Record<string, number> = {};
      if (angleMode === 'DEG') {
        scope.deg = 1;
      }

      const res = evaluate(evalExpr, scope);
      if (res === undefined || res === null) return '';
      
      let formatted: string;
      if (typeof res === 'number') {
        if (!isFinite(res)) throw new Error('Infinite');
        if (Math.abs(res) < 1e-12 && res !== 0) return '0';
        if (Math.abs(res) > 1e12) return res.toExponential(precision);
        formatted = format(res, { precision: precision, notation: 'auto' });
      } else {
        formatted = String(res);
      }
      return formatted;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error';
      if (msg.includes('Undefined') || msg.includes('parse')) return '';
      setError('Error: ' + msg.slice(0, 30));
      return '';
    }
  }, [angleMode, ans, precision]);

  const press = useCallback((key: string) => {
    setError('');

    if (key === 'SHIFT') {
      setShiftMode(!shiftMode);
      setAlphaMode(false);
      return;
    }
    if (key === 'ALPHA') {
      setAlphaMode(!alphaMode);
      setShiftMode(false);
      return;
    }
    if (key === 'MODE') {
      setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG');
      return;
    }
    if (key === 'HIST') {
      setShowHistory(true);
      return;
    }

    // Shift functions
    const shiftMap: Record<string, string> = {
      'sin': 'sin⁻¹', 'cos': 'cos⁻¹', 'tan': 'tan⁻¹',
      'ln': 'e^x', 'log': '10^x', '√': 'x²', '^': 'x³',
      '(': ']', ')': '[', 'π': 'e',
    };

    if (shiftMode && shiftMap[key]) {
      key = shiftMap[key];
      setShiftMode(false);
    }

    if (key === 'AC') {
      setExpression('');
      setResult('');
      setShiftMode(false);
      setAlphaMode(false);
      return;
    }

    if (key === 'DEL') {
      setExpression(prev => prev.slice(0, -1));
      return;
    }

    if (key === '=') {
      const res = evaluateExpr(expression);
      if (res) {
        setResult(res);
        setAns(res);
        setHistory(prev => [{ expr: expression, result: res, timestamp: Date.now() }, ...prev].slice(0, 50));
      }
      return;
    }

    // Special symbols
    const symbolMap: Record<string, string> = {
      'x²': '^2', 'x³': '^3', 'sin⁻¹': 'asin(', 'cos⁻¹': 'acos(', 'tan⁻¹': 'atan(',
      'e^x': 'e^', '10^x': '10^', 'π': 'pi',
    };

    const insert = symbolMap[key] || key;
    setExpression(prev => prev + insert);
  }, [expression, evaluateExpr, shiftMode, alphaMode, angleMode]);

  const loadHistory = (entry: HistoryEntry) => {
    setExpression(entry.expr);
    setResult(entry.result);
    setShowHistory(false);
  };

  // Button layout matching NumOS hardware key matrix
  const buttons = [
    // Row 1: Shift + Alpha + mode + navigation
    { key: 'SHIFT', cls: 'btn-func', label: shiftMode ? '⇧ ON' : 'SHIFT', wide: true },
    { key: 'ALPHA', cls: 'btn-alpha', label: alphaMode ? 'ABC ON' : 'ALPHA', wide: true },
    { key: 'MODE', cls: 'btn-func', label: angleMode },
    { key: 'HIST', cls: 'btn-func', label: 'HIST' },
    { key: 'AC', cls: 'btn-op', label: 'AC' },

    // Row 2: Trig + log
    { key: 'sin', cls: 'btn-func', topLabel: shiftMode ? 'sin⁻¹' : 'sin' },
    { key: 'cos', cls: 'btn-func', topLabel: shiftMode ? 'cos⁻¹' : 'cos' },
    { key: 'tan', cls: 'btn-func', topLabel: shiftMode ? 'tan⁻¹' : 'tan' },
    { key: '^', cls: 'btn-func', label: '^', topLabel: shiftMode ? 'x³' : 'x²' },
    { key: 'DEL', cls: 'btn-op', label: 'DEL' },

    // Row 3: Log + parens + π
    { key: 'ln', cls: 'btn-func', topLabel: shiftMode ? 'e^x' : 'ln' },
    { key: 'log', cls: 'btn-func', topLabel: shiftMode ? '10^x' : 'log' },
    { key: '(', cls: 'btn-func', label: '(', topLabel: shiftMode ? ']' : undefined },
    { key: ')', cls: 'btn-func', label: ')', topLabel: shiftMode ? '[' : undefined },
    { key: '√', cls: 'btn-func', label: '√', topLabel: shiftMode ? 'x²' : undefined },

    // Row 4: Numbers 7-9 + divide
    { key: '7', cls: 'btn-num' },
    { key: '8', cls: 'btn-num' },
    { key: '9', cls: 'btn-num' },
    { key: '÷', cls: 'btn-op', label: '÷' },
    { key: 'π', cls: 'btn-func', label: 'π', topLabel: shiftMode ? 'e' : undefined },

    // Row 5: 4-6 + multiply
    { key: '4', cls: 'btn-num' },
    { key: '5', cls: 'btn-num' },
    { key: '6', cls: 'btn-num' },
    { key: '×', cls: 'btn-op', label: '×' },
    { key: '%', cls: 'btn-func', label: '%' },

    // Row 6: 1-3 + minus
    { key: '1', cls: 'btn-num' },
    { key: '2', cls: 'btn-num' },
    { key: '3', cls: 'btn-num' },
    { key: '-', cls: 'btn-op', label: '−' },
    { key: 'Ans', cls: 'btn-func', label: 'Ans' },

    // Row 7: 0 + dot + plus + equals
    { key: '0', cls: 'btn-num', wide: true },
    { key: '.', cls: 'btn-num' },
    { key: '+', cls: 'btn-op', label: '+' },
    { key: '=', cls: 'btn-op', label: '=', tall: true },
  ];

  // Format expression for display
  const displayExpr = expression
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/pi/g, 'π')
    .replace(/sqrt\(/g, '√(')
    .replace(/asin\(/g, 'sin⁻¹(')
    .replace(/acos\(/g, 'cos⁻¹(')
    .replace(/atan\(/g, 'tan⁻¹(')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^\(-1\)/g, '⁻¹');

  return (
    <div className="calc-wrapper">
      <div className="calculator">
        {/* Branding */}
        <div className="calc-brand">
          <h1>NumOS</h1>
          <div className="subtitle">Open-Source Scientific Calculator</div>
        </div>

        {/* Status bar */}
        <div className="status-bar">
          <span className="status-indicator">
            <span className="status-dot" /> {angleMode}
          </span>
          <span className="status-indicator">
            {shiftMode ? 'SHIFT' : ''} {alphaMode ? 'ALPHA' : ''}
          </span>
          <span className="status-indicator">
            Prec: {precision}
          </span>
        </div>

        {/* Screen */}
        <div className="screen">
          <div className="history-panel" style={{ display: showHistory ? 'flex' : 'none' }}>
            <div className="history-title">Calculation History</div>
            {history.length === 0 && (
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--screen-text-dim)', paddingTop: 20 }}>
                No calculations yet
              </div>
            )}
            {history.map((entry, i) => (
              <div key={i} className="history-entry" onClick={() => loadHistory(entry)}>
                <div className="history-expr">{entry.expr}</div>
                <div className="history-result">{entry.result}</div>
              </div>
            ))}
            <div style={{ marginTop: 'auto', paddingTop: 10 }}>
              <button className="btn btn-func" style={{ width: '100%' }} onClick={() => setShowHistory(false)}>
                CLOSE [ESC]
              </button>
            </div>
          </div>

          <div ref={exprRef} className="screen-expression">
            {displayExpr || '\u00a0'}
          </div>
          <div className="screen-result">
            {error || result || '\u00a0'}
          </div>
          <div className="screen-mode">
            {activeApp === 0 ? 'CALCULATION' : APPS[activeApp]}
          </div>
        </div>

        {/* App launcher */}
        <div className="app-strip">
          {APPS.map((app, i) => (
            <button
              key={app}
              className={`app-tab ${i === activeApp ? 'active' : ''}`}
              onClick={() => setActiveApp(i)}
            >
              {app}
            </button>
          ))}
        </div>

        {/* Button grid */}
        <div className="btn-grid">
          {buttons.map(btn => (
            <button
              key={btn.key}
              className={`btn ${btn.cls} ${btn.wide ? 'btn-wide' : ''} ${btn.tall ? 'btn-tall' : ''}`}
              onClick={() => press(btn.key)}
            >
              {btn.topLabel && (
                <span className={`btn-top-label ${
                  btn.topLabel.includes('⁻¹') || btn.topLabel === 'e' || btn.topLabel === 'x³'
                    ? 'btn-label-shift'
                    : 'btn-label-alpha'
                }`}>
                  {btn.topLabel}
                </span>
              )}
              {btn.label || btn.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
