import { AnimationState } from '../types';

export function tabbyLoaf(t: number): AnimationState {
  return {
    bodySy: 0.7,
    bodyY: 5,
    headY: 3 + Math.sin(t * 2) * 0.05,
    tailR: 0,
    isBlink: Math.sin(t * 2) > 0.9,
  };
}
