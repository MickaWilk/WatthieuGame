import React from 'react';
import { Music, Timer, Volume2, VolumeX } from 'lucide-react';
import { MILESTONES_THRESHOLDS, MAX_SCORE } from '@/utils/milestones';

interface GameUIProps {
  score: number;
  timeLeft: number;
  mutedMusic: boolean;
  mutedSfx: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ score, timeLeft, mutedMusic, mutedSfx, onToggleMusic, onToggleSfx }) => {
  const isUrgent = timeLeft <= 10;

  const clampedScore = Math.max(0, Math.min(score, MAX_SCORE));
  const pct = (clampedScore / MAX_SCORE) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-md flex justify-between items-center border-b border-white/10">
      <div>
        <div className="text-2xl font-bold text-white">Score: {score}</div>
        <div className="mt-1 w-48 relative">
          <div className="h-2 rounded-full bg-white/10 relative overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-green-400 via-yellow-400 to-orange-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
            {MILESTONES_THRESHOLDS.map(t => (
              <div
                key={t}
                className="absolute top-0 w-px h-full bg-white/30"
                style={{ left: `${(t / MAX_SCORE) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-0.5">
            <span>0</span>
            <span>{score > MAX_SCORE ? `${score} 🔥` : `${clampedScore}/${MAX_SCORE}`}</span>
            <span>3k</span>
          </div>
        </div>
        <div className="text-xs text-white/70 mt-0.5">&#x1F7E2; Bonne bulle &nbsp; &#x1F534; Mauvaise bulle</div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 ${isUrgent ? 'animate-pulse text-red-400' : 'text-white'}`}>
          <Timer className="w-6 h-6" />
          <span className="text-2xl font-bold">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={onToggleMusic}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            title={mutedMusic ? 'Activer la musique' : 'Couper la musique'}
          >
            {mutedMusic ? <VolumeX className="w-4 h-4" /> : <Music className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleSfx}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            title={mutedSfx ? 'Activer les sons' : 'Couper les sons'}
          >
            {mutedSfx ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
