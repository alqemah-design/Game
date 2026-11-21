// Synthesises the app's sound effects as small WAV files (no third-party audio, no licences, works offline).
// Run: node scripts/generate-sfx.mjs
import { writeFileSync } from 'node:fs';

const RATE = 22050;
const note = (n) => 440 * 2 ** ((n - 69) / 12); // MIDI → Hz

function render(events, total) {
  const buf = new Float32Array(Math.ceil(total * RATE));
  for (const { t, d, f, type = 'sine', vol = 0.5, slide = 0 } of events) {
    const start = Math.floor(t * RATE), len = Math.floor(d * RATE);
    let phase = 0;
    for (let i = 0; i < len && start + i < buf.length; i++) {
      const p = i / len;
      const freq = f * (1 + slide * p);
      phase += (2 * Math.PI * freq) / RATE;
      const env = Math.min(1, i / (RATE * 0.005)) * (1 - p) ** 2; // fast attack, soft decay
      const s = type === 'tri' ? (2 / Math.PI) * Math.asin(Math.sin(phase)) : Math.sin(phase) + 0.25 * Math.sin(2 * phase);
      buf[start + i] += s * env * vol;
    }
  }
  return buf;
}

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

const sounds = {
  tap: render([{ t: 0, d: 0.06, f: note(84), type: 'tri', vol: 0.35 }], 0.08),
  pop: render([{ t: 0, d: 0.12, f: note(72), slide: 1.2, vol: 0.45 }], 0.14),
  correct: render([
    { t: 0, d: 0.14, f: note(76) }, { t: 0.09, d: 0.24, f: note(83) },
  ], 0.36),
  // Gentle, low and short: a mistake should never feel like punishment.
  tryAgain: render([{ t: 0, d: 0.18, f: note(60), type: 'tri', vol: 0.35, slide: -0.08 }], 0.2),
  flip: render([{ t: 0, d: 0.07, f: note(79), type: 'tri', vol: 0.3, slide: 0.4 }], 0.08),
  levelUp: render(
    [72, 76, 79, 84].map((n, i) => ({ t: i * 0.11, d: 0.3, f: note(n), vol: 0.4 }))
      .concat([{ t: 0.44, d: 0.6, f: note(88), vol: 0.35 }, { t: 0.44, d: 0.6, f: note(84), vol: 0.25 }]),
    1.1,
  ),
  sticker: render(
    [84, 88, 91, 96, 91, 96].map((n, i) => ({ t: i * 0.07, d: 0.2, f: note(n), type: 'tri', vol: 0.3 })),
    0.65,
  ),
};

for (const [name, samples] of Object.entries(sounds)) writeFileSync(new URL(`../assets/sfx/${name}.wav`, import.meta.url), wav(samples));
console.log('wrote', Object.keys(sounds).join(', '));
