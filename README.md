# 🧮 Aesthetic Calculator

An ultra-sleek, modern calculator web application featuring **7 curated aesthetic themes**, tactile acoustic sound effects, smooth physics-based animations, and ambient background visuals. 

Also includes a standalone **Python Tkinter Desktop GUI** version!

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License-MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

---

## ✨ Key Features

### 🎨 7 Curated Aesthetic Themes
Switch themes instantly with real-time palette changes saved to local storage:
* 🌌 **Midnight Cyber** — Deep space obsidian with electric indigo & cyan glow.
* 🌸 **Sakura Blossom** — Soft rosé pastel, frosted glass, and blush coral.
* 🍵 **Matcha Zen** — Calming dark forest green, jade mint, and earthy tones.
* ☕ **Warm Mocha** — Rich espresso, warm cream, and golden caramel.
* ❄️ **Frost Minimal** — Crisp paper white, soft shadows, and clean cerulean blue.
* 🪐 **Obsidian OLED** — Pure void black with high-contrast silver typography.
* 🌅 **Sunset Horizon** — Deep violet purple with glowing magenta & amber gradient.

---

### 💫 Visual & Motion Effects
* ⬆️ **Bottom-Up Number Rise**: Numbers and calculation results glide up from the bottom of the screen with spring physics.
* 🎈 **Floating Key Particles**: Clicking any key spawns a floating ghost particle that rises toward the screen.
* 🌊 **Interactive Icon Waves**: Radial shockwaves radiate on clicking icons (Theme, Sound, History, Copy).
* 🎡 **Playful Icon Animations**: Elastic 360° theme spin, audio wobble vibrations, clock-hand history spin, and copy badge bounce.
* 🌌 **Ambient Background Canvas**: Floating math symbols (`+`, `−`, `×`, `÷`, `%`, `√`, `π`, `∑`, `∞`) and bokeh particles adapt dynamically to the active theme palette.
* 🔦 **Cursor Follower Light**: A soft ambient light trails your mouse across the screen.

---

### 🔊 Tactile Sound & Usability
* **Synthesized Acoustic Clicks**: Realistic key clicks using the Web Audio API with distinct pitch frequencies (number taps, operator tones, clear thuds, and a harmonic equals chime).
* **Calculation History**: Slide-in drawer with timestamped equations and one-click recall.
* **One-Click Copy**: Copy results directly to your clipboard with a floating badge.
* **Auto Font Scaling**: Prevents text clipping by dynamically resizing numbers on long inputs.
* **Precision Arithmetic**: Fixes floating-point quirks (e.g., `0.1 + 0.2 = 0.3`) and protects against division by zero.

---

## ⌨️ Full Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `0` - `9` | Input Digits |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Arithmetic Operators |
| `Enter` or `=` | Calculate Result |
| `Backspace` | Delete last digit |
| `Escape` | All Clear (AC) & close drawers |
| `%` | Percentage |

---

## 🚀 Getting Started

### 1. Run in Browser (Zero Dependencies)
Double-click `index.html` to open it in any browser, or spin up a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve
```
Visit `http://localhost:8000`.

### 2. Run Desktop App (Python Tkinter)
```bash
python calculator_gui.py
```

---

## 📁 Project Structure

```
.
├── index.html           # Semantic HTML5 layout & overlay sheets
├── style.css            # Glassmorphism, CSS variables, & keyframe animations
├── script.js            # State engine, Web Audio synthesis, & canvas effects
├── calculator_gui.py    # Desktop Tkinter GUI with matching themes
└── README.md            # Project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
