import { BubblePosition } from "../types";

export const generateBubblePosition = (): BubblePosition => {
  const headerHeight = 80; // Hauteur de la barre UI
  const isMobile = window.innerWidth < 640;
  const MIN_SIZE = isMobile ? 60 : 100;
  const MAX_SIZE = isMobile ? 90 : 130;
  return {
    x: Math.random() * (window.innerWidth - 150),
    y: headerHeight + Math.random() * (window.innerHeight - headerHeight - 150),
    size: Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE,
    speed: Math.random() * (6 - 3) + 3,
    delay: Math.random() * -5,
    xAmplitude: Math.random() * (isMobile ? 60 : 140) + 30,
    yAmplitude: Math.random() * (isMobile ? 50 : 110) + 25,
  };
};
