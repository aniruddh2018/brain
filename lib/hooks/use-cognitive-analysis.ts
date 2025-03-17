import { useState, useEffect } from 'react';
import { generateReport, CognitiveReport, DomainAnalysis, LearningStyleAnalysis } from '@/lib';

interface UseCognitiveAnalysisOptions {
  autoFetch?: boolean;
}

// Define an extended cognitive report type with additional properties used in the UI
interface ExtendedCognitiveReport extends CognitiveReport {
  strengths?: { name: string; score: number }[];
  weaknesses?: { name: string; score: number }[];
  relationshipInsights?: { domains: string[]; insight: string }[];
  summary?: string;
}

interface DomainScores {
  memory: number;
  problemSolving: number;
  vocabulary: number;
  spatialReasoning: number;
  navigation: number;
  cognitiveFlexibility: number;
}

export function useCognitiveAnalysis(userData: any, options: UseCognitiveAnalysisOptions = {}) {
  const { autoFetch = true } = options;
  const [analysisData, setAnalysisData] = useState<ExtendedCognitiveReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch analysis data
  const fetchAnalysis = async () => {
    if (!userData || !userData.metrics) {
      setError('No user data or metrics available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate full cognitive report
      const data = await generateReport(userData, userData.metrics);

      console.log('Generated cognitive report:', data);

      // Enhance with additional computed properties
      const extendedData: ExtendedCognitiveReport = {
        ...data,
        strengths: extractStrengths(data),
        weaknesses: extractWeaknesses(data),
        relationshipInsights: generateRelationshipInsights(data),
        summary: generateSummary(data)
      };
      
      setAnalysisData(extendedData);
    } catch (err) {
      console.error('Error generating cognitive analysis:', err);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Call fetchAnalysis on mount if autoFetch is enabled
  useEffect(() => {
    if (autoFetch && userData) {
      fetchAnalysis();
    }
  }, [userData, autoFetch]);

  // Extract domain scores from the analysis data
  const getDomainScores = (): DomainScores => {
    // Default empty scores
    const defaultScores: DomainScores = {
      memory: 0,
      problemSolving: 0,
      vocabulary: 0,
      spatialReasoning: 0,
      navigation: 0,
      cognitiveFlexibility: 0
    };

    if (!userData?.metrics) {
      return defaultScores;
    }

    // If we have analysis data with domain analyses, use those scores
    if (analysisData?.domainAnalyses && analysisData.domainAnalyses.length > 0) {
      return analysisData.domainAnalyses.reduce<DomainScores>(
        (acc, domain) => {
          const domainKey = domain.domain.toLowerCase().replace(/\s+/g, '') as keyof DomainScores;
          acc[domainKey] = Math.round(domain.score);
          return acc;
        }, 
        { ...defaultScores } // Clone the default scores
      );
    }
    
    // Fallback: Extract directly from metrics
    const m = userData.metrics;
    return {
      memory: Math.round(m.memoryMatch?.memoryScore || 0),
      problemSolving: Math.round(m.towerOfHanoi?.problemSolvingScore || 0),
      vocabulary: Math.round(m.wordPuzzle?.vocabularyScore || 0),
      spatialReasoning: Math.round(m.spatialPattern?.spatialScore || 0),
      navigation: Math.round(m.mazeRun?.spatialNavigationScore || 0),
      cognitiveFlexibility: Math.round(m.stroopChallenge?.cognitiveFlexibilityScore || 0)
    };
  };

  // Create radar chart data from domain scores
  const createRadarData = () => {
    const scores = getDomainScores();
    
    return {
      labels: [
        'Memory',
        'Problem Solving',
        'Vocabulary',
        'Spatial Reasoning',
        'Navigation',
        'Cognitive Flexibility'
      ],
      datasets: [
        {
          label: 'Cognitive Performance',
          data: [
            scores.memory,
            scores.problemSolving,
            scores.vocabulary,
            scores.spatialReasoning,
            scores.navigation,
            scores.cognitiveFlexibility
          ],
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  // Derive strengths and weaknesses for the user
  const getStrengthsAndWeaknesses = (): { 
    strengths: { name: string; score: number }[]; 
    weaknesses: { name: string; score: number }[] 
  } => {
    if (analysisData?.strengths && analysisData?.weaknesses) {
      return {
        strengths: analysisData.strengths,
        weaknesses: analysisData.weaknesses
      };
    }

    // Calculate strengths/weaknesses from domain scores
    const scores = getDomainScores();
    const scorePairs = Object.entries(scores).map(([domain, score]) => ({
      name: formatDomainName(domain),
      score
    }));
    
    // Sort by score (highest to lowest)
    scorePairs.sort((a, b) => b.score - a.score);
    
    // Take top 3 as strengths, bottom 3 as weaknesses
    return {
      strengths: scorePairs.slice(0, 3),
      weaknesses: scorePairs.slice(-3).reverse()
    };
  };

  // Format domain name for display
  const formatDomainName = (domain: string): string => {
    const displayNames: { [key: string]: string } = {
      memory: 'Memory',
      problemsolving: 'Problem Solving',
      vocabulary: 'Vocabulary',
      spatialreasoning: 'Spatial Reasoning',
      navigation: 'Navigation',
      cognitiveflexibility: 'Cognitive Flexibility'
    };
    
    return displayNames[domain.toLowerCase()] || domain;
  };

  // Get recommendations based on cognitive profile
  const getRecommendations = () => {
    if (analysisData?.recommendations) {
      return analysisData.recommendations.map((rec: any) => ({
        title: typeof rec === 'string' ? rec : rec.title || 'Recommendation',
        description: typeof rec === 'string' ? '' : rec.description || ''
      }));
    }
    
    // Generate basic recommendations based on strengths/weaknesses
    const { strengths, weaknesses } = getStrengthsAndWeaknesses();
    
    const recommendations = [
      ...strengths.map(strength => ({
        title: `Leverage Your ${strength.name} Strengths`,
        description: `Continue developing your ${strength.name.toLowerCase()} skills with more advanced activities.`
      })),
      ...weaknesses.map(weakness => ({
        title: `Develop ${weakness.name} Skills`,
        description: `Focus on improving your ${weakness.name.toLowerCase()} abilities with targeted exercises.`
      }))
    ];
    
    return recommendations.slice(0, 6);
  };

  // Get domain insights from the analysis data
  const getDomainInsights = (): DomainAnalysis[] => {
    if (analysisData?.domainAnalyses) {
      return analysisData.domainAnalyses;
    }
    
    // Generate basic insights if none available
    const scores = getDomainScores();
    
    return Object.entries(scores).map(([domain, score]) => ({
      domain: formatDomainName(domain),
      score,
      analysis: `Your performance in ${formatDomainName(domain)} shows ${score >= 70 ? 'strength' : 'room for improvement'}.`,
      strengths: score >= 60 ? [`Good ${domain} performance`] : [],
      weaknesses: score < 60 ? [`Room to improve ${domain}`] : [],
      recommendations: [`Practice ${domain} regularly`, `Try different ${domain} exercises`]
    }));
  };

  // Get learning style information
  const getLearningStyle = (): LearningStyleAnalysis & {
    description?: string;
    teachingStrategies?: string[];
    accommodations?: string[];
  } => {
    if (analysisData?.learningStyle) {
      // Ensure the learning style has teaching strategies and accommodations
      const learningStyle = {
        ...analysisData.learningStyle,
        teachingStrategies: analysisData.learningStyle.teachingStrategies || 
          ['Use a variety of instructional methods', 'Provide visual and verbal instruction'],
        accommodations: analysisData.learningStyle.accommodations || 
          ['Allow extra time when needed', 'Provide a structured learning environment']
      };
      
      return learningStyle;
    }
    
    // Determine learning style based on strengths
    const { strengths } = getStrengthsAndWeaknesses();
    const topDomain = strengths[0]?.name || 'Memory';
    
    // Map domains to learning styles
    const styleMap: { [key: string]: string } = {
      'Memory': 'Sequential Learner',
      'Problem Solving': 'Logical Learner',
      'Vocabulary': 'Verbal/Linguistic Learner',
      'Spatial Reasoning': 'Visual-Spatial Learner',
      'Navigation': 'Kinesthetic Learner',
      'Cognitive Flexibility': 'Multimodal Learner'
    };
    
    const primaryStyle = styleMap[topDomain] || 'Multimodal Learner';
    
    // Generate basic learning style analysis
    return {
      primaryStyle,
      analysisText: `Based on your assessment performance, you show characteristics of a ${primaryStyle}.`,
      recommendations: [
        'Leverage your learning style to improve study effectiveness',
        'Try different learning approaches for challenging material',
        'Use your cognitive strengths to develop weaker areas'
      ],
      description: `${primaryStyle}s learn best through ${topDomain === 'Vocabulary' ? 'words and language' : 
                   topDomain === 'Spatial Reasoning' ? 'images and spatial understanding' : 
                   topDomain === 'Navigation' ? 'movement and physical interaction' : 
                   'structured approaches and logical progression'}.`,
      teachingStrategies: [
        `Provide ${topDomain === 'Vocabulary' ? 'clear verbal instructions' : 
          topDomain === 'Spatial Reasoning' ? 'visual diagrams and maps' : 
          topDomain === 'Navigation' ? 'hands-on activities' : 
          'well-structured step-by-step instructions'}`,
        'Use multiple modalities to reinforce learning',
        'Make connections between new and existing knowledge'
      ],
      accommodations: [
        'Allow for flexible demonstration of knowledge',
        'Provide materials in various formats',
        'Create a supportive learning environment'
      ]
    };
  };

  // Extract strengths from domain analyses
  function extractStrengths(report: CognitiveReport): { name: string; score: number }[] {
    const domainAnalyses = report.domainAnalyses || [];
    return domainAnalyses
      .filter(domain => domain.score >= 60)
      .map(domain => ({ name: domain.domain, score: Math.round(domain.score) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  // Extract weaknesses from domain analyses
  function extractWeaknesses(report: CognitiveReport): { name: string; score: number }[] {
    const domainAnalyses = report.domainAnalyses || [];
    return domainAnalyses
      .filter(domain => domain.score < 60)
      .map(domain => ({ name: domain.domain, score: Math.round(domain.score) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }

  // Generate relationship insights between domains
  function generateRelationshipInsights(report: CognitiveReport): { domains: string[]; insight: string }[] {
    const domainAnalyses = report.domainAnalyses || [];
    const insights = [];
    
    if (domainAnalyses.length >= 2) {
      // Get pairs of domains with most interesting relationships (highest difference or both high)
      const pairs = [];
      
      for (let i = 0; i < domainAnalyses.length; i++) {
        for (let j = i + 1; j < domainAnalyses.length; j++) {
          const domain1 = domainAnalyses[i];
          const domain2 = domainAnalyses[j];
          const roundedScore1 = Math.round(domain1.score);
          const roundedScore2 = Math.round(domain2.score);
          const difference = Math.abs(roundedScore1 - roundedScore2);
          const combined = roundedScore1 + roundedScore2;
          
          pairs.push({
            domains: [domain1.domain, domain2.domain],
            scores: [roundedScore1, roundedScore2],
            difference,
            combined
          });
        }
      }
      
      // Sort by most interesting (high difference or both high)
      pairs.sort((a, b) => {
        // Prioritize pairs with high differences
        if (a.difference > 20 && b.difference <= 20) return -1;
        if (b.difference > 20 && a.difference <= 20) return 1;
        
        // Then pairs with high combined scores
        return b.combined - a.combined;
      });
      
      // Take top 3 relationships
      for (let i = 0; i < Math.min(3, pairs.length); i++) {
        const pair = pairs[i];
        let insight = '';
        
        if (pair.difference > 20) {
          insight = `Your ${pair.domains[0]} and ${pair.domains[1]} skills show significant difference. Consider how strengthening ${pair.scores[0] < pair.scores[1] ? pair.domains[0] : pair.domains[1]} might benefit your overall cognitive profile.`;
        } else if (pair.combined > 140) {
          insight = `You show strong capabilities in both ${pair.domains[0]} and ${pair.domains[1]}. These complementary skills can be leveraged together for complex problem-solving.`;
        } else {
          insight = `Your ${pair.domains[0]} and ${pair.domains[1]} abilities are fairly balanced. Continuing to develop both will help maintain cognitive flexibility.`;
        }
        
        insights.push({ domains: pair.domains, insight });
      }
    }
    
    return insights;
  }

  // Generate a summary based on the report
  function generateSummary(report: CognitiveReport): string {
    return `Your cognitive assessment results show an overall score of ${Math.round(report.overallScore)}. ${report.summaryAnalysis}`;
  }

  return {
    analysisData,
    loading,
    error,
    fetchAnalysis,
    createRadarData,
    getStrengthsAndWeaknesses,
    getRecommendations,
    getDomainInsights,
    getLearningStyle,
    overallScore: analysisData?.overallScore ? Math.round(analysisData.overallScore) : 
      (userData ? Math.round(Object.values(getDomainScores()).reduce((sum: number, score: number) => sum + score, 0) / 6) : 0),
    summary: analysisData?.summary || `Based on your assessment results, you show varying levels of performance across cognitive domains.`
  };
} 