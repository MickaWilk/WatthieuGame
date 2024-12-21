import { BubblePosition } from "../types";

export const generateBubblePosition = (): BubblePosition => {
  const headerHeight = 80; // Hauteur de la barre UI
  return {
    x: Math.random() * (window.innerWidth - 150),
    y: headerHeight + Math.random() * (window.innerHeight - headerHeight - 150),
    size: Math.random() * (120 - 80) + 80,
    speed: Math.random() * (6 - 3) + 3,
    delay: Math.random() * -5,
    xAmplitude: Math.random() * 100 + 50,
    yAmplitude: Math.random() * 80 + 40
  };
};