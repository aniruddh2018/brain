"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Brain, Clock, Download, Lightbulb, Zap, Award, ArrowUpRight, ArrowDownRight, RotateCcw, FileText, MoveRight, Star, Map, Puzzle, BarChart, TrendingUp, Check, BookOpen, Users, Briefcase, School, Medal, Coffee, BookOpenCheck, LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CognitiveRadarChart from "@/components/dashboard/radar-chart"
import ScoreGauge from "@/components/dashboard/score-gauge"
import ComparisonChart from "@/components/dashboard/comparison-chart"
import RecommendationCard from "@/components/dashboard/recommendation-card"
import PerformanceTimeline from "@/components/dashboard/performance-timeline"
import { Loader2 } from "lucide-react"
import { generateReport } from "@/lib/report-generator"

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
  Title
)

// Import the Doughnut component from chart.js/react-chartjs-2
import { Doughnut } from 'react-chartjs-2'

// Or if you prefer, create your own Doughnut component:
const DoughnutChart = ({ data, options }: { data: any, options: any }) => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

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
  return (
    <div>
      {/* This component displays detailed analysis of a cognitive domain */}
      {getDetailedAnalysis(domain, score)}
    </div>
  );
};

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

export default function ResultsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [errorSections, setErrorSections] = useState<Record<string, boolean>>({})

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

  const handleStartOver = () => {
    try {
      const basicInfo = userData ? {
        name: userData.name,
        age: userData.age,
        education: userData.education,
        difficulty: userData.difficulty,
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

  const handleGenerateReport = async () => {
    if (!userData) return
    
    try {
      setGenerating(true)
      setError("") // Clear any previous errors
      
      // Add a clear message about using Gemini
      console.log("Generating report using Google Gemini...")
      
      const generatedReport = await generateReport(userData)
      setReport(generatedReport)
      setGenerating(false)
    } catch (err) {
      console.error("Error generating report with Gemini:", err)
      setError("Failed to generate detailed report. Please verify your Gemini API key and try again.")
      setGenerating(false)
    }
  }
  
  const calculateOverallScore = () => {
    if (!userData?.metrics) return 0
    
    try {
  const metrics = userData.metrics
      let totalScore = 0
      let count = 0
      
      if (metrics.memoryMatch?.memoryScore) {
        totalScore += metrics.memoryMatch.memoryScore
        count++
      }
      
      if (metrics.towerOfHanoi?.problemSolvingScore) {
        totalScore += metrics.towerOfHanoi.problemSolvingScore
        count++
      }
      
      if (metrics.wordPuzzle?.vocabularyScore) {
        totalScore += metrics.wordPuzzle.vocabularyScore
        count++
      }
      
      if (metrics.spatialPattern?.spatialScore) {
        totalScore += metrics.spatialPattern.spatialScore
        count++
      }
      
      if (metrics.mazeRun?.spatialNavigationScore) {
        totalScore += metrics.mazeRun.spatialNavigationScore
        count++
      }
      
      if (metrics.stroopChallenge?.cognitiveFlexibilityScore) {
        totalScore += metrics.stroopChallenge.cognitiveFlexibilityScore
        count++
      }
      
      return count > 0 ? Math.round(totalScore / count) : 0
    } catch (err) {
      console.error("Error calculating overall score:", err)
      return 0
    }
  }

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
      return {
        memory: m.memoryMatch?.memoryScore || 0,
        problemSolving: m.towerOfHanoi?.problemSolvingScore || 0,
        vocabulary: m.wordPuzzle?.vocabularyScore || 0,
        spatialReasoning: m.spatialPattern?.spatialScore || 0,
        navigation: m.mazeRun?.spatialNavigationScore || 0,
        cognitiveFlexibility: m.stroopChallenge?.cognitiveFlexibilityScore || 0
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

  const createRadarData = () => {
    const scores = getDomainScores()
    
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
    }
  }

  const createComparisonData = () => {
    const scores = getDomainScores()
    
    return {
      labels: ['Memory', 'Problem Solving', 'Vocabulary', 'Spatial Reasoning', 'Navigation', 'Flexibility'],
    datasets: [
      {
          label: 'Your Scores',
        data: [
            scores.memory,
            scores.problemSolving,
            scores.vocabulary,
            scores.spatialReasoning,
            scores.navigation,
            scores.cognitiveFlexibility
          ],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }
      ]
    }
  }

  const getDomainStrengthsAndWeaknesses = () => {
    const scores = getDomainScores()
    const domains = [
      { name: 'Memory', score: scores.memory },
      { name: 'Problem Solving', score: scores.problemSolving },
      { name: 'Vocabulary', score: scores.vocabulary },
      { name: 'Spatial Reasoning', score: scores.spatialReasoning },
      { name: 'Navigation', score: scores.navigation },
      { name: 'Cognitive Flexibility', score: scores.cognitiveFlexibility }
    ]
    
    domains.sort((a, b) => b.score - a.score)
    
    return {
      strengths: domains.slice(0, 2),
      weaknesses: domains.slice(-2).reverse()
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full p-6 shadow-lg">
          <div className="text-center">
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
              <p>{error}</p>
            </div>
            <Button onClick={() => router.push('/')} className="mt-4">
              Return Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!userData || !userData.metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full p-6 shadow-lg">
          <div className="text-center">
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4">
              <p>No assessment data found. Please complete the games first.</p>
            </div>
            <Button onClick={() => router.push('/games')} className="mt-4">
              Start Assessment
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const overallScore = calculateOverallScore()
  const domainScores = getDomainScores()
  const { strengths, weaknesses } = getDomainStrengthsAndWeaknesses()
  
  // Create a safe rendering function that catches errors
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
      setErrorSections(prev => ({ ...prev, [sectionName]: true }))
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error loading {sectionName} section. Please try refreshing the page.</p>
        </div>
      )
    }
  }

  // Create data for doughnut chart with proper typing
  const createDomainDoughnutData = (domain: string, score: number) => {
    return {
      labels: ['Score', 'Remaining'],
    datasets: [
      {
          data: [score, 100 - score],
          backgroundColor: [
            score >= 80 ? 'rgba(34, 197, 94, 0.8)' : 
            score >= 60 ? 'rgba(59, 130, 246, 0.8)' : 
            score >= 40 ? 'rgba(234, 179, 8, 0.8)' : 
            'rgba(239, 68, 68, 0.8)',
            'rgba(229, 231, 235, 0.5)'
          ],
          borderWidth: 0,
          cutout: '75%'
        }
      ]
    }
  }

  // Create a safe doughnut chart component
  const SafeDoughnutChart = ({ domain, score }: { domain: string, score: number }) => {
    const chartData = createDomainDoughnutData(domain, score)
    
    // Simple fallback if chart creation fails
    if (!chartData) {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded">
          <div className="text-center">
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-sm text-gray-500">{domain}</div>
          </div>
        </div>
      )
    }
    
    return (
      <div className="relative h-32">
        <Doughnut 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              }
            }
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-sm text-gray-500">{domain}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Cognitive Assessment Dashboard</CardTitle>
              <CardDescription>
                Player: {userData.name} | Age: {userData.age} | Difficulty: {userData.difficulty}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                Start Over
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="comparison">Comparisons</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
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
                        <p className="text-sm text-gray-500">Based on performance across all cognitive domains</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Cognitive Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {strengths.map((strength, index) => (
                          <div key={index} className="flex items-center">
                            <Award className="h-8 w-8 text-yellow-500 mr-3" />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{strength.name}</span>
                                <span className="font-bold">{strength.score}/100</span>
                              </div>
                              <Progress value={strength.score} className="h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-center">
                            <ArrowUpRight className="h-8 w-8 text-blue-500 mr-3" />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{weakness.name}</span>
                                <span className="font-bold">{weakness.score}/100</span>
                              </div>
                              <Progress value={weakness.score} className="h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(domainScores).map(([domain, score]) => (
                        <TooltipProvider key={domain}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h3 className="font-semibold text-gray-700 text-sm mb-2">{domain}</h3>
                                <div className="flex items-center justify-between">
                                  <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
                                  <div className={`text-xs px-2 py-1 rounded-full ${getScoreBadgeColor(score)}`}>
                                    {getScoreLabel(score)}
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getScoreDescription(score)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(domainScores).map(([domain, score]) => (
                    <Card key={domain}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-indigo-500" />
                          {domain} Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Score</span>
                            <span className="font-bold">{score}/100</span>
                        </div>
                          <Progress value={score} className="h-2 mb-4" />

                        <div className="pt-2">
                          <h4 className="text-sm font-semibold mb-1">Analysis</h4>
                          <p className="text-sm text-gray-600">
                              {renderSafely(domain, () => <DomainAnalysis domain={domain} score={score} />)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cognitive Domain Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    {renderSafely("comparisonChart", () => <ComparisonChart data={createComparisonData()} />)}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Domain Relationships</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(domainScores).map(([domain1, score1]) =>
                          Object.entries(domainScores).map(([domain2, score2]) =>
                            domain1 !== domain2 && (
                        <RelationshipItem
                                key={`${domain1}-${domain2}`}
                                domain1={domain1}
                                domain2={domain2}
                                score1={score1}
                                score2={score2}
                              />
                            )
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Performance Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      {renderSafely("performanceTimeline", () => <PerformanceTimeline data={createComparisonData()} />)}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cognitive Balance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        This analysis shows how balanced your cognitive abilities are across different domains. A more
                        balanced profile indicates versatile cognitive abilities.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <BalanceCard
                          title="Analytical vs. Creative"
                          score1={Math.round(
                            (domainScores.problemSolving + domainScores.navigation) / 2,
                          )}
                          score2={Math.round(
                            (domainScores.vocabulary + domainScores.spatialReasoning) / 2,
                          )}
                          label1="Analytical"
                          label2="Creative"
                        />

                        <BalanceCard
                          title="Processing Speed vs. Accuracy"
                          score1={Math.round(
                            domainScores.memory * 20 + domainScores.cognitiveFlexibility * 20,
                          )}
                          score2={Math.round((domainScores.memory + domainScores.cognitiveFlexibility) / 2)}
                          label1="Speed"
                          label2="Accuracy"
                          reverse={true}
                        />

                        <BalanceCard
                          title="Visual vs. Verbal"
                          score1={Math.round(
                            (domainScores.spatialReasoning + domainScores.navigation) / 2,
                          )}
                          score2={Math.round(
                            (domainScores.vocabulary + domainScores.cognitiveFlexibility) /
                              2,
                          )}
                          label1="Visual"
                          label2="Verbal"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {renderSafely('recommendations', () => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {getRecommendations(strengths, weaknesses).map((rec, index) => (
                      <RecommendationCard 
                        key={index} 
                        title={rec.title} 
                        description={rec.description} 
                        icon={rec.icon} 
                      />
                  ))}
                </div>
                ))}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cognitive Training Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600 mb-4">
                        Based on your cognitive assessment results, we've created a personalized training plan to help
                        improve your cognitive abilities over time.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {strengths.map((strength, index) => (
                        <TrainingCard
                            key={index}
                            title={`Focus on ${strength.name}`}
                            focus={`Focus on ${strength.name}`}
                            activities={getTrainingActivities(strength.name)}
                          />
                        ))}

                        <TrainingCard
                          title="Week 3-4"
                          focus={`Focus on ${weaknesses[0].name}`}
                          activities={getTrainingActivities(weaknesses[0].name)}
                        />

                        <TrainingCard
                          title="Week 5-6"
                          focus={`Focus on ${weaknesses[1].name}`}
                          activities={getTrainingActivities(weaknesses[1].name)}
                        />
                      </div>

                      <h3 className="text-lg font-semibold mb-3">Daily Practice Recommendations</h3>
                      <div className="space-y-3">
                        <PracticeItem
                          title="Morning Routine (10-15 minutes)"
                          description="Start your day with quick memory and attention exercises to boost cognitive alertness."
                        />

                        <PracticeItem
                          title="Midday Challenge (15-20 minutes)"
                          description="Focus on your weaker cognitive domains during peak mental energy hours."
                        />

                        <PracticeItem
                          title="Evening Review (5-10 minutes)"
                          description="Light practice on strengths to reinforce neural pathways before sleep."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Real-World Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Your cognitive profile has implications for various real-world activities and skills. Here's how
                        your cognitive strengths can be applied in everyday life.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ApplicationCard
                          title="Academic/Professional"
                          strengths={getAcademicApplications(strengths)}
                          improvements={getAcademicApplications(weaknesses, true)}
                        />

                        <ApplicationCard
                          title="Daily Life"
                          strengths={getDailyLifeApplications(strengths)}
                          improvements={getDailyLifeApplications(weaknesses, true)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <div className="mt-8 flex flex-col items-center">
              {!report && (
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={generating}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center"
                >
                  {generating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Generating with Gemini...
                    </>
                  ) : (
                    <>
                      {/* You could add a Gemini logo here */}
                      <FileText className="mr-2 h-4 w-4" /> Generate Report with Gemini
                    </>
                  )}
                </Button>
              )}

              {report && (
                <div className="w-full p-4 bg-white rounded-lg mb-4">
                  <h3 className="text-xl font-bold mb-2">Cognitive Assessment Report</h3>
                  <div className="whitespace-pre-line">{report}</div>
                </div>
              )}

              <Button variant="outline" onClick={handleStartOver}>
                Start Over
              </Button>
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

interface BalanceCardProps {
  title: string
  score1: number
  score2: number
  label1: string
  label2: string
  reverse?: boolean
}

function BalanceCard({ title, score1, score2, label1, label2, reverse = false }: BalanceCardProps) {
  const normalizedScore1 = Math.min(100, Math.max(0, score1))
  const normalizedScore2 = Math.min(100, Math.max(0, score2))

  const total = normalizedScore1 + normalizedScore2
  const balance = total > 0 ? 100 - (Math.abs(normalizedScore1 - normalizedScore2) / (total / 2)) * 100 : 50

  const isBalanced = balance >= 70

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-16 text-right text-xs">{label1}</div>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div
              className={`${reverse ? "bg-blue-400" : "bg-indigo-500"} h-full`}
              style={{ width: `${(normalizedScore1 / (normalizedScore1 + normalizedScore2)) * 100}%` }}
            ></div>
            <div
              className={`${reverse ? "bg-indigo-500" : "bg-blue-400"} h-full`}
              style={{ width: `${(normalizedScore2 / (normalizedScore1 + normalizedScore2)) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="w-16 text-xs">{label2}</div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Balance Score</span>
        <span className={`text-xs font-medium ${isBalanced ? "text-green-600" : "text-amber-600"}`}>
          {Math.round(balance)}%
        </span>
      </div>
    </div>
  )
}

interface TrainingCardProps {
  title: string
  focus: string
  activities: string[]
}

function TrainingCard({ title, focus, activities }: TrainingCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-blue-600 mb-3">{focus}</p>
      <ul className="space-y-2">
        {activities.map((activity, index) => (
          <li key={index} className="text-sm flex items-start">
            <span className="text-green-500 mr-2">•</span>
            {activity}
          </li>
        ))}
      </ul>
    </div>
  )
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

interface ApplicationCardProps {
  title: string
  strengths: string[]
  improvements: string[]
}

function ApplicationCard({ title, strengths, improvements }: ApplicationCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-green-600 flex items-center mb-2">
          <ArrowUpRight className="h-4 w-4 mr-1" /> Leverage Your Strengths
        </h4>
        <ul className="space-y-1">
          {strengths.map((item, index) => (
            <li key={index} className="text-sm flex items-start">
              <span className="text-green-500 mr-2">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-medium text-blue-600 flex items-center mb-2">
          <ArrowDownRight className="h-4 w-4 mr-1" /> Areas to Develop
        </h4>
        <ul className="space-y-1">
          {improvements.map((item, index) => (
            <li key={index} className="text-sm flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-blue-600"
  if (score >= 40) return "text-yellow-600"
  return "text-red-600"
}

function getScoreBadgeColor(score: number) {
  if (score >= 80) return "bg-green-100 text-green-800"
  if (score >= 60) return "bg-blue-100 text-blue-800"
  if (score >= 40) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Average"
  return "Needs Development"
}

function getScoreDescription(score: number) {
  if (score >= 80) return "Your cognitive abilities are well developed across multiple domains."
  if (score >= 60) return "You show good cognitive performance with some areas of excellence."
  if (score >= 40) return "Your cognitive abilities are in the average range with potential for improvement."
  return "There are opportunities to develop and strengthen your cognitive abilities."
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

interface Recommendation {
  title: string;
  description: string;
  icon: LucideIcon;
}

function getRecommendations(
  strengths: { name: string; score: number }[], 
  weaknesses: { name: string; score: number }[]
): Recommendation[] {
  const domainIcons: Record<string, LucideIcon> = {
    'Memory': Brain,
    'Problem Solving': Puzzle,
    'Vocabulary': BookOpen,
    'Spatial Reasoning': Map,
    'Navigation': Map,
    'Cognitive Flexibility': Activity
  };

  const recommendations: Recommendation[] = [];

  if (strengths.length > 0) {
    const primaryStrength = strengths[0];
    recommendations.push({
      title: `Leverage Your ${primaryStrength.name} Strengths`,
      description: `Your exceptional ${primaryStrength.name.toLowerCase()} abilities can be applied to enhance learning and problem-solving in various contexts.`,
      icon: domainIcons[primaryStrength.name] || Brain
    });
  }

  if (weaknesses.length > 0) {
    const primaryWeakness = weaknesses[0];
    recommendations.push({
      title: `Develop ${primaryWeakness.name} Skills`,
      description: `Targeted exercises to strengthen your ${primaryWeakness.name.toLowerCase()} abilities can lead to significant improvements in overall cognitive performance.`,
      icon: domainIcons[primaryWeakness.name] || Lightbulb
    });
  }

  if (strengths.length > 0 && weaknesses.length > 0) {
    recommendations.push({
      title: "Balance Your Cognitive Profile",
      description: `Work on transferring strategies from your strong ${strengths[0].name.toLowerCase()} domain to improve performance in ${weaknesses[0].name.toLowerCase()}.`,
      icon: Activity
    });
  }

  recommendations.push({
    title: "Daily Cognitive Training",
    description: "Incorporate short daily exercises across different cognitive domains for balanced development and maintenance of cognitive abilities.",
    icon: Medal
  });

  return recommendations;
}

function getTrainingActivities(domain: string) {
  const activities: { [key: string]: string[] } = {
    Memory: ["Pattern memorization games", "Spaced repetition practice", "Dual n-back exercises"],
    "Problem Solving": ["Logic puzzles and riddles", "Strategic board games", "Algorithm visualization"],
    Vocabulary: ["Word association games", "Etymology exploration", "Context-based word learning"],
    "Spatial Reasoning": ["3D mental rotation exercises", "Complex pattern recreation", "Spatial visualization tasks"],
    Navigation: ["Mental mapping exercises", "Landmark identification practice", "Alternative route planning"],
    "Cognitive Flexibility": ["Task-switching games", "Interference control exercises", "Mindfulness meditation"],
  }

  return (
    activities[domain] || [
      "Targeted cognitive exercises",
      "Progressive difficulty training",
      "Regular practice sessions",
    ]
  )
}

function getAcademicApplications(domains: { name: string; score: number }[], isWeakness = false) {
  const applications: { [key: string]: { strength: string; weakness: string } } = {
    Memory: {
      strength: "Excel at learning new information and recalling facts for exams and presentations",
      weakness: "Use memory aids and structured note-taking to improve information retention",
    },
    "Problem Solving": {
      strength: "Tackle complex projects and find innovative solutions to challenging problems",
      weakness: "Practice breaking down problems into smaller, manageable components",
    },
    Vocabulary: {
      strength: "Communicate ideas clearly and understand complex written materials",
      weakness: "Build reading comprehension through regular exposure to diverse texts",
    },
    "Spatial Reasoning": {
      strength: "Excel in fields requiring visual thinking like design, engineering, or mathematics",
      weakness: "Use visual aids and diagrams to improve understanding of spatial concepts",
    },
    Navigation: {
      strength: "Easily navigate new environments and understand spatial relationships in projects",
      weakness: "Practice creating mental maps and using landmarks for orientation",
    },
    "Cognitive Flexibility": {
      strength: "Adapt quickly to changing priorities and manage multiple projects effectively",
      weakness: "Develop structured approaches to task-switching and managing competing demands",
    },
  }

  return domains
    .map((domain) => (isWeakness ? applications[domain.name]?.weakness : applications[domain.name]?.strength))
    .filter(Boolean)
}

function getDailyLifeApplications(domains: { name: string; score: number }[], isWeakness = false) {
  const applications: { [key: string]: { strength: string; weakness: string } } = {
    Memory: {
      strength: "Remember important dates, names, and details without relying on reminders",
      weakness: "Create systems for tracking important information in daily life",
    },
    "Problem Solving": {
      strength: "Find efficient solutions to everyday challenges and make sound decisions",
      weakness: "Practice methodical approaches to household problems and daily decisions",
    },
    Vocabulary: {
      strength: "Express yourself precisely and understand nuanced communication",
      weakness: "Expand vocabulary through reading and conversation practice",
    },
    "Spatial Reasoning": {
      strength: "Easily arrange furniture, pack efficiently, and navigate without GPS",
      weakness: "Use visual planning tools for spatial tasks like home organization",
    },
    Navigation: {
      strength: "Find your way in unfamiliar places and remember locations easily",
      weakness: "Build familiarity with new areas gradually and practice mental mapping",
    },
    "Cognitive Flexibility": {
      strength: "Handle interruptions gracefully and adapt to changing plans",
      weakness: "Develop routines that incorporate flexibility and practice mindfulness",
    },
  }

  return domains
    .map((domain) => (isWeakness ? applications[domain.name]?.weakness : applications[domain.name]?.strength))
    .filter(Boolean)
}

