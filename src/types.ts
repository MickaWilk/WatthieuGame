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