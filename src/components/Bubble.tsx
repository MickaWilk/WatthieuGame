import React, { useMemo, useState } from 'react';
import { BubbleData } from '@/types';
import { playBubbleEffect } from '@/utils/effects';
import { getBubbleStyles } from '@/utils/styles';

interface BubbleProps {
  friend: BubbleData;
  position: BubbleData['position'];
  onPop: (id: number, points: number) => void;
  muted: boolean;
}

export const Bubble: React.FC<BubbleProps> = ({ friend, position, onPop, muted }) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!muted) {
      const audio = new Audio(friend.soundUrl);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }

    const rect = event.currentTarget.getBoundingClientRect();
    playBubbleEffect(friend.points, rect.left + rect.width / 2, rect.top + rect.height / 2);
    onPop(friend.id, friend.points);
  };

  // 4 vecteurs indépendants : x et y varient librement dans toutes les directions
  const kf = useMemo(() => Array.from({ length: 4 }, () => ({
    x: (Math.random() * 2 - 1),
    y: (Math.random() * 2 - 1),
  })), []);

  const { glowEffect, scoreClass } = getBubbleStyles(friend.points);

  const gradientColors = friend.points >= 0
    ? 'from-green-300 via-green-500 to-green-700'
    : 'from-red-300 via-red-500 to-red-700';

  const bubbleVars = {
    '--kx1': `${position.xAmplitude * kf[0].x}px`,
    '--ky1': `${position.yAmplitude * kf[0].y}px`,
    '--kx2': `${position.xAmplitude * kf[1].x}px`,
    '--ky2': `${position.yAmplitude * kf[1].y}px`,
    '--kx3': `${position.xAmplitude * kf[2].x}px`,
    '--ky3': `${position.yAmplitude * kf[2].y}px`,
    '--kx4': `${position.xAmplitude * kf[3].x}px`,
    '--ky4': `${position.yAmplitude * kf[3].y}px`,
  } as React.CSSProperties;

  return (
    <>
      {/* Wrapper externe : gère le scale hover, séparé de l'animation float */}
      <div
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.size}px`,
          height: `${position.size}px`,
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="bubble absolute cursor-pointer"
          style={{
            ...bubbleVars,
            left: 0,
            top: 0,
            width: `${position.size}px`,
            height: `${position.size}px`,
            animation: `bubble-float ${position.speed}s ease-in-out infinite`,
            animationDelay: `${position.delay}s`,
            filter: glowEffect,
          }}
          onClick={handleClick}
        >
          <div className={`w-full h-full rounded-full p-1 bg-gradient-to-br ${gradientColors} ring-2 ring-white/30`}>
            <div className={`absolute -top-2 -right-2 ${scoreClass} text-white rounded-full px-2 py-1 text-sm font-bold shadow-lg z-10`}>
              {friend.points > 0 ? `+${friend.points}` : friend.points}
            </div>
            <img
              src={friend.imageUrl}
              alt={friend.name}
              className="w-full h-full rounded-full object-cover"
              draggable={false}
            />
          </div>
          {/* Nom visible en bas de la bulle */}
          <div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-white whitespace-nowrap"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
          >
            {friend.name}
          </div>
        </div>
      </div>
    </>
  );
};
