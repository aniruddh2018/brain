"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Hourglass } from "lucide-react"

interface StroopChallengeProps {
  difficulty: string
  onComplete: (metrics: any) => void
}

interface StroopItem {
  word: string
  color: string
  isMatch: boolean
}

export default function StroopChallenge({ difficulty, onComplete }: StroopChallengeProps) {
  const [items, setItems] = useState<StroopItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [gameTime, setGameTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [totalItems, setTotalItems] = useState<number>(20)
  const [responses, setResponses] = useState<{ correct: boolean; time: number }[]>([])
  const [lastResponseTime, setLastResponseTime] = useState<number>(0)
  const [congruentRatio, setCongruentRatio] = useState<number>(0.5)

  // Set up game based on difficulty
  useEffect(() => {
    if (difficulty === "easy") {
      setTotalItems(15)
      setCongruentRatio(0.7) // More congruent items (easier)
    } else if (difficulty === "medium") {
      setTotalItems(20)
      setCongruentRatio(0.5)
    } else {
      setTotalItems(25)
      setCongruentRatio(0.3) // More incongruent items (harder)
    }

    startGame()
  }, [difficulty])

  // Timer for game
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setGameTime(Date.now() - startTime)
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying, startTime])

  const colors = [
    { name: "red", value: "text-red-500" },
    { name: "blue", value: "text-blue-500" },
    { name: "green", value: "text-green-500" },
    { name: "yellow", value: "text-yellow-500" },
    { name: "purple", value: "text-purple-500" },
  ]

  const generateItems = () => {
    const newItems: StroopItem[] = []

    for (let i = 0; i < totalItems; i++) {
      const isCongruent = Math.random() < congruentRatio
      const colorIndex = Math.floor(Math.random() * colors.length)

      if (isCongruent) {
        // Word and color match
        newItems.push({
          word: colors[colorIndex].name,
          color: colors[colorIndex].value,
          isMatch: true,
        })
      } else {
        // Word and color don't match
        let differentColorIndex = colorIndex
        while (differentColorIndex === colorIndex) {
          differentColorIndex = Math.floor(Math.random() * colors.length)
        }

        newItems.push({
          word: colors[colorIndex].name,
          color: colors[differentColorIndex].value,
          isMatch: false,
        })
      }
    }

    // Shuffle items
    return newItems.sort(() => Math.random() - 0.5)
  }

  const startGame = () => {
    const newItems = generateItems()
    setItems(newItems)
    setCurrentIndex(0)
    setResponses([])
    setLastResponseTime(0)
    setStartTime(Date.now())
    setIsPlaying(true)
  }

  const handleResponse = (response: boolean) => {
    if (!isPlaying) return

    const currentItem = items[currentIndex]
    const isCorrect = currentItem.isMatch === response
    const responseTime = Date.now() - (lastResponseTime || startTime)

    // Record response
    setResponses([...responses, { correct: isCorrect, time: responseTime }])

    // Move to next item
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setLastResponseTime(Date.now())
    } else {
      // Game complete
      gameComplete()
    }
  }

  const gameComplete = () => {
    setIsPlaying(false)

    // Calculate metrics
    const totalTime = (Date.now() - startTime) / 1000 // in seconds
    const correctResponses = responses.filter((r) => r.correct).length
    const accuracy = (correctResponses / responses.length) * 100

    // Calculate average response time
    const avgResponseTime =
      responses.length > 0 ? responses.reduce((sum, r) => sum + r.time, 0) / responses.length / 1000 : 0

    // Calculate congruent vs incongruent response times
    const congruentItems = items.filter((item) => item.isMatch)
    const incongruentItems = items.filter((item) => !item.isMatch)

    const congruentResponses = responses.filter((_, i) => items[i].isMatch)
    const incongruentResponses = responses.filter((_, i) => !items[i].isMatch)

    const avgCongruentTime =
      congruentResponses.length > 0
        ? congruentResponses.reduce((sum, r) => sum + r.time, 0) / congruentResponses.length / 1000
        : 0

    const avgIncongruentTime =
      incongruentResponses.length > 0
        ? incongruentResponses.reduce((sum, r) => sum + r.time, 0) / incongruentResponses.length / 1000
        : 0

    // Calculate interference effect (difference between incongruent and congruent times)
    const interferenceEffect = avgIncongruentTime - avgCongruentTime

    // Calculate cognitive flexibility score
    const flexibilityScore = calculateFlexibilityScore(accuracy, interferenceEffect)

    // Send metrics to parent
    onComplete({
      totalTime,
      correctResponses,
      totalItems: responses.length,
      accuracy,
      avgResponseTime,
      avgCongruentTime,
      avgIncongruentTime,
      interferenceEffect,
      cognitiveFlexibilityScore: flexibilityScore,
      attentionControlScore: calculateAttentionScore(accuracy, avgResponseTime),
    })
  }

  const calculateFlexibilityScore = (accuracy: number, interference: number) => {
    // Lower interference effect indicates better cognitive flexibility
    // Higher accuracy indicates better performance

    // Normalize interference effect (typical range is 0.2-1.0 seconds)
    const normalizedInterference = Math.max(0, Math.min(1, interference))
    const interferenceScore = 100 - normalizedInterference * 100

    return Math.round(accuracy * 0.6 + interferenceScore * 0.4)
  }

  const calculateAttentionScore = (accuracy: number, avgTime: number) => {
    // Higher accuracy and lower response time indicate better attention control

    // Normalize response time (typical range is 0.5-2.0 seconds)
    let timeScore = 100
    if (avgTime > 0.5) {
      timeScore = Math.max(0, 100 - (avgTime - 0.5) * 50)
    }

    return Math.round(accuracy * 0.7 + timeScore * 0.3)
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Stroop Challenge</h2>
      <p className="mb-6 text-center">
        Determine if the color of the text matches the word. Press "Match" if they match, "No Match" if they don't.
        Respond as quickly and accurately as possible.
      </p>

      {isPlaying && (
        <>
          <div className="flex justify-between w-full mb-4">
            <div className="text-sm">
              <p>
                Progress: {currentIndex + 1}/{items.length}
              </p>
              <p>
                Correct: {responses.filter((r) => r.correct).length}/{responses.length}
              </p>
            </div>
            <div className="flex items-center text-sm">
              <Hourglass className="w-4 h-4 mr-1" />
              <span>{(gameTime / 1000).toFixed(1)}s</span>
            </div>
          </div>

          <div className="mb-8 p-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <h3 className={`text-4xl font-bold ${items[currentIndex].color}`}>
              {items[currentIndex].word.toUpperCase()}
            </h3>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => handleResponse(true)} className="bg-green-500 hover:bg-green-600">
              Match
            </Button>
            <Button onClick={() => handleResponse(false)} className="bg-red-500 hover:bg-red-600">
              No Match
            </Button>
          </div>
        </>
      )}

      {!isPlaying && <Button onClick={startGame}>Restart Game</Button>}
    </div>
  )
}

