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

  const fetchAnalysis = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate cognitive report
      console.log("Fetching cognitive analysis for user:", userData.id);
      const report = await generateReport(userData, userData.metrics);
      
      // Add UI-specific properties to the report
      const enhancedReport: ExtendedCognitiveReport = {
        ...report,
        strengths: extractStrengths(report),
        weaknesses: extractWeaknesses(report),
        relationshipInsights: generateRelationshipInsights(report),
        summary: generateSummary(report),
        overallScore: report.overallScore || 0 // Ensure overallScore has a default value
      };
      
      console.log("Successfully processed cognitive analysis");
      setAnalysisData(enhancedReport);
    } catch (err) {
      console.error('Error fetching cognitive analysis:', err);
      
      // Provide more detailed error information based on the error type
      let errorMessage = 'Failed to generate cognitive analysis. Please try again.';
      
      if (err instanceof SyntaxError) {
        errorMessage = 'Error parsing cognitive analysis data. The report format may be invalid.';
        console.error('JSON parsing error details:', err.message);
      } else if (err instanceof Error) {
        errorMessage = `Analysis error: ${err.message}`;
      }
      
      // Log additional debugging information
      console.error('Error context:', { 
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        userData: userData ? { id: userData.id } : 'No user data'
      });
      
      setError(errorMessage);
      
      // Create a minimal fallback report to prevent UI failures
      const fallbackReport: ExtendedCognitiveReport = {
        userData: userData,
        overallScore: 0,
        summaryAnalysis: "Unable to generate analysis report. Please try again later.",
        domainAnalyses: [],
        learningStyle: {
          primaryStyle: "Visual",
          analysisText: "Learning style analysis unavailable.",
          recommendations: [],
          description: "Visual learners learn best through seeing information."
        },
        recommendations: ["Try running the assessment again."],
        detailedPerformanceData: {},
        strengths: [],
        weaknesses: [],
        relationshipInsights: [],
        summary: "Analysis report generation failed. This could be due to a temporary issue."
      };
      
      setAnalysisData(fallbackReport);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && userData) {
      fetchAnalysis();
    }
  }, [userData, autoFetch]);

  // Get domain scores from the analysis data
  const getDomainScores = (): DomainScores => {
    if (!analysisData) {
      return {
        memory: 0,
        problemSolving: 0,
        vocabulary: 0,
        spatialReasoning: 0,
        navigation: 0,
        cognitiveFlexibility: 0
      };
    }

    // Map domain analyses to scores
    const scores: any = {};
    analysisData.domainAnalyses.forEach((analysis: DomainAnalysis) => {
      const domain = analysis.domain.toLowerCase().replace(/\s+/g, '');
      scores[domain] = analysis.score;
    });

    return {
      memory: scores.memory || 0,
      problemSolving: scores.problemsolving || 0,
      vocabulary: scores.vocabulary || 0,
      spatialReasoning: scores.spatialreasoning || 0,
      navigation: scores.navigation || 0,
      cognitiveFlexibility: scores.cognitiveflexibility || 0
    };
  };

  // Create data for the radar chart
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
          borderWidth: 2,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
        }
      ]
    };
  };

  // Get strengths and weaknesses
  const getStrengthsAndWeaknesses = (): { 
    strengths: { name: string; score: number }[]; 
    weaknesses: { name: string; score: number }[] 
  } => {
    if (!analysisData) {
      return { strengths: [], weaknesses: [] };
    }

    return {
      strengths: analysisData.strengths || [],
      weaknesses: analysisData.weaknesses || []
    };
  };

  // Format domain name for display
  const formatDomainName = (domain: string): string => {
    switch (domain.toLowerCase()) {
      case 'memory': return 'Memory Recall';
      case 'problemsolving': return 'Problem Solving';
      case 'vocabulary': return 'Language & Vocabulary';
      case 'spatialreasoning': return 'Spatial Reasoning';
      case 'navigation': return 'Spatial Navigation';
      case 'cognitiveflexibility': return 'Cognitive Flexibility';
      default: return domain;
    }
  };

  // Get recommendations
  const getRecommendations = () => {
    if (!analysisData) return [];
    
    // Filter out duplicate recommendations
    const seen = new Set();
    return (analysisData.recommendations || []).filter(rec => {
      // Normalize the recommendation to avoid nearly-duplicate entries
      const normalized = rec.toLowerCase().trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  };

  // Get domain insights
  const getDomainInsights = (): DomainAnalysis[] => {
    if (!analysisData) return [];
    
    return analysisData.domainAnalyses.map((analysis: DomainAnalysis) => ({
      ...analysis,
      domain: formatDomainName(analysis.domain)
    }));
  };

  // Get learning style information
  const getLearningStyle = (): LearningStyleAnalysis & {
    description?: string;
    teachingStrategies?: string[];
    accommodations?: string[];
  } => {
    if (!analysisData || !analysisData.learningStyle || !analysisData.learningStyle.primaryStyle) {
      // Return default learning style if no data is available
      console.log("No learning style data available, using default visual style");
      return {
        primaryStyle: 'Visual',
        analysisText: 'Learning style could not be determined from the available data.',
        recommendations: [],
        description: 'Visual learners learn best through seeing information.',
        teachingStrategies: ['Use diagrams', 'Show videos', 'Provide written instructions'],
        accommodations: ['Provide visual aids', 'Use color-coding']
      };
    }
    
    // Safely access the primaryStyle with a fallback
    const style = (analysisData.learningStyle.primaryStyle || 'visual').toLowerCase();
    
    // Define descriptions and strategies based on learning style
    const styleInfo: {
      [key: string]: {
        description: string;
        strategies: string[];
        accommodations: string[];
      }
    } = {
      visual: {
        description: 'Visual learners learn best through seeing information presented visually. They prefer charts, diagrams, and written instructions.',
        strategies: [
          'Use diagrams, charts, and graphs',
          'Provide written instructions',
          'Use color-coding for organization',
          'Take notes with visual elements'
        ],
        accommodations: [
          'Provide visual aids for new concepts',
          'Allow for visual note-taking',
          'Use color-coding for important information'
        ]
      },
      auditory: {
        description: 'Auditory learners process information best when presented through sound and speech. They learn through listening and discussing.',
        strategies: [
          'Listen to lectures and audiobooks',
          'Discuss ideas verbally',
          'Read aloud when studying',
          'Use verbal repetition'
        ],
        accommodations: [
          'Record lectures when possible',
          'Participate in group discussions',
          'Explain concepts aloud to yourself'
        ]
      },
      kinesthetic: {
        description: 'Kinesthetic learners learn best through physical activities and hands-on experiences. They prefer engaging with materials directly.',
        strategies: [
          'Use hands-on experiments',
          'Take frequent breaks to move around',
          'Create physical models',
          'Study while walking or moving'
        ],
        accommodations: [
          'Use fidget tools while learning',
          'Incorporate movement into study sessions',
          'Practice concepts through real-world applications'
        ]
      }
    };
    
    // Default to visual if style not found
    const matchedStyle = styleInfo[style] || styleInfo.visual;
    
    return {
      ...analysisData.learningStyle,
      description: matchedStyle.description,
      teachingStrategies: matchedStyle.strategies,
      accommodations: matchedStyle.accommodations
    };
  };

  // Extract strengths from the report
  function extractStrengths(report: CognitiveReport | null): { name: string; score: number }[] {
    if (!report || !report.domainAnalyses || !Array.isArray(report.domainAnalyses)) {
      console.warn("Missing or invalid domain analyses for extracting strengths");
      return [];
    }
    
    return report.domainAnalyses
      .filter((analysis: DomainAnalysis) => analysis && typeof analysis.score === 'number' && analysis.score >= 70)
      .map((analysis: DomainAnalysis) => ({
        name: formatDomainName(analysis.domain),
        score: analysis.score
      }));
  }

  // Extract weaknesses from the report
  function extractWeaknesses(report: CognitiveReport | null): { name: string; score: number }[] {
    if (!report || !report.domainAnalyses || !Array.isArray(report.domainAnalyses)) {
      console.warn("Missing or invalid domain analyses for extracting weaknesses");
      return [];
    }
    
    return report.domainAnalyses
      .filter((analysis: DomainAnalysis) => analysis && typeof analysis.score === 'number' && analysis.score < 60)
      .map((analysis: DomainAnalysis) => ({
        name: formatDomainName(analysis.domain),
        score: analysis.score
      }));
  }

  // Generate insights about relationships between domains
  function generateRelationshipInsights(report: CognitiveReport | null): { domains: string[]; insight: string }[] {
    if (!report || !report.domainAnalyses || !Array.isArray(report.domainAnalyses) || report.domainAnalyses.length < 2) {
      console.warn("Insufficient domain data for relationship insights");
      return [];
    }
    
    const insights: { domains: string[]; insight: string }[] = [];
    const analyses = report.domainAnalyses;
    
    for (let i = 0; i < analyses.length; i++) {
      for (let j = i + 1; j < analyses.length; j++) {
        if (!analyses[i] || !analyses[j] || 
            typeof analyses[i].score !== 'number' || 
            typeof analyses[j].score !== 'number') {
          continue; // Skip invalid analyses
        }
        
        const domain1 = formatDomainName(analyses[i].domain);
        const domain2 = formatDomainName(analyses[j].domain);
        const score1 = analyses[i].score;
        const score2 = analyses[j].score;
        
        if (Math.abs(score1 - score2) <= 10) {
          insights.push({
            domains: [domain1, domain2],
            insight: `Your performance in ${domain1} and ${domain2} is balanced, indicating consistent cognitive processing across these areas.`
          });
        } else if (Math.abs(score1 - score2) >= 25) {
          const higher = score1 > score2 ? domain1 : domain2;
          const lower = score1 > score2 ? domain2 : domain1;
          insights.push({
            domains: [domain1, domain2],
            insight: `There's a significant difference between your ${higher} and ${lower} skills. Focusing on activities that bridge these domains could help balance your cognitive profile.`
          });
        }
      }
    }
    
    return insights.slice(0, 3); // Return only top 3 insights
  }

  // Generate summary from the report
  function generateSummary(report: CognitiveReport | null): string {
    if (!report) return 'Analysis summary not available.';
    
    return report.summaryAnalysis || 'Analysis summary not available.';
  }

  return {
    analysisData,
    loading,
    error,
    fetchAnalysis,
    getDomainScores,
    createRadarData,
    getStrengthsAndWeaknesses,
    getRecommendations,
    getDomainInsights,
    getLearningStyle,
    overallScore: analysisData?.overallScore || 0,
    summary: analysisData?.summary || ''
  };
} 