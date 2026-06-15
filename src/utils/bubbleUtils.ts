import { BubblePosition } from "../types";

export const generateBubblePosition = (): BubblePosition => {
  const headerHeight = 80; // Hauteur de la barre UI
  return {
    x: Math.random() * (window.innerWidth - 150),
    y: headerHeight + Math.random() * (window.innerHeight - headerHeight - 150),
    size: Math.random() * ((window.innerWidth < 640 ? 90 : 130) - (window.innerWidth < 640 ? 60 : 100)) + (window.innerWidth < 640 ? 60 : 100),
    speed: Math.random() * (6 - 3) + 3,
    delay: Math.random() * -5,
    xAmplitude: Math.random() * (window.innerWidth < 640 ? 60 : 140) + 30,
    yAmplitude: Math.random() * (window.innerWidth < 640 ? 50 : 110) + 25,
  };
};
