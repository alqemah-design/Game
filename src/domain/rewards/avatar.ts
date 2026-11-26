/**
 * Avatar = a boy or a girl. Parts are filtered by kind; some unlock with points
 * so dressing up stays a reason to keep playing.
 */
export type AvatarKind = 'boy' | 'girl';
export type AvatarPart = 'hair' | 'outfit' | 'pattern' | 'accessory';
export type AvatarOption = { id: string; minPoints: number; kinds?: AvatarKind[] };

export const AVATAR_KINDS: readonly AvatarKind[] = ['boy', 'girl'];

export const AVATAR_OPTIONS: Record<AvatarPart, AvatarOption[]> = {
  hair: [
    { id: 'short', minPoints: 0, kinds: ['boy'] },
    { id: 'side', minPoints: 0, kinds: ['boy'] },
    { id: 'curly', minPoints: 0 },
    { id: 'buzz', minPoints: 150, kinds: ['boy'] },
    { id: 'spiky', minPoints: 500, kinds: ['boy'] },
    { id: 'long', minPoints: 0, kinds: ['girl'] },
    { id: 'ponytail', minPoints: 0, kinds: ['girl'] },
    { id: 'hijab', minPoints: 0, kinds: ['girl'] },
    { id: 'bob', minPoints: 150, kinds: ['girl'] },
    { id: 'pigtails', minPoints: 500, kinds: ['girl'] },
  ],
  outfit: [
    { id: 'tshirt', minPoints: 0 },
    { id: 'thobe', minPoints: 0, kinds: ['boy'] },
    { id: 'dress', minPoints: 0, kinds: ['girl'] },
    { id: 'hoodie', minPoints: 300 },
    { id: 'cape', minPoints: 2000 },
  ],
  pattern: [
    { id: 'plain', minPoints: 0 },
    { id: 'dots', minPoints: 150 },
    { id: 'stripes', minPoints: 750 },
    { id: 'stars', minPoints: 3000 },
  ],
  accessory: [
    { id: 'none', minPoints: 0 },
    { id: 'cap', minPoints: 150, kinds: ['boy'] },
    { id: 'bow', minPoints: 150, kinds: ['girl'] },
    { id: 'glasses', minPoints: 500 },
    { id: 'headphones', minPoints: 1000 },
    { id: 'crown', minPoints: 4000 },
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
