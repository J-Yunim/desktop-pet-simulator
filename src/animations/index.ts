import { AnimationState } from './types';

import { tuxedoIdle } from './tuxedo/tuxedo-idle';
import { tuxedoWalking } from './tuxedo/tuxedo-walking';
import { tuxedoSleeping } from './tuxedo/tuxedo-sleeping';
import { tuxedoEating } from './tuxedo/tuxedo-eating';
import { tuxedoLoaf } from './tuxedo/tuxedo-loaf';

import { tabbyIdle } from './tabby/tabby-idle';
import { tabbyWalking } from './tabby/tabby-walking';
import { tabbySleeping } from './tabby/tabby-sleeping';
import { tabbyEating } from './tabby/tabby-eating';
import { tabbyLoaf } from './tabby/tabby-loaf';

export type PetType = 'tuxedo' | 'tabby';
export type PetState = 'idle' | 'walking' | 'sleeping' | 'eating' | 'loaf' | 'kneading' | 'yarn';

export function getAnimationState(type: PetType, state: PetState, t: number, isStarving: boolean): AnimationState {
  if (type === 'tuxedo') {
    switch (state) {
      case 'idle': return tuxedoIdle(t, isStarving);
      case 'walking': return tuxedoWalking(t);
      case 'sleeping': return tuxedoSleeping(t);
      case 'eating': return tuxedoEating(t);
      case 'loaf': return tuxedoLoaf(t);
      case 'kneading': return tuxedoIdle(t, isStarving); // Fallback
      case 'yarn': return tuxedoIdle(t, isStarving); // Fallback
    }
  } else if (type === 'tabby') {
    switch (state) {
      case 'idle': return tabbyIdle(t, isStarving);
      case 'walking': return tabbyWalking(t);
      case 'sleeping': return tabbySleeping(t);
      case 'eating': return tabbyEating(t);
      case 'loaf': return tabbyLoaf(t);
      case 'kneading': return tabbyIdle(t, isStarving); // Fallback
      case 'yarn': return tabbyIdle(t, isStarving); // Fallback
    }
  }
  
  // Fallback
  return tuxedoIdle(t, isStarving);
}
