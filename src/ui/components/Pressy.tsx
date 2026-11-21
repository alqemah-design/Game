import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { play } from '@/audio/sfx';

const APressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; sound?: boolean };

/** Pressable that squishes on touch – the tactile feel children expect from a "real" app. */
export function Pressy({ style, sound = true, onPressIn, onPressOut, onPress, ...rest }: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { scale.set(withSpring(0.92, { damping: 15, stiffness: 400 })); onPressIn?.(e); }}
      onPressOut={(e) => { scale.set(withSpring(1, { damping: 10, stiffness: 300 })); onPressOut?.(e); }}
      onPress={(e) => { if (sound) play('tap'); onPress?.(e); }}
      style={[style, anim]}
    />
  );
}
