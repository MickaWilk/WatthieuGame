import { BubblePosition } from "../types";

export const generateBubblePosition = (): BubblePosition => {
  const headerHeight = 80; // Hauteur de la barre UI
  return {
    x: Math.random() * (window.innerWidth - 150),
    y: headerHeight + Math.random() * (window.innerHeight - headerHeight - 150),
    size: Math.random() * (120 - 80) + 120,
    speed: Math.random() * (6 - 3) + 3,
    delay: Math.random() * -5,
    xAmplitude: Math.random() * 100 + 50, // variation aléatoire de l'amplitude en X
    yAmplitude: Math.random() * 80 + 40, // variation aléatoire de l'amplitude en Y
    startDirectionX: Math.random() > 0.5 ? 1 : -1,  // Début du mouvement X (gauche ou droite)
    startDirectionY: Math.random() > 0.5 ? 1 : -1,  // Début du mouvement Y (haut ou bas)
  };
};
