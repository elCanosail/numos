'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { evaluate, format } from 'mathjs';
import NaturalDisplay from './components/NaturalDisplay';
import Grapher from './components/Grapher';
import EquaSolver from './components/EquaSolver';
import Settings from './components/Settings';

interface HistoryEntry {
  expr: string;
  result: string;
  timestamp: number;
}

const APPS = ['CALC', 'GRAPHER', 'EQUA', 'SETTINGS'];

// Layout inspirado en Casio/TI/HP pero con criterio propio
// 5 columnas, organizadas por frecuencia de uso
const BUTTON_ROWS = [
  // Fila 1: Control
  [
    { key: 'SHIFT', cls: 'btn-shift', label: 'SHIFT' },
    { key: 'ALPHA', cls: 'btn-alpha', label: 'ALPHA' },
    { key: 'MODE', cls: 'btn-func', label: 'MODE' },
    { key: 'HIST', cls: 'btn-func', label: 'HIST' },
    { key: 'AC', cls: 'btn-action', label: 'AC' },
  ],
  // Fila 2: Trig + logs
  [
    { key: 'sin', cls: 'btn-func', topLabel: 'sin⁻¹', label: 'sin' },
    { key: 'cos', cls: 'btn-func', topLabel: 'cos⁻¹', label: 'cos' },
    { key: 'tan', cls: 'btn-func', topLabel: 'tan⁻¹', label: 'tan' },
    { key: 'ln', cls: 'btn-func', topLabel: 'eˣ', label: 'ln' },
    { key: 'log', cls: 'btn-func', topLabel: '10ˣ', label: 'log' },
  ],
  // Fila 3: Powers + parens
  [
    { key: '√', cls: 'btn-func', topLabel: 'x²', label: '√' },
    { key: '^', cls: 'btn-func', label: '^' },
    { key: '(', cls: 'btn-func', label: '(' },
    { key: ')', cls: 'btn-func', label: ')' },
    { key: 'π', cls: 'btn-func', label: 'π' },
  ],
  // Fila 4: Números 7-9 + DEL
  [
    { key: '7', cls: 'btn-num', label: '7' },
    { key: '8', cls: 'btn-num', label: '8' },
    { key: '9', cls: 'btn-num', label: '9' },
    { key: 'DEL', cls: 'btn-action', label: 'DEL' },
    { key: '÷', cls: 'btn-op', label: '÷' },
  ],
  // Fila 5: Números 4-6 + ops
  [
    { key: '4', cls: 'btn-num', label: '4' },
    { key: '5', cls: 'btn-num', label: '5' },
    { key: '6', cls: 'btn-num', label: '6' },
    { key: '×', cls: 'btn-op', label: '×' },
    { key: 'Ans', cls: 'btn-func', label: 'Ans' },
  ],
  // Fila 6: Números 1-3 + ops
  [
    { key: '1', cls: 'btn-num', label: '1' },
    { key: '2', cls: 'btn-num', label: '2' },
    { key: '3', cls: 'btn-num', label: '3' },
    { key: '+', cls: 'btn-op', label: '+' },
    { key: '-', cls: 'btn-op', label: '−' },
  ],
  // Fila 7: 0, ., EXP, =
  [
    { key: '0', cls: 'btn-num', label: '0' },
    { key: '.', cls: 'btn-num', label: '.' },
    { key: '×10ˣ', cls: 'btn-func', label: 'EXP' },
    { key: '=', cls: 'btn-op', label: '=', wide: true },
  ],
];

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
  const [theme, setTheme] = useState('dark');
  const exprRef = useRef<HTMLDivElement>(null);

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem('numos_settings');
    if (saved) {
      try {
        const { precision: p, angleMode: a, theme: t } = JSON.parse(saved);
        setPrecision(p || 10);
        setAngleMode(a || 'DEG');
        setTheme(t || 'dark');
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('numos_settings', JSON.stringify({ precision, angleMode, theme }));
  }, [precision, angleMode, theme]);

  useEffect(() => {
    if (exprRef.current) {
      exprRef.current.scrollLeft = exprRef.current.scrollWidth;
    }
  }, [expression]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showHistory) {
        if (e.key === 'Escape') setShowHistory(false);
        return;
      }
      if (activeApp !== 0) return;
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
  }, [expression, showHistory, activeApp]);

  const evaluateExpr = useCallback((expr: string): string => {
    try {
      setError('');
      if (!expr.trim()) return '';
      let evalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√(([^)]+))/g, 'sqrt($1)')
        .replace(/√(\d+)/g, 'sqrt($1)')
        .replace(/\^\(-1\)/g, '^(-1)')
        .replace(/Ans/g, ans)
        .replace(/sin\u207b\u00b9/g, 'asin')
        .replace(/cos\u207b\u00b9/g, 'acos')
        .replace(/tan\u207b\u00b9/g, 'atan')
        .replace(/ln/g, 'log')
        .replace(/log/g, 'log10')
        .replace(/\u00b2/g, '^2')
        .replace(/\u00b3/g, '^3')
        .replace(/×10\^/g, '*10^')
        .replace(/x\u207b\u00b9/g, '^(-1)')
        .replace(/\(-\)/g, '-');

      const scope: Record<string, number> = {};
      if (angleMode === 'DEG') scope.deg = 1;

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

    if (key === 'SHIFT') { setShiftMode(!shiftMode); setAlphaMode(false); return; }
    if (key === 'ALPHA') { setAlphaMode(!alphaMode); setShiftMode(false); return; }
    if (key === 'MODE') { setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG'); return; }
    if (key === 'HIST') { setShowHistory(true); return; }

    const shiftMap: Record<string, string> = {
      'sin': 'sin⁻¹', 'cos': 'cos⁻¹', 'tan': 'tan⁻¹',
      'ln': 'e^x', 'log': '10^x', '√': 'x²', '^': 'x√',
    };
    if (shiftMode && shiftMap[key]) { key = shiftMap[key]; setShiftMode(false); }

    if (key === 'AC') { setExpression(''); setResult(''); setShiftMode(false); setAlphaMode(false); return; }
    if (key === 'DEL') { setExpression(prev => prev.slice(0, -1)); return; }

    if (key === '=') {
      const res = evaluateExpr(expression);
      if (res) {
        setResult(res);
        setAns(res);
        setHistory(prev => [{ expr: expression, result: res, timestamp: Date.now() }, ...prev].slice(0, 50));
      }
      return;
    }

    const symbolMap: Record<string, string> = {
      'x²': '^2', 'x³': '^3', 'sin⁻¹': 'asin(', 'cos⁻¹': 'acos(', 'tan⁻¹': 'atan(',
      'e^x': 'e^', '10^x': '10^', 'π': 'pi', 'x⁻¹': '^(-1)',
      '×10ˣ': '*10^', 'EXP': '*10^',
    };
    const insert = symbolMap[key] || key;
    setExpression(prev => prev + insert);
  }, [expression, evaluateExpr, shiftMode, alphaMode, angleMode]);

  const loadHistory = (entry: HistoryEntry) => {
    setExpression(entry.expr);
    setResult(entry.result);
    setShowHistory(false);
  };

  const renderApp = () => {
    switch (activeApp) {
      case 1: return <Grapher />;
      case 2: return <EquaSolver />;
      case 3: return (
        <Settings
          precision={precision}
          onPrecisionChange={setPrecision}
          angleMode={angleMode}
          onAngleModeChange={setAngleMode}
          theme={theme}
          onThemeChange={setTheme}
          onClearHistory={() => setHistory([])}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="calc-wrapper">
      <div className="calculator">
        {/* Branding */}
        <div className="calc-brand">
          <h1>NumOS</h1>
          <span className="subtitle">Scientific</span>
        </div>

        {/* Status pills */}
        <div className="status-bar">
          <span className={`status-pill ${shiftMode ? 'shift-active' : ''}`}>
            {shiftMode ? 'SHIFT' : angleMode}
          </span>
          <span className={`status-pill ${alphaMode ? 'alpha-active' : ''}`}>
            {alphaMode ? 'ALPHA' : `FIX ${precision}`}
          </span>
          <span className={`status-pill ${ans !== '0' ? 'active' : ''}`}>
            ANS
          </span>
        </div>

        {/* Screen */}
        <div className="screen">
          {showHistory && (
            <div className="history-panel">
              <div className="history-title">History</div>
              {history.length === 0 && (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--screen-text-dim)', paddingTop: 20, textAlign: 'center' }}>
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
          )}

          <div ref={exprRef} className="screen-expression">
            {activeApp === 0 ? <NaturalDisplay expression={expression} /> : '\u00a0'}
          </div>
          <div className={`screen-result ${error ? 'error' : ''}`}>
            {error || result || '\u00a0'}
          </div>
          <div className="screen-mode">
            <span>{activeApp === 0 ? 'CALC' : APPS[activeApp]}</span>
            {expression && <span className="cursor-blink">|</span>}
          </div>
        </div>

        {/* App panels */}
        {activeApp !== 0 && renderApp()}

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
        {activeApp === 0 && (
          <div className="btn-grid">
            {BUTTON_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="btn-row">
                {row.map(btn => (
                  <button
                    key={btn.key}
                    className={`btn ${btn.cls} ${btn.wide ? 'btn-wide' : ''}`}
                    style={btn.wide ? { gridColumn: 'span 2' } : undefined}
                    onClick={() => press(btn.key)}
                  >
                    {btn.topLabel && (
                      <span className={`btn-top-label ${
                        btn.topLabel.includes('⁻¹') || ['eˣ', '10ˣ', 'x²', 'x√'].includes(btn.topLabel)
                          ? 'btn-label-shift'
                          : 'btn-label-alpha'
                      }`}>
                        {btn.topLabel}
                      </span>
                    )}
                    <span className="btn-main-label">{btn.label || btn.key}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
