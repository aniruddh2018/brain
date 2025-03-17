import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatDate, getAgeGroup } from './date-utils';
import { processDetailedMetrics } from './metrics-processor';
import { 
  UserData, 
  DomainAnalysis, 
  LearningStyleAnalysis, 
  DashboardContent, 
  CognitiveReport 
} from './report-types';

// Re-export types for components that import from this file
export type { 
  UserData, 
  DomainAnalysis, 
  LearningStyleAnalysis, 
  DashboardContent, 
  CognitiveReport 
};

// Initialize the AI model with your key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_AI_API_KEY || "");

/**
 * Generates a cognitive assessment report based on user data and metrics
 */
export async function generateReport(userData: UserData, allMetrics: Record<string, any>): Promise<CognitiveReport> {
  try {
    console.log("Generating report...");
    
    // Process detailed metrics for enhanced insights
    const enhancedInsights = processDetailedMetrics(allMetrics);
    
    // Format user data and metrics for AI processing
    const formattedData = formatMetricsForAI(userData, allMetrics, enhancedInsights);
    
    // Try to use AI for generating report
    try {
      const dashboardContent = await generateDashboardContent(formattedData);
      console.log("Successfully generated AI report");
      return {
        userData,
        ...dashboardContent,
        enhancedInsights
      };
    } catch (error) {
      console.error("Error generating AI report:", error);
      // Fall back to rule-based report
      const fallbackReport = createFallbackReport(userData, allMetrics, enhancedInsights);
      return {
        userData,
        ...fallbackReport,
        enhancedInsights
      };
    }
  } catch (error) {
    console.error("Error in report generation:", error);
    throw error;
  }
}

/**
 * Format metrics data for AI processing
 */
function formatMetricsForAI(userData: UserData, metrics: Record<string, any>, enhancedInsights: Record<string, any>) {
  const formatted: Record<string, any> = {
    userData,
    metrics: {},
    enhancedInsights
  };
  
  // Format game metrics
  Object.keys(metrics).forEach(game => {
    if (metrics[game] && typeof metrics[game] === 'object') {
      formatted.metrics[game] = metrics[game];
    }
  });
  
  // Add enhanced insights
  formatted.enhancedAnalysis = {
    speedAccuracyTradeoffs: enhancedInsights.speedAccuracyTradeoffs?.summary || "No data available",
    consistencyPatterns: enhancedInsights.consistencyPatterns?.summary || "No data available",
    strategyPatterns: enhancedInsights.strategyPatterns?.summary || "No data available",
    errorPatterns: enhancedInsights.errorPatterns?.summary || "No data available",
    crossDomainStrengths: enhancedInsights.crossDomainStrengths?.summary || "No data available",
    uniqueStrengths: enhancedInsights.uniqueStrengths?.summary || "No data available"
  };
  
  return formatted;
}

/**
 * Generate dashboard content using AI
 */
async function generateDashboardContent(formattedData: any): Promise<DashboardContent> {
  try {
    // Update prompt to include enhanced metrics analysis
    const prompt = `
      Analyze the following cognitive assessment data and generate a comprehensive report.
      Include insights from the enhanced analysis section which provides deeper metrics-based insights.
      
      ${JSON.stringify(formattedData)}
      
      Consider all detailed metrics in your analysis, not just the domain scores.
      Look for patterns in speed-accuracy tradeoffs, consistency, strategy approaches, and error patterns.
      Identify cross-domain strengths and any exceptional performance areas.
      
      Your analysis should return a JSON object with the following structure:
      {
        "overallScore": number,
        "summaryAnalysis": string,
        "domainAnalyses": array of domain analysis objects,
        "learningStyle": learning style analysis object,
        "recommendations": array of recommendation strings,
        "detailedPerformanceData": object with any additional performance data
      }
    `;
    
    // Generate text using AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(text);
      return parsedResponse;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw response:", text);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Error generating dashboard content:", error);
    throw error;
  }
}

/**
 * Create a fallback report when AI generation fails
 */
function createFallbackReport(userData: UserData, metrics: Record<string, any>, enhancedInsights: Record<string, any>): DashboardContent {
  // Create a basic report using rules-based approach
  const domainAnalyses: DomainAnalysis[] = [];
  const domainScores = getDomainScores(metrics);
  
  // Generate domain analyses based on scores
  Object.entries(domainScores).forEach(([domain, score]) => {
    if (score !== null) {
      domainAnalyses.push({
        domain,
        score,
        analysis: getAnalysisText(domain, score),
        strengths: getStrengths(domain, score),
        weaknesses: score < 60 ? getWeaknesses(domain, score) : [],
        recommendations: getRecommendations(domain, score)
      });
    }
  });
  
  // Calculate overall score
  const validScores = Object.values(domainScores).filter(score => score !== null) as number[];
  const overallScore = validScores.length > 0 
    ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) 
    : 0;
  
  // Generate summary based on overall score and insights
  const summaryAnalysis = `Overall cognitive performance score: ${overallScore}. ${enhancedInsights.strategyPatterns?.summary || ''} ${enhancedInsights.consistencyPatterns?.summary || ''}`;
  
  // Determine learning style
  const learningStyle = determineLearningStyle(enhancedInsights);
  
  // Generate recommendations
  const recommendations = generateOverallRecommendations(domainScores, enhancedInsights);
  
  return {
    overallScore,
    summaryAnalysis,
    domainAnalyses,
    learningStyle,
    recommendations,
    detailedPerformanceData: {
      domainScores,
      enhancedPatterns: {
        speedAccuracy: enhancedInsights.speedAccuracyTradeoffs?.dominantStyle || 'Balanced',
        consistency: enhancedInsights.consistencyPatterns?.consistencyLevel || 'Moderate'
      }
    }
  };
}

/**
 * Extract domain scores from metrics
 */
function getDomainScores(metrics: Record<string, any>): Record<string, number | null> {
  return {
    Memory: metrics.memoryMatch?.is_skipped ? null : (metrics.memoryMatch?.memoryScore || 0),
    'Problem Solving': metrics.towerOfHanoi?.is_skipped ? null : (metrics.towerOfHanoi?.problemSolvingScore || 0),
    Vocabulary: metrics.wordPuzzle?.is_skipped ? null : (metrics.wordPuzzle?.vocabularyScore || 0),
    'Spatial Reasoning': metrics.spatialPattern?.is_skipped ? null : (metrics.spatialPattern?.spatialScore || 0),
    Navigation: metrics.mazeRun?.is_skipped ? null : (metrics.mazeRun?.navigationScore || 0),
    'Cognitive Flexibility': metrics.stroopChallenge?.is_skipped ? null : (metrics.stroopChallenge?.cognitiveFlexibilityScore || 0)
  };
}

/**
 * Generate a basic analysis text based on domain and score
 */
function getAnalysisText(domain: string, score: number): string {
  if (score >= 80) {
    return `Your ${domain} abilities are excellent, showing strong performance across related tasks.`;
  } else if (score >= 60) {
    return `Your ${domain} abilities are good, with solid performance on most related tasks.`;
  } else if (score >= 40) {
    return `Your ${domain} abilities are average, with some areas showing strength and others needing development.`;
  } else {
    return `Your ${domain} abilities would benefit from focused development and practice.`;
  }
}

/**
 * Generate strengths based on domain and score
 */
function getStrengths(domain: string, score: number): string[] {
  const strengths: string[] = [];
  
  if (score >= 70) {
    strengths.push(`Strong ${domain.toLowerCase()} abilities`);
  }
  
  return strengths;
}

/**
 * Generate weaknesses based on domain and score
 */
function getWeaknesses(domain: string, score: number): string[] {
  const weaknesses: string[] = [];
  
  if (score < 60) {
    weaknesses.push(`Room for improvement in ${domain.toLowerCase()} tasks`);
  }
  
  return weaknesses;
}

/**
 * Generate recommendations based on domain and score
 */
function getRecommendations(domain: string, score: number): string[] {
  const recommendations: string[] = [];
  
  if (score < 60) {
    recommendations.push(`Regular practice with ${domain.toLowerCase()} activities`);
    recommendations.push(`Consider exercises specifically designed to improve ${domain.toLowerCase()} abilities`);
  } else {
    recommendations.push(`Continue developing ${domain.toLowerCase()} abilities through regular practice`);
  }
  
  return recommendations;
}

/**
 * Determine learning style based on enhanced insights
 */
function determineLearningStyle(enhancedInsights: Record<string, any>): LearningStyleAnalysis {
  // Default learning style
  let primaryStyle = enhancedInsights.speedAccuracyTradeoffs?.dominantStyle || "Visual Learner";
  let analysisText = enhancedInsights.speedAccuracyTradeoffs?.summary || 
    "Your learning style appears to be primarily visual, with strengths in pattern recognition and spatial reasoning.";
  
  // Generate recommendations based on learning style
  const recommendations = generateLearningStyleRecommendations(primaryStyle);
  
  return {
    primaryStyle,
    analysisText,
    recommendations
  };
}

/**
 * Generate learning style recommendations
 */
function generateLearningStyleRecommendations(style: string): string[] {
  const recommendations: string[] = [];
  
  if (style.includes("Visual") || style.includes("Balanced")) {
    recommendations.push("Use visual aids like diagrams and charts when learning new information");
    recommendations.push("Take advantage of color-coding systems to organize information");
  } 
  
  if (style.includes("Accuracy")) {
    recommendations.push("Allow extra time for thorough analysis of problems");
    recommendations.push("Use structured, systematic approaches to learning new skills");
  }
  
  if (style.includes("Speed")) {
    recommendations.push("Break learning sessions into shorter, more focused intervals");
    recommendations.push("Use timed practice sessions to maintain efficiency while improving accuracy");
  }
  
  // Add general recommendations if none matched or few were generated
  if (recommendations.length < 2) {
    recommendations.push("Use a variety of learning approaches to find what works best for you");
    recommendations.push("Combine visual, verbal, and hands-on learning methods");
  }
  
  return recommendations;
}

/**
 * Generate overall recommendations
 */
function generateOverallRecommendations(domainScores: Record<string, number | null>, enhancedInsights: Record<string, any>): string[] {
  const recommendations: string[] = [];
  
  // Find weakest domains (scores below 60)
  const weakestDomains = Object.entries(domainScores)
    .filter(([_, score]) => score !== null && score < 60)
    .sort(([_, a], [__, b]) => (a || 0) - (b || 0))
    .slice(0, 2)
    .map(([domain]) => domain);
  
  // Add domain-specific recommendations
  weakestDomains.forEach(domain => {
    recommendations.push(`Focus on improving ${domain.toLowerCase()} through targeted exercises`);
  });
  
  // Add general recommendations
  recommendations.push("Maintain a consistent cognitive training routine");
  recommendations.push("Ensure adequate sleep and physical exercise to support cognitive function");
  
  return recommendations;
} 