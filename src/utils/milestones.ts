export const MILESTONES = [
  { threshold: 50,   message: "OK." },
  { threshold: 100,  message: "Pas mal du tout ! 👍" },
  { threshold: 250,  message: "Tu commences à cartonner ! 🔥" },
  { threshold: 500,  message: "C'est chaud là ! 🚀" },
  { threshold: 750,  message: "Impressionnant ! 🌟" },
  { threshold: 1000, message: "T'es un monstre ! 💥" },
  { threshold: 1500, message: "LÉGENDE. 👑" },
  { threshold: 2000, message: "T'es pas humain... ⚡" },
  { threshold: 2500, message: "ON EST PLUS DANS LE MÊME SPORT. 🤯" },
  { threshold: 3000, message: "YOU'RE FUCKING GODLIKE. 👁️" },
];

export const NEGATIVE_MILESTONES = [
  { threshold: -50,   message: "Nul. Bien naze. 👎" },
  { threshold: -100,  message: "Vraiment pas doué... 🫤" },
  { threshold: -250,  message: "C'est un talent d'être aussi mauvais 😬" },
  { threshold: -500,  message: "Catastrophe ambulante 💀" },
  { threshold: -750,  message: "Tu le fais exprès là ?! 🤡" },
  { threshold: -1000, message: "Honte nationale 🚮" },
  { threshold: -1500, message: "Sous-sol de l'humanité 👻" },
  { threshold: -2000, message: "Cas d'école de nullité 📉" },
  { threshold: -2500, message: "On étudiera ton cas en labo 🔬" },
  { threshold: -3000, message: "LE PIRE HUMAIN DE L'HUMANITÉ. 🪦💩" },
];

export const MILESTONES_THRESHOLDS = MILESTONES.map(m => m.threshold);
export const MAX_SCORE = 3000;
