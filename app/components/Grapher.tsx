'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { evaluate } from 'mathjs';

export default function Grapher() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [func, setFunc] = useState('sin(x)');
  const [xMin, setXMin] = useState(-6.28);
  const [xMax, setXMax] = useState(6.28);
  const [yMin, setYMin] = useState(-1.5);
  const [yMax, setYMax] = useState(1.5);
  const [error, setError] = useState('');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive sizing
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cssW = rect.width;
    const cssH = rect.height;

    // Background — matches .screen bg
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, cssW, cssH);

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    // Grid — subtle, like screen grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    const gridStepX = xRange / 10;
    const gridStepY = yRange / 10;

    for (let i = 1; i < 10; i++) {
      const x = i / 10 * cssW;
      const y = i / 10 * cssH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cssW, y);
      ctx.stroke();
    }

    // Axes — #6a6a8a per spec
    ctx.strokeStyle = '#6a6a8a';
    ctx.lineWidth = 1.5;
    const x0 = (-xMin / xRange) * cssW;
    const y0 = cssH - ((-yMin / yRange) * cssH);

    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, cssH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(cssW, y0);
    ctx.stroke();

    // Plot function — #4ade80 (accent-green)
    if (!func.trim()) return;

    setError('');
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let first = true;
    let lastPy: number | null = null;
    const step = Math.max(1, Math.floor(cssW / 400)); // adaptive quality

    for (let px = 0; px <= cssW; px += step) {
      const x = xMin + (px / cssW) * xRange;
      try {
        const scope = { x, pi: Math.PI, e: Math.E };
        const y = Number(evaluate(func, scope));
        if (!isFinite(y)) {
          first = true;
          lastPy = null;
          continue;
        }

        const py = cssH - ((y - yMin) / yRange) * cssH;

        if (py < -50 || py > cssH + 50) {
          first = true;
          lastPy = null;
          continue;
        }

        // Smooth line breaks for discontinuities
        if (lastPy !== null && Math.abs(py - lastPy) > cssH * 0.4) {
          first = true;
        }

        if (first) {
          ctx.moveTo(px, py);
          first = false;
        } else {
          ctx.lineTo(px, py);
        }
        lastPy = py;
      } catch {
        first = true;
        lastPy = null;
      }
    }
    ctx.stroke();

    // Labels — JetBrains Mono, #a0a0b0
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    // X labels
    for (let i = 0; i <= 10; i++) {
      const x = xMin + (i / 10) * xRange;
      const px = (i / 10) * cssW;
      if (Math.abs(px - x0) > 18) {
        ctx.fillText(formatLabel(x), px, Math.min(cssH - 4, Math.max(y0 + 12, 12)));
      }
    }

    // Y labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
      const y = yMin + (i / 10) * yRange;
      const py = cssH - (i / 10) * cssH;
      if (Math.abs(py - y0) > 14) {
        ctx.fillText(formatLabel(y), Math.max(x0 - 6, 30), py + 3);
      }
    }
  }, [func, xMin, xMax, yMin, yMax]);

  const formatLabel = (n: number) => {
    if (Math.abs(n) < 1e-10) return '0';
    if (Number.isInteger(n)) return String(n);
    const absN = Math.abs(n);
    if (absN >= 10) return n.toFixed(1);
    if (absN >= 1) return n.toFixed(2);
    if (absN >= 0.1) return n.toFixed(3);
    return n.toExponential(1);
  };

  useEffect(() => {
    draw();
  }, [draw]);

  // Resize observer for responsive canvas
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [draw]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const xMid = (xMin + xMax) / 2;
    const yMid = (yMin + yMax) / 2;
    const xHalf = ((xMax - xMin) / 2) * factor;
    const yHalf = ((yMax - yMin) / 2) * factor;
    setXMin(xMid - xHalf);
    setXMax(xMid + xHalf);
    setYMin(yMid - yHalf);
    setYMax(yMid + yHalf);
  };

  const presets = [
    { label: 'sin(x)', f: 'sin(x)', x: [-6.28, 6.28], y: [-1.5, 1.5] },
    { label: 'x²', f: 'x^2', x: [-5, 5], y: [-1, 10] },
    { label: 'eˣ', f: 'e^x', x: [-3, 3], y: [-1, 10] },
    { label: 'ln(x)', f: 'log(x)', x: [0.1, 5], y: [-3, 3] },
    { label: '1/x', f: '1/x', x: [-5, 5], y: [-5, 5] },
    { label: 'tan(x)', f: 'tan(x)', x: [-3.14, 3.14], y: [-5, 5] },
  ];

  return (
    <div className="grapher-panel">
      <div className="grapher-top">
        <input
          className="grapher-input"
          value={func}
          onChange={(e) => setFunc(e.target.value)}
          placeholder="f(x) = ..."
          spellCheck={false}
          autoComplete="off"
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

      <div ref={wrapperRef} className="grapher-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="grapher-canvas"
          onWheel={handleWheel}
        />
      </div>

      <div className="grapher-ranges">
        <div className="range-group">
          <label>X range</label>
          <input
            type="number"
            step={0.1}
            value={xMin}
            onChange={(e) => setXMin(Number(e.target.value))}
          />
          <span>→</span>
          <input
            type="number"
            step={0.1}
            value={xMax}
            onChange={(e) => setXMax(Number(e.target.value))}
          />
        </div>
        <div className="range-group">
          <label>Y range</label>
          <input
            type="number"
            step={0.1}
            value={yMin}
            onChange={(e) => setYMin(Number(e.target.value))}
          />
          <span>→</span>
          <input
            type="number"
            step={0.1}
            value={yMax}
            onChange={(e) => setYMax(Number(e.target.value))}
          />
        </div>
      </div>

      {error && <div className="grapher-error">{error}</div>}
    </div>
  );
}
