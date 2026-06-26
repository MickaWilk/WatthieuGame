const MAX_CONCURRENT = 3;
const active: HTMLAudioElement[] = [];

export const playBubbleSound = (url: string, volume = 0.5): void => {
  const audio = new Audio(url);
  audio.volume = volume;

  const cleanup = () => {
    const i = active.indexOf(audio);
    if (i !== -1) active.splice(i, 1);
  };
  audio.addEventListener('ended', cleanup, { once: true });

  // Voice stealing : on ne dépasse jamais MAX_CONCURRENT sons simultanés
  if (active.length >= MAX_CONCURRENT) {
    const oldest = active.shift();
    if (oldest) {
      oldest.pause();
      oldest.currentTime = 0;
    }
  }
  active.push(audio);

  audio.play().catch(() => {
    cleanup();
  });
};
