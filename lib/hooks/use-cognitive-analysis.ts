import { useState, useEffect } from 'react';
import { generateDashboardContent, CognitiveReport, DomainAnalysis, LearningStyleAnalysis } from '@/lib/report-generator';

interface UseCognitiveAnalysisOptions {
  autoFetch?: boolean;
}

export function useCognitiveAnalysis(userData: any, options: UseCognitiveAnalysisOptions = {}) {
  const { autoFetch = true } = options;
  const [analysisData, setAnalysisData] = useState<CognitiveReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch analysis data
  const fetchAnalysis = async () => {
    if (!userData || !userData.metrics) {
      setError('No assessment data available to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await generateDashboardContent(userData);
      setAnalysisData(data);
    } catch (err) {
      console.error('Error generating cognitive analysis:', err);
      setError('Failed to generate analysis. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data when userData changes if autoFetch is true
  useEffect(() => {
    if (autoFetch && userData && userData.metrics) {
      fetchAnalysis();
    }
  }, [userData, autoFetch]);

  // Compute domain scores from raw metrics
  const getDomainScores = () => {
    if (!userData?.metrics) {
      return {
        memory: 0,
        problemSolving: 0,
        vocabulary: 0,
        spatialReasoning: 0,
        navigation: 0,
        cognitiveFlexibility: 0
      };
    }
    
    const m = userData.metrics;
    return {
      memory: m.memoryMatch?.memoryScore || 0,
      problemSolving: m.towerOfHanoi?.problemSolvingScore || 0,
      vocabulary: m.wordPuzzle?.vocabularyScore || 0,
      spatialReasoning: m.spatialPattern?.spatialScore || 0,
      navigation: m.mazeRun?.spatialNavigationScore || 0,
      cognitiveFlexibility: m.stroopChallenge?.cognitiveFlexibilityScore || m.stroopChallenge?.flexibilityScore || 0
    };
  };

  // Create radar chart data with domain scores
  const createRadarData = () => {
    const scores = analysisData?.domainAnalyses 
      ? analysisData.domainAnalyses.reduce(
          (acc, domain) => ({ ...acc, [domain.domain.toLowerCase().replace(/\s+/g, '')]: domain.score }), 
          getDomainScores()
        )
      : getDomainScores();
    
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
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Derive strengths and weaknesses for the user
  const getStrengthsAndWeaknesses = () => {
    if (analysisData?.strengths && analysisData?.weaknesses) {
      return {
        strengths: analysisData.strengths,
        weaknesses: analysisData.weaknesses
      };
    }

    // Fallback to calculating based on raw scores
    const scores = getDomainScores();
    const domains = [
      { name: 'Memory', score: scores.memory },
      { name: 'Problem Solving', score: scores.problemSolving },
      { name: 'Vocabulary', score: scores.vocabulary },
      { name: 'Spatial Reasoning', score: scores.spatialReasoning },
      { name: 'Navigation', score: scores.navigation },
      { name: 'Cognitive Flexibility', score: scores.cognitiveFlexibility }
    ];
    
    domains.sort((a, b) => b.score - a.score);
    
    return {
      strengths: domains.slice(0, 2),
      weaknesses: domains.slice(-2).reverse()
    };
  };

  // Get recommendations for improvement
  const getRecommendations = () => {
    if (analysisData?.recommendations) {
      return analysisData.recommendations;
    }

    // Fallback recommendations based on weaknesses
    const { weaknesses } = getStrengthsAndWeaknesses();
    return weaknesses.map(weakness => {
      const domain = weakness.name.toLowerCase();
      let title = `${weakness.name} Training`;
      let description = `Regular practice in ${weakness.name.toLowerCase()} activities can help improve this cognitive domain.`;
      
      // Domain-specific recommendations
      if (domain.includes('memory')) {
        description = 'Practice memory games and techniques like chunking information to improve recall.';
      } else if (domain.includes('problem')) {
        description = 'Work on puzzles and break down complex problems into smaller steps.';
      } else if (domain.includes('vocabulary')) {
        description = 'Reading diverse materials and word games can expand your vocabulary.';
      } else if (domain.includes('spatial')) {
        description = 'Practice visualization exercises and spatial reasoning puzzles.';
      } else if (domain.includes('navigation')) {
        description = 'Map reading and navigation games can improve your spatial navigation skills.';
      } else if (domain.includes('flexibility')) {
        description = 'Task-switching exercises and mindfulness can enhance cognitive flexibility.';
      }
      
      return { title, description };
    });
  };

  // Get domain insights with analysis and recommendations
  const getDomainInsights = (): DomainAnalysis[] => {
    if (analysisData?.domainAnalyses) {
      return analysisData.domainAnalyses;
    }

    // Fallback domain insights based on raw scores
    const scores = getDomainScores();
    return Object.entries(scores).map(([domainKey, score]) => {
      const domain = domainKey
        .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
        .replace(/^./, first => first.toUpperCase()); // Capitalize first letter
      
      return {
        domain,
        score,
        analysis: `Your performance in ${domain.toLowerCase()} shows ${score >= 70 ? 'strength' : 'room for improvement'}.`,
        recommendations: [
          `Practice ${domain.toLowerCase()} exercises regularly`,
          `Focus on building ${domain.toLowerCase()} skills through daily activities`
        ],
        strengths: score >= 70 ? [`Good ${domain.toLowerCase()} baseline`] : [],
        weaknesses: score < 70 ? [`${domain} could use targeted practice`] : []
      };
    });
  };

  // Get learning style information
  const getLearningStyles = (): LearningStyleAnalysis => {
    if (analysisData?.learningStyles) {
      return analysisData.learningStyles;
    }

    // Fallback learning style based on strengths
    const { strengths } = getStrengthsAndWeaknesses();
    const topDomain = strengths[0]?.name || 'Balanced';
    
    // Create default learning style based on top domain
    let primaryStyle = 'Balanced Learner';
    let description = 'Shows a balanced approach to learning with no strongly dominant style.';
    let teachingStrategies = [
      'Use a variety of teaching methods to engage different cognitive domains',
      'Provide multimodal learning experiences',
      'Alternate between visual, auditory, and hands-on activities'
    ];
    let accommodations = [
      'Allow flexibility in demonstrating knowledge',
      'Provide clear structure and expectations',
      'Offer choice in assignment formats when possible'
    ];
    
    // Customize based on top domain
    if (topDomain.includes('Memory')) {
      primaryStyle = 'Sequential Learner';
      description = 'Processes information effectively when presented in an organized, step-by-step format.';
      teachingStrategies = [
        'Present information in a logical sequence',
        'Use outlines and structured notes',
        'Provide clear connections between concepts'
      ];
      accommodations = [
        'Allow use of note-taking tools and organizers',
        'Break complex tasks into smaller steps',
        'Provide reference materials for memory support'
      ];
    } else if (topDomain.includes('Problem Solving')) {
      primaryStyle = 'Logical Learner';
      description = 'Excels when understanding the reasoning behind concepts and working with systems and patterns.';
      teachingStrategies = [
        'Emphasize critical thinking and logical reasoning',
        'Provide opportunities for systematic analysis',
        'Explain the "why" behind concepts and procedures'
      ];
      accommodations = [
        'Allow time for thorough analysis',
        'Provide problem-solving frameworks',
        'Use step-by-step guides for complex tasks'
      ];
    } else if (topDomain.includes('Vocabulary')) {
      primaryStyle = 'Verbal/Linguistic Learner';
      description = 'Learns best through reading, writing, and verbal explanation of concepts.';
      teachingStrategies = [
        'Use discussion-based activities',
        'Incorporate reading and writing tasks',
        'Explain concepts verbally with rich language'
      ];
      accommodations = [
        'Provide written instructions',
        'Allow extra time for reading comprehension',
        'Use word banks and vocabulary support'
      ];
    } else if (topDomain.includes('Spatial') || topDomain.includes('Navigation')) {
      primaryStyle = 'Visual-Spatial Learner';
      description = 'Processes information most effectively through visual and spatial representations.';
      teachingStrategies = [
        'Use diagrams, charts, and visual aids',
        'Incorporate mind mapping and graphic organizers',
        'Demonstrate concepts with visual models'
      ];
      accommodations = [
        'Provide visual schedules and instructions',
        'Allow use of diagrams in assignments',
        'Offer alternatives to text-heavy materials'
      ];
    } else if (topDomain.includes('Flexibility')) {
      primaryStyle = 'Multimodal Learner';
      description = 'Adapts well to different teaching approaches and benefits from variety in instruction.';
      teachingStrategies = [
        'Use mixed teaching methods',
        'Incorporate movement and hands-on activities',
        'Provide opportunities for creative expression'
      ];
      accommodations = [
        'Offer flexibility in assignment completion',
        'Allow breaks during extended work periods',
        'Support transitions between different activities'
      ];
    }
    
    return {
      primaryStyle,
      description,
      teachingStrategies,
      accommodations
    };
  };

  return {
    analysisData,
    loading,
    error,
    fetchAnalysis,
    createRadarData,
    getStrengthsAndWeaknesses,
    getRecommendations,
    getDomainInsights,
    getLearningStyles,
    overallScore: analysisData?.overallScore || (userData ? Object.values(getDomainScores()).reduce((sum: any, score: any) => sum + score, 0) / 6 : 0),
    summary: analysisData?.summary || `Based on your assessment results, you show varying levels of performance across cognitive domains.`
  };
} 