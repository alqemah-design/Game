import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/ui/components/Text';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { Easing, FadeIn, ZoomIn, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { ROOM_SPOTS, roomItemName } from '@/domain/games/newGames';
import { Pressy } from '../../components/Pressy';

/** Room drawn in one-point perspective in a 400×320 box; vanishing point at (200,110). */
export const ROOM_W = 400;
export const ROOM_H = 320;

/** Where each ROOM_SPOTS index sits: base point (x,y) and depth scale (smaller = further away). */
const SPOT_POS: { x: number; y: number; s: number }[] = [
  { x: 110, y: 111, s: 0.6 }, { x: 143, y: 111, s: 0.6 }, { x: 176, y: 111, s: 0.6 }, // shelf
  { x: 40, y: 118, s: 0.85 }, { x: 360, y: 118, s: 0.85 }, // walls (y = centre)
  { x: 258, y: 210, s: 0.72 }, { x: 300, y: 210, s: 0.72 }, // table top
  { x: 128, y: 222, s: 0.82 }, { x: 205, y: 242, s: 0.95 }, // back floor
  { x: 72, y: 294, s: 1.15 }, { x: 205, y: 306, s: 1.22 }, { x: 334, y: 296, s: 1.15 }, // front floor
];
const BASE_FONT = 54;

/** The room itself. Static: drawn once and memoised. */
const RoomBackdrop = memo(function RoomBackdrop() {
  const vp = { x: 200, y: 110 };
  const planks = Array.from({ length: 9 }, (_, i) => 80 + i * 30).map((x0) => ({ x0, xf: vp.x + (x0 - vp.x) * ((ROOM_H - vp.y) / (190 - vp.y)) }));
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`}>
      <Defs>
        <LinearGradient id="backWall" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFF1DC" /><Stop offset="1" stopColor="#F6D9B4" /></LinearGradient>
        <LinearGradient id="leftWall" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#E9C394" /><Stop offset="1" stopColor="#F3D4AC" /></LinearGradient>
        <LinearGradient id="rightWall" x1="1" y1="0" x2="0" y2="0"><Stop offset="0" stopColor="#E6BE8E" /><Stop offset="1" stopColor="#F3D4AC" /></LinearGradient>
        <LinearGradient id="ceiling" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFFFFF" /><Stop offset="1" stopColor="#FCEBD4" /></LinearGradient>
        <LinearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#B9783F" /><Stop offset="1" stopColor="#D69A5E" /></LinearGradient>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#38BDF8" /><Stop offset="1" stopColor="#E0F2FE" /></LinearGradient>
        <LinearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#A16207" /><Stop offset="1" stopColor="#713F12" /></LinearGradient>
        <LinearGradient id="tableTop" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#D4A373" /><Stop offset="1" stopColor="#B07D4F" /></LinearGradient>
        <LinearGradient id="curtain" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#F472B6" /><Stop offset="0.5" stopColor="#FBCFE8" /><Stop offset="1" stopColor="#EC4899" /></LinearGradient>
        <RadialGradient id="rug" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#A5B4FC" /><Stop offset="0.7" stopColor="#818CF8" /><Stop offset="1" stopColor="#6366F1" /></RadialGradient>
        <RadialGradient id="lampGlow" cx="0.5" cy="0" r="1"><Stop offset="0" stopColor="#FFFBEB" stopOpacity="0.9" /><Stop offset="1" stopColor="#FFFBEB" stopOpacity="0" /></RadialGradient>
        <ClipPath id="floorClip"><Polygon points="80,190 320,190 400,320 0,320" /></ClipPath>
      </Defs>

      {/* shell of the room */}
      <Polygon points="0,0 400,0 320,30 80,30" fill="url(#ceiling)" />
      <Polygon points="0,0 80,30 80,190 0,320" fill="url(#leftWall)" />
      <Polygon points="400,0 320,30 320,190 400,320" fill="url(#rightWall)" />
      <Rect x="80" y="30" width="240" height="160" fill="url(#backWall)" />
      <Polygon points="80,190 320,190 400,320 0,320" fill="url(#floor)" />
      {/* floor boards converging to the vanishing point */}
      <G clipPath="url(#floorClip)" stroke="#8B5A2B" strokeOpacity={0.35} strokeWidth={1.5}>
        {planks.map((p) => <Line key={p.x0} x1={p.x0} y1={190} x2={p.xf} y2={ROOM_H} />)}
        {[212, 240, 276].map((y, i) => <Line key={y} x1={0} y1={y} x2={400} y2={y} strokeDasharray={`${30 + i * 12} ${50 + i * 15}`} strokeDashoffset={i * 23} />)}
      </G>
      {/* skirting boards and corners */}
      <Rect x="80" y="183" width="240" height="7" fill="#FFFFFF" opacity={0.85} />
      <Polygon points="0,312 80,185 80,190 0,320" fill="#FFFFFF" opacity={0.7} />
      <Polygon points="400,312 320,185 320,190 400,320" fill="#FFFFFF" opacity={0.7} />
      <G stroke="#C9A27A" strokeWidth={1.2} opacity={0.6}>
        <Line x1="80" y1="30" x2="80" y2="190" /><Line x1="320" y1="30" x2="320" y2="190" />
        <Line x1="0" y1="0" x2="80" y2="30" /><Line x1="400" y1="0" x2="320" y2="30" />
      </G>

      {/* window with sky, sun, cloud and curtains */}
      <Rect x="210" y="48" width="90" height="82" rx="3" fill="#FFFFFF" />
      <Rect x="215" y="53" width="80" height="72" fill="url(#sky)" />
      <Circle cx="276" cy="72" r="10" fill="#FDE047" />
      <G fill="#FFFFFF" opacity={0.95}><Circle cx="234" cy="90" r="8" /><Circle cx="244" cy="86" r="10" /><Circle cx="255" cy="91" r="7" /><Rect x="232" y="90" width="26" height="8" rx="4" /></G>
      <Path d="M230 112 Q255 100 280 112 L295 125 L215 125 Z" fill="#86EFAC" />
      <Rect x="253" y="53" width="4" height="72" fill="#FFFFFF" /><Rect x="215" y="87" width="80" height="4" fill="#FFFFFF" />
      <Rect x="204" y="44" width="102" height="5" rx="2" fill="#78350F" />
      <Path d="M206 48 Q200 90 208 136 L222 136 Q214 90 222 48 Z" fill="url(#curtain)" />
      <Path d="M304 48 Q310 90 302 136 L288 136 Q296 90 288 48 Z" fill="url(#curtain)" />

      {/* shelf on the back wall */}
      <Rect x="92" y="111" width="104" height="7" rx="2" fill="url(#wood)" />
      <Path d="M100 118 L100 128 L108 118 Z M184 118 L184 128 L176 118 Z" fill="#713F12" />
      <Rect x="94" y="118" width="100" height="3" fill="#000" opacity={0.1} />

      {/* rug */}
      <Ellipse cx="205" cy="272" rx="128" ry="34" fill="url(#rug)" />
      <Ellipse cx="205" cy="272" rx="110" ry="27" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeDasharray="6 6" opacity={0.7} />

      {/* table: legs then top in perspective */}
      <Ellipse cx="282" cy="250" rx="58" ry="7" fill="#000" opacity={0.12} />
      <G fill="#7C4A1E"><Rect x="238" y="214" width="6" height="36" /><Rect x="318" y="214" width="6" height="36" /><Rect x="250" y="212" width="5" height="26" /><Rect x="306" y="212" width="5" height="26" /></G>
      <Polygon points="242,198 320,198 330,212 232,212" fill="url(#tableTop)" />
      <Rect x="232" y="212" width="98" height="6" fill="#8B5A2B" />

      {/* ceiling lamp and its light */}
      <Ellipse cx="200" cy="120" rx="150" ry="110" fill="url(#lampGlow)" opacity={0.35} />
      <Line x1="200" y1="0" x2="200" y2="14" stroke="#4B5563" strokeWidth={2} />
      <Path d="M184 26 Q200 8 216 26 Z" fill="#F59E0B" />
      <Circle cx="200" cy="27" r="4" fill="#FEF3C7" />
    </Svg>
  );
});

function ItemShadow({ k, spot }: { k: number; spot: number }) {
  const p = SPOT_POS[spot];
  if (ROOM_SPOTS[spot] === 'wall') return null;
  const w = 34 * p.s * k, h = 8 * p.s * k;
  return <View pointerEvents="none" style={{ position: 'absolute', left: p.x * k - w / 2, top: p.y * k - h / 2, width: w, height: h, borderRadius: w, backgroundColor: 'rgba(0,0,0,0.22)' }} />;
}

function Pulse({ children }: { children: React.ReactNode }) {
  const v = useSharedValue(1);
  useEffect(() => {
    v.set(withRepeat(withTiming(1.25, { duration: 500, easing: Easing.inOut(Easing.quad) }), -1, true));
    return () => cancelAnimation(v);
  }, [v]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: v.value }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

function Shake({ on, children }: { on: boolean; children: React.ReactNode }) {
  const x = useSharedValue(0);
  useEffect(() => {
    if (on) x.set(withSequence(withTiming(-6, { duration: 50 }), withTiming(6, { duration: 70 }), withTiming(0, { duration: 50 })));
  }, [on, x]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <Animated.View style={st}>{children}</Animated.View>;
}

type Props = {
  width: number;
  scene: string[];
  /** Lights off between studying and answering. */
  dark?: boolean;
  onTap?: (spot: number) => void;
  found?: number[];
  wrong?: number[];
  hintSpot?: number;
};

/** A furnished room with things placed in it; each thing can be tapped. */
export function RoomScene({ width, scene, dark, onTap, found = [], wrong = [], hintSpot }: Props) {
  const k = width / ROOM_W;
  return (
    <View style={[styles.frame, { width, height: ROOM_H * k }]}>
      <RoomBackdrop />
      {scene.map((e, i) => e ? <ItemShadow key={`s${i}`} k={k} spot={i} /> : null)}
      {scene.map((e, i) => {
        const p = SPOT_POS[i];
        const font = BASE_FONT * p.s * k;
        const box = font * 1.35;
        const wall = ROOM_SPOTS[i] === 'wall';
        const left = p.x * k - box / 2;
        const top = wall ? p.y * k - box / 2 : p.y * k - box * 0.92;
        if (!e) {
          return hintSpot === i ? (
            <View key={i} pointerEvents="none" style={{ position: 'absolute', left, top, width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
              <Pulse><View style={[styles.hintRing, { width: box * 0.8, height: box * 0.8, borderRadius: box }]} /></Pulse>
            </View>
          ) : null;
        }
        const ok = found.includes(i);
        const bad = wrong.includes(i);
        return (
          <Animated.View key={`${i}-${e}`} entering={ZoomIn.duration(250)} style={{ position: 'absolute', left, top, width: box, height: box }}>
            <Shake on={bad}>
              <Pressy sound={false} onPress={() => onTap?.(i)} accessibilityLabel={roomItemName(e) || e}
                style={[styles.item, { width: box, height: box, borderRadius: box }, ok && styles.found, hintSpot === i && styles.hint]}>
                <Text style={{ fontSize: font, opacity: bad ? 0.5 : 1 }}>{e}</Text>
              </Pressy>
            </Shake>
          </Animated.View>
        );
      })}
      {dark && (
        <Animated.View entering={FadeIn.duration(250)} pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dark]}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${ROOM_W} ${ROOM_H}`}>
            <Circle cx="276" cy="72" r="9" fill="#FEF9C3" />
            {[[230, 64], [248, 100], [286, 108], [262, 60]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r="1.6" fill="#FFF" />)}
          </Svg>
          <Text style={styles.darkText}>🌙 أُطفئت الأنوار…</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 18, overflow: 'hidden', borderWidth: 4, borderColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  item: { alignItems: 'center', justifyContent: 'center' },
  found: { backgroundColor: 'rgba(34,197,94,0.35)', borderWidth: 3, borderColor: '#22C55E' },
  hint: { backgroundColor: 'rgba(250,204,21,0.45)' },
  hintRing: { borderWidth: 3, borderColor: '#FACC15', borderStyle: 'dashed', backgroundColor: 'rgba(250,204,21,0.25)' },
  dark: { backgroundColor: 'rgba(15,23,42,0.88)', alignItems: 'center', justifyContent: 'center' },
  darkText: { position: 'absolute', color: '#FEF9C3', fontSize: 20, fontWeight: '800' },
});
