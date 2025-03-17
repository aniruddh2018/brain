// Base interface for all game metrics
export interface BaseGameMetrics {
  score: number;
  timeSpent: number;
  difficulty: string;
  is_skipped?: boolean;
}

// Memory Match game metrics
export interface MemoryMatchMetrics extends BaseGameMetrics {
  memoryScore: number;
  matchesMade: number;
  incorrectAttempts: number;
  averageMatchTime: number;
}

// Tower of Hanoi game metrics
export interface TowerOfHanoiMetrics extends BaseGameMetrics {
  planningScore: number;
  movesCount: number;
  optimalMovesRatio: number;
  timePerMove: number;
}

// Word Puzzle game metrics
export interface WordPuzzleMetrics extends BaseGameMetrics {
  languageScore: number;
  wordsFound: number;
  hintsUsed: number;
  averageWordLength: number;
}

// Spatial Pattern game metrics
export interface SpatialPatternMetrics extends BaseGameMetrics {
  spatialScore: number;
  patternsCompleted: number;
  accuracyRate: number;
  complexityLevel: number;
}

// Maze Run game metrics
export interface MazeRunMetrics extends BaseGameMetrics {
  navigationScore: number;
  pathEfficiency: number;
  deadEndsEncountered: number;
  completionSpeed: number;
}

// Stroop Challenge game metrics
export interface StroopChallengeMetrics extends BaseGameMetrics {
  attentionScore: number;
  correctResponses: number;
  incorrectResponses: number;
  averageResponseTime: number;
  interferenceEffect: number;
}

// Union type for all game metrics
export type GameMetrics = 
  | MemoryMatchMetrics
  | TowerOfHanoiMetrics
  | WordPuzzleMetrics
  | SpatialPatternMetrics
  | MazeRunMetrics
  | StroopChallengeMetrics;

// Game data structure
export interface GameData {
  name: string;
  metrics: GameMetrics;
  is_skipped?: boolean;
} 