import React from 'react';
import { Friend } from '../types';
import { getBubbleStyles } from '../utils/styles';

interface BubbleProps {
  friend: Friend;
  onPop: (points: number) => void;
}

export const Bubble: React.FC<BubbleProps> = ({ friend, onPop }) => {
  const randomPosition = () => {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    return { x, y };
  };

  const { x, y } = randomPosition();
  const size = Math.random() * (100 - 50) + 50;
  const speed = Math.random() * (8 - 3) + 3;
  const { borderColor, glowEffect, scoreClass } = getBubbleStyles(friend.points);

  return (
    <div
      className={`absolute rounded-full cursor-pointer transition-transform hover:scale-105 border-4 ${borderColor}`}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `float ${speed}s infinite alternate ease-in-out`,
        boxShadow: glowEffect,
      }}
      onClick={() => onPop(friend.points)}
    >
      <img
        src={friend.imageUrl}
        alt={friend.name}
        className="w-full h-full rounded-full object-cover"
      />
      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${scoreClass}`}>
        {friend.points > 0 ? '+' : ''}{friend.points}
      </div>
    </div>
  );
};