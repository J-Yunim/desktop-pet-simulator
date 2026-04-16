import { AnimationState } from '../types';

export function tabbySleeping(t: number): AnimationState {
  return {
    bodySy: 0.6 + Math.sin(t * 2) * 0.05,
    bodyY: 6,
    headY: 5 + Math.sin(t * 2) * 0.02,
    tailR: 0.5,
    isBlink: true,
    drawExtras: (ctx, t, PX) => {
      ctx.globalAlpha = Math.sin(t * 3) * 0.5 + 0.5;
      ctx.fillStyle = '#888';
      ctx.font = 'bold 12px Courier New';
      ctx.fillText('z', 16 * PX, 4 * PX);
      ctx.fillText('Z', 20 * PX, 0);
      ctx.globalAlpha = 1;
    }
  };
}
