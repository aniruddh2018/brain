"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Brain, Clock, Download, Lightbulb, Zap, Award, ArrowUpRight, ArrowDownRight, RotateCcw, FileText, MoveRight, Star, Map, Puzzle, BarChart, TrendingUp, Check, BookOpen, Users, Briefcase, School, Medal, Coffee, BookOpenCheck, LucideIcon, ChevronDown, AlertTriangle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CognitiveRadarChart from "@/components/dashboard/radar-chart"
import ScoreGauge from "@/components/dashboard/score-gauge"
import ComparisonChart from "@/components/dashboard/comparison-chart"
import RecommendationCard from "@/components/dashboard/recommendation-card"
import PerformanceTimeline from "@/components/dashboard/performance-timeline"
import { Loader2 } from "lucide-react"
import { generateReport } from "@/lib"
import { useCognitiveAnalysis } from "@/lib/hooks/use-cognitive-analysis"
import DomainDetail from "@/components/dashboard/domain-detail"
import StudyRecommendations from "@/components/dashboard/study-recommendations"
import { saveUserReport } from "@/lib"
import type { DomainAnalysis } from "@/lib"
import { NavBar } from "@/components/ui/nav-bar"

// Import Chart.js components to fix doughnut error
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  BarElement,
  DoughnutController,
  Title
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement, 
  LineElement,
  RadialLinearScale,
  BarElement,
  DoughnutController,
  Title
)

// Import the Doughnut component from chart.js/react-chartjs-2
import { Doughnut } from 'react-chartjs-2'

// Or if you prefer, create your own Doughnut component:
const DoughnutChart = ({ data, options }: { data: any, options: any }) => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      // Clean up previous chart instance
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      // Create new chart
      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        chartInstance.current = new ChartJS(ctx, {
          type: 'doughnut',
          data: data,
          options: options
        })
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, options])

  return (
    <div className="relative h-full w-full">
      <canvas ref={chartRef} id="doughnut-chart"></canvas>
    </div>
  )
}

// Define DomainAnalysis component
const DomainAnalysis = ({ domain, score }: { domain: string, score: number }) => {
  const [expanded, setExpanded] = useState(false)
  
  // Generate analysis text
  const analysisText = getDetailedAnalysis(domain, score)
  
  // Create domain insights object with proper structure
  const domainInsights = {
    analysis: analysisText,
    strengths: [`Strong performance in ${domain.toLowerCase()}`],
    weaknesses: score < 60 ? [`Room for improvement in ${domain.toLowerCase()}`] : [],
    recommendations: [
      `Regular practice in ${domain.toLowerCase()} activities`,
      `Apply ${domain.toLowerCase()} skills in daily life`
    ]
  }
  
  return (
    <Card>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <DomainScoreDisplay domain={domain} score={score} />
            <span className="ml-3">{domain}</span>
          </CardTitle>
          <div className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Analysis</h4>
              <p className="text-gray-600">{domainInsights.analysis}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-1" /> Strengths
                </h4>
                <ul className="list-disc list-inside text-gray-600 ml-1 space-y-1">
                  {domainInsights.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
              
              {domainInsights.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" /> Areas for Growth
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 ml-1 space-y-1">
                    {domainInsights.weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-gray-600 ml-1 space-y-1">
                {domainInsights.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Create a simple score display component without Chart.js
const DomainScoreDisplay = ({ domain, score }: { domain: string, score: number }) => {
  const scoreColor = 
    score >= 80 ? 'text-green-600 bg-green-50 border-green-200' : 
    score >= 60 ? 'text-blue-600 bg-blue-50 border-blue-200' : 
    score >= 40 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 
    'text-red-600 bg-red-50 border-red-200';
    
  return (
    <div className={`rounded-lg p-4 border ${scoreColor} flex flex-col items-center justify-center h-32`}>
      <div className="text-3xl font-bold mb-1">{score}</div>
      <div className="text-sm mb-2">{domain}</div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${
            score >= 80 ? 'bg-green-600' : 
            score >= 60 ? 'bg-blue-600' : 
            score >= 40 ? 'bg-yellow-600' : 
            'bg-red-600'
          }`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

// Utility functions
function getScoreBadgeColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Development";
}

function getDetailedAnalysis(domain: string, score: number) {
  if (score >= 85) {
    const excellentAnalysis: { [key: string]: string } = {
      Memory: "You show exceptional memory abilities with strong recall and recognition patterns.",
      "Problem Solving": "Your problem-solving skills are highly developed, with excellent logical reasoning.",
      Vocabulary: "You demonstrate an extensive vocabulary and excellent word processing abilities.",
      "Spatial Reasoning": "Your spatial reasoning is exceptional, with strong pattern recognition abilities.",
      Navigation: "You excel at spatial navigation with efficient pathfinding and minimal backtracking.",
      "Cognitive Flexibility": "You demonstrate excellent cognitive flexibility and attention control.",
    }
    return excellentAnalysis[domain] || "You show excellent performance in this cognitive domain."
  } else if (score >= 70) {
    const veryGoodAnalysis: { [key: string]: string } = {
      Memory: "You have very good memory abilities with effective recall and recognition strategies.",
      "Problem Solving": "Your problem-solving approach is methodical and effective in most situations.",
      Vocabulary: "You show a strong vocabulary with good word recognition and processing.",
      "Spatial Reasoning": "Your spatial reasoning is well-developed with good pattern recognition.",
      Navigation: "You navigate spatial environments efficiently with good pathfinding abilities.",
      "Cognitive Flexibility": "You show very good cognitive flexibility with effective task-switching abilities.",
    }
    return veryGoodAnalysis[domain] || "You show very good performance in this cognitive domain."
  } else if (score >= 50) {
    const goodAnalysis: { [key: string]: string } = {
      Memory: "Your memory abilities are good but could benefit from more consistent strategies.",
      "Problem Solving": "You solve problems effectively but occasionally take longer routes to solutions.",
      Vocabulary: "Your vocabulary is good with room for expansion in certain areas.",
      "Spatial Reasoning": "Your spatial reasoning shows good fundamentals with some areas to strengthen.",
      Navigation: "You navigate spatial environments adequately with occasional inefficient routes.",
      "Cognitive Flexibility": "Your cognitive flexibility is good with some room for improvement in switching tasks.",
    }
    return goodAnalysis[domain] || "You show good performance in this cognitive domain with room for improvement."
  } else {
    const needsWorkAnalysis: { [key: string]: string } = {
      Memory: "Your memory abilities need development, with challenges in recall and recognition.",
      "Problem Solving": "Your problem-solving skills need development, with challenges in logical reasoning.",
      Vocabulary: "You face challenges with word recognition and processing.",
      "Spatial Reasoning": "Your spatial reasoning needs development, with difficulties in pattern recognition.",
      Navigation: "You show challenges with spatial navigation, with inefficient route planning.",
      "Cognitive Flexibility": "Your cognitive flexibility needs development, with difficulties switching between tasks.",
    }
    return needsWorkAnalysis[domain] || "This cognitive domain would benefit from focused development."
  }
}

function getRelationshipDescription(domain1: string, domain2: string, score1: number, score2: number) {
  const difference = Math.abs(score1 - score2)
  const balance = 100 - difference

  if (balance >= 80) {
    return `Your ${domain1} and ${domain2} abilities are very well balanced, indicating integrated cognitive processing across these domains.`
  } else if (balance >= 60) {
    return `Your ${domain1} and ${domain2} abilities show good balance, with slightly stronger performance in ${score1 > score2 ? domain1 : domain2}.`
  } else {
    return `Your ${score1 > score2 ? domain1 : domain2} abilities are significantly stronger than your ${score1 > score2 ? domain2 : domain1} abilities, suggesting an opportunity for targeted development.`
  }
}

function getRecommendationIcon(title: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    "Leverage Your Memory Strengths": Brain,
    "Leverage Your Problem Solving Strengths": Puzzle,
    "Leverage Your Vocabulary Strengths": BookOpen,
    "Leverage Your Spatial Reasoning Strengths": Map,
    "Leverage Your Navigation Strengths": Map,
    "Leverage Your Cognitive Flexibility Strengths": Activity,
    "Develop Memory Skills": Brain,
    "Develop Problem Solving Skills": Puzzle,
    "Develop Vocabulary Skills": BookOpen,
    "Develop Spatial Reasoning Skills": Map,
    "Develop Navigation Skills": Map,
    "Develop Cognitive Flexibility Skills": Activity,
    "Balance Your Cognitive Profile": Activity,
    "Daily Cognitive Training": Medal
  };

  return icons[title] || Brain;
}

interface PracticeItemProps {
  title: string
  description: string
}

function PracticeItem({ title, description }: PracticeItemProps) {
  return (
    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
      <div className="bg-indigo-100 p-2 rounded-full mr-3">
        <Clock className="h-4 w-4 text-indigo-600" />
      </div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

function getPractices(strengths: { name: string; score: number }[], weaknesses: { name: string; score: number }[]): PracticeItemProps[] {
  const practices: PracticeItemProps[] = [
    {
      title: "Morning Routine (10-15 minutes)",
      description: "Start your day with quick memory and attention exercises to boost cognitive alertness."
    },
    {
      title: "Midday Challenge (15-20 minutes)",
      description: "Focus on your weaker cognitive domains during peak mental energy hours."
    },
    {
      title: "Evening Review (5-10 minutes)",
      description: "Light practice on strengths to reinforce neural pathways before sleep."
    }
  ];

  return practices;
}

// Add this component to safely wrap StudyRecommendations
function SafeStudyRecommendations(props: {
  domainAnalyses: any[];
  strengths: any[];
  weaknesses: any[];
  getLearningStyle: () => any;
}) {
  // Create a safe version of learning style with fallbacks
  const safeLearningStyle = () => {
    try {
      const learningStyle = props.getLearningStyle();
      
      // If the learning style is invalid or missing primaryStyle, provide defaults
      if (!learningStyle || !learningStyle.primaryStyle) {
        console.warn("Invalid learning style detected, using fallback");
        return {
          primaryStyle: "Visual",
          analysisText: "Learning style analysis unavailable.",
          recommendations: [],
          description: "Visual learners learn best through seeing information.",
          teachingStrategies: ["Use visual aids", "Provide diagrams"],
          accommodations: ["Use color coding", "Provide written materials"]
        };
      }
      
      return learningStyle;
    } catch (error) {
      console.error("Error getting learning style:", error);
      return {
        primaryStyle: "Visual",
        analysisText: "Error retrieving learning style data.",
        recommendations: [],
        description: "Visual learners learn best through seeing information.",
        teachingStrategies: ["Use visual aids", "Provide diagrams"],
        accommodations: ["Use color coding", "Provide written materials"]
      };
    }
  };
  
  return (
    <StudyRecommendations
      domainAnalyses={props.domainAnalyses || []}
      strengths={props.strengths || []}
      weaknesses={props.weaknesses || []}
      learningStyle={safeLearningStyle()}
    />
  );
}

export default function ResultsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [errorSections, setErrorSections] = useState<Record<string, boolean>>({})
  const [savingReport, setSavingReport] = useState(false)
  
  // Use our enhanced analysis hook
  const {
    analysisData,
    loading: analysisLoading,
    error: analysisError,
    fetchAnalysis,
    createRadarData,
    getStrengthsAndWeaknesses,
    getRecommendations,
    getDomainInsights,
    overallScore: enhancedOverallScore,
    summary,
    getLearningStyle
  } = useCognitiveAnalysis(userData)

  // Original calculation function as fallback
  const calculateOverallScore = () => {
    if (!userData?.metrics) return 0
    
    try {
      const metrics = userData.metrics
      let totalScore = 0
      let count = 0
      
      // Check for skipped status in metrics
      const isSkipped = (gameName: string) => {
        // Get user ID from localStorage
        const userId = localStorage.getItem('userId')
        if (!userId) return false
        
        // Use direct metrics data to determine if game was skipped
        return metrics[gameName]?.is_skipped === true
      }
      
      if (metrics.memoryMatch?.memoryScore && !isSkipped('memoryMatch')) {
        totalScore += metrics.memoryMatch.memoryScore
        count++
      }
      
      if (metrics.towerOfHanoi?.problemSolvingScore && !isSkipped('towerOfHanoi')) {
        totalScore += metrics.towerOfHanoi.problemSolvingScore
        count++
      }
      
      if (metrics.wordPuzzle?.vocabularyScore && !isSkipped('wordPuzzle')) {
        totalScore += metrics.wordPuzzle.vocabularyScore
        count++
      }
      
      if (metrics.spatialPattern?.spatialScore && !isSkipped('spatialPattern')) {
        totalScore += metrics.spatialPattern.spatialScore
        count++
      }
      
      if (metrics.mazeRun?.spatialNavigationScore && !isSkipped('mazeRun')) {
        totalScore += metrics.mazeRun.spatialNavigationScore
        count++
      }
      
      if (metrics.stroopChallenge?.cognitiveFlexibilityScore && !isSkipped('stroopChallenge')) {
        totalScore += metrics.stroopChallenge.cognitiveFlexibilityScore
        count++
      }
      
      return count > 0 ? Math.round(totalScore / count) : 0
    } catch (err) {
      console.error("Error calculating overall score:", err)
      return 0
    }
  }

  // Use enhanced overall score if available
  const overallScore = enhancedOverallScore || calculateOverallScore()

  // A safe rendering function that catches errors
  const renderSafely = (sectionName: string, renderFn: () => JSX.Element | string): JSX.Element => {
    try {
      const result = renderFn()
      // If the result is a string, wrap it in a span
      if (typeof result === 'string') {
        return <span>{result}</span>
      }
      return result as JSX.Element
    } catch (err) {
      console.error(`Error rendering ${sectionName}:`, err)
      // Update error sections state
      if (setErrorSections) {
        setErrorSections(prev => ({ ...prev, [sectionName]: true }))
      } else {
        console.error("setErrorSections is not defined")
      }
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error loading {sectionName} section. Please try refreshing the page.</p>
        </div>
      )
    }
  }

  useEffect(() => {
    try {
    const storedData = localStorage.getItem("userData")
    if (!storedData) {
        setError("No assessment data found. Please complete the games first.")
        setLoading(false)
      return
    }

    const parsedData = JSON.parse(storedData)
      console.log("Loaded results data:", parsedData)
      
      if (!parsedData.metrics || Object.keys(parsedData.metrics).length === 0) {
        setError("No game metrics found. Please complete the assessments first.")
        setLoading(false)
      return
    }

    setUserData(parsedData)
    setLoading(false)
    } catch (err) {
      console.error("Error loading user data:", err)
      setError("Failed to load assessment results. Please try again.")
      setLoading(false)
    }
  }, [])

  // When analysis data is available, save to Supabase
  useEffect(() => {
    const saveReportToSupabase = async () => {
      // Only save if we have user data, analysis data and it's not loading
      if (userData && analysisData && !analysisLoading && !savingReport) {
        try {
          setSavingReport(true);
          console.log("Saving cognitive report to Supabase...");
          
          // Get user ID from local storage
          const userId = localStorage.getItem('userId');
          if (!userId) {
            console.log("No userId found, skipping report save to Supabase");
            return;
          }
          
          // Prepare report data
          const reportData = {
            overallScore: overallScore,
            summary: summary,
            strengths: getStrengthsAndWeaknesses().strengths,
            weaknesses: getStrengthsAndWeaknesses().weaknesses,
            domainAnalyses: getDomainInsights(),
            recommendations: getRecommendations(),
            // Cast to ExtendedCognitiveReport to access relationshipInsights
            relationshipInsights: (analysisData as any).relationshipInsights || [],
            learningStyle: getLearningStyle()
          };
          
          // Save to Supabase
          await saveUserReport(userId, reportData);
          console.log("Cognitive report saved to Supabase successfully");
        } catch (err) {
          console.error("Error saving report to Supabase:", err);
          // Don't set error state as it would disrupt the UI
    } finally {
          setSavingReport(false);
        }
      }
    };
    
    saveReportToSupabase();
  }, [analysisData, analysisLoading]);

  const handleStartOver = () => {
    try {
      const basicInfo = userData ? {
        name: userData.name,
        age: userData.age,
        education: userData.education,
        difficulty: userData.difficulty,
        id: userData.id, // Preserve the user ID for Supabase
        gameIndex: 0,
        metrics: {}
      } : null;
      
      if (basicInfo) {
        localStorage.setItem("userData", JSON.stringify(basicInfo));
      } else {
        localStorage.removeItem("userData");
      }
      
      router.push("/games");
    } catch (err) {
      console.error("Error resetting game:", err);
      setError("Failed to restart assessment. Please refresh the page.");
    }
  }

  const handleViewAllReports = () => {
    router.push("/my-reports");
  }

  const handleGenerateReport = async () => {
    // Report generation functionality has been removed
    console.log("Report feature removed");
  }

  // Use AI-enhanced domain scores when available
  const getDomainScores = () => {
    if (!userData?.metrics) {
      return {
        memory: 0,
        problemSolving: 0,
        vocabulary: 0,
        spatialReasoning: 0,
        navigation: 0,
        cognitiveFlexibility: 0
      }
    }
    
    try {
      const m = userData.metrics
      // Check for skipped status
      const wasSkipped = (game: string) => m[game]?.is_skipped === true
      
      return {
        memory: wasSkipped('memoryMatch') ? null : m.memoryMatch?.memoryScore || m.memoryMatch?.memory || 0,
        problemSolving: wasSkipped('towerOfHanoi') ? null : m.towerOfHanoi?.problemSolvingScore || 0,
        vocabulary: wasSkipped('wordPuzzle') ? null : m.wordPuzzle?.vocabularyScore || 0,
        spatialReasoning: wasSkipped('spatialPattern') ? null : m.spatialPattern?.spatialScore || m.spatialPattern?.spatialReasoningScore || 0,
        navigation: wasSkipped('mazeRun') ? null : m.mazeRun?.spatialNavigationScore || 0,
        cognitiveFlexibility: wasSkipped('stroopChallenge') ? null : m.stroopChallenge?.cognitiveFlexibilityScore || 0
      }
    } catch (err) {
      console.error("Error extracting domain scores:", err)
      return {
        memory: 0,
        problemSolving: 0,
        vocabulary: 0,
        spatialReasoning: 0,
        navigation: 0,
        cognitiveFlexibility: 0
      }
    }
  }

  // Use enhanced radar data when available
  const createOriginalRadarData = () => {
    const scores = getDomainScores()
    
    // Convert null values (skipped games) to a default value
    const formatScore = (score: number | null) => score === null ? 0 : score
    
    return {
      labels: [
        'Memory' + (scores.memory === null ? ' (No Data)' : ''),
        'Problem Solving' + (scores.problemSolving === null ? ' (No Data)' : ''),
        'Vocabulary' + (scores.vocabulary === null ? ' (No Data)' : ''),
        'Spatial Reasoning' + (scores.spatialReasoning === null ? ' (No Data)' : ''),
        'Navigation' + (scores.navigation === null ? ' (No Data)' : ''),
        'Cognitive Flexibility' + (scores.cognitiveFlexibility === null ? ' (No Data)' : '')
      ],
    datasets: [
      {
          label: 'Cognitive Performance',
        data: [
            formatScore(scores.memory),
            formatScore(scores.problemSolving),
            formatScore(scores.vocabulary),
            formatScore(scores.spatialReasoning),
            formatScore(scores.navigation),
            formatScore(scores.cognitiveFlexibility)
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    }
  }

  // Use enhanced comparison data
  const createComparisonData = () => {
    const scores = getDomainScores()
    
    // Convert null values (skipped games) to a default value
    const formatScore = (score: number | null) => score === null ? 0 : score
    
    return {
      labels: [
        'Memory' + (scores.memory === null ? ' (No Data)' : ''),
        'Problem Solving' + (scores.problemSolving === null ? ' (No Data)' : ''),
        'Vocabulary' + (scores.vocabulary === null ? ' (No Data)' : ''),
        'Spatial Reasoning' + (scores.spatialReasoning === null ? ' (No Data)' : ''),
        'Navigation' + (scores.navigation === null ? ' (No Data)' : ''),
        'Flexibility' + (scores.cognitiveFlexibility === null ? ' (No Data)' : '')
      ],
    datasets: [
      {
          label: 'Your Scores',
        data: [
            formatScore(scores.memory),
            formatScore(scores.problemSolving),
            formatScore(scores.vocabulary),
            formatScore(scores.spatialReasoning),
            formatScore(scores.navigation),
            formatScore(scores.cognitiveFlexibility)
          ],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    }
  }

  // Use AI-enhanced strengths and weaknesses
  const getDomainStrengthsAndWeaknesses = () => {
    return getStrengthsAndWeaknesses();
  }

  // Check if any games were skipped
  const hasSkippedGames = () => {
    if (!userData?.metrics) return false
    
    try {
      const metrics = userData.metrics
      const games = ["memoryMatch", "towerOfHanoi", "wordPuzzle", "spatialPattern", "mazeRun", "stroopChallenge"]
      
      return games.some(game => metrics[game]?.is_skipped === true)
    } catch (err) {
      console.error("Error checking for skipped games:", err)
      return false
    }
  }

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assessment results...</p>
            </div>
            </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>
            Go Home
          </Button>
                      </div>
                </div>
    )
  }

  const { strengths, weaknesses } = getDomainStrengthsAndWeaknesses()
  const rawRecommendations = getRecommendations().slice(0, 3);
  
  // Transform the raw recommendations (strings) into objects with title and description
  const recommendations = rawRecommendations.map(rec => {
    const parts = rec.split(':').map(part => part.trim());
    return {
      title: parts[0] || 'Recommendation',
      description: parts.length > 1 ? parts.slice(1).join(': ') : rec
    };
  });
  const domainInsights = getDomainInsights();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use the shared NavBar component */}
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="border-b bg-white pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <CardTitle className="text-2xl font-bold mb-1">
                  Cognitive Assessment Results
                </CardTitle>
              <CardDescription>
                  {userData?.name ? `${userData.name}'s Assessment` : 'Your Assessment'}
              </CardDescription>
            </div>
              <div className="flex space-x-2">
                <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleStartOver}
                      >
                        <RotateCcw className="h-4 w-4" />
              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                      <p>Start Over</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                    </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mt-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Summary
                </h3>
                <p className="mt-2 text-gray-700">
                  {summary}
                          </p>
                        </div>
                      </div>
            
            <Tabs defaultValue="overview" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="comparison">Comparisons</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="study">For Teachers</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="col-span-1 md:col-span-2 overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Cognitive Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      {renderSafely("cognitiveProfile", () => <CognitiveRadarChart data={createRadarData()} />)}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                      <ScoreGauge score={overallScore} />
                      <div className="mt-4 text-center">
                        {hasSkippedGames() ? (
                          <p className="text-sm text-amber-600">
                            <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                            Score includes estimated data from skipped games
                          </p>
                        ) : (
                        <p className="text-sm text-gray-500">Based on performance across all cognitive domains</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <ArrowUpRight className="h-5 w-5 text-green-500 mr-2" />
                        Top Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {strengths.map((strength: { name: string; score: number }, index: number) => (
                          <li key={index} className="flex items-center">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${getScoreBadgeColor(strength.score)} mr-3`}>
                              <span className="text-white font-bold">{strength.score}</span>
                        </div>
                            
                            <div>
                              <h4 className="font-medium">{strength.name}</h4>
                              <p className="text-sm text-gray-500">{getScoreLabel(strength.score)}</p>
                        </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <ArrowDownRight className="h-5 w-5 text-amber-500 mr-2" />
                        Areas for Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {weaknesses.map((weakness: { name: string; score: number }, index: number) => (
                          <li key={index} className="flex items-center">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${getScoreBadgeColor(weakness.score)} mr-3`}>
                              <span className="text-white font-bold">{weakness.score}</span>
                        </div>
                            
                            <div>
                              <h4 className="font-medium">{weakness.name}</h4>
                              <p className="text-sm text-gray-500">{getScoreLabel(weakness.score)}</p>
                        </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                        </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {domainInsights.map((domainData: DomainAnalysis, index: number) => (
                    <DomainDetail key={index} domainData={domainData} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    {renderSafely("domainComparison", () => <ComparisonChart data={createComparisonData()} />)}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(analysisData as any)?.relationshipInsights?.map((relationship: { domains: string[]; insight: string }, index: number) => (
                    <Card key={index}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {relationship.domains.join(" & ")} Relationship
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{relationship.insight}</p>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec: { title: string; description: string }, index: number) => (
                    <RecommendationCard
                      key={index}
                      title={rec.title}
                      description={rec.description}
                      icon={getRecommendationIcon(rec.title)}
                    />
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {getPractices(strengths, weaknesses).map((practice, index) => (
                        <PracticeItem
                          key={index}
                          title={practice.title}
                          description={practice.description}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="study" className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
                  <h3 className="font-medium text-blue-800 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Teacher Guidance
                  </h3>
                  <p className="mt-2 text-gray-700">
                    These recommendations are designed to help educators optimize their teaching approach based on this student's cognitive profile. Suggestions for learning styles, instructional strategies, and accommodations are tailored to the individual's strengths and areas for development.
                  </p>
                </div>
                
                <SafeStudyRecommendations
                  domainAnalyses={domainInsights}
                  strengths={strengths}
                  weaknesses={weaknesses}
                  getLearningStyle={getLearningStyle}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex flex-col items-center">
              <div className="flex space-x-4">
              <Button variant="outline" onClick={handleStartOver}>
                Start Over
              </Button>
                <Button onClick={handleViewAllReports} className="bg-indigo-600 hover:bg-indigo-700">
                  View All Reports
              </Button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                You can access your reports anytime from the "My Reports" section
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  description: string
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <div className="mt-2 mb-1">
        <Progress value={value} className="h-2" />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{description}</span>
        <span className="font-bold">{value}</span>
      </div>
    </div>
  )
}

interface DetailItemProps {
  label: string
  value: string | number
  icon?: React.ComponentType<{ className?: string }>
}

function DetailItem({ label, value, icon: Icon }: DetailItemProps) {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 text-indigo-500 mr-2" />}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  )
}

interface RelationshipItemProps {
  domain1: string
  domain2: string
  score1: number
  score2: number
}

function RelationshipItem({ domain1, domain2, score1, score2 }: RelationshipItemProps) {
  const difference = Math.abs(score1 - score2)
  const balance = 100 - difference

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {domain1} vs {domain2}
        </span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {balance >= 80 ? "Highly Balanced" : balance >= 60 ? "Balanced" : "Imbalanced"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 text-right text-sm">
          {domain1}: {score1}
        </div>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div className="bg-indigo-500 h-full" style={{ width: `${(score1 / (score1 + score2)) * 100}%` }}></div>
            <div className="bg-blue-400 h-full" style={{ width: `${(score2 / (score1 + score2)) * 100}%` }}></div>
          </div>
        </div>
        <div className="w-24 text-sm">
          {domain2}: {score2}
        </div>
      </div>
      <p className="text-xs text-gray-500">{getRelationshipDescription(domain1, domain2, score1, score2)}</p>
    </div>
  )
}