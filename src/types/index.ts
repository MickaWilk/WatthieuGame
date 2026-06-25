export type BonusType = 'time' | 'multiplier' | 'megapop' | 'goldrush';

export interface Friend {
  id: number;
  name: string;
  imageUrl: string;
  points: number;
}

export interface BubbleData extends Friend {
  soundUrl: string;
  position: BubblePosition;
  bonus?: BonusType;
}

export interface GameState {
  score: number;
  timeLeft: number;
  isPlaying: boolean;
}

export interface BubblePosition {
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  xAmplitude: number;
  yAmplitude: number;
}