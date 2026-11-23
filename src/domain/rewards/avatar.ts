/**
 * Avatar = a boy or a girl. Parts are filtered by kind; some unlock with points
 * so dressing up stays a reason to keep playing.
 */
export type AvatarKind = 'boy' | 'girl';
export type AvatarPart = 'hair' | 'outfit' | 'pattern' | 'accessory';
export type AvatarOption = { id: string; label: string; minPoints: number; kinds?: AvatarKind[] };

export const KIND_AR: Record<AvatarKind, string> = { boy: 'ولد', girl: 'بنت' };

export const AVATAR_OPTIONS: Record<AvatarPart, AvatarOption[]> = {
  hair: [
    { id: 'short', label: 'قصير', minPoints: 0, kinds: ['boy'] },
    { id: 'side', label: 'مفروق', minPoints: 0, kinds: ['boy'] },
    { id: 'curly', label: 'مجعد', minPoints: 0 },
    { id: 'buzz', label: 'قصير جدًا', minPoints: 150, kinds: ['boy'] },
    { id: 'spiky', label: 'مدبب', minPoints: 500, kinds: ['boy'] },
    { id: 'long', label: 'طويل', minPoints: 0, kinds: ['girl'] },
    { id: 'ponytail', label: 'ذيل حصان', minPoints: 0, kinds: ['girl'] },
    { id: 'hijab', label: 'حجاب', minPoints: 0, kinds: ['girl'] },
    { id: 'bob', label: 'قصّة قصيرة', minPoints: 150, kinds: ['girl'] },
    { id: 'pigtails', label: 'ضفيرتان', minPoints: 500, kinds: ['girl'] },
  ],
  outfit: [
    { id: 'tshirt', label: 'قميص', minPoints: 0 },
    { id: 'thobe', label: 'ثوب', minPoints: 0, kinds: ['boy'] },
    { id: 'dress', label: 'فستان', minPoints: 0, kinds: ['girl'] },
    { id: 'hoodie', label: 'هودي', minPoints: 300 },
    { id: 'cape', label: 'عباءة بطل', minPoints: 2000 },
  ],
  pattern: [
    { id: 'plain', label: 'سادة', minPoints: 0 },
    { id: 'dots', label: 'نقاط', minPoints: 150 },
    { id: 'stripes', label: 'خطوط', minPoints: 750 },
    { id: 'stars', label: 'نجوم', minPoints: 3000 },
  ],
  accessory: [
    { id: 'none', label: 'بدون', minPoints: 0 },
    { id: 'cap', label: 'قبعة', minPoints: 150, kinds: ['boy'] },
    { id: 'bow', label: 'فيونكة', minPoints: 150, kinds: ['girl'] },
    { id: 'glasses', label: 'نظارة', minPoints: 500 },
    { id: 'headphones', label: 'سماعات', minPoints: 1000 },
    { id: 'crown', label: 'تاج', minPoints: 4000 },
  ],
};

export const SKIN_TONES = ['#FDDCB5', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C3A1E'];
export const HAIR_COLORS = ['#1F2937', '#4B2E1E', '#7C4A21', '#B7791F', '#E5C07B', '#9CA3AF'];
export const PALETTE = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#14B8A6', '#3B82F6', '#A855F7', '#EC4899', '#1F2937', '#FFFFFF'];

export type Avatar = {
  kind: AvatarKind;
  hair: string;
  outfit: string;
  pattern: string;
  accessory: string;
  skin: string;
  hairColor: string;
  outfitColor: string;
};

export const DEFAULT_AVATARS: Record<AvatarKind, Avatar> = {
  boy: { kind: 'boy', hair: 'short', outfit: 'tshirt', pattern: 'plain', accessory: 'none', skin: SKIN_TONES[1], hairColor: '#1F2937', outfitColor: '#3B82F6' },
  girl: { kind: 'girl', hair: 'long', outfit: 'dress', pattern: 'plain', accessory: 'none', skin: SKIN_TONES[1], hairColor: '#4B2E1E', outfitColor: '#EC4899' },
};
export const DEFAULT_AVATAR = DEFAULT_AVATARS.boy;

export const isUnlocked = (o: AvatarOption, points: number) => points >= o.minPoints;
export const fitsKind = (o: AvatarOption, kind: AvatarKind) => !o.kinds || o.kinds.includes(kind);
export const optionsFor = (part: AvatarPart, kind: AvatarKind) => AVATAR_OPTIONS[part].filter((o) => fitsKind(o, kind));

/** Switch boy↔girl keeping colours, replacing parts that don't fit the new kind. */
export function withKind(a: Avatar, kind: AvatarKind): Avatar {
  const next: Avatar = { ...a, kind };
  for (const part of Object.keys(AVATAR_OPTIONS) as AvatarPart[]) {
    if (!optionsFor(part, kind).some((o) => o.id === next[part])) next[part] = DEFAULT_AVATARS[kind][part];
  }
  return next;
}

/**
 * Repairs avatars saved by earlier versions (which had body shapes such as "bear" or "robot")
 * or damaged data: guesses the kind from old girl-only parts, then fixes anything invalid.
 */
export function normalizeAvatar(raw: unknown): Avatar {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const kind: AvatarKind = r.kind === 'girl' || r.kind === 'boy' ? r.kind : r.outfit === 'dress' || r.hair === 'long' ? 'girl' : 'boy';
  const base = DEFAULT_AVATARS[kind];
  const merged: Avatar = {
    kind,
    hair: str(r.hair) ?? base.hair,
    outfit: str(r.outfit) ?? base.outfit,
    pattern: str(r.pattern) ?? base.pattern,
    accessory: str(r.accessory) ?? base.accessory,
    skin: str(r.skin) ?? base.skin,
    hairColor: str(r.hairColor) ?? base.hairColor,
    outfitColor: str(r.outfitColor) ?? base.outfitColor,
  };
  return withKind(merged, kind);
}
