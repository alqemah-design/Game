import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import type { Artwork, ArtStroke } from '@/domain/progress';
import type { ColoringPage } from '@/domain/content/coloringPages';
import { play } from '@/audio/sfx';
import { Pressy } from '../components/Pressy';
import { font, radius, raised, useTheme } from '../theme/theme';

type Tool = 'fill' | 'brush' | 'sticker';
type Snapshot = Pick<Artwork, 'fills' | 'strokes' | 'stickers'>;

const COLORS = ['#EF4444', '#F97316', '#FACC15', '#84CC16', '#22C55E', '#14B8A6', '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#F9A8D4', '#92400E', '#FFFFFF', '#9CA3AF', '#111827'];
const SIZES = [6, 12, 22];
const STICKERS = ['⭐', '❤️', '🌸', '🦋', '🌈', '☁️', '🎈', '✨', '🍭', '🐞'];
const VB = 300;

/** Raised tool button with its name under the icon (children can't read icons alone). */
function ToolButton({ icon, label, onPress, active, save }: { icon: string; label: string; onPress: () => void; active?: boolean; save?: boolean }) {
  const t = useTheme();
  const bg = save ? t.success : active ? t.primary : t.card;
  return (
    <Pressy onPress={onPress} accessibilityLabel={label} style={[styles.tool, raised(t, bg, save ? '#15803D' : active ? '#5B21B6' : t.edge)]}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <Text style={[styles.toolLabel, { color: save || active ? '#FFFFFF' : t.text }]}>{label}</Text>
    </Pressy>
  );
}

export function ColoringCanvas({ page, initial, onSave }: { page: ColoringPage; initial?: Snapshot; onSave: (s: Snapshot) => void }) {
  const t = useTheme();
  const [tool, setTool] = useState<Tool>('fill');
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [art, setArt] = useState<Snapshot>(initial ?? { fills: {}, strokes: [], stickers: [] });
  const [live, setLiveState] = useState<ArtStroke | null>(null);
  const liveRef = useRef<ArtStroke | null>(null);
  const lastPt = useRef<[number, number] | null>(null);
  const setLive = (s: ArtStroke | null) => { liveRef.current = s; setLiveState(s); };
  const history = useRef<Snapshot[]>([]);
  const [w, setW] = useState(0);
  const scale = w ? VB / w : 1;

  const commit = (next: Snapshot) => { history.current.push(art); if (history.current.length > 40) history.current.shift(); setArt(next); };
  const undo = () => { const prev = history.current.pop(); if (prev) setArt(prev); };

  const brush = usePanGesture({
    enabled: tool === 'brush',
    minDistance: 0,
    runOnJS: true,
    onActivate: (e) => {
      lastPt.current = [e.x * scale, e.y * scale];
      setLive({ d: `M${(e.x * scale).toFixed(1)} ${(e.y * scale).toFixed(1)}`, color, width: size });
    },
    onUpdate: (e) => {
      const s = liveRef.current;
      if (!s) return;
      const x = e.x * scale, y = e.y * scale;
      // Skip points closer than 2 units: keeps saved drawings small and redraws cheap.
      const last = lastPt.current;
      if (last && Math.hypot(x - last[0], y - last[1]) < 2) return;
      lastPt.current = [x, y];
      setLive({ ...s, d: `${s.d} L${x.toFixed(1)} ${y.toFixed(1)}` });
    },
    onDeactivate: () => {
      const s = liveRef.current;
      if (s) commit({ ...art, strokes: [...art.strokes, s] });
      setLive(null);
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={brush}>
        <View style={[styles.canvas, { backgroundColor: '#FFFFFF' }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          <Pressable
            disabled={tool !== 'sticker'}
            style={StyleSheet.absoluteFill}
            onPress={(e) => { play('pop'); commit({ ...art, stickers: [...art.stickers, { emoji: sticker, x: e.nativeEvent.locationX * scale, y: e.nativeEvent.locationY * scale }] }); }}
          >
            <Svg width="100%" height="100%" viewBox={`0 0 ${VB} ${VB}`} pointerEvents={tool === 'fill' ? 'auto' : 'none'}>
              {page.regions.map((r) => (
                <Path key={r.id} d={r.d} fill={art.fills[r.id] ?? '#FFFFFF'} stroke="#1F2937" strokeWidth={3} strokeLinejoin="round"
                  onPress={tool === 'fill' ? () => { play('pop'); commit({ ...art, fills: { ...art.fills, [r.id]: color } }); } : undefined} />
              ))}
              <G pointerEvents="none">
                {[...art.strokes, ...(live ? [live] : [])].map((s, i) => (
                  <Path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                ))}
                {art.stickers.map((s, i) => <SvgText key={i} x={s.x} y={s.y + 12} fontSize={34} textAnchor="middle">{s.emoji}</SvgText>)}
              </G>
            </Svg>
          </Pressable>
        </View>
      </GestureDetector>

      <View style={styles.tools}>
        {([['fill', '🪣', 'تعبئة'], ['brush', '🖌️', 'فرشاة'], ['sticker', '⭐', 'ملصقات']] as const).map(([id, icon, label]) => (
          <ToolButton key={id} icon={icon} label={label} active={tool === id} onPress={() => setTool(id)} />
        ))}
        <ToolButton icon="↩️" label="تراجع" onPress={undo} />
        <ToolButton icon="🧽" label="مسح" onPress={() => commit({ fills: {}, strokes: [], stickers: [] })} />
        <ToolButton icon="💾" label="حفظ" onPress={() => onSave(art)} save />
      </View>

      {tool === 'sticker' ? (
        <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
          {STICKERS.map((s) => (
            <Pressy key={s} onPress={() => setSticker(s)} style={[styles.sw, { backgroundColor: sticker === s ? t.hintBg : t.card }]}><Text style={{ fontSize: 28 }}>{s}</Text></Pressy>
          ))}
        </ScrollView>
      ) : (
        <>
          <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
            {COLORS.map((c) => (
              <Pressy key={c} sound={false} onPress={() => setColor(c)} accessibilityLabel={`لون ${c}`}
                style={[styles.sw, { backgroundColor: c, borderWidth: color === c ? 5 : 2, borderColor: color === c ? t.primary : t.border }]} />
            ))}
          </ScrollView>
          {tool === 'brush' && (
            <View style={[styles.row, { justifyContent: 'center' }]}>
              {SIZES.map((s) => (
                <Pressy key={s} onPress={() => setSize(s)} style={[styles.sw, { backgroundColor: size === s ? t.hintBg : t.card }]}>
                  <View style={{ width: s + 4, height: s + 4, borderRadius: 99, backgroundColor: color }} />
                </Pressy>
              ))}
            </View>
          )}
        </>
      )}
      <Text style={[font.small, { color: t.textMuted, textAlign: 'center' }]}>
        {tool === 'fill' ? 'اختر لونًا ثم المس جزءًا من الرسمة' : tool === 'brush' ? 'ارسم بإصبعك' : 'المس الرسمة لتضع ملصقًا'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { width: '100%', aspectRatio: 1, maxWidth: 560, alignSelf: 'center', borderRadius: radius.lg, overflow: 'hidden' },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
  tool: { width: 58, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  sw: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
