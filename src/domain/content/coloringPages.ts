/**
 * Colouring pages as vector regions (viewBox 0 0 300 300). Each region is tappable and fillable;
 * pages beyond the first three unlock through achievements (see rewards.ts).
 */
export type Region = { id: string; d: string };
export type ColoringPage = { id: string; title: string; emoji: string; regions: Region[] };

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y} h${w} v${h} h${-w} Z`;

export const COLORING_PAGES: readonly ColoringPage[] = [
  {
    id: 'cat', title: 'قطة', emoji: '🐱',
    regions: [
      { id: 'body', d: ellipse(150, 215, 75, 60) },
      { id: 'tail', d: 'M215 230 Q275 210 262 150 Q256 135 246 150 Q252 200 205 210 Z' },
      { id: 'head', d: circle(150, 120, 62) },
      { id: 'earL', d: 'M98 92 L92 36 L135 66 Z' },
      { id: 'earR', d: 'M202 92 L208 36 L165 66 Z' },
      { id: 'eyeL', d: ellipse(127, 115, 10, 14) },
      { id: 'eyeR', d: ellipse(173, 115, 10, 14) },
      { id: 'nose', d: 'M140 140 L160 140 L150 152 Z' },
    ],
  },
  {
    id: 'sun', title: 'شمس', emoji: '☀️',
    regions: [
      { id: 'sky', d: rect(5, 5, 290, 290) },
      { id: 'rays', d: Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6, b = a + 0.18, c = a - 0.18;
        const p = (r: number, t: number) => `${(150 + r * Math.cos(t)).toFixed(1)} ${(150 + r * Math.sin(t)).toFixed(1)}`;
        return `M${p(80, c)} L${p(135, a)} L${p(80, b)} Z`;
      }).join(' ') },
      { id: 'sun', d: circle(150, 150, 75) },
      { id: 'cheekL', d: circle(112, 165, 12) },
      { id: 'cheekR', d: circle(188, 165, 12) },
      { id: 'smile', d: 'M118 175 Q150 210 182 175 Q150 192 118 175 Z' },
    ],
  },
  {
    id: 'car', title: 'سيارة', emoji: '🚗',
    regions: [
      { id: 'road', d: rect(5, 230, 290, 60) },
      { id: 'body', d: 'M30 200 L30 160 Q35 145 60 142 L100 140 L130 100 Q138 92 150 92 L210 92 Q225 92 232 105 L255 140 Q275 145 275 165 L275 200 Z' },
      { id: 'window1', d: 'M110 140 L138 106 L175 106 L175 140 Z' },
      { id: 'window2', d: 'M185 106 L222 106 Q228 108 232 116 L245 140 L185 140 Z' },
      { id: 'wheelL', d: circle(85, 205, 28) },
      { id: 'wheelR', d: circle(222, 205, 28) },
      { id: 'light', d: ellipse(265, 165, 8, 10) },
    ],
  },
  {
    id: 'fish', title: 'سمكة', emoji: '🐟',
    regions: [
      { id: 'water', d: rect(5, 5, 290, 290) },
      { id: 'body', d: 'M50 150 Q120 70 210 150 Q120 230 50 150 Z' },
      { id: 'tail', d: 'M205 150 L270 100 L255 150 L270 200 Z' },
      { id: 'fin', d: 'M110 108 Q140 70 170 112 Z' },
      { id: 'eye', d: circle(90, 140, 10) },
      { id: 'bubble1', d: circle(40, 80, 12) },
      { id: 'bubble2', d: circle(60, 45, 8) },
    ],
  },
  {
    id: 'butterfly', title: 'فراشة', emoji: '🦋',
    regions: [
      { id: 'wingTL', d: 'M145 140 Q70 30 40 90 Q30 140 145 150 Z' },
      { id: 'wingTR', d: 'M155 140 Q230 30 260 90 Q270 140 155 150 Z' },
      { id: 'wingBL', d: 'M145 158 Q60 170 70 230 Q100 260 145 175 Z' },
      { id: 'wingBR', d: 'M155 158 Q240 170 230 230 Q200 260 155 175 Z' },
      { id: 'spotL', d: circle(90, 105, 16) },
      { id: 'spotR', d: circle(210, 105, 16) },
      { id: 'body', d: ellipse(150, 160, 10, 60) },
    ],
  },
  {
    id: 'house', title: 'بيت', emoji: '🏠',
    regions: [
      { id: 'grass', d: rect(5, 250, 290, 45) },
      { id: 'wall', d: rect(60, 140, 180, 110) },
      { id: 'roof', d: 'M40 145 L150 55 L260 145 Z' },
      { id: 'door', d: rect(130, 190, 40, 60) },
      { id: 'winL', d: rect(78, 165, 36, 32) },
      { id: 'winR', d: rect(186, 165, 36, 32) },
      { id: 'chimney', d: rect(195, 70, 24, 45) },
    ],
  },
  {
    id: 'rocket', title: 'صاروخ', emoji: '🚀',
    regions: [
      { id: 'space', d: rect(5, 5, 290, 290) },
      { id: 'body', d: 'M150 30 Q200 80 195 200 L105 200 Q100 80 150 30 Z' },
      { id: 'window', d: circle(150, 110, 22) },
      { id: 'finL', d: 'M108 160 L70 220 L108 200 Z' },
      { id: 'finR', d: 'M192 160 L230 220 L192 200 Z' },
      { id: 'flame', d: 'M115 200 L185 200 L165 250 L150 230 L135 250 Z' },
    ],
  },
  {
    id: 'flower', title: 'زهرة', emoji: '🌸',
    regions: [
      ...Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return { id: `petal${i}`, d: circle(+(150 + 45 * Math.cos(a)).toFixed(1), +(110 + 45 * Math.sin(a)).toFixed(1), 30) };
      }),
      { id: 'center', d: circle(150, 110, 28) },
      { id: 'stem', d: rect(144, 150, 12, 130) },
      { id: 'leaf', d: 'M156 220 Q210 190 230 215 Q200 240 156 232 Z' },
    ],
  },
  {
    id: 'castle', title: 'قلعة', emoji: '🏰',
    regions: [
      { id: 'wall', d: rect(60, 130, 180, 140) },
      { id: 'towerL', d: 'M30 270 L30 90 L45 90 L45 75 L60 75 L60 90 L75 90 L75 75 L90 75 L90 270 Z' },
      { id: 'towerR', d: 'M210 270 L210 90 L225 90 L225 75 L240 75 L240 90 L255 90 L255 75 L270 75 L270 270 Z' },
      { id: 'gate', d: 'M125 270 L125 215 Q150 185 175 215 L175 270 Z' },
      { id: 'flag', d: 'M150 130 L150 60 L195 75 L150 90 Z' },
      { id: 'win', d: rect(135, 150, 30, 30) },
    ],
  },
  {
    id: 'dragon', title: 'تنين', emoji: '🐉',
    regions: [
      { id: 'body', d: ellipse(150, 190, 80, 55) },
      { id: 'belly', d: ellipse(150, 205, 45, 30) },
      { id: 'head', d: ellipse(220, 115, 42, 34) },
      { id: 'wing', d: 'M120 150 L80 60 L130 95 L150 50 L165 140 Z' },
      { id: 'tail', d: 'M72 200 Q20 210 25 160 L45 175 Q50 195 80 185 Z' },
      { id: 'eye', d: circle(232, 105, 8) },
      { id: 'fire', d: 'M262 120 L295 100 L285 120 L298 135 L262 130 Z' },
    ],
  },
];

export const PAGE_BY_ID = Object.fromEntries(COLORING_PAGES.map((p) => [p.id, p]));
