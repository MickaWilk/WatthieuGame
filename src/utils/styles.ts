export const getBubbleStyles = (points: number) => {
  const glowEffect = getGlowEffect(points);
  const scoreClass = getScoreClass(points);
  return { glowEffect, scoreClass };
};

const getGlowEffect = (points: number): string => {
  if (points > 0) {
    return `drop-shadow(0 0 12px ${points > 10 ? '#00ff00' : '#90EE90'})`;
  }
  return `drop-shadow(0 0 12px ${points > -10 ? '#ffcccb' : '#ff0000'})`;
};

const getScoreClass = (points: number): string => {
  return points > 0 ? 'bg-green-500' : 'bg-red-500';
};
