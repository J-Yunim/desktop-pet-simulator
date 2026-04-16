import { AnimationState } from '../types';

export function tabbyIdle(t: number, isStarving: boolean): AnimationState {
  if (isStarving) {
    return {
      bodySy: 0.8,
      bodyY: 4,
      headY: 3,
      tailR: -0.2,
      isBlink: true,
    };
  }
  return {
    bodySy: 1,
    bodyY: 0,
    headY: 0,
    tailR: Math.sin(t * 2) * 0.1,
    isBlink: Math.sin(t * 3) > 0.95,
  };
}
