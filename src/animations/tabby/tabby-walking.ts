import { AnimationState } from '../types';

export function tabbyWalking(t: number): AnimationState {
  return {
    bodySy: 1,
    bodyY: Math.abs(Math.sin(t * 10)) * 2,
    headY: Math.abs(Math.sin(t * 10 + Math.PI)) * 1,
    tailR: Math.sin(t * 5) * 0.2,
    isBlink: false,
  };
}
