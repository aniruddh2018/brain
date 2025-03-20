import { ReactNode } from 'react';

export interface StroopGameProps {
  children?: ReactNode;
  onComplete?: (results: StroopGameResults) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  rounds?: number;
}

export interface StroopGameResults {
  score: number;
  accuracy: number;
  responseTime: number;
  cognitiveFlexibilityScore: number;
  completedRounds: number;
  errors: number;
  is_skipped?: boolean;
}

export interface StroopRound {
  word: string;
  color: string;
  isCongruent: boolean;
}

export type ColorMap = {
  [key: string]: string;
}; 