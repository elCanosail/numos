# 🔢 NumOS — Open-Source Scientific Calculator

> A fully functional web simulator of the **NumOS** scientific calculator firmware — built on ESP32, rendered in the browser.

[![Deploy](https://img.shields.io/badge/Live%20Demo-numos-two.vercel.app-orange?style=flat-square&logo=vercel)](https://numos-two.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🚀 Live Demo

**Try it now:** [https://numos-two.vercel.app](https://numos-two.vercel.app)

Works on desktop and mobile. No installation required.

---

## 📸 Screenshots

| Calculator | Grapher | Equation Solver |
|:----------:|:-------:|:---------------:|
| ![calc](https://via.placeholder.com/320x420/2a2d32/c8d0a8?text=CALC) | ![graph](https://via.placeholder.com/320x420/1a1a2e/4ade80?text=GRAPHER) | ![equa](https://via.placeholder.com/320x420/2a2d32/c8d0a8?text=EQUA) |

---

## ✨ Features

### 🧮 CALC — Scientific Calculator
- Full numeric keypad with **physical-button feel** (3D press animation)
- **SHIFT / ALPHA** modifier keys for secondary functions
- Trigonometric functions: `sin`, `cos`, `tan` + inverse (`sin⁻¹`, `cos⁻¹`, `tan⁻¹`)
- Logarithms: `ln`, `log₁₀` + exponential shortcuts (`eˣ`, `10ˣ`)
- Powers & roots: `x²`, `x³`, `√`, `^`
- Constants: `π`, `e`, `Ans` (last result)
- **Angle modes**: DEG / RAD toggle
- **Precision control**: 5–15 decimal places
- **Calculation history** with click-to-recall (press `H` or `HIST` button)
- **Natural Display** — renders fractions, superscripts, and roots as real math notation
- Keyboard support: type expressions directly, `Enter` to evaluate, `ESC` to clear

### 📈 GRAPHER — Function Plotter
- Real-time plot of `y = f(x)` using HTML5 Canvas
- **Presets**: `sin(x)`, `x²`, `eˣ`, `ln(x)`, `1/x`
- **Zoom** with mouse wheel
- Configurable X/Y ranges with live input fields
- Grid, axes, and coordinate labels
- Powered by **MathJS** for safe expression evaluation

### ➗ EQUA — Equation Solver
Three solver modes with step-by-step working:
- **Linear**: `ax + b = 0` → `x = -b/a`
- **Quadratic**: `ax² + bx + c = 0` → discriminant, real/complex roots
- **2×2 System**: Cramer's rule with determinant calculation

### ⚙️ SETTINGS
- **Precision slider**: 5–15 digits
- **Angle mode**: DEG / RAD toggle
- **3 Themes**: Dark (default), Light, Classic LCD
- **Clear history** button
- All settings persisted to `localStorage`

---

## 🏗️ Architecture

```
NumOS Web Simulator
├── Next.js 15 (App Router)
├── React 19 + TypeScript
├── MathJS — expression evaluation
├── Pure CSS — no Tailwind, no UI frameworks
│   ├── Physical button design (shadows, gradients, press states)
│   ├── LCD screen simulation (scanlines, color shifts)
│   └── 3 theme variants (Dark / Light / LCD)
└── Static export → Vercel
```

### File Structure
```
app/
├── page.tsx              # Main calculator shell
├── layout.tsx            # Root layout + fonts
├── globals.css           # All styles (themes, buttons, screen)
└── components/
    ├── NaturalDisplay.tsx  # 2D math rendering (fractions, powers)
    ├── Grapher.tsx         # Canvas function plotter
    ├── EquaSolver.tsx      # Linear/Quadratic/System solver
    └── Settings.tsx        # Preferences panel
```

---

## 🖥️ Hardware Origin

This web simulator is based on the **NumOS** firmware project — an open-source scientific calculator operating system built for the **ESP32-S3 N16R8** microcontroller with a color TFT display.

| | Hardware (NumOS) | This Simulator |
|:---|:---|:---|
| **Platform** | ESP32-S3 + TFT | Browser (any device) |
| **CAS Engine** | Giac C++ | MathJS |
| **Display** | Physical LCD | Simulated LCD with scanlines |
| **Input** | Physical keys | Click / Touch / Keyboard |
| **Apps** | 8 (incl. Particle Lab, Bridge Designer) | 4 (CALC, GRAPHER, EQUA, SETTINGS) |

The hardware project targets real calculator devices competing with Casio fx-991EX, TI-84 Plus CE, and HP Prime G2. This web version lets you experience the calculator interface without the hardware.

---

## 🛠️ Local Development

```bash
# Clone
git clone https://github.com/elCanosail/numos.git
cd numos

# Install
npm install

# Dev server
npm run dev

# Build (static export)
npm run build
```

---

## 🎯 Roadmap

- [x] CALC with full keypad and history
- [x] GRAPHER with zoom and presets
- [x] EQUA solver (linear, quadratic, 2×2)
- [x] SETTINGS with themes and precision
- [x] Natural Display for fractions/powers
- [ ] CALCUL — Calculus (derivatives, integrals)
- [ ] PYTHON — MicroPython console simulation
- [ ] PARTICLE — Powder Toy sandbox
- [ ] BRIDGE — Structural simulator
- [ ] Variable memory (A–Z + Ans persistence)
- [ ] Matrix operations
- [ ] Complex number display

---

## 🤝 Contributing

Contributions welcome. The hardware project lives at [github.com/El-EnderJ/NeoCalculator](https://github.com/El-EnderJ/NeoCalculator) — this repo is the web simulator spin-off.

Issues and PRs for UI improvements, new calculator features, or bug fixes are appreciated.

---

## 📜 License

MIT — feel free to fork, embed, or hack on this.

---

## 🙏 Credits

- **NumOS / NeoCalculator** hardware project by [El-EnderJ](https://github.com/El-EnderJ)
- **Web simulator** by [elCanosail](https://github.com/elCanosail)
- Powered by [MathJS](https://mathjs.org/) for mathematical evaluation

---

<p align="center">
  <sub>Built with precision. No bloat. Just math.</sub>
</p>
