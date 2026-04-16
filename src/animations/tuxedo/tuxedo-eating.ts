import { AnimationState } from '../types';

export function tuxedoEating(t: number): AnimationState {
  const eatCycle = t % 1;
  const isBiting = eatCycle < 0.5;
  
  return {
    bodySy: 0.9,
    bodyY: 2,
    headY: isBiting ? 4 : 2,
    tailR: Math.sin(t * 2) * 0.3,
    isBlink: true,
    frameRate: 1,
  };
}
