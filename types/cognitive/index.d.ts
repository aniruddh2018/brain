declare module 'cognitive' {
  export interface CognitiveMetrics {
    overallScore: number;
    domainScores: {
      attention: number;
      memory: number;
      problemSolving: number;
      cognitiveFlexibility: number;
    };
    insights: {
      strategyPatterns: {
        summary: string;
        details: string[];
      };
      consistencyPatterns: {
        summary: string;
        details: string[];
      };
      errorPatterns: {
        summary: string;
        details: string[];
      };
      crossDomainPatterns: {
        summary: string;
        details: string[];
      };
    };
    recommendations: string[];
  }
}

declare module 'cognitive-new' {
  export interface CognitiveMetrics {
    overallScore: number;
    domainScores: {
      attention: number;
      memory: number;
      problemSolving: number;
      cognitiveFlexibility: number;
    };
    insights: {
      strategyPatterns: {
        summary: string;
        details: string[];
      };
      consistencyPatterns: {
        summary: string;
        details: string[];
      };
      errorPatterns: {
        summary: string;
        details: string[];
      };
      crossDomainPatterns: {
        summary: string;
        details: string[];
      };
    };
    recommendations: string[];
  }
} 