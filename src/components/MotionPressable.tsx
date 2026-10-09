import { useEffect, useState } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion, useMotionEnabled } from '@/lib/motion';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function MotionPressable({ style, onPressIn, onPressOut, ...props }: PressableProps) {
  const enabled = useMotionEnabled();
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  useEffect(() => { if (!enabled) { cancelAnimation(scale); scale.value = 1; } }, [enabled, scale]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <AnimatedPressable {...props} style={[typeof style === 'function' ? style({ pressed }) : style, pressed && { opacity: 0.75 }, animated]}
    onPressIn={(event: GestureResponderEvent) => { setPressed(true); if (enabled) scale.value = withSpring(motion.pressedScale, motion.spring); onPressIn?.(event); }}
    onPressOut={(event: GestureResponderEvent) => { setPressed(false); scale.value = enabled ? withSpring(1, motion.spring) : 1; onPressOut?.(event); }} />;
}
