"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Hourglass, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

interface MazeRunProps {
  difficulty: string
  onComplete: (metrics: any) => void
}

interface Position {
  x: number
  y: number
}

interface MoveRecord {
  position: Position
  time: number
}

export default function MazeRun({ difficulty, onComplete }: MazeRunProps) {
  const [mazeSize, setMazeSize] = useState<number>(8)
  const [maze, setMaze] = useState<number[][]>([])
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 })
  const [goalPos, setGoalPos] = useState<Position>({ x: 0, y: 0 })
  const [startTime, setStartTime] = useState<number>(0)
  const [gameTime, setGameTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [moveCount, setMoveCount] = useState<number>(0)
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([])
  const [backtrackCount, setBacktrackCount] = useState<number>(0)
  const [optimalPath, setOptimalPath] = useState<number>(0)

  const mazeRef = useRef<HTMLDivElement>(null)

  // Set up game based on difficulty
  useEffect(() => {
    if (difficulty === "easy") {
      setMazeSize(8)
    } else if (difficulty === "medium") {
      setMazeSize(10)
    } else {
      setMazeSize(12)
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

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return

      switch (e.key) {
        case "ArrowUp":
          movePlayer(0, -1)
          break
        case "ArrowDown":
          movePlayer(0, 1)
          break
        case "ArrowLeft":
          movePlayer(-1, 0)
          break
        case "ArrowRight":
          movePlayer(1, 0)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, playerPos, maze])

  // Focus maze on start
  useEffect(() => {
    if (isPlaying && mazeRef.current) {
      mazeRef.current.focus()
    }
  }, [isPlaying])

  const generateMaze = () => {
    // Initialize maze with walls
    const newMaze = Array(mazeSize)
      .fill(0)
      .map(() => Array(mazeSize).fill(1))

    // Create a path using recursive backtracking
    const stack: Position[] = []
    const start: Position = { x: 1, y: 1 }
    newMaze[start.y][start.x] = 0
    stack.push(start)

    const directions = [
      { x: 0, y: -2 }, // Up
      { x: 0, y: 2 }, // Down
      { x: -2, y: 0 }, // Left
      { x: 2, y: 0 }, // Right
    ]

    while (stack.length > 0) {
      const current = stack[stack.length - 1]

      // Get unvisited neighbors
      const unvisitedNeighbors: Position[] = []

      for (const dir of directions) {
        const nx = current.x + dir.x
        const ny = current.y + dir.y

        if (nx > 0 && nx < mazeSize - 1 && ny > 0 && ny < mazeSize - 1 && newMaze[ny][nx] === 1) {
          unvisitedNeighbors.push({ x: nx, y: ny })
        }
      }

      if (unvisitedNeighbors.length > 0) {
        // Choose random unvisited neighbor
        const next = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)]

        // Remove wall between current and next
        newMaze[current.y + (next.y - current.y) / 2][current.x + (next.x - current.x) / 2] = 0

        // Mark next as visited
        newMaze[next.y][next.x] = 0

        // Add next to stack
        stack.push(next)
      } else {
        // Backtrack
        stack.pop()
      }
    }

    // Set player position at top-left
    const playerPosition = { x: 1, y: 1 }

    // Set goal position at bottom-right
    const goalPosition = { x: mazeSize - 2, y: mazeSize - 2 }

    // Ensure start and goal are open
    newMaze[playerPosition.y][playerPosition.x] = 0
    newMaze[goalPosition.y][goalPosition.x] = 0

    setMaze(newMaze)
    setPlayerPos(playerPosition)
    setGoalPos(goalPosition)

    // Calculate optimal path length using BFS
    const optimalLength = calculateOptimalPath(newMaze, playerPosition, goalPosition)
    setOptimalPath(optimalLength)
  }

  const calculateOptimalPath = (maze: number[][], start: Position, goal: Position) => {
    const queue: { pos: Position; dist: number }[] = [{ pos: start, dist: 0 }]
    const visited = new Set<string>()
    visited.add(`${start.x},${start.y}`)

    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 0, y: 1 }, // Down
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 }, // Right
    ]

    while (queue.length > 0) {
      const { pos, dist } = queue.shift()!

      if (pos.x === goal.x && pos.y === goal.y) {
        return dist
      }

      for (const dir of directions) {
        const nx = pos.x + dir.x
        const ny = pos.y + dir.y

        if (nx >= 0 && nx < mazeSize && ny >= 0 && ny < mazeSize && maze[ny][nx] === 0 && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`)
          queue.push({ pos: { x: nx, y: ny }, dist: dist + 1 })
        }
      }
    }

    return -1 // No path found
  }

  const startGame = () => {
    generateMaze()
    setMoveCount(0)
    setMoveHistory([])
    setBacktrackCount(0)
    setStartTime(Date.now())
    setIsPlaying(true)
  }

  const movePlayer = (dx: number, dy: number) => {
    const newX = playerPos.x + dx
    const newY = playerPos.y + dy

    // Check if move is valid
    if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && maze[newY][newX] === 0) {
      // Check for backtracking
      if (moveHistory.length > 0) {
        const prevPos = moveHistory[moveHistory.length - 1].position
        if (moveHistory.length > 1 && prevPos.x === newX && prevPos.y === newY) {
          setBacktrackCount(backtrackCount + 1)
        }
      }

      // Update position
      setPlayerPos({ x: newX, y: newY })
      setMoveCount(moveCount + 1)

      // Record move
      setMoveHistory([...moveHistory, { position: { x: newX, y: newY }, time: Date.now() - startTime }])

      // Check if reached goal
      if (newX === goalPos.x && newY === goalPos.y) {
        gameComplete()
      }
    }
  }

  const gameComplete = () => {
    setIsPlaying(false)

    // Calculate metrics
    const totalTime = (Date.now() - startTime) / 1000 // in seconds
    const efficiency = optimalPath > 0 ? (optimalPath / moveCount) * 100 : 0

    // Calculate decision time (average time between moves)
    const moveTimes = moveHistory.map((move, index) => {
      if (index === 0) return move.time
      return move.time - moveHistory[index - 1].time
    })

    const avgMoveTime = moveTimes.length > 0 ? moveTimes.reduce((a, b) => a + b, 0) / moveTimes.length / 1000 : 0

    // Calculate spatial navigation score
    const spatialScore = calculateSpatialNavigationScore(efficiency, backtrackCount, mazeSize)

    // Send metrics to parent
    onComplete({
      totalTime,
      moves: moveCount,
      optimalPath,
      efficiency,
      backtrackCount,
      avgMoveTime,
      spatialNavigationScore: spatialScore,
      planningScore: calculatePlanningScore(efficiency, backtrackCount, avgMoveTime),
    })
  }

  const calculateSpatialNavigationScore = (efficiency: number, backtracks: number, size: number) => {
    // Base score on efficiency
    const baseScore = efficiency

    // Penalize for backtracking
    const backtrackPenalty = Math.min(50, backtracks * (size / 4))

    return Math.max(0, Math.round(baseScore - backtrackPenalty))
  }

  const calculatePlanningScore = (efficiency: number, backtracks: number, avgTime: number) => {
    // Higher efficiency, fewer backtracks, and moderate decision time indicate better planning
    const efficiencyScore = efficiency
    const backtrackScore = Math.max(0, 100 - backtracks * 5)

    // Optimal decision time is around 1-2 seconds
    let timeScore = 100
    if (avgTime < 0.5) {
      timeScore = 70 // Too fast might indicate impulsive decisions
    } else if (avgTime > 3) {
      timeScore = Math.max(50, 100 - (avgTime - 3) * 10) // Too slow might indicate difficulty planning
    }

    return Math.round(efficiencyScore * 0.5 + backtrackScore * 0.3 + timeScore * 0.2)
  }

  const handleDirectionClick = (dx: number, dy: number) => {
    if (isPlaying) {
      movePlayer(dx, dy)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Maze Run</h2>
      <p className="mb-6 text-center">
        Navigate through the maze from the start (top-left) to the goal (bottom-right). Use arrow keys or the direction
        buttons to move.
      </p>

      <div className="flex justify-between w-full mb-4">
        <div className="text-sm">
          <p>Moves: {moveCount}</p>
          <p>
            Size: {mazeSize}x{mazeSize}
          </p>
        </div>
        <div className="flex items-center text-sm">
          <Hourglass className="w-4 h-4 mr-1" />
          <span>{(gameTime / 1000).toFixed(1)}s</span>
        </div>
      </div>

      <div
        ref={mazeRef}
        className="mb-6 bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
        tabIndex={0}
        style={{ width: `${mazeSize * 30}px`, height: `${mazeSize * 30}px` }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${mazeSize}, 1fr)`,
            gridTemplateRows: `repeat(${mazeSize}, 1fr)`,
            width: "100%",
            height: "100%",
          }}
        >
          {maze.map((row, y) =>
            row.map((cell, x) => {
              let cellClass = "w-full h-full"

              if (playerPos.x === x && playerPos.y === y) {
                cellClass += " bg-blue-500" // Player
              } else if (goalPos.x === x && goalPos.y === y) {
                cellClass += " bg-green-500" // Goal
              } else if (cell === 1) {
                cellClass += " bg-gray-800" // Wall
              } else {
                cellClass += " bg-white" // Path
              }

              return <div key={`${x}-${y}`} className={cellClass}></div>
            }),
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div></div>
        <Button variant="outline" size="icon" onClick={() => handleDirectionClick(0, -1)}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div></div>

        <Button variant="outline" size="icon" onClick={() => handleDirectionClick(-1, 0)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div></div>
        <Button variant="outline" size="icon" onClick={() => handleDirectionClick(1, 0)}>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div></div>
        <Button variant="outline" size="icon" onClick={() => handleDirectionClick(0, 1)}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <div></div>
      </div>

      {!isPlaying && <Button onClick={startGame}>Restart Game</Button>}
    </div>
  )
}

