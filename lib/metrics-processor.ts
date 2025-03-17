/**
 * Metrics processor module for extracting insights from detailed game metrics
 */

import { GameMetrics } from "@/types/cognitive/game-metrics.types";

type MetricInsight = {
  summary: string;
  detailedAnalysis: Record<string, any>;
  dominantStyle?: string;
  consistencyLevel?: string;
};

/**
 * Process detailed metrics to extract insights across cognitive domains
 */
export function processDetailedMetrics(metrics: Record<string, any>): Record<string, MetricInsight> {
  // Initialize insights object
  const insights: Record<string, MetricInsight> = {
    speedAccuracyTradeoffs: analyzeSpeedAccuracyTradeoffs(metrics),
    consistencyPatterns: analyzeConsistencyPatterns(metrics),
    strategyPatterns: analyzeStrategyPatterns(metrics),
    errorPatterns: analyzeErrorPatterns(metrics),
    crossDomainStrengths: analyzeCrossDomainStrengths(metrics),
    uniqueStrengths: identifyUniqueStrengths(metrics)
  };

  return insights;
}

/**
 * Analyze speed-accuracy tradeoffs across games
 */
function analyzeSpeedAccuracyTradeoffs(metrics: Record<string, any>): MetricInsight {
  const speedAccuracyData: Record<string, { speed: number; accuracy: number }> = {};
  let summary = '';
  let dominantStyle = 'Balanced';
  
  // Extract speed and accuracy metrics from each game
  if (metrics.memoryMatch && !metrics.memoryMatch.is_skipped) {
    speedAccuracyData.memoryMatch = {
      speed: metrics.memoryMatch.avgReactionTime || 0,
      accuracy: metrics.memoryMatch.accuracy || 0
    };
  }
  
  if (metrics.stroopChallenge && !metrics.stroopChallenge.is_skipped) {
    speedAccuracyData.stroopChallenge = {
      speed: metrics.stroopChallenge.averageResponseTime || 0,
      accuracy: metrics.stroopChallenge.accuracy || 0
    };
  }
  
  if (metrics.spatialPattern && !metrics.spatialPattern.is_skipped) {
    speedAccuracyData.spatialPattern = {
      speed: metrics.spatialPattern.reactionTime || 0,
      accuracy: metrics.spatialPattern.accuracyRate || 0
    };
  }
  
  // Analyze speed vs accuracy preference
  const speeds: number[] = [];
  const accuracies: number[] = [];
  
  Object.values(speedAccuracyData).forEach(data => {
    speeds.push(data.speed);
    accuracies.push(data.accuracy);
  });
  
  // Calculate averages if data exists
  if (speeds.length > 0 && accuracies.length > 0) {
    const avgSpeed = speeds.reduce((sum, val) => sum + val, 0) / speeds.length;
    const avgAccuracy = accuracies.reduce((sum, val) => sum + val, 0) / accuracies.length;
    
    // Determine dominant style
    if (avgAccuracy > 85 && avgSpeed > 2000) {
      dominantStyle = 'Accuracy-Focused';
      summary = 'You tend to prioritize accuracy over speed, taking time to ensure correct responses.';
    } else if (avgAccuracy < 75 && avgSpeed < 1000) {
      dominantStyle = 'Speed-Focused';
      summary = 'You tend to prioritize speed over accuracy, responding quickly even at the cost of some errors.';
    } else {
      dominantStyle = 'Balanced';
      summary = 'You maintain a good balance between speed and accuracy in cognitive tasks.';
    }
  } else {
    summary = 'Insufficient data to determine speed-accuracy tradeoff patterns.';
  }
  
  return {
    summary,
    dominantStyle,
    detailedAnalysis: speedAccuracyData
  };
}

/**
 * Analyze consistency patterns across game sessions
 */
function analyzeConsistencyPatterns(metrics: Record<string, any>): MetricInsight {
  let summary = '';
  let consistencyLevel = 'Moderate';
  const detailedAnalysis: Record<string, any> = {};
  
  // Check for consistency in various game metrics
  const consistencyIndicators: Record<string, number> = {};
  
  // Memory match consistency (if data available)
  if (metrics.memoryMatch && !metrics.memoryMatch.is_skipped && metrics.memoryMatch.moves) {
    const moves = metrics.memoryMatch.moves;
    if (Array.isArray(moves) && moves.length > 0) {
      const moveTimesConsistency = calculateConsistency(moves.map((m: any) => m.time || 0));
      consistencyIndicators.memoryMatchMoveTimesConsistency = moveTimesConsistency;
      detailedAnalysis.memoryMatch = { moveTimesConsistency };
    }
  }
  
  // Stroop challenge consistency (if data available)
  if (metrics.stroopChallenge && !metrics.stroopChallenge.is_skipped && 
      metrics.stroopChallenge.trials && Array.isArray(metrics.stroopChallenge.trials)) {
    const responseTimes = metrics.stroopChallenge.trials.map((t: any) => t.responseTime || 0);
    const responseTimesConsistency = calculateConsistency(responseTimes);
    consistencyIndicators.stroopResponseTimesConsistency = responseTimesConsistency;
    detailedAnalysis.stroopChallenge = { responseTimesConsistency };
  }
  
  // Determine overall consistency level
  const consistencyValues = Object.values(consistencyIndicators);
  if (consistencyValues.length > 0) {
    const avgConsistency = consistencyValues.reduce((sum, val) => sum + val, 0) / consistencyValues.length;
    
    if (avgConsistency < 0.15) {
      consistencyLevel = 'High';
      summary = 'You demonstrate high consistency in your cognitive performance, maintaining steady performance across tasks.';
    } else if (avgConsistency < 0.3) {
      consistencyLevel = 'Moderate';
      summary = 'You show moderate consistency in your cognitive performance, with some variation between attempts.';
    } else {
      consistencyLevel = 'Variable';
      summary = 'Your cognitive performance shows significant variability, with notable differences between attempts.';
    }
  } else {
    summary = 'Insufficient data to determine consistency patterns.';
  }
  
  return {
    summary,
    consistencyLevel,
    detailedAnalysis
  };
}

/**
 * Calculate consistency coefficient (lower is more consistent)
 */
function calculateConsistency(values: number[]): number {
  if (values.length <= 1) return 0;
  
  // Filter out zeros and invalid values
  const validValues = values.filter(v => v > 0);
  if (validValues.length <= 1) return 0;
  
  // Calculate coefficient of variation
  const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  const squaredDiffs = validValues.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / validValues.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev / mean; // Coefficient of variation
}

/**
 * Analyze strategy patterns across games
 */
function analyzeStrategyPatterns(metrics: Record<string, any>): MetricInsight {
  const strategyIndicators: Record<string, string> = {};
  let summary = '';
  
  // Tower of Hanoi strategy (if data available)
  if (metrics.towerOfHanoi && !metrics.towerOfHanoi.is_skipped) {
    const optimalMovesRatio = metrics.towerOfHanoi.optimalMovesRatio || 0;
    if (optimalMovesRatio > 0.9) {
      strategyIndicators.towerOfHanoi = 'Highly Strategic';
    } else if (optimalMovesRatio > 0.7) {
      strategyIndicators.towerOfHanoi = 'Strategic';
    } else {
      strategyIndicators.towerOfHanoi = 'Exploratory';
    }
  }
  
  // Maze Run strategy (if data available)
  if (metrics.mazeRun && !metrics.mazeRun.is_skipped) {
    const pathEfficiency = metrics.mazeRun.pathEfficiency || 0;
    const backtrackingCount = metrics.mazeRun.backtrackingCount || 0;
    
    if (pathEfficiency > 0.9 && backtrackingCount < 3) {
      strategyIndicators.mazeRun = 'Efficient Explorer';
    } else if (pathEfficiency > 0.7) {
      strategyIndicators.mazeRun = 'Methodical Explorer';
    } else {
      strategyIndicators.mazeRun = 'Trial and Error Explorer';
    }
  }
  
  // Generate summary based on strategy indicators
  if (Object.keys(strategyIndicators).length > 0) {
    const strategies = Object.values(strategyIndicators);
    
    if (strategies.some(s => s.includes('Highly Strategic') || s.includes('Efficient'))) {
      summary = 'You demonstrate strong strategic thinking, efficiently solving problems with minimal wasted effort.';
    } else if (strategies.some(s => s.includes('Strategic') || s.includes('Methodical'))) {
      summary = 'You show good strategic thinking, approaching problems methodically.';
    } else {
      summary = 'You tend to use an exploratory approach to problem-solving, learning through trial and error.';
    }
  } else {
    summary = 'Insufficient data to determine strategy patterns.';
  }
  
  return {
    summary,
    detailedAnalysis: strategyIndicators
  };
}

/**
 * Analyze error patterns across games
 */
function analyzeErrorPatterns(metrics: Record<string, any>): MetricInsight {
  const errorPatterns: Record<string, any> = {};
  let summary = '';
  
  // Memory Match errors (if data available)
  if (metrics.memoryMatch && !metrics.memoryMatch.is_skipped) {
    const errors = metrics.memoryMatch.errors || 0;
    const totalMoves = metrics.memoryMatch.totalMoves || 1; // Avoid division by zero
    const errorRate = errors / totalMoves;
    
    errorPatterns.memoryMatch = {
      errorRate,
      pattern: errorRate > 0.4 ? 'High' : errorRate > 0.2 ? 'Moderate' : 'Low'
    };
  }
  
  // Stroop Challenge errors (if data available)
  if (metrics.stroopChallenge && !metrics.stroopChallenge.is_skipped) {
    const incorrectResponses = metrics.stroopChallenge.incorrectResponses || 0;
    const totalResponses = (metrics.stroopChallenge.correctResponses || 0) + incorrectResponses;
    const errorRate = totalResponses > 0 ? incorrectResponses / totalResponses : 0;
    
    errorPatterns.stroopChallenge = {
      errorRate,
      pattern: errorRate > 0.3 ? 'High' : errorRate > 0.15 ? 'Moderate' : 'Low'
    };
  }
  
  // Generate summary based on error patterns
  if (Object.keys(errorPatterns).length > 0) {
    const errorRates = Object.values(errorPatterns).map(e => e.errorRate);
    const avgErrorRate = errorRates.reduce((sum, rate) => sum + rate, 0) / errorRates.length;
    
    if (avgErrorRate > 0.3) {
      summary = 'You tend to make more errors in cognitive tasks, which may indicate opportunities to improve focus or processing.';
    } else if (avgErrorRate > 0.15) {
      summary = 'You make a moderate number of errors in cognitive tasks, balancing speed with accuracy.';
    } else {
      summary = 'You make few errors in cognitive tasks, showing strong focus and attention to detail.';
    }
  } else {
    summary = 'Insufficient data to determine error patterns.';
  }
  
  return {
    summary,
    detailedAnalysis: errorPatterns
  };
}

/**
 * Analyze cross-domain strengths
 */
function analyzeCrossDomainStrengths(metrics: Record<string, any>): MetricInsight {
  const domainScores: Record<string, number> = {};
  let summary = '';
  
  // Extract domain scores from metrics
  if (metrics.memoryMatch && !metrics.memoryMatch.is_skipped) {
    domainScores.memory = metrics.memoryMatch.memoryScore || 0;
  }
  
  if (metrics.towerOfHanoi && !metrics.towerOfHanoi.is_skipped) {
    domainScores.problemSolving = metrics.towerOfHanoi.problemSolvingScore || 0;
    domainScores.planning = metrics.towerOfHanoi.planningScore || 0;
  }
  
  if (metrics.wordPuzzle && !metrics.wordPuzzle.is_skipped) {
    domainScores.vocabulary = metrics.wordPuzzle.vocabularyScore || 0;
    domainScores.language = metrics.wordPuzzle.languageScore || 0;
  }
  
  if (metrics.spatialPattern && !metrics.spatialPattern.is_skipped) {
    domainScores.spatial = metrics.spatialPattern.spatialScore || 0;
    domainScores.patternRecognition = metrics.spatialPattern.patternRecognitionScore || 0;
  }
  
  if (metrics.mazeRun && !metrics.mazeRun.is_skipped) {
    domainScores.navigation = metrics.mazeRun.navigationScore || 0;
    domainScores.spatialNavigation = metrics.mazeRun.spatialNavigationScore || 0;
  }
  
  if (metrics.stroopChallenge && !metrics.stroopChallenge.is_skipped) {
    domainScores.cognitiveFlexibility = metrics.stroopChallenge.cognitiveFlexibilityScore || 0;
    domainScores.attention = metrics.stroopChallenge.attentionScore || 0;
  }
  
  // Identify cross-domain correlations
  const crossDomainPatterns: Record<string, string> = {};
  
  // Check for visual-spatial strength pattern
  if (domainScores.spatial && domainScores.navigation && 
      domainScores.spatial > 70 && domainScores.navigation > 70) {
    crossDomainPatterns.visualSpatial = 'Strong';
  }
  
  // Check for executive function strength
  if (domainScores.problemSolving && domainScores.cognitiveFlexibility && 
      domainScores.problemSolving > 70 && domainScores.cognitiveFlexibility > 70) {
    crossDomainPatterns.executiveFunction = 'Strong';
  }
  
  // Generate summary based on cross-domain patterns
  if (Object.keys(crossDomainPatterns).length > 0) {
    if (crossDomainPatterns.visualSpatial === 'Strong') {
      summary = 'You show strong visual-spatial abilities across different tasks, indicating good mental visualization skills.';
    } else if (crossDomainPatterns.executiveFunction === 'Strong') {
      summary = 'You demonstrate strong executive function skills across different tasks, showing good cognitive control and planning abilities.';
    } else {
      summary = 'You show some cross-domain strengths in your cognitive profile.';
    }
  } else {
    summary = 'Your cognitive strengths appear specialized rather than showing strong cross-domain patterns.';
  }
  
  return {
    summary,
    detailedAnalysis: {
      domainScores,
      crossDomainPatterns
    }
  };
}

/**
 * Identify unique strengths based on metrics
 */
function identifyUniqueStrengths(metrics: Record<string, any>): MetricInsight {
  const uniqueStrengths: string[] = [];
  let summary = '';
  
  // Check for exceptional memory performance
  if (metrics.memoryMatch && !metrics.memoryMatch.is_skipped) {
    const accuracy = metrics.memoryMatch.accuracy || 0;
    const avgReactionTime = metrics.memoryMatch.avgReactionTime || 0;
    
    if (accuracy > 90 && avgReactionTime < 1500) {
      uniqueStrengths.push('Exceptional visual memory with both speed and accuracy');
    } else if (accuracy > 90) {
      uniqueStrengths.push('Highly accurate visual memory');
    } else if (avgReactionTime < 1500 && accuracy > 75) {
      uniqueStrengths.push('Fast visual memory processing');
    }
  }
  
  // Check for exceptional problem-solving
  if (metrics.towerOfHanoi && !metrics.towerOfHanoi.is_skipped) {
    const optimalMovesRatio = metrics.towerOfHanoi.optimalMovesRatio || 0;
    
    if (optimalMovesRatio > 0.9) {
      uniqueStrengths.push('Exceptional strategic thinking and planning');
    }
  }
  
  // Check for exceptional cognitive flexibility
  if (metrics.stroopChallenge && !metrics.stroopChallenge.is_skipped) {
    const accuracy = metrics.stroopChallenge.accuracy || 0;
    const interferenceEffect = metrics.stroopChallenge.interferenceEffect || 100;
    
    if (accuracy > 90 && interferenceEffect < 200) {
      uniqueStrengths.push('Exceptional cognitive control and flexibility');
    }
  }
  
  // Generate summary based on unique strengths
  if (uniqueStrengths.length > 0) {
    summary = `You demonstrate ${uniqueStrengths.length} notable cognitive strengths: ${uniqueStrengths.join(', ')}.`;
  } else {
    summary = 'No exceptional strengths identified in the available data, though you show balanced abilities across domains.';
  }
  
  return {
    summary,
    detailedAnalysis: { uniqueStrengths }
  };
}

/**
 * Utility function to calculate standard deviation
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
} 