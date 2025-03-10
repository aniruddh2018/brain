"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Brain, Clock, Download, Lightbulb, Zap, Award, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CognitiveRadarChart from "@/components/dashboard/radar-chart"
import ScoreGauge from "@/components/dashboard/score-gauge"
import ComparisonChart from "@/components/dashboard/comparison-chart"
import RecommendationCard from "@/components/dashboard/recommendation-card"
import PerformanceTimeline from "@/components/dashboard/performance-timeline"
import { Loader2 } from "lucide-react"
import { generateReport } from "@/lib/report-generator"

export default function ResultsPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<string>("")
  const [generatingReport, setGeneratingReport] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem("userData")
    if (!storedData) {
      router.push("/")
      return
    }

    const parsedData = JSON.parse(storedData)

    // Check if all games are completed
    if (!parsedData.metrics || Object.keys(parsedData.metrics).length < 6) {
      router.push("/games")
      return
    }

    setUserData(parsedData)
    setLoading(false)
  }, [router])

  const handleStartOver = () => {
    localStorage.removeItem("userData")
    router.push("/")
  }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    try {
      const generatedReport = await generateReport(userData)
      setReport(generatedReport)
    } catch (error) {
      console.error("Error generating report:", error)
      setReport("There was an error generating your cognitive assessment report. Please try again later.")
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const metrics = userData.metrics

  // Calculate overall cognitive score (weighted average of all domains)
  const overallScore = Math.round(
    metrics.memoryMatch.memoryScore * 0.15 +
      metrics.towerOfHanoi.problemSolvingScore * 0.2 +
      metrics.wordPuzzle.vocabularyScore * 0.15 +
      metrics.spatialPattern.spatialScore * 0.15 +
      metrics.mazeRun.spatialNavigationScore * 0.15 +
      metrics.stroopChallenge.cognitiveFlexibilityScore * 0.2,
  )

  // Identify strengths and weaknesses
  const allScores = [
    { name: "Memory", score: metrics.memoryMatch.memoryScore },
    { name: "Problem Solving", score: metrics.towerOfHanoi.problemSolvingScore },
    { name: "Vocabulary", score: metrics.wordPuzzle.vocabularyScore },
    { name: "Spatial Reasoning", score: metrics.spatialPattern.spatialScore },
    { name: "Navigation", score: metrics.mazeRun.spatialNavigationScore },
    { name: "Cognitive Flexibility", score: metrics.stroopChallenge.cognitiveFlexibilityScore },
  ]

  const sortedScores = [...allScores].sort((a, b) => b.score - a.score)
  const strengths = sortedScores.slice(0, 2)
  const weaknesses = sortedScores.slice(-2)

  // Prepare data for radar chart
  const radarData = {
    labels: ["Memory", "Problem Solving", "Vocabulary", "Spatial Reasoning", "Navigation", "Cognitive Flexibility"],
    datasets: [
      {
        label: "Your Performance",
        data: [
          metrics.memoryMatch.memoryScore,
          metrics.towerOfHanoi.problemSolvingScore,
          metrics.wordPuzzle.vocabularyScore,
          metrics.spatialPattern.spatialScore,
          metrics.mazeRun.spatialNavigationScore,
          metrics.stroopChallenge.cognitiveFlexibilityScore,
        ],
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgb(99, 102, 241)",
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "#fff",
      },
    ],
  }

  // Prepare comparison data
  const comparisonData = {
    labels: ["Memory", "Problem Solving", "Vocabulary", "Spatial", "Navigation", "Flexibility"],
    datasets: [
      {
        label: "Your Scores",
        data: [
          metrics.memoryMatch.memoryScore,
          metrics.towerOfHanoi.problemSolvingScore,
          metrics.wordPuzzle.vocabularyScore,
          metrics.spatialPattern.spatialScore,
          metrics.mazeRun.spatialNavigationScore,
          metrics.stroopChallenge.cognitiveFlexibilityScore,
        ],
        backgroundColor: "rgba(99, 102, 241, 0.7)",
      },
      {
        label: "Average Scores",
        data: [70, 65, 72, 68, 67, 63],
        backgroundColor: "rgba(156, 163, 175, 0.5)",
      },
    ],
  }

  // Generate recommendations based on weaknesses
  const recommendations = [
    {
      title: `Improve ${weaknesses[0].name}`,
      description: getRecommendation(weaknesses[0].name),
      icon: Lightbulb,
    },
    {
      title: `Boost ${weaknesses[1].name}`,
      description: getRecommendation(weaknesses[1].name),
      icon: Zap,
    },
  ]

  // Performance timeline data (simulated improvement over time)
  const timelineData = {
    labels: ["Day 1", "Day 3", "Day 7", "Day 14", "Day 30"],
    datasets: [
      {
        label: "Projected Improvement",
        data: [
          overallScore,
          Math.min(100, overallScore + 3),
          Math.min(100, overallScore + 7),
          Math.min(100, overallScore + 12),
          Math.min(100, overallScore + 18),
        ],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
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
                      <CognitiveRadarChart data={radarData} />
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
                      {allScores.map((item, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h3 className="font-semibold text-gray-700 text-sm mb-2">{item.name}</h3>
                                <div className="flex items-center justify-between">
                                  <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</div>
                                  <div className={`text-xs px-2 py-1 rounded-full ${getScoreBadgeColor(item.score)}`}>
                                    {getScoreLabel(item.score)}
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getScoreDescription(item.name)}</p>
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
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-indigo-500" />
                        Memory Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Memory Score</span>
                          <span className="font-bold">{metrics.memoryMatch.memoryScore}/100</span>
                        </div>
                        <Progress value={metrics.memoryMatch.memoryScore} className="h-2 mb-4" />

                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem
                            label="Accuracy"
                            value={`${metrics.memoryMatch.accuracy.toFixed(1)}%`}
                            icon={Activity}
                          />
                          <DetailItem
                            label="Reaction Time"
                            value={`${metrics.memoryMatch.avgReactionTime.toFixed(2)}s`}
                            icon={Clock}
                          />
                          <DetailItem
                            label="Total Time"
                            value={`${metrics.memoryMatch.totalTime.toFixed(1)}s`}
                            icon={Clock}
                          />
                          <DetailItem label="Moves" value={metrics.memoryMatch.moves} icon={Activity} />
                        </div>

                        <div className="pt-2">
                          <h4 className="text-sm font-semibold mb-1">Analysis</h4>
                          <p className="text-sm text-gray-600">
                            {getDetailedAnalysis("Memory", metrics.memoryMatch.memoryScore)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                        Problem Solving Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Problem Solving Score</span>
                          <span className="font-bold">{metrics.towerOfHanoi.problemSolvingScore}/100</span>
                        </div>
                        <Progress value={metrics.towerOfHanoi.problemSolvingScore} className="h-2 mb-4" />

                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem label="Planning Score" value={metrics.towerOfHanoi.planningScore} icon={Brain} />
                          <DetailItem
                            label="Efficiency"
                            value={`${metrics.towerOfHanoi.efficiency.toFixed(1)}%`}
                            icon={Zap}
                          />
                          <DetailItem label="Moves Used" value={metrics.towerOfHanoi.moves} icon={Activity} />
                          <DetailItem label="Optimal Moves" value={metrics.towerOfHanoi.optimalMoves} icon={Award} />
                        </div>

                        <div className="pt-2">
                          <h4 className="text-sm font-semibold mb-1">Analysis</h4>
                          <p className="text-sm text-gray-600">
                            {getDetailedAnalysis("Problem Solving", metrics.towerOfHanoi.problemSolvingScore)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-indigo-500" />
                        Vocabulary Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Vocabulary Score</span>
                          <span className="font-bold">{metrics.wordPuzzle.vocabularyScore}/100</span>
                        </div>
                        <Progress value={metrics.wordPuzzle.vocabularyScore} className="h-2 mb-4" />

                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem label="Processing Speed" value={metrics.wordPuzzle.processingSpeed} icon={Zap} />
                          <DetailItem
                            label="Accuracy"
                            value={`${metrics.wordPuzzle.accuracy.toFixed(1)}%`}
                            icon={Activity}
                          />
                          <DetailItem
                            label="Avg Word Time"
                            value={`${metrics.wordPuzzle.avgWordTime.toFixed(2)}s`}
                            icon={Clock}
                          />
                          <DetailItem
                            label="Correct Words"
                            value={`${metrics.wordPuzzle.correctAnswers}/${metrics.wordPuzzle.totalWords}`}
                            icon={Award}
                          />
                        </div>

                        <div className="pt-2">
                          <h4 className="text-sm font-semibold mb-1">Analysis</h4>
                          <p className="text-sm text-gray-600">
                            {getDetailedAnalysis("Vocabulary", metrics.wordPuzzle.vocabularyScore)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-indigo-500" />
                        Spatial Reasoning Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Spatial Score</span>
                          <span className="font-bold">{metrics.spatialPattern.spatialScore}/100</span>
                        </div>
                        <Progress value={metrics.spatialPattern.spatialScore} className="h-2 mb-4" />

                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem
                            label="Pattern Recognition"
                            value={metrics.spatialPattern.patternRecognitionScore}
                            icon={Brain}
                          />
                          <DetailItem label="Max Level" value={metrics.spatialPattern.maxLevel} icon={Award} />
                          <DetailItem
                            label="Pattern Length"
                            value={metrics.spatialPattern.maxPatternLength}
                            icon={Activity}
                          />
                          <DetailItem
                            label="Reaction Time"
                            value={`${metrics.spatialPattern.reactionTime.toFixed(2)}s`}
                            icon={Clock}
                          />
                        </div>

                        <div className="pt-2">
                          <h4 className="text-sm font-semibold mb-1">Analysis</h4>
                          <p className="text-sm text-gray-600">
                            {getDetailedAnalysis("Spatial Reasoning", metrics.spatialPattern.spatialScore)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-indigo-500" />
                        Spatial Navigation Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Navigation Score</span>
                          <span className="font-bold">{metrics.mazeRun.spatialNavigationScore}/100</span>
                        </div>
                        <Progress value={metrics.mazeRun.spatialNavigationScore} className="h-2 mb-4" />

                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem label="Planning Score" value={metrics.mazeRun.planningScore} icon={Brain} />
                          <DetailItem
                            label="Efficiency"
                            value={`${metrics.mazeRun.efficiency.toFixed(1)}%`}
                            icon={Zap}
                          />
                          <DetailItem label="Backtracks" value={metrics.mazeRun.backtrackCount} icon={Activity} />
                          <DetailItem
                            label="Moves"
                            value={`${metrics.mazeRun.moves} (Opt: ${metrics.mazeRun.optimalPath})`}
                            icon={Activity}
                          />
                        </div>

                        <div className="pt-2">
                          <h4 className="text-sm font-semibold mb-1">Analysis</h4>
                          <p className="text-sm text-gray-600">
                            {getDetailedAnalysis("Navigation", metrics.mazeRun.spatialNavigationScore)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-indigo-500" />
                        Cognitive Flexibility Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Flexibility Score</span>
                          <span className="font-bold">{metrics.stroopChallenge.cognitiveFlexibilityScore}/100</span>
                        </div>
                        <Progress value={metrics.stroopChallenge.cognitiveFlexibilityScore} className="h-2 mb-4" />

                        <div className="grid grid-cols-2 gap-4">
                          <DetailItem
                            label="Attention Control"
                            value={metrics.stroopChallenge.attentionControlScore}
                            icon={Brain}
                          />
                          <DetailItem
                            label="Accuracy"
                            value={`${metrics.stroopChallenge.accuracy.toFixed(1)}%`}
                            icon={Activity}
                          />
                          <DetailItem
                            label="Response Time"
                            value={`${metrics.stroopChallenge.avgResponseTime.toFixed(2)}s`}
                            icon={Clock}
                          />
                          <DetailItem
                            label="Interference Effect"
                            value={`${metrics.stroopChallenge.interferenceEffect.toFixed(2)}s`}
                            icon={Activity}
                          />
                        </div>

                        <div className="pt-2">
                          <h4 className="text-sm font-semibold mb-1">Analysis</h4>
                          <p className="text-sm text-gray-600">
                            {getDetailedAnalysis(
                              "Cognitive Flexibility",
                              metrics.stroopChallenge.cognitiveFlexibilityScore,
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cognitive Domain Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ComparisonChart data={comparisonData} />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Domain Relationships</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <RelationshipItem
                          domain1="Memory"
                          domain2="Problem Solving"
                          score1={metrics.memoryMatch.memoryScore}
                          score2={metrics.towerOfHanoi.problemSolvingScore}
                        />
                        <RelationshipItem
                          domain1="Vocabulary"
                          domain2="Cognitive Flexibility"
                          score1={metrics.wordPuzzle.vocabularyScore}
                          score2={metrics.stroopChallenge.cognitiveFlexibilityScore}
                        />
                        <RelationshipItem
                          domain1="Spatial Reasoning"
                          domain2="Navigation"
                          score1={metrics.spatialPattern.spatialScore}
                          score2={metrics.mazeRun.spatialNavigationScore}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Performance Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      <PerformanceTimeline data={timelineData} />
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
                            (metrics.towerOfHanoi.problemSolvingScore + metrics.mazeRun.planningScore) / 2,
                          )}
                          score2={Math.round(
                            (metrics.wordPuzzle.vocabularyScore + metrics.spatialPattern.patternRecognitionScore) / 2,
                          )}
                          label1="Analytical"
                          label2="Creative"
                        />

                        <BalanceCard
                          title="Processing Speed vs. Accuracy"
                          score1={Math.round(
                            metrics.memoryMatch.avgReactionTime * 20 + metrics.stroopChallenge.avgResponseTime * 20,
                          )}
                          score2={Math.round((metrics.memoryMatch.accuracy + metrics.stroopChallenge.accuracy) / 2)}
                          label1="Speed"
                          label2="Accuracy"
                          reverse={true}
                        />

                        <BalanceCard
                          title="Visual vs. Verbal"
                          score1={Math.round(
                            (metrics.spatialPattern.spatialScore + metrics.mazeRun.spatialNavigationScore) / 2,
                          )}
                          score2={Math.round(
                            (metrics.wordPuzzle.vocabularyScore + metrics.stroopChallenge.cognitiveFlexibilityScore) /
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {recommendations.map((rec, index) => (
                    <RecommendationCard key={index} title={rec.title} description={rec.description} icon={rec.icon} />
                  ))}
                </div>

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
                        <TrainingCard
                          title="Week 1-2"
                          focus={`Focus on ${weaknesses[0].name}`}
                          activities={getTrainingActivities(weaknesses[0].name)}
                        />

                        <TrainingCard
                          title="Week 3-4"
                          focus={`Focus on ${weaknesses[1].name}`}
                          activities={getTrainingActivities(weaknesses[1].name)}
                        />

                        <TrainingCard
                          title="Week 5-6"
                          focus="Balanced Training"
                          activities={[
                            "Combine exercises from all cognitive domains",
                            "Increase difficulty progressively",
                            "Track improvements weekly",
                          ]}
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
                <Button onClick={handleGenerateReport} disabled={generatingReport} className="mb-4">
                  {generatingReport ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    "Generate Detailed Report"
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
  // Normalize scores to be between 0-100
  const normalizedScore1 = Math.min(100, Math.max(0, score1))
  const normalizedScore2 = Math.min(100, Math.max(0, score2))

  // Calculate balance percentage (how close the scores are)
  const total = normalizedScore1 + normalizedScore2
  const balance = total > 0 ? 100 - (Math.abs(normalizedScore1 - normalizedScore2) / (total / 2)) * 100 : 50

  // Determine if the balance is good
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

// Helper functions for text content
function getScoreColor(score: number) {
  if (score >= 85) return "text-green-600"
  if (score >= 70) return "text-blue-600"
  if (score >= 50) return "text-amber-600"
  return "text-red-600"
}

function getScoreBadgeColor(score: number) {
  if (score >= 85) return "bg-green-100 text-green-800"
  if (score >= 70) return "bg-blue-100 text-blue-800"
  if (score >= 50) return "bg-amber-100 text-amber-800"
  return "bg-red-100 text-red-800"
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 50) return "Average"
  return "Needs Work"
}

function getScoreDescription(domain: string) {
  const descriptions: { [key: string]: string } = {
    Memory: "Ability to retain and recall information over short periods",
    "Problem Solving": "Ability to analyze situations and find logical solutions",
    Vocabulary: "Word recognition and language processing abilities",
    "Spatial Reasoning": "Ability to understand and manipulate visual patterns",
    Navigation: "Ability to plan routes and navigate spatial environments",
    "Cognitive Flexibility": "Ability to switch between different mental tasks",
  }

  return descriptions[domain] || "Cognitive ability score"
}

function getDetailedAnalysis(domain: string, score: number) {
  if (score >= 85) {
    const excellentAnalysis: { [key: string]: string } = {
      Memory:
        "You demonstrate exceptional visual memory abilities, with strong recall and pattern recognition. Your quick reaction time suggests efficient memory processing.",
      "Problem Solving":
        "Your problem-solving skills are excellent, showing strong logical reasoning and efficient solution planning. You approach problems methodically and find optimal solutions.",
      Vocabulary:
        "You exhibit outstanding word recognition and processing abilities. Your vocabulary skills are well-developed, allowing for quick and accurate word processing.",
      "Spatial Reasoning":
        "Your spatial reasoning abilities are exceptional, with excellent pattern recognition and visual processing. You can easily identify and remember complex spatial patterns.",
      Navigation:
        "You demonstrate superior spatial navigation skills, planning efficient routes with minimal backtracking. Your spatial awareness and planning abilities are highly developed.",
      "Cognitive Flexibility":
        "Your cognitive flexibility is excellent, showing strong ability to switch between tasks and resist interference. Your attention control and mental adaptability are well-developed.",
    }
    return excellentAnalysis[domain] || "You show excellent performance in this cognitive domain."
  } else if (score >= 70) {
    const goodAnalysis: { [key: string]: string } = {
      Memory:
        "You show good memory abilities with solid recall and recognition. Your visual memory is functioning well, though there's room for improvement in reaction time.",
      "Problem Solving":
        "Your problem-solving skills are good, with effective logical reasoning. You find solutions efficiently, though occasionally not taking the most optimal path.",
      Vocabulary:
        "You demonstrate good word recognition and processing. Your vocabulary skills are solid, with room for improvement in processing speed.",
      "Spatial Reasoning":
        "Your spatial reasoning is good, with effective pattern recognition. You can identify and remember spatial patterns well, with some room for improvement.",
      Navigation:
        "You show good spatial navigation abilities, planning routes effectively with occasional backtracking. Your spatial awareness is well-developed.",
      "Cognitive Flexibility":
        "Your cognitive flexibility is good, showing ability to switch between tasks and manage interference. Your attention control is effective.",
    }
    return goodAnalysis[domain] || "You show good performance in this cognitive domain."
  } else if (score >= 50) {
    const averageAnalysis: { [key: string]: string } = {
      Memory:
        "Your memory abilities are average, with moderate recall and recognition. There's potential for improvement in both accuracy and reaction time.",
      "Problem Solving":
        "Your problem-solving skills are average, showing basic logical reasoning. You can find solutions, though often not taking the most efficient approach.",
      Vocabulary:
        "You demonstrate average word recognition and processing. Your vocabulary skills are functional but could benefit from further development.",
      "Spatial Reasoning":
        "Your spatial reasoning is average, with basic pattern recognition. You can identify simple patterns but may struggle with more complex ones.",
      Navigation:
        "You show average spatial navigation abilities, with some inefficiency in route planning and moderate backtracking. There's room for improvement in spatial awareness.",
      "Cognitive Flexibility":
        "Your cognitive flexibility is average, showing some ability to switch between tasks but with noticeable interference effects. Your attention control could be improved.",
    }
    return averageAnalysis[domain] || "You show average performance in this cognitive domain."
  } else {
    const needsWorkAnalysis: { [key: string]: string } = {
      Memory:
        "Your memory abilities need development, with challenges in recall and recognition. Focused practice could significantly improve your visual memory performance.",
      "Problem Solving":
        "Your problem-solving skills need development, with challenges in logical reasoning. Structured practice could help improve your approach to finding solutions.",
      Vocabulary:
        "You face challenges with word recognition and processing. Targeted vocabulary exercises could help strengthen these skills.",
      "Spatial Reasoning":
        "Your spatial reasoning needs development, with difficulties in pattern recognition. Specific exercises could help improve your spatial processing abilities.",
      Navigation:
        "You show challenges with spatial navigation, with inefficient route planning and frequent backtracking. Focused practice could improve your spatial awareness.",
      "Cognitive Flexibility":
        "Your cognitive flexibility needs development, with difficulties switching between tasks and managing interference. Targeted exercises could improve your attention control.",
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

function getRecommendation(domain: string) {
  const recommendations: { [key: string]: string } = {
    Memory:
      "Practice memory games daily, starting with simple patterns and gradually increasing complexity. Use visualization techniques and spaced repetition to strengthen recall abilities.",
    "Problem Solving":
      "Engage with logic puzzles, strategic games, and real-world problem scenarios. Break down complex problems into smaller steps and practice identifying multiple solution paths.",
    Vocabulary:
      "Read diverse materials daily, learn 5 new words per week, and practice word association games. Use context clues to deduce meanings and create connections between related words.",
    "Spatial Reasoning":
      "Practice with 3D puzzles, mental rotation exercises, and pattern recognition activities. Visualize objects from different perspectives and recreate complex patterns from memory.",
    Navigation:
      "Practice map reading, create mental maps of familiar places, and try navigating new environments without GPS. Identify landmarks and practice finding alternative routes.",
    "Cognitive Flexibility":
      "Practice task-switching exercises, engage with activities requiring divided attention, and try Stroop-like exercises with increasing difficulty. Mindfulness meditation can also improve cognitive control.",
  }

  return recommendations[domain] || "Practice targeted exercises focusing on this cognitive domain regularly."
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

