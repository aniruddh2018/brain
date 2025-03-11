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

export default function GamesPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>("")

  useEffect(() => {
    // Get user data from localStorage
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

  const handleGameComplete = (gameMetrics: any) => {
    // Debug logging
    console.log("Game completed with metrics:", gameMetrics)
    setDebugInfo(`Game ${userData?.gameIndex} completed`)
    
    if (!userData) {
      console.error("No user data available when completing game")
      return
    }

    const currentGameName = getGameName(userData.gameIndex)
    console.log(`Completing ${currentGameName}, current index: ${userData.gameIndex}`)

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

    // If all games are completed, go to results page
    if (updatedUserData.gameIndex >= 6) {
      console.log("All games completed, navigating to results")
      router.push("/results")
    }
  }

  // Force move to next game (for debugging)
  const forceNextGame = () => {
    if (!userData) return
    
    const updatedUserData = {
      ...userData,
      gameIndex: userData.gameIndex + 1,
      metrics: {
        ...userData.metrics,
        [getGameName(userData.gameIndex)]: { 
          // Default metrics
          totalTime: 60,
          accuracy: 70,
          score: 75
        },
      },
    }
    
    localStorage.setItem("userData", JSON.stringify(updatedUserData))
    setUserData(updatedUserData)
    
    if (updatedUserData.gameIndex >= 6) {
      router.push("/results")
    }
  }

  const getGameName = (index: number) => {
    const games = ["memoryMatch", "towerOfHanoi", "wordPuzzle", "spatialPattern", "mazeRun", "stroopChallenge"]
    return games[index]
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
        return <div>All games completed</div>
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-center mb-4">
            {userData.gameIndex < 6 ? `Game ${userData.gameIndex + 1} of 6` : "Assessment Complete"}
          </h1>
          <Progress value={(userData.gameIndex / 6) * 100} className="h-2 mb-4" />
          <p className="text-center text-gray-600 mb-2">
            Player: {userData.name} | Age: {userData.age} | Difficulty: {userData.difficulty}
          </p>
          
          {/* Debug info and controls */}
          <div className="mt-4 text-sm text-gray-500">
            <p>Current game: {getGameName(userData.gameIndex)}</p>
            {debugInfo && <p className="text-blue-500">{debugInfo}</p>}
            <div className="mt-2 flex justify-center">
              <Button variant="outline" size="sm" onClick={forceNextGame}>
                Skip to Next Game
              </Button>
            </div>
          </div>
        </div>

        <GameContainer>{getCurrentGame()}</GameContainer>
      </div>
    </div>
  )
}

