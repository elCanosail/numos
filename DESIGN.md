# NumOS Design Reference — Calculator UI v3

## Referencias Principales

### 1. Casio fx-991ES PLUS / EX ClassWiz (Primary)
- **Layout teclado**: 5 columnas × ~10 filas
- **Teclas SHIFT**: Funciones amarillas arriba de cada tecla
- **Teclas ALPHA**: Funciones rojas arriba de cada tecla  
- **Teclas numéricas**: Gris oscuro, texto blanco
- **Teclas de operación**: Naranja/marrón (AC, DEL, =)
- **Teclas de función**: Gris medio (sin, cos, log, etc.)

### 2. TI-84 Plus CE (Secondary)
- **Pantalla**: LCD retro, ~96×31 pixels feel
- **Menus**: Sistema de menús anidados
- **MathPrint**: Fracciones y templates visuales

### 3. HP Prime G2 (Tertiary)
- **Touch interface**: Referencia para apps modernas
- **Color coding**: Consistente por categoría

---

## Layout de Teclas — Casio fx-991ES PLUS

```
Fila 1 (Sistema):
[SHIFT]  [ALPHA]  [←]  [→]  [MODE/SETUP]

Fila 2 (Funciones inversas):
[solve]  [d/dx]  [∫]  [↓]  [↑]

Fila 3 (Trig/Log):
[sin]  [cos]  [tan]  [^]  [log]  [ln]  [(-)]  [° ' "]  [hyp]

Fila 4 (Memoria/Básico):
[ENG]  [(]  [)]  [,]  [S⇔D]

Fila 5 (Números 7-9 ÷):
[7]  [8]  [9]  [DEL]  [AC]

Fila 6 (Números 4-6 ×):
[4]  [5]  [6]  [×]  [÷]

Fila 7 (Números 1-3 -):
[1]  [2]  [3]  [+]  [-]

Fila 8 (0 . EXP =):
[0]  [.]  [×10ˣ]  [Ans]  [=]

Fila 9 (Editar/ABCD):
[INS]  [DEL]  [RECALL]  [STORE]  [M+]
```

**Nota**: NumOS usa 5 columnas. Adaptamos a grid 5×7 para web.

---

## Colores — Referencia Casio

```css
/* Colores teclas */
--key-number:        #2a2d35;    /* Gris muy oscuro, números */
--key-number-text:   #e0e0e0;    /* Blanco grisáceo */

--key-function:      #4a5560;    /* Gris medio, funciones */
--key-function-text: #e0e0e0;

--key-operator:      #c4621e;    /* Naranja óxido, operaciones */
--key-operator-text: #ffffff;

--key-shift:         #d4a017;    /* Amarillo dorado, SHIFT */
--key-alpha:         #c53030;    /* Rojo, ALPHA */

--key-action:        #a04818;    /* Marrón rojizo, AC/DEL/= */
--key-action-text:   #ffffff;

/* Pantalla LCD */
--screen-bg:         #c4c8b0;    /* Verde grisáceo LCD */
--screen-text:       #1a1e12;    /* Casi negro */
--screen-text-dim:   #5a6048;    /* Gris verdoso */

/* Cuerpo calculadora */
--calc-body:         #1e2128;    /* Negro azulado */
--calc-bezel:        #15181e;    /* Más oscuro */
--calc-accent:       #2d333d;    /* Detalles */
```

---

## Pantalla LCD — Especificaciones

- **Aspect ratio**: ~2.5:1 (alto:ancho)
- **Color**: Verde pálido/grisáceo (#c4c8b0)
- **Texto**: Negro verdoso muy oscuro
- **Efectos**:
  - Scanlines horizontales sutiles
  - Slight color bleed (pixels no perfectos)
  - Pixel font rendering
  - Cursor parpadeante
  - Indicadores de estado en esquinas

### Indicadores de estado (esquina superior):
- `S` = SHIFT activo
- `A` = ALPHA activo
- `M` = Memoria usada
- `⇧` = Modo de inserción
- `D` / `R` / `G` = DEG/RAD/GRAD
- `FIX` / `SCI` / `NORM` = Formato número

---

## Natural Display — Math Rendering

### Fracciones:
```
  1     ← numerador (centrado)
─────    ← barra horizontal
  2     ← denominador (centrado)
```

### Raíces cuadradas:
```
√‾‾‾‾‾‾‾‾
   2    ← barra extensible sobre argumento
```

### Potencias:
```
x²   ← superscript alineado arriba-derecha
```

### Integrales:
```
  b
  ⌠
  ⎮ f(x) dx
  ⌡
  a
```

### Matrices:
```
┌ a  b ┐
│ c  d │
└ e  f ┘
```

---

## Teclas SHIFT/ALPHA — Funciones alternas

Cada tecla tiene 3 funciones:
1. **Principal**: Texto blanco en el centro
2. **SHIFT** (amarillo): Texto arriba de la tecla
3. **ALPHA** (rojo): Texto arriba-derecha de la tecla

Ejemplo tecla [sin]:
- Principal: `sin`
- SHIFT: `sin⁻¹`
- ALPHA: `A`

---

## Animaciones

### Teclas:
- **Idle**: Sombra inferior 2px, gradiente sutil
- **Hover**: Brillo sutil, cursor pointer
- **Active/Presionada**: 
  - Sombra eliminada
  - Transform: translateY(2px)
  - Background más oscuro
  - Escala 0.98
  - Duración: 80ms

### Pantalla:
- **Input**: Cursor parpadea 500ms
- **Result**: Fade-in 200ms
- **Error**: Flash rojo sutil 300ms
- **Scroll**: Smooth 150ms

---

## Responsive

- **Desktop**: 380px ancho fijo, centrado
- **Mobile**: 100% ancho, padding reducido
- **Tablet**: Escalado proporcional

---

## Iconos de Apps

| App | Icono | Color |
|-----|-------|-------|
| CALC | 🧮 | #4ade80 |
| GRAPHER | 📈 | #60a5fa |
| EQUA | ➗ | #f472b6 |
| SETTINGS | ⚙️ | #a78bfa |
