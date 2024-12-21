export interface Friend {
  id: number;
  name: string;
  imageUrl: string;
  points: number;
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
  startDirectionX: number;
  startDirectionY: number;
}