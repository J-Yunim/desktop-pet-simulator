import React, { useEffect, useRef, useState } from 'react';
import { getAnimationState, PetState } from '../animations';

// Dynamically import all animation frames
const ALL_ANIMATIONS = import.meta.glob('../assets/animations/**/*.png', { eager: true, import: 'default' }) as Record<string, string>;

function getFramesFor(type: string, state: string) {
  // Map internal state names to directory names if they differ
  const dirMap: Record<string, string> = {
    'idle': type === 'tabby' ? 'sitting' : 'idle',
    'loaf': type === 'tabby' ? 'loafing' : 'loaf',
    'walking': 'walking',
    'sleeping': 'sleeping',
    'eating': 'eating',
    'kneading': 'kneading',
    'yarn': 'yarn'
  };

  const dirName = dirMap[state] || state;
  const folderName = `${type}-${dirName}`;
  const prefix = `../assets/animations/${type}/${folderName}/frame-`;
  
  return Object.keys(ALL_ANIMATIONS)
    .filter(path => path.includes(`/${type}/`) && path.includes(`/${folderName}/`) && path.includes('/frame-'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/frame-(\d+)\.png$/)?.[1] || '0');
      const numB = parseInt(b.match(/frame-(\d+)\.png$/)?.[1] || '0');
      return numA - numB;
    })
    .map(path => ALL_ANIMATIONS[path]);
}

const BUBBLE_FISH = [
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,3,2,2,2,2,2,2,2,1],
  [1,2,2,3,3,3,3,3,3,3,2,3,2,2,2,1],
  [1,2,2,3,4,1,3,3,3,3,3,3,3,2,2,1],
  [1,2,2,3,3,3,3,3,3,3,2,3,2,2,2,1],
  [1,2,2,2,2,2,2,3,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [0,0,0,1,1,1,1,2,2,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
];

const P = {
  c1:'#000000', c2:'#383838', c3:'#FFFFFF', // Tuxedo
  c4:'#63533a', c5:'#3a260e', // Tabby
  sm:'#888', sl:'#BBB', blush:'#FAC8D8', food:'#8B4513', pink:'#F06090'
};

const PX = 8; // Scale factor (2x from previous 4)

interface DesktopPetProps {
  key?: number | string;
  type?: 'tuxedo' | 'tabby';
  initialX?: number;
  initialY?: number;
  isStarving?: boolean;
  name?: string;
  isFrozen?: boolean;
  forceState?: PetState;
  staticMode?: boolean;
  spriteUrl?: string;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function DesktopPet({ 
  type = 'tuxedo', 
  initialX = 100, 
  initialY = 100, 
  isStarving = false,
  name = 'Cat',
  isFrozen = false,
  forceState,
  staticMode = false,
  onClick,
  onContextMenu
}: DesktopPetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteImgRef = useRef<HTMLImageElement | null>(null);
  const animationFramesRef = useRef<Record<string, HTMLImageElement[]>>({});
  const isSpriteLoadedRef = useRef(false);
  const isAnimationsLoadedRef = useRef(false);
  const [, forceUpdate] = useState({}); // To trigger re-render on load if needed for other UI
  
  const [isHoveringPet, setIsHoveringPet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const dragOffsetRefY = useRef(0);
  const originalYRef = useRef(initialY);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  
  const posRef = useRef({ x: initialX, y: initialY });
  const dirRef = useRef(1);
  const stateRef = useRef<PetState>('idle');
  const isStarvingRef = useRef(isStarving);
  const isFrozenRef = useRef(isFrozen);

  useEffect(() => {
    isStarvingRef.current = isStarving;
  }, [isStarving]);

  useEffect(() => {
    isFrozenRef.current = isFrozen;
  }, [isFrozen]);

  useEffect(() => {
    // Load multi-frame animations for Tabby and Tuxedo
    if (type === 'tabby' || type === 'tuxedo') {
      const states: PetState[] = ['idle', 'walking', 'sleeping', 'eating', 'loaf', 'kneading', 'yarn'];
      const animations: Record<string, string[]> = {};
      
      states.forEach(state => {
        const frames = getFramesFor(type, state);
        if (frames.length > 0) {
          animations[state] = frames;
        }
      });
      
      const loaded: Record<string, HTMLImageElement[]> = {};
      let totalToLoad = 0;
      let loadedCount = 0;

      const entries = Object.entries(animations);
      if (entries.length === 0) {
        isAnimationsLoadedRef.current = true;
        forceUpdate({});
        return;
      }

      entries.forEach(([state, frames]) => {
        totalToLoad += frames.length;
        loaded[state] = frames.map((src) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loadedCount++;
            if (loadedCount === totalToLoad) {
              animationFramesRef.current = loaded;
              isAnimationsLoadedRef.current = true;
              forceUpdate({});
            }
          };
          img.onerror = () => {
            console.error(`Failed to load frame: ${src}`);
            loadedCount++;
            if (loadedCount === totalToLoad) {
              animationFramesRef.current = loaded;
              isAnimationsLoadedRef.current = true;
              forceUpdate({});
            }
          };
          return img;
        });
      });
    } else {
      isAnimationsLoadedRef.current = false;
      animationFramesRef.current = {};
    }
  }, [type]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let startTime = performance.now();
    let lastStateChange = startTime;
    let lastFrameTime = startTime;
    const TARGET_FPS = 12;
    const FRAME_MIN_TIME = 1000 / TARGET_FPS;
    
    const drawCat = (t: number) => {
      const s = forceState || (isStarvingRef.current ? 'idle' : stateRef.current);
      
      // If we are forcing a state that doesn't exist, don't draw anything
      const frames = animationFramesRef.current[s];
      if (forceState && (!frames || frames.length === 0)) {
        ctx.clearRect(0, 0, cv.width, cv.height);
        return;
      }

      ctx.clearRect(0, 0, cv.width, cv.height);
      
      const animState = getAnimationState(type, s, t, isStarvingRef.current);
      
      const drawBubble = (bubbleData: number[][], cmap: Record<number, string>) => {
        const BPX = PX * 0.5; // 0.5x smaller
        ctx.save();
        ctx.translate(4 * PX, -7 * PX); // Adjusted to be just above the head
        // Bubble doesn't flip with the pet
        ctx.scale(dirRef.current, 1); 
        ctx.translate(-8 * BPX, 0);
        
        for (let r = 0; r < bubbleData.length; r++) {
          for (let c = 0; c < bubbleData[r].length; c++) {
            const val = bubbleData[r][c];
            if (val) {
              ctx.fillStyle = cmap[val];
              ctx.fillRect(c * BPX, r * BPX, BPX, BPX);
            }
          }
        }
        ctx.restore();
      };

      ctx.save();
      // Center the pet in the canvas (base at y=224 to give more head room)
      ctx.translate(cv.width/2, 224);
      ctx.scale(dirRef.current, 1);
      ctx.translate(-8 * PX, -16 * PX); // Center pivot
      
      if (frames && frames.length > 0 && isAnimationsLoadedRef.current) {
        // Multi-frame animation rendering
        // Ensure a consistent loop duration for walking (e.g., 0.5s per cycle)
        const defaultFrameRate = s === 'walking' ? Math.max(frames.length * 2, 4) : 4;
        const frameRate = animState.frameRate || defaultFrameRate;
        const frameIndex = Math.floor(t * frameRate) % frames.length;
        const frameImg = frames[frameIndex];
        
        ctx.save();
        ctx.translate(0, animState.bodyY * PX);
        // No scaling for frame-based animations (Tabby/Tuxedo) to prevent compress/expand
        
        ctx.drawImage(frameImg, 0, 0, 16 * PX, 16 * PX);
        
        if (animState.drawExtras) {
          animState.drawExtras(ctx, t, PX);
        }
        ctx.restore();

        if (isStarvingRef.current) {
          drawBubble(BUBBLE_FISH, {1: P.c1, 2: P.c3, 3: '#FF8C00', 4: '#FFFFFF'});
        }
      } else if (type === 'tabby' || type === 'tuxedo') {
        // Fallback to absolute if individual frames aren't ready
        ctx.fillStyle = type === 'tabby' ? '#63533a' : '#000000';
        ctx.fillRect(4 * PX, 8 * PX, 8 * PX, 6 * PX);
      } else if (spriteImgRef.current && isSpriteLoadedRef.current) {
        // Sprite-based rendering
        const frameCount = 2; 
        const frameIndex = Math.floor(t * 4) % frameCount;
        
        // Calculate source dimensions based on frame count
        const sw = spriteImgRef.current.width / frameCount;
        const sh = spriteImgRef.current.height;
        
        // Use square frames if height is much larger than frame width (to crop white space)
        const effectiveSh = sh > sw * 1.5 ? sw : sh;
        
        ctx.save();
        // Apply animation transforms
        ctx.translate(0, animState.bodyY * PX);
        ctx.scale(1, animState.bodySy);
        
        ctx.drawImage(
          spriteImgRef.current,
          frameIndex * sw, 0, sw, effectiveSh,
          0, 0, 16 * PX, 16 * PX
        );
        
        if (animState.drawExtras) {
          animState.drawExtras(ctx, t, PX);
        }
        ctx.restore();
        
        if (isStarvingRef.current) {
          drawBubble(BUBBLE_FISH, {1: P.c1, 2: P.c3, 3: '#FF8C00', 4: '#FFFFFF'});
        }
      }

      ctx.restore();
    };

    const loop = (time: number) => {
      animFrame = requestAnimationFrame(loop);
      
      const elapsed = time - lastFrameTime;
      if (elapsed < FRAME_MIN_TIME) return; // Skip frame to save CPU
      
      lastFrameTime = time - (elapsed % FRAME_MIN_TIME);
      const t = (time - startTime) / 1000;
      
      // AI Logic (pause if frozen or dragging)
      if (!isFrozenRef.current && !isDraggingRef.current) {
        if (isStarvingRef.current) {
          stateRef.current = 'idle';
        } else if (time - lastStateChange > 3000 + Math.random() * 5000) {
          lastStateChange = time;
          const allStates: PetState[] = ['idle', 'walking', 'sleeping', 'eating', 'loaf', 'kneading', 'yarn'];
          // Only pick states that actually have loaded animation frames
          const availableStates = allStates.filter(s => 
            animationFramesRef.current[s] && 
            animationFramesRef.current[s].length > 0 &&
            animationFramesRef.current[s].every(img => img.complete && img.naturalWidth > 0)
          );
          
          if (availableStates.length > 0) {
            const nextState = availableStates[Math.floor(Math.random() * availableStates.length)];
            stateRef.current = nextState;
            if (nextState === 'walking') {
              dirRef.current = Math.random() > 0.5 ? 1 : -1;
            }
          }
        }

        // Movement
        if (!staticMode && stateRef.current === 'walking' && !isStarvingRef.current) {
          let nx = posRef.current.x + dirRef.current * 1.5;
          if (nx < -30) { nx = -30; dirRef.current = 1; }
          if (nx > window.innerWidth - 130) { nx = window.innerWidth - 130; dirRef.current = -1; }
          posRef.current.x = nx;
        }
      }

      // Update DOM directly
      if (containerRef.current && !staticMode) {
        containerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }

      drawCat(t);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [type, forceState, staticMode]);

  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        posRef.current.x = e.clientX - dragOffsetRef.current;
        posRef.current.y = e.clientY - dragOffsetRefY.current;
      }
    };
    const onWindowMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        posRef.current.y = originalYRef.current;
      }
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, []);

  const checkPixelTransparency = (e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      return pixel[3] > 10; // Alpha > 10
    } catch (err) {
      return false;
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (checkPixelTransparency(e)) {
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);
      dragOffsetRef.current = e.clientX - posRef.current.x;
      dragOffsetRefY.current = e.clientY - posRef.current.y;
      originalYRef.current = posRef.current.y;
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const dist = Math.sqrt(
      Math.pow(e.clientX - dragStartPosRef.current.x, 2) + 
      Math.pow(e.clientY - dragStartPosRef.current.y, 2)
    );
    
    if (onClick && checkPixelTransparency(e) && dist < 5) {
      onClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const isOverPet = checkPixelTransparency(e);
    if (isOverPet !== isHoveringPet) {
      setIsHoveringPet(isOverPet);
    }
  };

  const handleMouseLeave = () => {
    setIsHoveringPet(false);
  };

  return (
    <div 
      ref={containerRef}
      className="group"
      style={{
        position: staticMode ? 'relative' : 'fixed',
        left: staticMode ? 'auto' : 0,
        top: staticMode ? 'auto' : 0,
        width: 256,
        height: 256,
        pointerEvents: 'none', // Allow clicking through the container
        zIndex: isFrozen ? 10001 : 9999,
        willChange: staticMode ? 'auto' : 'transform'
      }}
    >
      <canvas 
        ref={canvasRef} 
        width={256} 
        height={256} 
        onMouseDown={handleCanvasMouseDown}
        onClick={handleCanvasClick}
        onContextMenu={(e) => {
          if (onContextMenu && checkPixelTransparency(e)) {
            e.preventDefault();
            onContextMenu(e);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          imageRendering: 'pixelated',
          pointerEvents: 'auto', // Re-enable pointer events for the canvas
          cursor: isDragging ? 'grabbing' : (isHoveringPet ? 'grab' : 'default')
        }} 
        className={`transition-transform ${isHoveringPet || isDragging ? 'scale-110' : ''}`}
      />
      <div 
        className={`absolute bottom-0 left-0 right-0 text-center text-white font-bold text-sm tracking-wider transition-opacity ${isHoveringPet ? 'opacity-100' : 'opacity-80'}`}
        style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
      >
        {name}
      </div>
    </div>
  );
}
