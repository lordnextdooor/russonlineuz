// Синтезирует музыку и звуковые эффекты для Reels — без чужих треков и авторских прав.
// Запуск: node scripts/make-audio.mjs → public/audio/*.wav (44.1 кГц, стерео, 16 бит)
import {mkdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const outDir = fileURLToPath(new URL('../public/audio/', import.meta.url));
mkdirSync(outDir, {recursive: true});

// Детерминированный шум, чтобы файлы не менялись от запуска к запуску
let seed = 1;
const noise = () => (seed = (seed * 16807) % 2147483647) / 1073741823.5 - 1;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const lp = (fc) => {
  const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
  let y = 0;
  return (x) => (y += a * (x - y));
};

function writeWav(name, left, right = left) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(outDir + name, buf);
  console.log('✓', name, (n / SR).toFixed(1) + ' s');
}

const normalize = (chs, peak) => {
  const m = Math.max(...chs.map((c) => c.reduce((a, x) => Math.max(a, Math.abs(x)), 0)));
  chs.forEach((c) => c.forEach((x, i) => (c[i] = (x / m) * peak)));
};

// ---------- Музыка: тёплый лёгкий бит, 112 BPM, C – Am – F – G ----------
{
  const beat = 60 / 112;
  const bars = 12; // ≈ 25.7 с — длиннее любого ролика
  const n = Math.ceil(bars * 4 * beat * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  // pan: −1 левый канал, +1 правый
  const add = (t0, fn, dur, pan = 0) => {
    const s0 = Math.floor(t0 * SR);
    const len = Math.floor(dur * SR);
    for (let i = 0; i < len && s0 + i < n; i++) {
      const v = fn(i / SR);
      L[s0 + i] += v * (1 - pan);
      R[s0 + i] += v * (1 + pan);
    }
  };
  const chords = [
    [48, [60, 64, 67]],
    [45, [57, 60, 64]],
    [41, [57, 60, 65]],
    [43, [59, 62, 67]],
  ];

  for (let bar = 0; bar < bars; bar++) {
    const [root, tones] = chords[bar % 4];
    const t = bar * 4 * beat;
    // Бочка: синус с падающей высотой, на 1 и 3 и тихая на «и» четвёртой доли
    for (const b of [0, 2, 3.5]) {
      const gain = b === 3.5 ? 0.45 : 0.9;
      add(t + b * beat, (x) => Math.sin(2 * Math.PI * (45 * x + (110 / 25) * (1 - Math.exp(-25 * x)))) * Math.exp(-x * 9) * gain, 0.4);
    }
    // Хлопок на 2 и 4
    for (const b of [1, 3]) {
      const f = lp(3000);
      add(t + b * beat, (x) => {
        const s = noise();
        return (s - f(s)) * Math.exp(-x * 22) * 0.45;
      }, 0.25, 0.1);
    }
    // Хай-хэт восьмыми
    for (let e = 0; e < 8; e++) {
      const f = lp(7000);
      add(t + e * beat * 0.5, (x) => {
        const s = noise();
        return (s - f(s)) * Math.exp(-x * 70) * (e % 2 ? 0.16 : 0.1);
      }, 0.08, e % 2 ? 0.35 : -0.35);
    }
    // Бас
    for (const e of [0, 1.5, 2, 3, 3.5]) {
      const fr = midi(root - 12 + (e === 3.5 ? 7 : 0));
      add(t + e * beat, (x) => (Math.sin(2 * Math.PI * fr * x) + 0.3 * Math.sin(4 * Math.PI * fr * x)) * Math.min(1, x * 200) * Math.exp(-x * 4) * 0.55, beat * 0.9);
    }
    // Пэд: три ноты, расстроенная пила через фильтр
    for (const [k, note] of tones.entries()) {
      const fr = midi(note);
      const f = lp(900);
      let ph1 = 0;
      let ph2 = 0;
      add(t, (x) => {
        ph1 = (ph1 + fr / SR) % 1;
        ph2 = (ph2 + (fr * 1.006) / SR) % 1;
        const env = Math.min(1, x / 0.4) * Math.min(1, (4 * beat - x) / 0.3);
        return f(ph1 * 2 - 1 + (ph2 * 2 - 1)) * env * 0.07;
      }, 4 * beat, k === 0 ? -0.4 : k === 2 ? 0.4 : 0);
    }
    // Щипковое арпеджио (Karplus–Strong) восьмыми
    const arp = [tones[0] + 12, tones[1] + 12, tones[2] + 12, tones[1] + 12];
    for (let e = 0; e < 7; e++) {
      const period = Math.round(SR / midi(arp[e % 4]));
      const ring = Float32Array.from({length: period}, () => noise() * 0.5);
      let idx = 0;
      add(t + e * beat * 0.5, () => {
        const a = ring[idx];
        ring[idx] = 0.498 * (a + ring[(idx + 1) % period]);
        idx = (idx + 1) % period;
        return a * 0.5;
      }, beat * 1.2, e % 2 ? 0.3 : -0.3);
    }
  }
  // Мягкое ограничение и общий уровень
  for (let i = 0; i < n; i++) {
    L[i] = Math.tanh(L[i] * 1.2);
    R[i] = Math.tanh(R[i] * 1.2);
  }
  normalize([L, R], 0.8);
  writeWav('music.wav', L, R);
}

// ---------- Эффекты ----------
const sfx = (name, dur, fn) => {
  const n = Math.floor(dur * SR);
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) a[i] = fn(i / SR, dur);
  normalize([a], 0.9);
  writeWav(name, a);
};

// Шторка: шум с открывающимся фильтром
{
  let y = 0;
  sfx('whoosh.wav', 0.42, (x, d) => {
    const fc = 300 + 5000 * Math.sin((Math.PI * x) / d) ** 2;
    y += (1 - Math.exp((-2 * Math.PI * fc) / SR)) * (noise() - y);
    return y * Math.sin((Math.PI * x) / d) ** 1.5;
  });
}
// Появление: короткий «поп»
sfx('pop.wav', 0.12, (x) => Math.sin(2 * Math.PI * (700 * x - 1500 * x * x)) * Math.exp(-x * 40) + noise() * Math.exp(-x * 400) * 0.3);
// Галочка: светлый звон
sfx('ding.wav', 0.8, (x) =>
  (Math.sin(2 * Math.PI * 1318.5 * x) + 0.5 * Math.sin(2 * Math.PI * 1975.5 * x) + 0.25 * Math.sin(2 * Math.PI * 2637 * x)) *
  Math.exp(-x * 6) * Math.min(1, x * 400),
);
// Хук и финал: низкий удар
sfx('impact.wav', 0.6, (x) => Math.sin(2 * Math.PI * (90 * x - 40 * x * x)) * Math.exp(-x * 7) + noise() * Math.exp(-x * 60) * 0.4);
// Смешок для сценок: пять коротких «хи» с падающей высотой
sfx('giggle.wav', 0.7, (x) => {
  const k = Math.floor(x / 0.13);
  const t = x - k * 0.13;
  if (k > 4 || t > 0.09) return 0;
  const f = 620 - k * 45;
  const env = Math.sin((Math.PI * t) / 0.09);
  return (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * 2 * f * t) + noise() * 0.15) * env * (1 - k * 0.12);
});
// Зачёркивание: короткий «чирк»
{
  const f = lp(2500);
  sfx('swipe.wav', 0.2, (x, d) => {
    const s = noise();
    return (s - f(s)) * Math.sin((Math.PI * x) / d);
  });
}
