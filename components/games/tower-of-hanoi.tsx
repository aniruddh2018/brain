"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Hourglass } from "lucide-react"

interface TowerOfHanoiProps {
  difficulty: string
  onComplete: (metrics: any) => void
}

interface Disk {
  size: number
  color: string
}

export default function TowerOfHanoi({ difficulty, onComplete }: TowerOfHanoiProps) {
  const [disks, setDisks] = useState<number>(3)
  const [towers, setTowers] = useState<Disk[][]>([[], [], []])
  const [selectedTower, setSelectedTower] = useState<number | null>(null)
  const [moves, setMoves] = useState<number>(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [gameTime, setGameTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [optimalMoves, setOptimalMoves] = useState<number>(0)
  const [moveHistory, setMoveHistory] = useState<{ from: number; to: number; time: number }[]>([])

  // Set up game based on difficulty
  useEffect(() => {
    if (difficulty === "easy") setDisks(3)
    else if (difficulty === "medium") setDisks(4)
    else setDisks(5)

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

  const diskColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
  ]

  const startGame = () => {
    // Initialize towers
    const initialTowers: Disk[][] = [[], [], []]
    initialTowers[0] = Array.from({ length: disks }, (_, i) => ({
      size: disks - i,
      color: diskColors[disks - i - 1],
    }))

    setTowers(initialTowers)
    setSelectedTower(null)
    setMoves(0)
    setStartTime(Date.now())
    setIsPlaying(true)
    setMoveHistory([])

    // Calculate optimal moves (2^n - 1)
    setOptimalMoves(Math.pow(2, disks) - 1)
  }

  const handleTowerClick = (towerIndex: number) => {
    if (!isPlaying) return

    if (selectedTower === null) {
      // No tower selected yet, check if this tower has disks
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex)
      }
    } else {
      // A tower is already selected, try to move disk
      if (selectedTower === towerIndex) {
        // Clicked the same tower, deselect
        setSelectedTower(null)
      } else {
        // Try to move disk from selected tower to this tower
        const fromTower = towers[selectedTower]
        const toTower = towers[towerIndex]

        if (toTower.length === 0 || fromTower[fromTower.length - 1].size < toTower[toTower.length - 1].size) {
          // Valid move
          const newTowers = [...towers]
          const disk = newTowers[selectedTower].pop()!
          newTowers[towerIndex].push(disk)

          setTowers(newTowers)
          setSelectedTower(null)
          setMoves(moves + 1)

          // Record move
          setMoveHistory([
            ...moveHistory,
            {
              from: selectedTower,
              to: towerIndex,
              time: Date.now() - startTime,
            },
          ])

          // Check if game is complete
          if (towerIndex === 2 && newTowers[2].length === disks) {
            gameComplete()
          }
        } else {
          // Invalid move, just deselect
          setSelectedTower(null)
        }
      }
    }
  }

  const gameComplete = () => {
    setIsPlaying(false)

    // Calculate metrics
    const totalTime = (Date.now() - startTime) / 1000 // in seconds
    const efficiency = optimalMoves > 0 ? (optimalMoves / moves) * 100 : 0

    // Calculate average move time
    const moveTimes = moveHistory.map((move, index) => {
      if (index === 0) return move.time
      return move.time - moveHistory[index - 1].time
    })

    const avgMoveTime = moveTimes.length > 0 ? moveTimes.reduce((a, b) => a + b, 0) / moveTimes.length / 1000 : 0

    // Calculate planning score based on consistency of move times
    const moveTimeStdDev = calculateStandardDeviation(moveTimes)
    const planningScore = calculatePlanningScore(efficiency, moveTimeStdDev)

    // Send metrics to parent
    onComplete({
      totalTime,
      moves,
      optimalMoves,
      efficiency,
      avgMoveTime,
      planningScore,
      problemSolvingScore: calculateProblemSolvingScore(totalTime, moves, optimalMoves),
    })
  }

  const calculateStandardDeviation = (values: number[]) => {
    if (values.length === 0) return 0

    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const squareDiffs = values.map((value) => Math.pow(value - avg, 2))
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
    return Math.sqrt(avgSquareDiff)
  }

  const calculatePlanningScore = (efficiency: number, stdDev: number) => {
    // Lower standard deviation in move times suggests more consistent planning
    // Higher efficiency suggests better planning
    const maxStdDev = 5000 // 5 seconds
    const stdDevScore = Math.max(0, 100 - (stdDev / maxStdDev) * 100)

    return Math.round((efficiency + stdDevScore) / 2)
  }

  const calculateProblemSolvingScore = (time: number, moves: number, optimal: number) => {
    // Calculate score based on how close to optimal solution and time taken
    const moveRatio = optimal / Math.max(moves, optimal)
    const timeScore = Math.max(0, 100 - (time / (optimal * 2)) * 100)

    return Math.round((moveRatio * 100 + timeScore) / 2)
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Tower of Hanoi</h2>
      <p className="mb-6 text-center">
        Move all disks from the left tower to the right tower. You can only move one disk at a time, and you cannot
        place a larger disk on top of a smaller one.
      </p>

      <div className="flex justify-between w-full mb-4">
        <div className="text-sm">
          <p>Moves: {moves}</p>
          <p>Optimal: {optimalMoves}</p>
        </div>
        <div className="flex items-center text-sm">
          <Hourglass className="w-4 h-4 mr-1" />
          <span>{(gameTime / 1000).toFixed(1)}s</span>
        </div>
      </div>

      <div className="flex justify-around w-full mb-8">
        {towers.map((tower, towerIndex) => (
          <div
            key={towerIndex}
            className={`flex flex-col-reverse items-center cursor-pointer ${
              selectedTower === towerIndex ? "bg-blue-100 rounded-lg" : ""
            }`}
            onClick={() => handleTowerClick(towerIndex)}
          >
            <div className="w-2 h-20 bg-gray-400 mb-1"></div>
            <div className="w-20 h-2 bg-gray-600"></div>

            {tower.map((disk, diskIndex) => (
              <div
                key={diskIndex}
                className={`h-4 rounded-md ${disk.color}`}
                style={{ width: `${disk.size * 12}px` }}
              ></div>
            ))}
          </div>
        ))}
      </div>

      {!isPlaying && <Button onClick={startGame}>Restart Game</Button>}
    </div>
  )
}

