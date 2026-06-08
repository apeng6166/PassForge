import { generatePassword, generateBatch, getOptionsFromDOM } from './generator.js';
import { evaluateStrength, applyStrengthUI } from './strength.js';

const STORAGE_KEY = 'passforge-settings';

const els = {
  passwordDisplay: document.getElementById('passwordDisplay'),
  generateBtn: document.getElementById('generateBtn'),
  copyBtn: document.getElementById('copyBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  batchGenerateBtn: document.getElementById('batchGenerateBtn'),
  batchList: document.getElementById('batchList'),
  batchCount: document.getElementById('batchCount'),
  lengthRange: document.getElementById('lengthRange'),
  lengthInput: document.getElementById('lengthInput'),
  themeToggle: document.getElementById('themeToggle'),
  toast: document.getElementById('toast'),
};

let currentPassword = '';

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => els.toast.classList.add('hidden'), 2200);
}

function syncLength(from) {
  const value = Math.min(128, Math.max(4, Number(from.value) || 16));
  els.lengthRange.value = value;
  els.lengthInput.value = value;
  saveSettings();
}

function saveSettings() {
  const data = {
    length: els.lengthInput.value,
    uppercase: document.getElementById('uppercase').checked,
    lowercase: document.getElementById('lowercase').checked,
    numbers: document.getElementById('numbers').checked,
    symbols: document.getElementById('symbols').checked,
    excludeAmbiguous: document.getElementById('excludeAmbiguous').checked,
    batchCount: els.batchCount.value,
    theme: document.documentElement.dataset.theme || 'auto',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.length) syncLength({ value: data.length });
    document.getElementById('uppercase').checked = data.uppercase !== false;
    document.getElementById('lowercase').checked = data.lowercase !== false;
    document.getElementById('numbers').checked = data.numbers !== false;
    document.getElementById('symbols').checked = data.symbols !== false;
    document.getElementById('excludeAmbiguous').checked = !!data.excludeAmbiguous;
    if (data.batchCount) els.batchCount.value = data.batchCount;
    if (data.theme) applyTheme(data.theme);
  } catch {
    /* ignore */
  }
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
    els.themeToggle.textContent = '☀️';
  } else if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
    els.themeToggle.textContent = '🌙';
  } else {
    delete document.documentElement.dataset.theme;
    els.themeToggle.textContent = '🌙';
  }
  saveSettings();
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = current === 'dark' || (!current && prefersDark);
  applyTheme(isDark ? 'light' : 'dark');
}

function setPassword(password) {
  currentPassword = password;
  els.passwordDisplay.textContent = password;
  els.copyBtn.disabled = false;
  els.regenerateBtn.disabled = false;
  els.batchList.classList.add('hidden');
  els.batchList.innerHTML = '';
  applyStrengthUI(evaluateStrength(password, getOptionsFromDOM()));
}

function handleGenerate() {
  try {
    setPassword(generatePassword(getOptionsFromDOM()));
  } catch (err) {
    showToast(err.message);
  }
}

function handleRegenerate() {
  handleGenerate();
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

async function handleCopy() {
  if (!currentPassword) return;
  try {
    await copyText(currentPassword);
    showToast('已复制到剪贴板');
  } catch {
    showToast('复制失败，请手动选中复制');
  }
}

function renderBatchList(passwords) {
  els.batchList.innerHTML = '';
  passwords.forEach((pwd, i) => {
    const li = document.createElement('li');
    li.className = 'batch-item';

    const code = document.createElement('code');
    code.textContent = pwd;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost btn-sm';
    btn.textContent = '复制';
    btn.addEventListener('click', async () => {
      try {
        await copyText(pwd);
        showToast(`已复制第 ${i + 1} 条`);
      } catch {
        showToast('复制失败');
      }
    });

    li.append(code, btn);
    els.batchList.appendChild(li);
  });

  els.batchList.classList.remove('hidden');
  els.passwordDisplay.textContent = `已生成 ${passwords.length} 条密码`;
  els.copyBtn.disabled = true;
}

function handleBatchGenerate() {
  try {
    const options = getOptionsFromDOM();
    const count = Number(els.batchCount.value) || 1;
    const passwords = generateBatch(options, count);
    renderBatchList(passwords);
    applyStrengthUI({ level: 0, label: '—', hint: '批量模式' });
  } catch (err) {
    showToast(err.message);
  }
}

els.generateBtn.addEventListener('click', handleGenerate);
els.regenerateBtn.addEventListener('click', handleRegenerate);
els.copyBtn.addEventListener('click', handleCopy);
els.batchGenerateBtn.addEventListener('click', handleBatchGenerate);
els.lengthRange.addEventListener('input', () => syncLength(els.lengthRange));
els.lengthInput.addEventListener('change', () => syncLength(els.lengthInput));
els.themeToggle.addEventListener('click', toggleTheme);

['uppercase', 'lowercase', 'numbers', 'symbols', 'excludeAmbiguous'].forEach((id) => {
  document.getElementById(id).addEventListener('change', saveSettings);
});
els.batchCount.addEventListener('change', saveSettings);

loadSettings();
handleGenerate();
