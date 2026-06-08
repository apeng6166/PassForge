const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

const AMBIGUOUS = new Set(['0', 'O', 'o', '1', 'l', 'I']);

function secureRandomInt(max) {
  if (max <= 0) throw new RangeError('max must be positive');
  const array = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let value;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

function pickRandom(str) {
  return str[secureRandomInt(str.length)];
}

function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildPool(options) {
  const pools = [];
  let combined = '';

  for (const [key, enabled] of Object.entries(options.types)) {
    if (!enabled) continue;
    let chars = CHARSETS[key];
    if (options.excludeAmbiguous) {
      chars = [...chars].filter((c) => !AMBIGUOUS.has(c)).join('');
    }
    if (chars.length === 0) {
      throw new Error(`字符集「${key}」在排除易混淆字符后为空`);
    }
    pools.push(chars);
    combined += chars;
  }

  if (combined.length === 0) {
    throw new Error('请至少选择一种字符类型');
  }

  return { pools, combined };
}

export function generatePassword(options) {
  const length = Math.min(128, Math.max(4, Number(options.length) || 16));
  const { pools, combined } = buildPool(options);

  if (length < pools.length) {
    throw new Error(`密码长度至少为 ${pools.length}（需包含每种已选字符类型）`);
  }

  const chars = [];

  for (const pool of pools) {
    chars.push(pickRandom(pool));
  }

  while (chars.length < length) {
    chars.push(pickRandom(combined));
  }

  return shuffle(chars).join('');
}

export function generateBatch(options, count) {
  const n = Math.min(50, Math.max(1, Number(count) || 1));
  const set = new Set();
  const results = [];
  let attempts = 0;
  const maxAttempts = n * 100;

  while (results.length < n && attempts < maxAttempts) {
    attempts++;
    const pwd = generatePassword(options);
    if (!set.has(pwd)) {
      set.add(pwd);
      results.push(pwd);
    }
  }

  if (results.length < n) {
    throw new Error('无法生成足够数量的不重复密码，请调整参数');
  }

  return results;
}

export function getOptionsFromDOM() {
  return {
    length: Number(document.getElementById('lengthInput').value),
    excludeAmbiguous: document.getElementById('excludeAmbiguous').checked,
    types: {
      uppercase: document.getElementById('uppercase').checked,
      lowercase: document.getElementById('lowercase').checked,
      numbers: document.getElementById('numbers').checked,
      symbols: document.getElementById('symbols').checked,
    },
  };
}
