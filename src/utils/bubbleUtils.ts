import { BubblePosition } from "../types";

export const generateBubblePosition = (): BubblePosition => {
  return {
    x: Math.random() * (window.innerWidth - 150),
    y: Math.random() * (window.innerHeight - 150),
    size: Math.random() * (120 - 80) + 80, // Increased size range
    speed: Math.random() * (8 - 3) + 3
  };
};