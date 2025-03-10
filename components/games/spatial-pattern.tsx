"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Hourglass } from "lucide-react"

interface SpatialPatternProps {
  difficulty: string
  onComplete: (metrics: any) => void
}

interface PatternCell {
  row: number
  col: number
  highlighted: boolean
}

export default function SpatialPattern({ difficulty, onComplete }: SpatialPatternProps) {
  const [gridSize, setGridSize] = useState<number>(4)
  const [pattern, setPattern] = useState<PatternCell[]>([])
  const [userPattern, setUserPattern] = useState<PatternCell[]>([])
  const [showingPattern, setShowingPattern] = useState<boolean>(false)
  const [gamePhase, setGamePhase] = useState<"instruction" | "showing" | "input" | "feedback">("instruction")
  const [startTime, setStartTime] = useState<number>(0)
  const [gameTime, setGameTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [level, setLevel] = useState<number>(1)
  const [patternLength, setPatternLength] = useState<number>(3)
  const [firstClickTime, setFirstClickTime] = useState<number>(0)
  const [lastClickTime, setLastClickTime] = useState<number>(0)

  // Set up game based on difficulty
  useEffect(() => {
    if (difficulty === "easy") {
      setGridSize(3)
      setPatternLength(3)
    } else if (difficulty === "medium") {
      setGridSize(4)
      setPatternLength(4)
    } else {
      setGridSize(5)
      setPatternLength(5)
    }

    startGame()
  }, [difficulty])

  // Timer for game
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && gamePhase !== "showing") {
      interval = setInterval(() => {
        setGameTime(Date.now() - startTime)
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying, startTime, gamePhase])

  // Handle pattern display timer
  useEffect(() => {
    if (gamePhase === "showing") {
      setShowingPattern(true)

      const timer = setTimeout(
        () => {
          setShowingPattern(false)
          setGamePhase("input")
          setStartTime(Date.now())
        },
        2000 + patternLength * 500,
      ) // Show longer for more complex patterns

      return () => clearTimeout(timer)
    }
  }, [gamePhase, patternLength])

  const generatePattern = () => {
    const newPattern: PatternCell[] = []
    const cells: string[] = []

    // Generate random pattern
    while (newPattern.length < patternLength) {
      const row = Math.floor(Math.random() * gridSize)
      const col = Math.floor(Math.random() * gridSize)
      const cellKey = `${row}-${col}`

      if (!cells.includes(cellKey)) {
        cells.push(cellKey)
        newPattern.push({ row, col, highlighted: true })
      }
    }

    setPattern(newPattern)
    setUserPattern([])
  }

  const startGame = () => {
    setLevel(1)
    setPatternLength(difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5)
    setGamePhase("instruction")
    setIsPlaying(true)
    setGameTime(0)
    setFirstClickTime(0)
    setLastClickTime(0)
  }

  const startLevel = () => {
    generatePattern()
    setGamePhase("showing")
  }

  const handleCellClick = (row: number, col: number) => {
    if (gamePhase !== "input") return

    // Record timing data
    const now = Date.now()
    if (firstClickTime === 0) {
      setFirstClickTime(now)
    }
    setLastClickTime(now)

    // Add to user pattern
    const newUserPattern = [...userPattern, { row, col, highlighted: true }]
    setUserPattern(newUserPattern)

    // Check if user has input enough cells
    if (newUserPattern.length >= pattern.length) {
      checkPattern(newUserPattern)
    }
  }

  const checkPattern = (userInput: PatternCell[]) => {
    setGamePhase("feedback")

    // Check if patterns match
    let correct = true
    const patternCells = pattern.map((p) => `${p.row}-${p.col}`)
    const userCells = userInput.map((p) => `${p.row}-${p.col}`)

    for (let i = 0; i < patternCells.length; i++) {
      if (!userCells.includes(patternCells[i])) {
        correct = false
        break
      }
    }

    if (correct) {
      // Level complete
      setTimeout(() => {
        if (level >= 3) {
          // Game complete after 3 levels
          gameComplete()
        } else {
          // Next level
          setLevel(level + 1)
          setPatternLength(patternLength + 1)
          setGamePhase("instruction")
        }
      }, 1000)
    } else {
      // Failed, retry same level
      setTimeout(() => {
        setUserPattern([])
        setGamePhase("instruction")
      }, 1000)
    }
  }

  const gameComplete = () => {
    setIsPlaying(false)

    // Calculate metrics
    const totalTime = gameTime / 1000 // in seconds
    const reactionTime = firstClickTime > 0 ? (firstClickTime - startTime) / 1000 : 0

    // Calculate average time between clicks
    const avgClickTime = userPattern.length > 1 ? (lastClickTime - firstClickTime) / (userPattern.length - 1) / 1000 : 0

    // Calculate spatial reasoning score
    const spatialScore = calculateSpatialScore(level, patternLength, reactionTime)

    // Send metrics to parent
    onComplete({
      totalTime,
      maxLevel: level,
      maxPatternLength: patternLength,
      reactionTime,
      avgClickTime,
      spatialScore,
      patternRecognitionScore: calculatePatternScore(level, avgClickTime),
    })
  }

  const calculateSpatialScore = (lvl: number, pLength: number, reaction: number) => {
    // Base score on level reached and pattern complexity
    const baseScore = lvl * 20 + (pLength - 3) * 10

    // Adjust for reaction time (faster is better)
    const reactionFactor = Math.max(0.7, 1 - reaction / 5)

    return Math.min(100, Math.round(baseScore * reactionFactor))
  }

  const calculatePatternScore = (lvl: number, avgTime: number) => {
    // Base score on level reached
    const baseScore = lvl * 25

    // Adjust for average click time (faster is better)
    const timeFactor = Math.max(0.6, 1 - avgTime / 2)

    return Math.min(100, Math.round(baseScore * timeFactor))
  }

  const isCellInPattern = (row: number, col: number, patternArray: PatternCell[]) => {
    return patternArray.some((cell) => cell.row === row && cell.col === col)
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Spatial Pattern</h2>

      {gamePhase === "instruction" && (
        <div className="mb-6 text-center">
          <p className="mb-4">Remember the pattern of highlighted cells, then recreate it by clicking on the grid.</p>
          <p className="font-bold mb-4">
            Level {level}: Remember {patternLength} cells
          </p>
          <Button onClick={startLevel}>Show Pattern</Button>
        </div>
      )}

      {(gamePhase === "showing" || gamePhase === "input" || gamePhase === "feedback") && (
        <>
          <div className="flex justify-between w-full mb-4">
            <div className="text-sm">
              <p>Level: {level}/3</p>
              <p>Pattern: {patternLength} cells</p>
            </div>
            {gamePhase !== "showing" && (
              <div className="flex items-center text-sm">
                <Hourglass className="w-4 h-4 mr-1" />
                <span>{(gameTime / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>

          <div
            className="grid gap-2 mb-6"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: `${gridSize * 60}px`,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const row = Math.floor(index / gridSize)
              const col = index % gridSize

              const isInPattern = showingPattern && isCellInPattern(row, col, pattern)
              const isInUserPattern = isCellInPattern(row, col, userPattern)

              let cellClass = "w-14 h-14 rounded-md cursor-pointer transition-all duration-200"

              if (gamePhase === "feedback") {
                const isCorrect = isCellInPattern(row, col, pattern)
                const userSelected = isCellInPattern(row, col, userPattern)

                if (isCorrect && userSelected) {
                  cellClass += " bg-green-500" // Correct
                } else if (!isCorrect && userSelected) {
                  cellClass += " bg-red-500" // Wrong
                } else if (isCorrect && !userSelected) {
                  cellClass += " bg-yellow-500" // Missed
                } else {
                  cellClass += " bg-gray-200" // Not part of pattern
                }
              } else if (isInPattern) {
                cellClass += " bg-blue-500" // Showing pattern
              } else if (isInUserPattern) {
                cellClass += " bg-blue-300" // User selection
              } else {
                cellClass += " bg-gray-200" // Default
              }

              return <div key={index} className={cellClass} onClick={() => handleCellClick(row, col)}></div>
            })}
          </div>

          {gamePhase === "showing" && <p>Memorize this pattern!</p>}

          {gamePhase === "input" && (
            <p>
              Click on the cells to recreate the pattern ({userPattern.length}/{pattern.length})
            </p>
          )}
        </>
      )}

      {!isPlaying && (
        <Button onClick={startGame} className="mt-4">
          Restart Game
        </Button>
      )}
    </div>
  )
}

