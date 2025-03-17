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
      setError('No assessment data available to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Use generateReport instead of generateDashboardContent
      const data = await generateReport(userData, userData.metrics);
      
      // Add UI-specific properties to the report
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

    // Use available scores from the analysis data or fall back to raw metrics
    const scores: DomainScores = analysisData?.domainAnalyses 
      ? analysisData.domainAnalyses.reduce<DomainScores>(
          (acc, domain) => {
            const domainKey = domain.domain.toLowerCase().replace(/\s+/g, '') as keyof DomainScores;
            return { ...acc, [domainKey]: domain.score };
          }, 
          getDomainScores()
        )
      : getDomainScores();

    return scores;
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
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
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

    // Generate default strengths and weaknesses based on domain scores
    const scores = getDomainScores();
    const domains = Object.entries(scores)
      .map(([domain, score]): { name: string; score: number } => ({ 
        name: formatDomainName(domain), 
        score 
      }))
      .sort((a, b) => b.score - a.score);

    return {
      strengths: domains.slice(0, 3),
      weaknesses: domains.slice(-3).reverse()
    };
  };

  // Format domain name for display
  const formatDomainName = (domain: string): string => {
    const formattedDomains: Record<string, string> = {
      memory: 'Memory',
      problemSolving: 'Problem Solving',
      vocabulary: 'Vocabulary',
      spatialReasoning: 'Spatial Reasoning',
      navigation: 'Navigation',
      cognitiveFlexibility: 'Cognitive Flexibility'
    };

    return formattedDomains[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
  };

  // Generate recommendations based on analysis
  const getRecommendations = () => {
    if (analysisData?.recommendations && analysisData.recommendations.length > 0) {
      // Map simple recommendation strings to objects with title and description
      return analysisData.recommendations.map(rec => {
        const parts = rec.split(':').map(p => p.trim());
        return {
          title: parts[0],
          description: parts[1] || rec
        };
      });
    }

    // Fallback recommendations based on weaknesses
    const { weaknesses } = getStrengthsAndWeaknesses();
    return weaknesses.map((weakness: { name: string; score: number }) => {
      const domain = weakness.name.toLowerCase();
      let title = `${weakness.name} Training`;
      let description = `Regular practice in ${weakness.name.toLowerCase()} activities can help improve this cognitive domain.`;

      return { title, description };
    });
  };

  // Get domain insights from the analysis data
  const getDomainInsights = (): DomainAnalysis[] => {
    if (analysisData?.domainAnalyses && analysisData.domainAnalyses.length > 0) {
      return analysisData.domainAnalyses;
    }

    // Generate fallback domain insights
    const scores = getDomainScores();
    return Object.entries(scores).map(([domain, score]): DomainAnalysis => ({
      domain: formatDomainName(domain),
      score,
      analysis: `Your ${formatDomainName(domain)} abilities show a score of ${score}/100.`,
      strengths: score > 70 ? [`Strong ${domain} performance`] : [],
      weaknesses: score < 60 ? [`${formatDomainName(domain)} needs improvement`] : [],
      recommendations: [`Practice ${domain} regularly to maintain and improve skills`]
    }));
  };

  // Get learning style information
  const getLearningStyle = (): LearningStyleAnalysis & {
    description?: string;
    teachingStrategies?: string[];
    accommodations?: string[];
  } => {
    if (analysisData?.learningStyle) {
      return {
        ...analysisData.learningStyle,
        description: "Based on your cognitive profile and performance patterns.",
        teachingStrategies: ["Use visual aids", "Break complex concepts into smaller parts"],
        accommodations: ["Allow extra time for processing", "Provide multiple formats of learning materials"]
      };
    }

    // Fallback learning style based on strengths
    const { strengths } = getStrengthsAndWeaknesses();
    let primaryStyle = "Visual Learner";
    let description = "Based on your cognitive strengths, you appear to learn best through visual means.";
    let teachingStrategies = [
      "Use diagrams and visual representations",
      "Organize information with color-coding and spatial arrangements",
      "Provide visual metaphors and examples"
    ];
    let accommodations = [
      "Provide information in visual formats when possible",
      "Allow time for processing visual information",
      "Use visual cues to highlight important information"
    ];
    
    // Determine learning style based on strengths
    if (strengths[0] && strengths[0].name === "Memory") {
      primaryStyle = "Visual-Spatial Learner";
    } else if (strengths[0] && strengths[0].name === "Problem Solving") {
      primaryStyle = "Logical Learner";
    }
    
    return {
      primaryStyle,
      description,
      teachingStrategies,
      accommodations,
      analysisText: "Your cognitive profile suggests you learn most effectively through visual and spatial methods.",
      recommendations: [
        "Use visual aids when learning new information",
        "Create diagrams or mind maps to organize concepts",
        "Practice visualizing information to improve recall"
      ]
    };
  };

  // Extract strengths from domain analyses
  function extractStrengths(report: CognitiveReport): { name: string; score: number }[] {
    return report.domainAnalyses
      .filter(domain => domain.score >= 70)
      .map(domain => ({ name: domain.domain, score: domain.score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  // Extract weaknesses from domain analyses
  function extractWeaknesses(report: CognitiveReport): { name: string; score: number }[] {
    return report.domainAnalyses
      .filter(domain => domain.score < 70)
      .map(domain => ({ name: domain.domain, score: domain.score }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }

  // Generate relationship insights between domains
  function generateRelationshipInsights(report: CognitiveReport): { domains: string[]; insight: string }[] {
    const insights: { domains: string[]; insight: string }[] = [];
    const domains = report.domainAnalyses;
    
    // Compare key domain pairs
    if (domains.length >= 2) {
      for (let i = 0; i < domains.length - 1; i++) {
        for (let j = i + 1; j < domains.length; j++) {
          if (insights.length < 3) { // Limit to 3 insights
            const domain1 = domains[i];
            const domain2 = domains[j];
            insights.push({
              domains: [domain1.domain, domain2.domain],
              insight: `Your ${domain1.domain} (${domain1.score}) and ${domain2.domain} (${domain2.score}) abilities show a relationship that suggests ${domain1.score > domain2.score ? domain1.domain : domain2.domain} is a cognitive strength you can leverage.`
            });
          }
        }
      }
    }
    
    return insights;
  }

  // Generate a summary based on the report
  function generateSummary(report: CognitiveReport): string {
    return `Your cognitive assessment results show an overall score of ${report.overallScore}. ${report.summaryAnalysis}`;
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
    overallScore: analysisData?.overallScore || (userData ? Object.values(getDomainScores()).reduce((sum: number, score: number) => sum + score, 0) / 6 : 0),
    summary: analysisData?.summary || `Based on your assessment results, you show varying levels of performance across cognitive domains.`
  };
} 