const CHARSETS = {
  uppercase: 26,
  lowercase: 26,
  numbers: 10,
  symbols: 25,
};

export function evaluateStrength(password, options) {
  if (!password || password === '点击「生成密码」开始') {
    return { level: 0, label: '—', hint: '生成密码后显示强度' };
  }

  let poolSize = 0;
  for (const [key, enabled] of Object.entries(options.types)) {
    if (enabled) poolSize += CHARSETS[key];
  }
  if (options.excludeAmbiguous) {
    poolSize = Math.max(poolSize - 6, 1);
  }

  const entropy = password.length * Math.log2(poolSize || 1);
  const typeCount = Object.values(options.types).filter(Boolean).length;

  let level, label, hint;

  if (entropy < 40 || password.length < 8) {
    level = 1;
    label = '弱';
    hint = '建议增加长度或字符种类';
  } else if (entropy < 60 || typeCount < 3) {
    level = 2;
    label = '中';
    hint = '可用，建议再加强';
  } else if (entropy < 80) {
    level = 3;
    label = '强';
    hint = '适合大多数场景';
  } else {
    level = 4;
    label = '极强';
    hint = '熵值较高，安全性良好';
  }

  return { level, label, hint, entropy: Math.round(entropy) };
}

export function applyStrengthUI({ level, label, hint }) {
  const fill = document.getElementById('strengthFill');
  const labelEl = document.getElementById('strengthLabel');

  fill.dataset.level = level;
  fill.style.width = level === 0 ? '0%' : `${level * 25}%`;
  labelEl.textContent = level === 0 ? '强度：—' : `强度：${label} · ${hint}`;
}
