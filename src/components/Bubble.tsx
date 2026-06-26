import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BubbleData, BonusType } from '@/types';
import { playBubbleEffect, playBonusSound } from '@/utils/effects';
import { getBubbleStyles } from '@/utils/styles';
import { playBubbleSound } from '@/utils/bubbleSound';

interface BubbleProps {
  friend: BubbleData;
  position: BubbleData['position'];
  onPop: (id: number, points: number, bonus?: BonusType) => void;
  mutedSfx: boolean;
  goldRush: boolean;
}

export const Bubble: React.FC<BubbleProps> = ({ friend, position, onPop, mutedSfx, goldRush }) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mutedSfx) {
      playBubbleSound(friend.soundUrl, 0.5);
    }

    if (friend.bonus) {
      if (!mutedSfx) playBonusSound();
      onPop(friend.id, friend.points, friend.bonus);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    playBubbleEffect(friend.points, rect.left + rect.width / 2, rect.top + rect.height / 2);
    onPop(friend.id, friend.points);
  };

  // 4 vecteurs indépendants figés au montage.
  // useState avec initialiseur lazy : la fonction n'est appelée qu'une seule fois, le résultat
  // est stable et lisible directement pendant le render (contrairement à useRef.current).
  const [kf] = useState(() => Array.from({ length: 4 }, () => ({
    x: (Math.random() * 2 - 1),
    y: (Math.random() * 2 - 1),
  })));

  const { glowEffect: baseGlowEffect, scoreClass: baseScoreClass } = getBubbleStyles(friend.points);

  const isBonus = Boolean(friend.bonus);

  // Pendant le gold rush, les bulles d'amis passent toutes au doré/ambre
  const goldRushOverride = goldRush && !isBonus;

  const gradientColors = goldRushOverride
    ? 'from-amber-300 via-amber-500 to-yellow-600'
    : friend.points >= 0
      ? 'from-green-300 via-green-500 to-green-700'
      : 'from-red-300 via-red-500 to-red-700';

  const glowEffect = goldRushOverride ? 'drop-shadow(0 0 12px #f59e0b)' : baseGlowEffect;
  const scoreClass = goldRushOverride ? 'bg-amber-500' : baseScoreClass;

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

  const bonusGlow = 'drop-shadow(0 0 14px #fbbf24) drop-shadow(0 0 28px #f59e0b)';

  return (
    /* Wrapper externe : gère le scale hover, séparé de l'animation float */
    <div
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.size}px`,
          height: `${position.size}px`,
          transform: hovered ? 'scale(1.15)' : 'scale(1)',
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
            animation: isBonus
              ? `bubble-float ${position.speed}s ease-in-out infinite, bonus-pulse 1.2s ease-in-out infinite`
              : `bubble-float ${position.speed}s ease-in-out infinite`,
            animationDelay: `${position.delay}s`,
            filter: isBonus ? bonusGlow : glowEffect,
          }}
          onClick={handleClick}
        >
          {isBonus ? (
            /* Bulle bonus dorée - surprise, pas de label de type */
            <div className="w-full h-full rounded-full flex items-center justify-center ring-4 ring-yellow-300/80"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 50%, #b45309)',
              }}
            >
              <Sparkles
                style={{ width: '50%', height: '50%', color: '#ffffff', filter: 'drop-shadow(0 0 4px #fbbf24)' }}
              />
            </div>
          ) : (
            <div className={`w-full h-full rounded-full p-1 bg-linear-to-br ${gradientColors} ${goldRushOverride ? 'ring-2 ring-amber-300' : 'ring-2 ring-white/30'}`}>
              <div className={`absolute -top-2 -right-2 ${scoreClass} text-white rounded-full px-2 py-1 text-sm font-bold shadow-lg z-10`}>
                {goldRushOverride ? `+${Math.abs(friend.points)}` : (friend.points > 0 ? `+${friend.points}` : friend.points)}
              </div>
              <img
                src={friend.imageUrl}
                alt={friend.name}
                className="w-full h-full rounded-full object-cover"
                draggable={false}
              />
              {goldRushOverride && (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b 70%, #b45309)', mixBlendMode: 'color' }}
                />
              )}
            </div>
          )}
          {/* Nom visible en bas de la bulle (bonus : "BONUS ?" pour préserver la surprise) */}
          <div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap"
            style={{
              color: isBonus ? '#fbbf24' : '#ffffff',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            {isBonus ? '?' : friend.name}
          </div>
        </div>
    </div>
  );
};
