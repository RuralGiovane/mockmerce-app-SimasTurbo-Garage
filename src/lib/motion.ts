import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { FadeInDown, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';
export const ANIMATIONS_ENABLED = true;
export const motion = {
  fast: 140, normal: 250, drawerIn: 260, drawerOut: 220,
  stagger: 45, maxDelay: 270, pressedScale: 0.97,
  spring: { damping: 16, stiffness: 240, mass: 0.5, reduceMotion: ReduceMotion.System },
};
export function useMotionEnabled() {
  // Evita movimento antes de conhecer a preferência do sistema.
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); }).catch(() => undefined);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; listener.remove(); };
  }, []);
  return ANIMATIONS_ENABLED && !reduced;
}
export const itemEntry = (index: number) => FadeInDown.duration(motion.normal)
  .delay(Math.min(index * motion.stagger, motion.maxDelay)).reduceMotion(ReduceMotion.System);
export const itemExit = FadeOut.duration(motion.fast).reduceMotion(ReduceMotion.System);
export const itemLayout = LinearTransition.duration(motion.normal).reduceMotion(ReduceMotion.System);
