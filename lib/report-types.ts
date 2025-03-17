/**
 * Type definitions for cognitive assessment reports
 */

/**
 * Interface for user data
 */
export interface UserData {
  id?: string;
  name: string;
  age: number;
  education?: string;
  difficulty?: string;
  metrics?: Record<string, any>;
}

/**
 * Interface for domain analysis
 */
export interface DomainAnalysis {
  domain: string;
  score: number;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

/**
 * Interface for learning style analysis
 */
export interface LearningStyleAnalysis {
  primaryStyle: string;
  analysisText: string;
  recommendations: string[];
  description?: string;
  teachingStrategies?: string[];
  accommodations?: string[];
}

/**
 * Interface for dashboard content
 */
export interface DashboardContent {
  overallScore: number;
  summaryAnalysis: string;
  domainAnalyses: DomainAnalysis[];
  learningStyle: LearningStyleAnalysis;
  recommendations: string[];
  detailedPerformanceData: Record<string, any>;
}

/**
 * Interface for cognitive report
 */
export interface CognitiveReport {
  userData: UserData;
  overallScore: number;
  summaryAnalysis: string;
  domainAnalyses: DomainAnalysis[];
  learningStyle: LearningStyleAnalysis;
  recommendations: string[];
  detailedPerformanceData: Record<string, any>;
  enhancedInsights?: Record<string, any>;
} 