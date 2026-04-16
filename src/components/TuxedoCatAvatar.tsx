import { motion } from "motion/react";

const CAT_DATA = [
  [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0], // 0
  [0,1,2,1,0,0,0,1,2,1,0,0,0,0,0,0], // 1
  [1,2,2,1,1,1,1,1,2,2,1,0,0,0,0,0], // 1
  [1,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0], // 2
  [1,2,2,2,3,3,3,2,2,2,1,0,0,0,0,0], // 3
  [1,2,2,1,3,1,3,1,2,2,1,0,0,0,0,0], // 4
  [1,2,2,3,3,3,3,3,2,2,1,0,0,0,0,0], // 5
  [1,2,2,3,3,3,3,3,2,2,1,0,0,0,0,0], // 6
  [0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0], // 7
  [0,1,2,3,3,3,3,3,2,1,0,0,0,0,0,0], // 8
  [0,1,2,2,3,3,3,2,2,1,0,0,1,1,0,0], // 9
  [0,1,3,3,3,3,3,3,3,1,0,1,2,2,1,0], // 10
  [0,1,3,3,3,1,3,3,3,1,1,2,2,1,0,0], // 11
  [0,1,3,3,1,0,1,3,3,1,2,2,1,0,0,0], // 12
  [0,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0], // 13
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 14
];

const COLORS: Record<number, string> = {
  1: "#000000", // Black outline
  2: "#383838", // Gray
  3: "#FFFFFF", // White
};

export function TuxedoCatAvatar({ blink = false }: { blink?: boolean }) {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(16, minmax(0, 1fr))',
          imageRendering: 'pixelated'
        }}
      >
        {CAT_DATA.map((row, y) => 
          row.map((colorCode, x) => {
            let color = COLORS[colorCode] || "transparent";
            
            // Handle blinking (eyes are at y=4, x=3 and x=7)
            if (blink && y === 4 && (x === 3 || x === 7)) {
              color = COLORS[2]; // Close eyes (make them gray)
            }

            return (
              <div 
                key={`${x}-${y}`} 
                style={{ backgroundColor: color }}
                className="w-full h-full"
              />
            );
          })
        )}
      </motion.div>
    </div>
  );
}
