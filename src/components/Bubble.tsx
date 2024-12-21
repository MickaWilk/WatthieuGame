import React, { useMemo } from 'react';
import { Friend, BubblePosition } from '../types';
import { playBubbleEffect } from '../utils/effects';

interface BubbleProps {
  friend: Friend;
  position: BubblePosition;
  onPop: (points: number) => void;
}

export const Bubble: React.FC<BubbleProps> = ({ friend, position, onPop }) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = new Audio(friend.soundUrl);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));

    const rect = event.currentTarget.getBoundingClientRect();
    playBubbleEffect(friend.points, rect.left + rect.width / 2, rect.top + rect.height / 2);
    onPop(friend.points);
  };

  const animationName = useMemo(() => `float-${Math.random().toString(36).substr(2, 9)}`, []);
  
  const gradientColors = friend.points >= 0
    ? 'from-green-300 via-green-500 to-green-700'
    : 'from-red-300 via-red-500 to-red-700';
    
  const pointsColor = friend.points >= 0 ? 'bg-green-500' : 'bg-red-500';
  const keyframesStyle = `
  @keyframes ${animationName} {
    0%, 100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(${position.xAmplitude * 0.5 * position.startDirectionX}px, 
                           ${-position.yAmplitude * 0.7 * position.startDirectionY}px);
    }
    50% {
      transform: translate(${-position.xAmplitude * 0.3 * position.startDirectionX}px, 
                           ${-position.yAmplitude * position.startDirectionY}px);
    }
    75% {
      transform: translate(${-position.xAmplitude * position.startDirectionX}px, 
                           ${-position.yAmplitude * 0.5 * position.startDirectionY}px);
    }
    85% {
      transform: translate(${position.xAmplitude * 0.3 * position.startDirectionX}px, 
                           ${position.yAmplitude * 0.3 * position.startDirectionY}px); 
    }
    95% {
      transform: translate(${position.xAmplitude * 0.15 * position.startDirectionX}px, 
                           ${position.yAmplitude * 0.15 * position.startDirectionY}px); 
    }
  }
`;

  return (
    <>
      <style>{keyframesStyle}</style>
      <div
        className="bubble absolute cursor-pointer"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.size}px`,
          height: `${position.size}px`,
          animation: `${animationName} ${position.speed}s ease-in-out infinite`,
          animationDelay: `${position.delay}s`,
          transition: 'transform 0.3s ease-in-out',
        }}
        onClick={handleClick}
      >
        <div className={`w-full h-full rounded-full p-1 bg-gradient-to-br ${gradientColors}`}>
          <div className={`absolute -top-2 -right-2 ${pointsColor} text-white rounded-full px-2 py-1 text-sm font-bold shadow-lg z-10`}>
            {friend.points > 0 ? `+${friend.points}` : friend.points}
          </div>
          <img
            src={friend.imageUrl}
            alt={friend.name}
            className="w-full h-full rounded-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    </>
  );
};