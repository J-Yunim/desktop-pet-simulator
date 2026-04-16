export interface AnimationState {
  headY: number;
  bodySy: number;
  bodyY: number;
  tailR: number;
  isBlink: boolean;
  frameRate?: number;
  drawExtras?: (ctx: CanvasRenderingContext2D, t: number, PX: number) => void;
}
