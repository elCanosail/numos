'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { evaluate } from 'mathjs';

export default function Grapher() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [func, setFunc] = useState('sin(x)');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-2);
  const [yMax, setYMax] = useState(2);
  const [error, setError] = useState('');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    // Grid
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    const gridStepX = xRange / 10;
    const gridStepY = yRange / 10;
    
    for (let i = 0; i <= 10; i++) {
      const x = i / 10 * w;
      const y = i / 10 * h;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#6a6a8a';
    ctx.lineWidth = 2;
    const x0 = -xMin / xRange * w;
    const y0 = h - (-yMin / yRange * h);

    ctx.beginPath();
    ctx.moveTo(x0, 0); ctx.lineTo(x0, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y0); ctx.lineTo(w, y0);
    ctx.stroke();

    // Plot function
    if (!func.trim()) return;
    
    setError('');
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let first = true;
    for (let px = 0; px <= w; px++) {
      const x = xMin + (px / w) * xRange;
      try {
        const scope = { x, pi: Math.PI, e: Math.E };
        const y = Number(evaluate(func, scope));
        if (!isFinite(y)) { first = true; continue; }
        
        const py = h - ((y - yMin) / yRange * h);
        
        if (py < -100 || py > h + 100) { first = true; continue; }
        
        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
      } catch {
        first = true;
      }
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    
    // X labels
    for (let i = 0; i <= 10; i++) {
      const x = xMin + (i / 10) * xRange;
      const px = i / 10 * w;
      if (Math.abs(px - x0) > 20) {
        ctx.fillText(x.toFixed(1), px, y0 + 15);
      }
    }
    
    // Y labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
      const y = yMin + (i / 10) * yRange;
      const py = h - (i / 10 * h);
      if (Math.abs(py - y0) > 20) {
        ctx.fillText(y.toFixed(1), x0 - 5, py + 3);
      }
    }
  }, [func, xMin, xMax, yMin, yMax]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const xMid = (xMin + xMax) / 2;
    const yMid = (yMin + yMax) / 2;
    const xHalf = (xMax - xMin) / 2 * factor;
    const yHalf = (yMax - yMin) / 2 * factor;
    setXMin(xMid - xHalf);
    setXMax(xMid + xHalf);
    setYMin(yMid - yHalf);
    setYMax(yMid + yHalf);
  };

  const presets = [
    { label: 'sin(x)', f: 'sin(x)', x: [-6.28, 6.28], y: [-1.5, 1.5] },
    { label: 'x²', f: 'x^2', x: [-5, 5], y: [-1, 10] },
    { label: 'e^x', f: 'e^x', x: [-3, 3], y: [-1, 10] },
    { label: 'ln(x)', f: 'log(x)', x: [0.1, 5], y: [-3, 3] },
    { label: '1/x', f: '1/x', x: [-5, 5], y: [-5, 5] },
  ];

  return (
    <div className="grapher-panel">
      <div className="grapher-top">
        <input
          className="grapher-input"
          value={func}
          onChange={(e) => setFunc(e.target.value)}
          placeholder="f(x) = ..."
        />
        <div className="grapher-presets">
          {presets.map((p) => (
            <button
              key={p.label}
              className="preset-btn"
              onClick={() => {
                setFunc(p.f);
                setXMin(p.x[0]);
                setXMax(p.x[1]);
                setYMin(p.y[0]);
                setYMax(p.y[1]);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={350}
        className="grapher-canvas"
        onWheel={handleWheel}
      />

      <div className="grapher-ranges">
        <div className="range-group">
          <label>X range:</label>
          <input type="number" step={0.1} value={xMin} onChange={(e) => setXMin(Number(e.target.value))} />
          <span>to</span>
          <input type="number" step={0.1} value={xMax} onChange={(e) => setXMax(Number(e.target.value))} />
        </div>
        <div className="range-group">
          <label>Y range:</label>
          <input type="number" step={0.1} value={yMin} onChange={(e) => setYMin(Number(e.target.value))} />
          <span>to</span>
          <input type="number" step={0.1} value={yMax} onChange={(e) => setYMax(Number(e.target.value))} />
        </div>
      </div>

      {error && <div className="grapher-error">{error}</div>}
    </div>
  );
}
