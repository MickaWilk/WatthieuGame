export const getBubbleStyles = (points: number) => {
  const borderColor = getBorderColor(points);
  const glowEffect = getGlowEffect(points);
  const scoreClass = getScoreClass(points);

  return {
    borderColor,
    glowEffect,
    scoreClass,
  };
};

const getBorderColor = (points: number): string => {
  if (points > 10) return 'border-green-400';
  if (points > 0) return 'border-green-300';
  if (points > -10) return 'border-red-300';
  return 'border-red-500';
};

const getGlowEffect = (points: number): string => {
  if (points > 0) {
    return `0 0 20px ${points > 10 ? '#00ff00' : '#90EE90'}`;
  }
  return `0 0 20px ${points > -10 ? '#ffcccb' : '#ff0000'}`;
};

const getScoreClass = (points: number): string => {
  return points > 0 ? 'bg-green-500' : 'bg-red-500';
};