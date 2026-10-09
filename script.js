// ==========================================================
// THEMES & CONFIGURATION
// ==========================================================

const THEMES = {
  'theme-midnight': { name: 'Midnight', rgb: '99, 102, 241', accentRgb: '6, 182, 212' },
  'theme-sakura': { name: 'Sakura', rgb: '244, 63, 94', accentRgb: '251, 113, 133' },
  'theme-matcha': { name: 'Matcha', rgb: '16, 185, 129', accentRgb: '52, 211, 153' },
  'theme-mocha': { name: 'Mocha', rgb: '217, 119, 6', accentRgb: '251, 191, 36' },
  'theme-frost': { name: 'Frost', rgb: '37, 99, 235', accentRgb: '56, 189, 248' },
  'theme-oled': { name: 'OLED', rgb: '255, 255, 255', accentRgb: '56, 189, 248' },
  'theme-sunset': { name: 'Sunset', rgb: '236, 72, 153', accentRgb: '249, 115, 22' }
};

let currentInput = '0';
let previousInput = '';
let currentOperation = null;
let shouldResetScreen = false;
let soundEnabled = true;
let historyData = [];
let activeTheme = 'theme-midnight';

// DOM Elements
const currentDisplay = document.getElementById('currentDisplay');
const historyDisplay = document.getElementById('historyDisplay');
const currentThemeName = document.getElementById('currentThemeName');
const themePickerBtn = document.getElementById('themePickerBtn');
const themeIconSpan = document.getElementById('themeIconSpan');
const themeModal = document.getElementById('themeModal');
const closeThemeBtn = document.getElementById('closeThemeBtn');
const themeCards = document.querySelectorAll('.theme-card');

const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');

const historyToggleBtn = document.getElementById('historyToggleBtn');
const historyIconSpan = document.getElementById('historyIconSpan');
const historyModal = document.getElementById('historyModal');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const historyList = document.getElementById('historyList');
const historyBadge = document.getElementById('historyBadge');

const copyBtn = document.getElementById('copyBtn');
const copyIconSpan = document.getElementById('copyIconSpan');
const copyTooltip = document.getElementById('copyTooltip');
const buttons = document.querySelectorAll('.key-btn');
const fxOverlay = document.getElementById('fxOverlay');
const cursorGlow = document.getElementById('cursorGlow');
const bgCanvas = document.getElementById('bgCanvas');

// ==========================================================
// 1. BACKGROUND CANVAS PARTICLES & AMBIENT BOKEH EFFECT
// ==========================================================

const ctx = bgCanvas.getContext('2d');
let canvasW = 0;
let canvasH = 0;
const MATH_SYMBOLS = ['+', '−', '×', '÷', '%', '√', 'π', '=', '•', '∑', '∞'];
const particles = [];
const PARTICLE_COUNT = 32;

function resizeCanvas() {
  canvasW = window.innerWidth;
  canvasH = window.innerHeight;
  bgCanvas.width = canvasW;
  bgCanvas.height = canvasH;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class AmbientParticle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * canvasW;
    this.y = initial ? Math.random() * canvasH : canvasH + 20;
    this.speedY = 0.3 + Math.random() * 0.7;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.size = 11 + Math.random() * 16;
    this.alpha = 0.08 + Math.random() * 0.22;
    this.isSymbol = Math.random() > 0.45;
    this.symbol = MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)];
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;

    if (this.y < -30 || this.x < -30 || this.x > canvasW + 30) {
      this.reset();
    }
  }

  draw() {
    const themeConfig = THEMES[activeTheme] || THEMES['theme-midnight'];
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.isSymbol) {
      ctx.font = `600 ${this.size}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = `rgba(${themeConfig.rgb}, ${this.alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.symbol, 0, 0);
    } else {
      // Soft glowing bokeh orbs
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
      grad.addColorStop(0, `rgba(${themeConfig.accentRgb}, ${this.alpha * 1.5})`);
      grad.addColorStop(1, `rgba(${themeConfig.accentRgb}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new AmbientParticle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Interactive smooth mouse follower light
let targetMouseX = window.innerWidth / 2;
let targetMouseY = window.innerHeight / 2;
let currentMouseX = targetMouseX;
let currentMouseY = targetMouseY;

window.addEventListener('mousemove', (e) => {
  targetMouseX = e.clientX;
  targetMouseY = e.clientY;
});

function updateCursorGlow() {
  currentMouseX += (targetMouseX - currentMouseX) * 0.08;
  currentMouseY += (targetMouseY - currentMouseY) * 0.08;
  cursorGlow.style.left = `${currentMouseX}px`;
  cursorGlow.style.top = `${currentMouseY}px`;
  requestAnimationFrame(updateCursorGlow);
}
updateCursorGlow();

// ==========================================================
// 2. BOTTOM-UP NUMBER & KEY APPEARANCE EFFECT
// ==========================================================

function triggerNumberSlideUp() {
  currentDisplay.classList.remove('slide-up-active');
  void currentDisplay.offsetWidth; // Force CSS reflow
  currentDisplay.classList.add('slide-up-active');
}

function createFloatingDigitParticle(element, text) {
  if (!element || !text) return;
  const rect = element.getBoundingClientRect();
  const particle = document.createElement('div');
  particle.className = 'float-digit-particle';
  particle.textContent = text;
  particle.style.left = `${rect.left + rect.width / 2}px`;
  particle.style.top = `${rect.top + rect.height / 2}px`;

  fxOverlay.appendChild(particle);
  setTimeout(() => {
    particle.remove();
  }, 700);
}

// ==========================================================
// 3. ICON CLICK ANIMATIONS & RIPPLE WAVES
// ==========================================================

function triggerIconWave(buttonElement) {
  if (!buttonElement) return;
  buttonElement.classList.remove('trigger-icon-wave');
  void buttonElement.offsetWidth;
  buttonElement.classList.add('trigger-icon-wave');
  setTimeout(() => {
    buttonElement.classList.remove('trigger-icon-wave');
  }, 500);
}

function animateThemeIcon() {
  triggerIconWave(themePickerBtn);
  themeIconSpan.classList.remove('theme-spin-active');
  void themeIconSpan.offsetWidth;
  themeIconSpan.classList.add('theme-spin-active');
  setTimeout(() => themeIconSpan.classList.remove('theme-spin-active'), 650);
}

function animateSoundIcon() {
  triggerIconWave(soundToggleBtn);
  soundIcon.classList.remove('sound-wobble-active');
  void soundIcon.offsetWidth;
  soundIcon.classList.add('sound-wobble-active');
  setTimeout(() => soundIcon.classList.remove('sound-wobble-active'), 550);
}

function animateHistoryIcon() {
  triggerIconWave(historyToggleBtn);
  historyIconSpan.classList.remove('clock-spin-active');
  void historyIconSpan.offsetWidth;
  historyIconSpan.classList.add('clock-spin-active');
  setTimeout(() => historyIconSpan.classList.remove('clock-spin-active'), 600);
}

function animateCopyIcon() {
  triggerIconWave(copyBtn);
  copyIconSpan.classList.remove('copy-jump-active');
  void copyIconSpan.offsetWidth;
  copyIconSpan.classList.add('copy-jump-active');
  setTimeout(() => copyIconSpan.classList.remove('copy-jump-active'), 500);
}

// ==========================================================
// AUDIO SYNTHESIS ENGINE
// ==========================================================

let audioCtx = null;

function playAcousticSound(type = 'number') {
  if (!soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (type === 'number') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'operator') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'equals') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'clear') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {}
}

// ==========================================================
// PRECISION & FORMATTING
// ==========================================================

function stripPrecision(num) {
  if (isNaN(num) || !isFinite(num)) return num;
  return parseFloat(Number(num.toPrecision(12)).toString());
}

function formatDisplayNumber(numStr) {
  if (numStr === 'Error' || numStr === 'Cannot divide by 0') return numStr;
  const parts = numStr.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let formattedInt = '';
  if (integerPart === '-' || integerPart === '') {
    formattedInt = integerPart;
  } else {
    const num = parseFloat(integerPart);
    formattedInt = isNaN(num) ? integerPart : num.toLocaleString('en-US');
  }

  if (decimalPart !== undefined) {
    return `${formattedInt}.${decimalPart}`;
  }
  return formattedInt;
}

function updateDisplay() {
  currentDisplay.textContent = formatDisplayNumber(currentInput);
  triggerNumberSlideUp();

  const len = currentInput.length;
  if (len > 12) {
    currentDisplay.style.fontSize = '1.75rem';
  } else if (len > 8) {
    currentDisplay.style.fontSize = '2.2rem';
  } else {
    currentDisplay.style.fontSize = '2.75rem';
  }

  let opSymbol = '';
  if (currentOperation === '+') opSymbol = '+';
  else if (currentOperation === '-') opSymbol = '−';
  else if (currentOperation === '*') opSymbol = '×';
  else if (currentOperation === '/') opSymbol = '÷';

  if (previousInput !== '' && currentOperation) {
    historyDisplay.textContent = `${formatDisplayNumber(previousInput)} ${opSymbol}`;
  } else {
    historyDisplay.textContent = '';
  }

  buttons.forEach(btn => {
    if (btn.dataset.action === 'operator') {
      if (currentOperation && btn.dataset.val === currentOperation && shouldResetScreen) {
        btn.classList.add('is-active-op');
      } else {
        btn.classList.remove('is-active-op');
      }
    }
  });
}

// ==========================================================
// CALCULATION LOGIC
// ==========================================================

function appendNumber(num, sourceBtn = null) {
  playAcousticSound('number');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, num);

  if (shouldResetScreen || currentInput === 'Error' || currentInput === 'Cannot divide by 0') {
    currentInput = '';
    shouldResetScreen = false;
  }
  if (currentInput === '0' && num !== '.') {
    currentInput = num;
  } else {
    if (currentInput.length >= 15) return;
    currentInput += num;
  }
  updateDisplay();
}

function appendDecimal(sourceBtn = null) {
  playAcousticSound('number');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, '.');

  if (shouldResetScreen || currentInput === 'Error' || currentInput === 'Cannot divide by 0') {
    currentInput = '0';
    shouldResetScreen = false;
  }
  if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function handleOperator(op, sourceBtn = null) {
  playAcousticSound('operator');
  if (sourceBtn) {
    const symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    createFloatingDigitParticle(sourceBtn, symbolMap[op] || op);
  }

  if (currentInput === 'Error' || currentInput === 'Cannot divide by 0') {
    allClear();
    return;
  }

  if (currentOperation !== null && !shouldResetScreen) {
    executeCalculation();
  }

  previousInput = currentInput;
  currentOperation = op;
  shouldResetScreen = true;
  updateDisplay();
}

function executeCalculation(sourceBtn = null) {
  if (currentOperation === null || previousInput === '' || shouldResetScreen) return;
  playAcousticSound('equals');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, '=');

  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  let result;

  switch (currentOperation) {
    case '+':
      result = prev + current;
      break;
    case '-':
      result = prev - current;
      break;
    case '*':
      result = prev * current;
      break;
    case '/':
      if (current === 0) {
        currentInput = 'Cannot divide by 0';
        previousInput = '';
        currentOperation = null;
        updateDisplay();
        return;
      }
      result = prev / current;
      break;
    default:
      return;
  }

  result = stripPrecision(result);

  const opSymbol = currentOperation === '*' ? '×' : currentOperation === '/' ? '÷' : currentOperation === '-' ? '−' : '+';
  addHistoryRecord(`${formatDisplayNumber(previousInput)} ${opSymbol} ${formatDisplayNumber(currentInput)}`, result.toString());

  currentInput = result.toString();
  previousInput = '';
  currentOperation = null;
  shouldResetScreen = true;
  updateDisplay();
}

function allClear(sourceBtn = null) {
  playAcousticSound('clear');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, 'AC');
  currentInput = '0';
  previousInput = '';
  currentOperation = null;
  shouldResetScreen = false;
  updateDisplay();
}

function backspace(sourceBtn = null) {
  playAcousticSound('clear');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, '⌫');
  if (shouldResetScreen || currentInput === 'Cannot divide by 0' || currentInput === 'Error') {
    allClear();
    return;
  }
  if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
}

function handlePercent(sourceBtn = null) {
  playAcousticSound('operator');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, '%');
  const val = parseFloat(currentInput);
  if (isNaN(val)) return;
  const result = stripPrecision(val / 100);
  currentInput = result.toString();
  updateDisplay();
}

function handleSqrt(sourceBtn = null) {
  playAcousticSound('operator');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, '√');
  const val = parseFloat(currentInput);
  if (isNaN(val) || val < 0) {
    currentInput = 'Error';
  } else {
    const result = stripPrecision(Math.sqrt(val));
    addHistoryRecord(`√(${formatDisplayNumber(currentInput)})`, result.toString());
    currentInput = result.toString();
    shouldResetScreen = true;
  }
  updateDisplay();
}

function handleSquare(sourceBtn = null) {
  playAcousticSound('operator');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, 'x²');
  const val = parseFloat(currentInput);
  if (isNaN(val)) return;
  const result = stripPrecision(val * val);
  addHistoryRecord(`sqr(${formatDisplayNumber(currentInput)})`, result.toString());
  currentInput = result.toString();
  shouldResetScreen = true;
  updateDisplay();
}

function handleNegate(sourceBtn = null) {
  playAcousticSound('number');
  if (sourceBtn) createFloatingDigitParticle(sourceBtn, '±');
  if (currentInput === '0' || currentInput === 'Error' || currentInput === 'Cannot divide by 0') return;
  if (currentInput.startsWith('-')) {
    currentInput = currentInput.slice(1);
  } else {
    currentInput = '-' + currentInput;
  }
  updateDisplay();
}

// ==========================================================
// HISTORY SYSTEM
// ==========================================================

function addHistoryRecord(expr, result) {
  historyData.unshift({ expr, result, id: Date.now() });
  if (historyData.length > 40) historyData.pop();
  historyBadge.classList.add('show');
  saveHistory();
  renderHistory();
}

function renderHistory() {
  if (historyData.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📝</span>
        <p>No calculations yet</p>
        <span class="empty-sub">Calculations will appear here</span>
      </div>`;
    return;
  }

  historyList.innerHTML = '';
  historyData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card-expr">${item.expr} =</div>
      <div class="history-card-val">${formatDisplayNumber(item.result)}</div>
    `;
    card.addEventListener('click', () => {
      playAcousticSound('number');
      currentInput = item.result;
      shouldResetScreen = true;
      updateDisplay();
      historyModal.classList.remove('open');
    });
    historyList.appendChild(card);
  });
}

function saveHistory() {
  try {
    localStorage.setItem('aesthetic_calc_history', JSON.stringify(historyData));
  } catch (e) {}
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('aesthetic_calc_history');
    if (saved) {
      historyData = JSON.parse(saved);
      renderHistory();
    }
  } catch (e) {}
}

// ==========================================================
// THEME SWITCHING SYSTEM
// ==========================================================

function setTheme(themeKey) {
  Object.keys(THEMES).forEach(key => {
    document.body.classList.remove(key);
  });

  document.body.classList.add(themeKey);
  activeTheme = themeKey;
  currentThemeName.textContent = THEMES[themeKey]?.name || 'Theme';

  themeCards.forEach(card => {
    if (card.dataset.theme === themeKey) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  try {
    localStorage.setItem('aesthetic_calc_theme', themeKey);
  } catch (e) {}
}

function initTheme() {
  const saved = localStorage.getItem('aesthetic_calc_theme');
  if (saved && THEMES[saved]) {
    setTheme(saved);
  } else {
    setTheme('theme-midnight');
  }
}

themePickerBtn.addEventListener('click', () => {
  playAcousticSound('number');
  animateThemeIcon();
  historyModal.classList.remove('open');
  themeModal.classList.toggle('open');
});

closeThemeBtn.addEventListener('click', () => {
  triggerIconWave(closeThemeBtn);
  themeModal.classList.remove('open');
});

themeCards.forEach(card => {
  card.addEventListener('click', () => {
    const chosen = card.dataset.theme;
    if (chosen) {
      setTheme(chosen);
      playAcousticSound('operator');
      animateThemeIcon();
      setTimeout(() => {
        themeModal.classList.remove('open');
      }, 160);
    }
  });
});

// ==========================================================
// HISTORY DRAWER CONTROLS
// ==========================================================

historyToggleBtn.addEventListener('click', () => {
  playAcousticSound('number');
  animateHistoryIcon();
  historyBadge.classList.remove('show');
  themeModal.classList.remove('open');
  historyModal.classList.toggle('open');
});

closeHistoryBtn.addEventListener('click', () => {
  triggerIconWave(closeHistoryBtn);
  historyModal.classList.remove('open');
});

clearHistoryBtn.addEventListener('click', () => {
  triggerIconWave(clearHistoryBtn);
  playAcousticSound('clear');
  historyData = [];
  saveHistory();
  renderHistory();
});

// ==========================================================
// SOUND TOGGLE & CLIPBOARD
// ==========================================================

soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  animateSoundIcon();
  if (soundEnabled) {
    soundIcon.textContent = '🔊';
    soundToggleBtn.classList.add('active');
    playAcousticSound('number');
  } else {
    soundIcon.textContent = '🔇';
    soundToggleBtn.classList.remove('active');
  }
});

copyBtn.addEventListener('click', () => {
  playAcousticSound('number');
  animateCopyIcon();
  navigator.clipboard.writeText(currentInput).then(() => {
    copyTooltip.classList.add('show');
    setTimeout(() => {
      copyTooltip.classList.remove('show');
    }, 1500);
  }).catch(() => {});
});

// ==========================================================
// BUTTON CLICK ROUTING
// ==========================================================

buttons.forEach(button => {
  button.addEventListener('click', (e) => {
    const action = button.dataset.action;
    const val = button.dataset.val;

    switch (action) {
      case 'number':
        appendNumber(val, button);
        break;
      case 'decimal':
        appendDecimal(button);
        break;
      case 'operator':
        handleOperator(val, button);
        break;
      case 'calculate':
        executeCalculation(button);
        break;
      case 'all-clear':
        allClear(button);
        break;
      case 'backspace':
        backspace(button);
        break;
      case 'percent':
        handlePercent(button);
        break;
      case 'sqrt':
        handleSqrt(button);
        break;
      case 'square':
        handleSquare(button);
        break;
      case 'negate':
        handleNegate(button);
        break;
    }
  });
});

// ==========================================================
// FULL KEYBOARD ACCESSIBILITY
// ==========================================================

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const key = e.key;
  let targetBtn = null;

  if (!isNaN(key) && key !== ' ') {
    targetBtn = document.querySelector(`.key-btn[data-action="number"][data-val="${key}"]`);
    appendNumber(key, targetBtn);
  } else if (key === '.') {
    targetBtn = document.querySelector(`.key-btn[data-action="decimal"]`);
    appendDecimal(targetBtn);
  } else if (key === '+' || key === '-' || key === '*' || key === '/') {
    targetBtn = document.querySelector(`.key-btn[data-action="operator"][data-val="${key}"]`);
    handleOperator(key, targetBtn);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    targetBtn = document.querySelector(`.key-btn[data-action="calculate"]`);
    executeCalculation(targetBtn);
  } else if (key === 'Backspace') {
    targetBtn = document.querySelector(`.key-btn[data-action="backspace"]`);
    backspace(targetBtn);
  } else if (key === 'Escape') {
    targetBtn = document.querySelector(`.key-btn[data-action="all-clear"]`);
    allClear(targetBtn);
    themeModal.classList.remove('open');
    historyModal.classList.remove('open');
  } else if (key === '%') {
    targetBtn = document.querySelector(`.key-btn[data-action="percent"]`);
    handlePercent(targetBtn);
  }

  if (targetBtn) {
    targetBtn.classList.add('active-press');
    setTimeout(() => targetBtn.classList.remove('active-press'), 130);
  }
});

// Close modals when clicking outside
document.addEventListener('click', (e) => {
  if (!themeModal.contains(e.target) && !themePickerBtn.contains(e.target)) {
    themeModal.classList.remove('open');
  }
  if (!historyModal.contains(e.target) && !historyToggleBtn.contains(e.target)) {
    historyModal.classList.remove('open');
  }
});

// Initialization
initTheme();
loadHistory();
updateDisplay();
