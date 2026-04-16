import { motion } from "motion/react";

const COLORS: Record<number, string> = {
  0: "transparent",
  1: "#000000", // Black outline
  2: "#FFFFFF", // White chest/face
  3: "#63533a", // Light Gray (slate-300)
  4: "#3a260e", // Dark Gray (slate-500)
};

const CAT_DATA = [
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 3, 1, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0],
  [1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 0, 0],
  [1, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 3, 1, 0, 0, 0],
  [1, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0],
  [1, 4, 4, 3, 1, 2, 1, 2, 1, 3, 4, 4, 1, 0, 0, 0],
  [1, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 1, 0, 0, 0],
  [1, 4, 4, 4, 2, 2, 2, 2, 2, 4, 4, 4, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
  [0, 1, 3, 3, 2, 2, 2, 2, 2, 3, 3, 1, 0, 1, 3, 1],
  [0, 1, 3, 3, 3, 2, 2, 2, 3, 3, 3, 1, 0, 1, 3, 1],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 3, 1],
  [0, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 4, 1, 0],
  [0, 1, 2, 2, 2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export function GrayTabbyCatAvatar({ blink = false }: { blink?: boolean }) {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full h-full"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
          gridTemplateRows: "repeat(16, minmax(0, 1fr))",
          imageRendering: "pixelated",
        }}
      >
        {CAT_DATA.map((row, rowIndex) =>
          row.map((colorIndex, colIndex) => {
            // Apply blink effect to eyes (row 5, cols 4 and 8)
            let finalColorIndex = colorIndex;
            if (blink && rowIndex === 5 && (colIndex === 4 || colIndex === 8)) {
              finalColorIndex = 3; // Change eye to light gray when blinking
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  backgroundColor: COLORS[finalColorIndex],
                }}
              />
            );
          })
        )}
      </motion.div>
    </div>
  );
}
