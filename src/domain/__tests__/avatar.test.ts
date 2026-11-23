import { AVATAR_OPTIONS, DEFAULT_AVATARS, normalizeAvatar, optionsFor, withKind, type AvatarPart } from '../rewards/avatar';

describe('avatar', () => {
  it('converts avatars saved by the earlier version (body shapes)', () => {
    expect(normalizeAvatar({ body: 'robot', hair: 'short', outfit: 'tshirt', skin: '#5C3A1E' })).toMatchObject({ kind: 'boy', hair: 'short', skin: '#5C3A1E' });
    expect(normalizeAvatar({ body: 'bear', hair: 'long', outfit: 'dress' })).toMatchObject({ kind: 'girl', hair: 'long', outfit: 'dress' });
    expect(normalizeAvatar(null)).toEqual(DEFAULT_AVATARS.boy);
    expect(normalizeAvatar({ kind: 'boy', hair: 'nonsense' }).hair).toBe('short');
  });

  it('switching kind keeps colours and replaces parts that do not fit', () => {
    const boy = { ...DEFAULT_AVATARS.boy, outfit: 'thobe', accessory: 'cap', outfitColor: '#22C55E' };
    const girl = withKind(boy, 'girl');
    expect(girl).toMatchObject({ kind: 'girl', hair: 'long', outfit: 'dress', accessory: 'none', outfitColor: '#22C55E' });
    expect(withKind({ ...girl, hair: 'curly' }, 'boy').hair).toBe('curly'); // shared style stays
  });

  it('each kind has a free option for every part', () => {
    for (const kind of ['boy', 'girl'] as const)
      for (const part of Object.keys(AVATAR_OPTIONS) as AvatarPart[])
        expect(optionsFor(part, kind).some((o) => o.minPoints === 0)).toBe(true);
  });
});
