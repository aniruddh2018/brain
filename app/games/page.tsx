"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import GameContainer from "@/components/game-container"
import MemoryMatch from "@/components/games/memory-match"
import TowerOfHanoi from "@/components/games/tower-of-hanoi"
import WordPuzzle from "@/components/games/word-puzzle"
import SpatialPattern from "@/components/games/spatial-pattern"
import MazeRun from "@/components/games/maze-run"
import StroopChallenge from "@/components/games/stroop-challenge"
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
  GameData,
  BaseGameMetrics,
  MemoryMatchMetrics,
  TowerOfHanoiMetrics,
  WordPuzzleMetrics,
  SpatialPatternMetrics,
  MazeRunMetrics,
  StroopChallengeMetrics,
  GameMetrics
} from "@/types/cognitive-new/games"

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
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [savingGame, setSavingGame] = useState(false)

  useEffect(() => {
    // Get user data from localStorage (will be replaced with Supabase in future)
    const storedData = localStorage.getItem("userData")
    if (!storedData) {
      router.push("/")
      return
    }

    // Log data loading
    const parsedData = JSON.parse(storedData)
    console.log("Loaded user data:", parsedData)
    setUserData(parsedData)
    setLoading(false)
  }, [router])

  const handleGameComplete = async (gameMetrics: GameMetrics) => {
    // Debug logging
    console.log("Game completed with metrics:", gameMetrics)
    setDebugInfo(`Game ${userData?.gameIndex} completed`)
    
    if (!userData) {
      console.error("No user data available when completing game")
      return
    }

    const currentGameName = getGameName(userData.gameIndex)
    console.log(`Completing ${currentGameName}, current index: ${userData.gameIndex}`)

    // Save game metrics to Supabase (and localStorage for backward compatibility)
    const userId = localStorage.getItem('userId')
    if (userId && !savingGame) {
      try {
        setSavingGame(true)
        
        // Log the data being sent to help debug
        console.log('Saving completed game metrics:', {
          name: currentGameName,
          metrics: gameMetrics,
          is_skipped: false
        });
        
        // Use the imported saveGameMetrics function from supabase-fixed
        const result = await saveGameMetrics(userId, {
          name: currentGameName,
          metrics: gameMetrics,
          is_skipped: false
        });
        
        console.log(`Game metrics saved to Supabase for ${currentGameName}:`, result);
      } catch (error) {
        console.error("Error saving game metrics to Supabase:", error);
      } finally {
        setSavingGame(false)
      }
    } else if (!userId) {
      console.error("No user ID found in localStorage");
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

    console.log("Updating to:", updatedUserData)
    
    // Save to localStorage
    localStorage.setItem("userData", JSON.stringify(updatedUserData))
    
    // Update state
    setUserData(updatedUserData)
    setDebugInfo(`${currentGameName} completed, moving to game ${updatedUserData.gameIndex}`)

    // If all games are completed, go directly to results page
    if (isLastGame) {
      console.log("Last game completed, navigating directly to results")
      router.push("/results")
    }
  }

  // Force move to next game (for debugging)
  const forceNextGame = async () => {
    if (!userData) return
    
    const currentGameName = getGameName(userData.gameIndex);
    const userDifficulty = userData.difficulty;
    
    // Create base metrics for skipped game - ensure is_skipped is set
    let gameMetrics: any; // Use any temporarily to allow for additional fields
    
    // Define minimal base metrics for skipped games
    const baseSkippedMetrics = {
      score: 0,
      timeSpent: 0,
      difficulty: userDifficulty,
      is_skipped: true
    };
    
    switch(currentGameName) {
      case "memoryMatch":
        gameMetrics = {
          ...baseSkippedMetrics,
          memoryScore: null, // Set to null to indicate skipped
          memory: null, // Add this to match possible alternate property name
          matchesMade: 0,
          incorrectAttempts: 0,
          averageMatchTime: 0
        };
        break;
      case "towerOfHanoi":
        gameMetrics = {
          ...baseSkippedMetrics,
          planningScore: null, // Set to null
          problemSolvingScore: null, // This is the field used in results page
          movesCount: 0,
          optimalMovesRatio: 0,
          timePerMove: 0
        };
        break;
      case "wordPuzzle":
        gameMetrics = {
          ...baseSkippedMetrics,
          languageScore: null,
          vocabularyScore: null, // This is the field used in results page
          wordsFound: 0,
          hintsUsed: 0,
          averageWordLength: 0
        };
        break;
      case "spatialPattern":
        gameMetrics = {
          ...baseSkippedMetrics,
          spatialScore: null, // This is used in results page
          spatialReasoningScore: null, // Add this to match the expected property name
          patternsCompleted: 0,
          accuracyRate: 0,
          complexityLevel: 0
        };
        break;
      case "mazeRun":
        gameMetrics = {
          ...baseSkippedMetrics,
          navigationScore: null,
          spatialNavigationScore: null, // This is used in results page
          pathEfficiency: 0,
          deadEndsEncountered: 0,
          completionSpeed: 0
        };
        break;
      case "stroopChallenge":
      default:
        // Default to Stroop Challenge metrics if game name is not recognized
        gameMetrics = {
          ...baseSkippedMetrics,
          attentionScore: null,
          cognitiveFlexibilityScore: null, // This is used in results page
          correctResponses: 0,
          incorrectResponses: 0,
          averageResponseTime: 0,
          interferenceEffect: 0
        };
    }
    
    // Save skipped game metrics to Supabase
    const userId = localStorage.getItem('userId')
    if (userId && !savingGame) {
      try {
        setSavingGame(true)
        
        // Log the data being sent to help debug
        console.log('Saving skipped game metrics:', {
          name: currentGameName,
          metrics: gameMetrics,
          is_skipped: true
        });
        
        await saveGameMetrics(userId, {
          name: currentGameName,
          metrics: gameMetrics,
          is_skipped: true
        });
        console.log(`Skipped game metrics saved to Supabase for ${currentGameName}`);
      } catch (error) {
        console.error("Error saving skipped game metrics to Supabase:", error);
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

    // Check if this was the last game (index 5 = StroopChallenge)
    const isLastGame = userData.gameIndex === 5;
    
    if (isLastGame) {
      console.log("Last game skipped, navigating directly to results")
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
        return null // No need to return anything here as completion UI is handled separately
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
              
              {/* Debug info (only in development) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mb-4 p-2 border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-xs text-gray-500">{debugInfo}</p>
                </div>
              )}
              
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
              
              {/* Footer info */}
              <div className="text-center">
                {/* Footer content removed */}
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

