"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import GameContainer from "@/components/game-container"
import dynamic from 'next/dynamic'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  Blocks, 
  BookOpen, 
  Layers, 
  Compass, 
  Activity 
} from "lucide-react"
import { supabase, saveGameMetrics, saveUserData } from "@/lib/supabase-fixed"
import {
  MemoryMatchMetrics,
  TowerOfHanoiMetrics,
  WordPuzzleMetrics,
  SpatialPatternMetrics,
  MazeRunMetrics,
  StroopChallengeMetrics,
  GameMetrics
} from "@/types/cognitive/game-metrics.types"

// Dynamically import game components with loading fallbacks
const MemoryMatch = dynamic(() => import('@/components/games/memory-match'), {
  loading: () => <GameLoadingFallback name="Memory Match" />,
  ssr: false
})

const TowerOfHanoi = dynamic(() => import('@/components/games/tower-of-hanoi'), {
  loading: () => <GameLoadingFallback name="Tower of Hanoi" />,
  ssr: false
})

const WordPuzzle = dynamic(() => import('@/components/games/word-puzzle'), {
  loading: () => <GameLoadingFallback name="Word Puzzle" />,
  ssr: false
})

const SpatialPattern = dynamic(() => import('@/components/games/spatial-pattern'), {
  loading: () => <GameLoadingFallback name="Spatial Pattern" />,
  ssr: false
})

const MazeRun = dynamic(() => import('@/components/games/maze-run'), {
  loading: () => <GameLoadingFallback name="Maze Run" />,
  ssr: false
})

const StroopChallenge = dynamic(() => import('@/components/games/stroop-challenge'), {
  loading: () => <GameLoadingFallback name="Stroop Challenge" />,
  ssr: false
})

// Game loading fallback component
function GameLoadingFallback({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 bg-white rounded-xl shadow-lg">
      <div className="h-16 w-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800">Loading {name}</h3>
      <p className="text-gray-600 mt-2 text-center">Preparing your cognitive assessment...</p>
    </div>
  )
}

// Define interfaces for user data
interface UserData {
  id: string;
  name: string;
  age: number;
  education: string;
  difficulty: string;
  gameIndex: number;
  metrics: {
    [key: string]: any;
  };
}

// Helper types for the metrics
type GameMetricsType = Record<string, Record<string, any>>

// Note: We're using the imported saveGameMetrics function from supabase-fixed
// instead of a local implementation to ensure consistency.

export default function GamesPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingGame, setSavingGame] = useState(false)

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (!storedData) {
      router.push("/")
      return
    }

    const parsedData = JSON.parse(storedData)
    setUserData(parsedData)
    setLoading(false)
  }, [router])

  const handleGameComplete = async (gameMetrics: GameMetrics) => {
    if (!userData) return;
    
    const currentGameName = getGameName(userData.gameIndex)
    
    // Save game metrics to Supabase
    const userId = localStorage.getItem('userId')
    if (userId && !savingGame) {
      try {
        setSavingGame(true)
        
        await saveGameMetrics(userId, {
          name: currentGameName,
          metrics: gameMetrics,
          is_skipped: false
        });
      } catch (error) {
        // Keep only error logging for critical issues
        console.error("Error saving game metrics:", error);
      } finally {
        setSavingGame(false)
      }
    }

    // Check if this is the last game (index 5 = StroopChallenge)
    const isLastGame = userData.gameIndex === 5;

    // Update game index and store metrics
    const updatedUserData = {
      ...userData,
      gameIndex: userData.gameIndex + 1,
      metrics: {
        ...userData.metrics,
        [currentGameName]: gameMetrics,
      },
    }
    
    // Save to localStorage
    localStorage.setItem("userData", JSON.stringify(updatedUserData))
    
    // Update state
    setUserData(updatedUserData)

    // If all games are completed, go directly to results page
    if (isLastGame) {
      router.push("/results")
    }
  }

  // Force move to next game
  const forceNextGame = async () => {
    if (!userData) return
    
    const currentGameName = getGameName(userData.gameIndex);
    const userDifficulty = userData.difficulty;
    
    // Create minimal metrics for skipped game
    let gameMetrics: any = {
      score: 0,
      timeSpent: 0,
      difficulty: userDifficulty,
      is_skipped: true
    };
    
    // Add game-specific null metrics based on the game type
    switch(currentGameName) {
      case "memoryMatch":
        gameMetrics = { ...gameMetrics, memoryScore: null, memory: null, matchesMade: 0, incorrectAttempts: 0, averageMatchTime: 0 };
        break;
      case "towerOfHanoi":
        gameMetrics = { ...gameMetrics, planningScore: null, problemSolvingScore: null, movesCount: 0, optimalMovesRatio: 0, timePerMove: 0 };
        break;
      case "wordPuzzle":
        gameMetrics = { ...gameMetrics, languageScore: null, vocabularyScore: null, wordsFound: 0, hintsUsed: 0, averageWordLength: 0 };
        break;
      case "spatialPattern":
        gameMetrics = { ...gameMetrics, spatialScore: null, spatialReasoningScore: null, patternsCompleted: 0, accuracyRate: 0, complexityLevel: 0 };
        break;
      case "mazeRun":
        gameMetrics = { ...gameMetrics, navigationScore: null, spatialNavigationScore: null, pathEfficiency: 0, deadEndsEncountered: 0, completionSpeed: 0 };
        break;
      case "stroopChallenge":
        gameMetrics = { ...gameMetrics, attentionScore: null, cognitiveFlexibilityScore: null, correctResponses: 0, incorrectResponses: 0, averageResponseTime: 0, interferenceEffect: 0 };
        break;
    }
    
    // Save skipped game metrics to Supabase
    const userId = localStorage.getItem('userId')
    if (userId && !savingGame) {
      try {
        setSavingGame(true)
        await saveGameMetrics(userId, {
          name: currentGameName,
          metrics: gameMetrics,
          is_skipped: true
        });
      } catch (error) {
        console.error("Error saving skipped game metrics:", error);
      } finally {
        setSavingGame(false)
      }
    }
    
    const updatedUserData = {
      ...userData,
      gameIndex: userData.gameIndex + 1,
      metrics: {
        ...userData.metrics,
        [currentGameName]: gameMetrics,
      },
    }

    localStorage.setItem("userData", JSON.stringify(updatedUserData))
    setUserData(updatedUserData)

    // Check if this was the last game
    const isLastGame = userData.gameIndex === 5;
    
    if (isLastGame) {
      router.push("/results")
    }
  }

  const getGameName = (index: number) => {
    const games = ["memoryMatch", "towerOfHanoi", "wordPuzzle", "spatialPattern", "mazeRun", "stroopChallenge"]
    return games[index]
  }
  
  // Helper function to add game-specific scores
  const addGameSpecificScores = (gameName: string, baseMetrics: any) => {
    const metrics = { ...baseMetrics };
    
    // If game is skipped, set all scores to null
    if (metrics.is_skipped === true) {
      switch(gameName) {
        case "memoryMatch":
          metrics.memoryScore = null;
          metrics.memory = null;
          break;
        case "towerOfHanoi":
          metrics.planningScore = null;
          metrics.problemSolvingScore = null;
          break;
        case "wordPuzzle":
          metrics.languageScore = null;
          metrics.vocabularyScore = null;
          break;
        case "spatialPattern":
          metrics.spatialScore = null;
          metrics.spatialReasoningScore = null;
          break;
        case "mazeRun":
          metrics.navigationScore = null;
          metrics.spatialNavigationScore = null;
          break;
        case "stroopChallenge":
          metrics.attentionScore = null;
          metrics.cognitiveFlexibilityScore = null;
          break;
      }
      return metrics;
    }
    
    // For non-skipped games, add specific score fields
    switch(gameName) {
      case "memoryMatch":
        metrics.memoryScore = 70;
        break;
      case "towerOfHanoi":
        metrics.planningScore = 70;
        metrics.problemSolvingScore = 70;
        break;
      case "wordPuzzle":
        metrics.vocabularyScore = 70;
        break;
      case "spatialPattern":
        metrics.spatialScore = 70;
        break;
      case "mazeRun":
        metrics.navigationScore = 70;
        metrics.spatialNavigationScore = 70;
        break;
      case "stroopChallenge":
        metrics.cognitiveFlexibilityScore = 70;
        break;
    }
    
    return metrics;
  }

  // Format game name for display
  const getFormattedGameName = (index: number) => {
    const gameNames = {
      "memoryMatch": { name: "Memory Match", icon: Brain },
      "towerOfHanoi": { name: "Tower of Hanoi", icon: Blocks },
      "wordPuzzle": { name: "Word Puzzle", icon: BookOpen },
      "spatialPattern": { name: "Spatial Pattern", icon: Layers },
      "mazeRun": { name: "Maze Run", icon: Compass },
      "stroopChallenge": { name: "Stroop Challenge", icon: Activity }
    }
    
    const gameName = getGameName(index)
    return gameNames[gameName as keyof typeof gameNames] || { name: "Unknown Game", icon: Brain }
  }

  const getCurrentGame = () => {
    if (!userData) return null

    switch (userData.gameIndex) {
      case 0:
        return <MemoryMatch difficulty={userData.difficulty} onComplete={handleGameComplete} />
      case 1:
        return <TowerOfHanoi difficulty={userData.difficulty} onComplete={handleGameComplete} />
      case 2:
        return <WordPuzzle difficulty={userData.difficulty} onComplete={handleGameComplete} />
      case 3:
        return <SpatialPattern difficulty={userData.difficulty} onComplete={handleGameComplete} />
      case 4:
        return <MazeRun difficulty={userData.difficulty} onComplete={handleGameComplete} />
      case 5:
        return <StroopChallenge difficulty={userData.difficulty} onComplete={handleGameComplete} />
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : userData ? (
            <>
              {/* Game controls header */}
              <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold">IQLEVAL</h1>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 text-indigo-800 font-bold text-lg h-8 w-8 rounded-full flex items-center justify-center">
                      {userData.gameIndex + 1}
                    </div>
                    <span className="text-sm text-gray-500">of 6</span>
                    <Progress value={(userData.gameIndex / 6) * 100} className="h-2 w-24 md:w-32 ml-2" />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{userData.name}</span>
                    <span className="text-xs text-gray-500">{userData.age}y</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs ml-1">{userData.difficulty}</span>
                  </div>
                  
                  {/* Only show Skip game button if there are games remaining */}
                  {userData.gameIndex < 6 && (
                    <Button variant="outline" size="sm" className="h-8 text-xs px-2 py-1" onClick={forceNextGame}>
                      Skip game
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Current game */}
              <div className="mb-8">
                {userData.gameIndex < 6 ? (
                  <>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1.5 rounded-full text-white shadow-md flex items-center gap-2 animate-badge-pulse hover:scale-105 transition-transform">
                      {(() => {
                        const gameInfo = getFormattedGameName(userData.gameIndex);
                        const GameIcon = gameInfo.icon
                        return (
                          <>
                            <GameIcon className="h-4 w-4 animate-subtle-bounce" />
                            <span className="text-sm font-medium">{gameInfo.name}</span>
                          </>
                        )
                      })()}
                    </div>
                    
                    <GameContainer>
                      {getCurrentGame()}
                    </GameContainer>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 max-w-xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">All Cognitive Assessments Completed</h2>
                    <p className="text-gray-600 mb-10 text-center text-lg leading-relaxed">
                      Congratulations! You've completed all the cognitive assessments. 
                      Your personalized cognitive report is now ready.
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-medium"
                      onClick={() => router.push("/results")}
                    >
                      See Personalized Cognitive Report
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p>No user data found. Please return to the home page and create a profile.</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push("/")}
              >
                Go to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}



