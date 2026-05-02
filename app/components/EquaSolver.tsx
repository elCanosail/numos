'use client';

import { useState } from 'react';

interface Step {
  label: string;
  value: string;
  kind?: 'normal' | 'error' | 'success';
}

export default function EquaSolver() {
  const [mode, setMode] = useState<'linear' | 'quadratic' | 'system'>('linear');
  const [steps, setSteps] = useState<Step[]>([]);

  // Linear: ax + b = 0
  const [linA, setLinA] = useState('1');
  const [linB, setLinB] = useState('0');

  // Quadratic: ax² + bx + c = 0
  const [quadA, setQuadA] = useState('1');
  const [quadB, setQuadB] = useState('0');
  const [quadC, setQuadC] = useState('0');

  // System 2x2
  const [s11, setS11] = useState('1');
  const [s12, setS12] = useState('0');
  const [s1r, setS1r] = useState('0');
  const [s21, setS21] = useState('0');
  const [s22, setS22] = useState('1');
  const [s2r, setS2r] = useState('0');

  const solveLinear = () => {
    const a = parseFloat(linA);
    const b = parseFloat(linB);
    if (a === 0) {
      setSteps([
        {
          label: 'Error',
          value: a === 0 && b === 0 ? 'Infinite solutions' : 'No solution',
          kind: 'error',
        },
      ]);
      return;
    }
    const x = -b / a;
    setSteps([
      { label: 'Equation', value: `${fmt(a)}x + ${fmt(b)} = 0` },
      { label: 'Isolate x', value: `${fmt(a)}x = ${fmt(-b)}` },
      { label: 'Divide', value: `x = ${fmt(-b)} / ${fmt(a)}` },
      { label: 'Result', value: `x = ${fmt(x)}`, kind: 'success' },
    ]);
  };

  const solveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);
    if (a === 0) {
      setSteps([
        { label: 'Error', value: 'a must not be 0', kind: 'error' },
      ]);
      return;
    }

    const disc = b * b - 4 * a * c;
    const newSteps: Step[] = [
      { label: 'Equation', value: `${fmt(a)}x² + ${fmt(b)}x + ${fmt(c)} = 0` },
      {
        label: 'Discriminant',
        value: `Δ = ${fmt(b)}² - 4(${fmt(a)})(${fmt(c)}) = ${fmt(disc)}`,
      },
    ];

    if (disc < 0) {
      const real = -b / (2 * a);
      const imag = Math.sqrt(-disc) / (2 * a);
      newSteps.push({
        label: 'No real roots',
        value: `Complex: ${fmt(real)} ± ${fmt(imag)}i`,
        kind: 'error',
      });
    } else if (disc === 0) {
      const x = -b / (2 * a);
      newSteps.push({
        label: 'Double root',
        value: `x = ${fmt(x)}`,
        kind: 'success',
      });
    } else {
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      newSteps.push({
        label: 'Root 1',
        value: `x₁ = ${fmt(x1)}`,
        kind: 'success',
      });
      newSteps.push({
        label: 'Root 2',
        value: `x₂ = ${fmt(x2)}`,
        kind: 'success',
      });
    }
    setSteps(newSteps);
  };

  const solveSystem = () => {
    const a11 = parseFloat(s11),
      a12 = parseFloat(s12),
      b1 = parseFloat(s1r);
    const a21 = parseFloat(s21),
      a22 = parseFloat(s22),
      b2 = parseFloat(s2r);
    const det = a11 * a22 - a12 * a21;

    if (det === 0) {
      setSteps([
        { label: 'Determinant', value: `${fmt(det)}` },
        { label: 'Error', value: 'No unique solution', kind: 'error' },
      ]);
      return;
    }

    const x = (b1 * a22 - a12 * b2) / det;
    const y = (a11 * b2 - b1 * a21) / det;
    setSteps([
      {
        label: 'System',
        value: `${fmt(a11)}x + ${fmt(a12)}y = ${fmt(b1)}\n${fmt(a21)}x + ${fmt(a22)}y = ${fmt(b2)}`,
      },
      { label: 'Determinant', value: `det = ${fmt(det)}` },
      {
        label: 'Cramer X',
        value: `x = ${fmt(b1 * a22 - a12 * b2)} / ${fmt(det)}`,
      },
      {
        label: 'Cramer Y',
        value: `y = ${fmt(a11 * b2 - b1 * a21)} / ${fmt(det)}`,
      },
      {
        label: 'Result',
        value: `x = ${fmt(x)}, y = ${fmt(y)}`,
        kind: 'success',
      },
    ]);
  };

  const fmt = (n: number) => {
    if (!isFinite(n)) return String(n);
    if (Math.abs(n) < 1e-10) return '0';
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(6).replace(/\.?0+$/, '');
  };

  // Render equation with styled coefficients
  const Coeff = ({ val, placeholder }: { val: string; placeholder: string }) => (
    <span className="coeff-inline">{val || placeholder}</span>
  );

  return (
    <div className="equa-panel">
      <div className="equa-tabs">
        {(['linear', 'quadratic', 'system'] as const).map((m) => (
          <button
            key={m}
            className={`equa-tab ${mode === m ? 'active' : ''}`}
            onClick={() => {
              setMode(m);
              setSteps([]);
            }}
          >
            {m === 'linear' && 'Linear'}
            {m === 'quadratic' && 'Quadratic'}
            {m === 'system' && '2×2 System'}
          </button>
        ))}
      </div>

      {mode === 'linear' && (
        <div className="equa-content">
          <div className="equation-display">
            <Coeff val={linA} placeholder="a" />
            <span className="var-inline">x</span>
            <span className="eq-operator">+</span>
            <Coeff val={linB} placeholder="b" />
            <span className="eq-operator">=</span>
            <span className="eq-equals">0</span>
          </div>
          <div className="coeff-grid-2">
            <input
              type="number"
              value={linA}
              onChange={(e) => setLinA(e.target.value)}
              placeholder="a"
            />
            <input
              type="number"
              value={linB}
              onChange={(e) => setLinB(e.target.value)}
              placeholder="b"
            />
          </div>
          <button className="btn-op" onClick={solveLinear}>
            Solve
          </button>
        </div>
      )}

      {mode === 'quadratic' && (
        <div className="equa-content">
          <div className="equation-display">
            <Coeff val={quadA} placeholder="a" />
            <span className="var-inline">
              x<sup>2</sup>
            </span>
            <span className="eq-operator">+</span>
            <Coeff val={quadB} placeholder="b" />
            <span className="var-inline">x</span>
            <span className="eq-operator">+</span>
            <Coeff val={quadC} placeholder="c" />
            <span className="eq-operator">=</span>
            <span className="eq-equals">0</span>
          </div>
          <div className="coeff-grid-3">
            <input
              type="number"
              value={quadA}
              onChange={(e) => setQuadA(e.target.value)}
              placeholder="a"
            />
            <input
              type="number"
              value={quadB}
              onChange={(e) => setQuadB(e.target.value)}
              placeholder="b"
            />
            <input
              type="number"
              value={quadC}
              onChange={(e) => setQuadC(e.target.value)}
              placeholder="c"
            />
          </div>
          <button className="btn-op" onClick={solveQuadratic}>
            Solve
          </button>
        </div>
      )}

      {mode === 'system' && (
        <div className="equa-content">
          <div className="equation-display" style={{ lineHeight: 1.8 }}>
            <Coeff val={s11} placeholder="a₁₁" />
            <span className="var-inline">x</span>
            <span className="eq-operator">+</span>
            <Coeff val={s12} placeholder="a₁₂" />
            <span className="var-inline">y</span>
            <span className="eq-operator">=</span>
            <Coeff val={s1r} placeholder="b₁" />
            <br />
            <Coeff val={s21} placeholder="a₂₁" />
            <span className="var-inline">x</span>
            <span className="eq-operator">+</span>
            <Coeff val={s22} placeholder="a₂₂" />
            <span className="var-inline">y</span>
            <span className="eq-operator">=</span>
            <Coeff val={s2r} placeholder="b₂" />
          </div>
          <div className="coeff-grid-3 sys">
            <input
              type="number"
              value={s11}
              onChange={(e) => setS11(e.target.value)}
              placeholder="a₁₁"
            />
            <input
              type="number"
              value={s12}
              onChange={(e) => setS12(e.target.value)}
              placeholder="a₁₂"
            />
            <input
              type="number"
              value={s1r}
              onChange={(e) => setS1r(e.target.value)}
              placeholder="b₁"
            />
            <input
              type="number"
              value={s21}
              onChange={(e) => setS21(e.target.value)}
              placeholder="a₂₁"
            />
            <input
              type="number"
              value={s22}
              onChange={(e) => setS22(e.target.value)}
              placeholder="a₂₂"
            />
            <input
              type="number"
              value={s2r}
              onChange={(e) => setS2r(e.target.value)}
              placeholder="b₂"
            />
          </div>
          <button className="btn-op" onClick={solveSystem}>
            Solve
          </button>
        </div>
      )}

      {steps.length > 0 && (
        <div className="steps-panel">
          {steps.map((s, i) => (
            <div key={i} className="step-row">
              <span className="step-label">{s.label}</span>
              <span className={`step-value ${s.kind || ''}`}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
