/** Avatar parts. Each option has a points threshold so dressing up is a reason to keep playing. */
export type AvatarPart = 'body' | 'hair' | 'outfit' | 'pattern' | 'accessory';
export type AvatarOption = { id: string; label: string; minPoints: number };

export const AVATAR_OPTIONS: Record<AvatarPart, AvatarOption[]> = {
  body: [
    { id: 'round', label: 'دائري', minPoints: 0 },
    { id: 'tall', label: 'طويل', minPoints: 0 },
    { id: 'bear', label: 'دبدوب', minPoints: 300 },
    { id: 'robot', label: 'روبوت', minPoints: 1500 },
  ],
  hair: [
    { id: 'none', label: 'بدون', minPoints: 0 },
    { id: 'short', label: 'قصير', minPoints: 0 },
    { id: 'curly', label: 'مجعد', minPoints: 0 },
    { id: 'long', label: 'طويل', minPoints: 150 },
    { id: 'spiky', label: 'مدبب', minPoints: 500 },
  ],
  outfit: [
    { id: 'tshirt', label: 'قميص', minPoints: 0 },
    { id: 'dress', label: 'فستان', minPoints: 0 },
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
    { id: 'glasses', label: 'نظارة', minPoints: 500 },
    { id: 'crown', label: 'تاج', minPoints: 4000 },
    { id: 'headphones', label: 'سماعات', minPoints: 1000 },
  ],
};

export const SKIN_TONES = ['#FDDCB5', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C3A1E'];
export const PALETTE = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#14B8A6', '#3B82F6', '#A855F7', '#EC4899', '#1F2937', '#78350F'];

export type Avatar = {
  body: string; hair: string; outfit: string; pattern: string; accessory: string;
  skin: string; hairColor: string; outfitColor: string;
};

export const DEFAULT_AVATAR: Avatar = {
  body: 'round', hair: 'short', outfit: 'tshirt', pattern: 'plain', accessory: 'none',
  skin: SKIN_TONES[1], hairColor: '#1F2937', outfitColor: '#3B82F6',
};

export const isUnlocked = (o: AvatarOption, points: number) => points >= o.minPoints;
