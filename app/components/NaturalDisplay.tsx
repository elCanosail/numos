'use client';

interface NaturalDisplayProps {
  expression: string;
}

export default function NaturalDisplay({ expression }: NaturalDisplayProps) {
  if (!expression) return <div className="natural-display">&nbsp;</div>;

  // Try to detect and render fractions
  const renderExpr = () => {
    // Simple fraction detection: a/b where a and b are numbers or simple expressions
    const fracMatch = expression.match(/(.+)\/(.+)/);
    if (fracMatch) {
      const [, num, den] = fracMatch;
      return (
        <div className="natural-fraction">
          <div className="frac-num">{formatToken(num)}</div>
          <div className="frac-bar" />
          <div className="frac-den">{formatToken(den)}</div>
        </div>
      );
    }

    // Power detection: x^2, x^3
    const powerMatch = expression.match(/(.+)\^(\d+)/);
    if (powerMatch) {
      const [, base, exp] = powerMatch;
      return (
        <div className="natural-power">
          <span>{formatToken(base)}</span>
          <sup className="natural-sup">{exp}</sup>
        </div>
      );
    }

    // Default: render as formatted tokens
    return <div className="natural-tokens">{formatToken(expression)}</div>;
  };

  return <div className="natural-display">{renderExpr()}</div>;
}

function formatToken(expr: string): React.ReactNode {
  // Replace common symbols
  const formatted = expr
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/pi/g, 'π')
    .replace(/sqrt\(/g, '√(')
    .replace(/sqrt(\d+)/g, '√$1')
    .replace(/asin\(/g, 'sin⁻¹(')
    .replace(/acos\(/g, 'cos⁻¹(')
    .replace(/atan\(/g, 'tan⁻¹(')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^\(-1\)/g, '⁻¹')
    .replace(/\^\(([^)]+)\)/g, '^($1)')
    .replace(/Ans/g, 'Ans')
    .replace(/e\^/g, 'e^')
    .replace(/10\^/g, '10^');

  return formatted;
}
