/**
 * Guard: screens and components must take their text from the dictionaries, never hard-code it.
 * Arabic content that is *taught* (letters, words) lives in src/domain/content, not in the UI.
 */
// Node's fs/path, typed minimally (the app itself targets React Native, so Node types are not installed).
// eslint-disable-next-line @typescript-eslint/no-require-imports -- test-only Node API
const { readdirSync, readFileSync, statSync } = require('fs') as {
  readdirSync: (p: string) => string[];
  readFileSync: (p: string, enc: 'utf8') => string;
  statSync: (p: string) => { isDirectory: () => boolean };
};
// eslint-disable-next-line @typescript-eslint/no-require-imports -- test-only Node API
const { join } = require('path') as { join: (...p: string[]) => string };

const ROOTS = ['src/app', 'src/ui'];
// Allowed: a language's own name in the language picker.
const ALLOWED = ['العربية'];
const ARABIC = /[؀-ۿ]/;

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.tsx') || p.endsWith('.ts') ? [p] : [];
  });

it('no hard-coded Arabic UI text outside the dictionaries', () => {
  const offenders: string[] = [];
  for (const f of ROOTS.flatMap(files)) {
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
      const cleaned = ALLOWED.reduce((s, a) => s.split(a).join(''), code);
      if (/^\s*\*/.test(line)) return; // block comment line
      if (ARABIC.test(cleaned)) offenders.push(`${f}:${i + 1}: ${line.trim()}`);
    });
  }
  expect(offenders).toEqual([]);
});
