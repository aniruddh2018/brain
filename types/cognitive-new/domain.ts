// Cognitive domain scores
export interface DomainScores {
  memory: number | null;
  attention: number | null;
  planning: number | null;
  language: number | null;
  spatial: number | null;
  navigation: number | null;
}

// Overall cognitive metrics
export interface CognitiveMetrics {
  overallScore: number;
  domainScores: DomainScores;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// User cognitive report
export interface CognitiveReport {
  id?: string;
  userId: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  domainAnalyses: Record<string, string>;
  recommendations: string[];
  relationshipInsights: string[];
  learningStyles: string[];
  createdAt?: string;
  updatedAt?: string;
} 