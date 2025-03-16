"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

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

interface PathNode {
  x: number
  y: number
  g: number // cost from start to current node
  h: number // heuristic (estimated cost from current to goal)
  f: number // total cost (g + h)
  parent: PathNode | null
}

// Improved cell type definition
enum CellType {
  PATH = 0,
  WALL = 1,
  START = 2,
  GOAL = 3,
  VISITED = 4
}

export default function MazeRun({ difficulty, onComplete }: MazeRunProps) {
  const [mazeSize, setMazeSize] = useState<number>(10)
  const [maze, setMaze] = useState<number[][]>([])
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 })
  const [goalPosition, setGoalPosition] = useState<Position>({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [gameTime, setGameTime] = useState<number>(0)
  const [backtrackCount, setBacktrackCount] = useState<number>(0)
  const [optimalPath, setOptimalPath] = useState<Position[]>([])
  const [alternativePaths, setAlternativePaths] = useState<Position[][]>([])
  const [pathDeviation, setPathDeviation] = useState<number>(0)
  const [visitedPositions, setVisitedPositions] = useState<Set<string>>(new Set())
  const [showOptimalPath, setShowOptimalPath] = useState<boolean>(false)
  
  // Refs to track state
  const visitedCellsRef = useRef<Set<string>>(new Set())
  const gameCompletedRef = useRef<boolean>(false)

  // Set up game based on difficulty
  useEffect(() => {
    visitedCellsRef.current = new Set<string>()
    gameCompletedRef.current = false
    setVisitedPositions(new Set())
    setShowOptimalPath(false)
    
    // Set maze size based on difficulty
    if (difficulty === "easy") setMazeSize(8)
    else if (difficulty === "medium") setMazeSize(12)
    else setMazeSize(16)

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

  // Key controls
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
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPlaying, playerPosition, maze])

  // IMPROVED: Generate a proper maze using a recursive backtracking algorithm
  // This ensures a fully connected maze with guaranteed paths
  const generateMaze = () => {
    const size = mazeSize
    
    // Start with a grid full of walls
    const newMaze: number[][] = Array(size).fill(0).map(() => Array(size).fill(CellType.WALL))
    
    // Define start and goal positions
    const start: Position = { x: 0, y: 0 }
    const goal: Position = { x: size - 1, y: size - 1 }
    
    // Helper to get random direction
    const directions = [
      { dx: 0, dy: -2 }, // up
      { dx: 2, dy: 0 },  // right
      { dx: 0, dy: 2 },  // down
      { dx: -2, dy: 0 }  // left
    ]
    
    // Shuffle array function
    const shuffle = (array: any[]) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }
    
    // Recursive function to carve paths
    const carvePath = (x: number, y: number) => {
      newMaze[y][x] = CellType.PATH // Mark current cell as path
      
      // Randomize directions
      const shuffledDirections = shuffle([...directions])
      
      // Try each direction
      for (const { dx, dy } of shuffledDirections) {
        const nx = x + dx
        const ny = y + dy
        
        // Check if next position is valid and not visited
        if (
          nx >= 0 && nx < size &&
          ny >= 0 && ny < size &&
          newMaze[ny][nx] === CellType.WALL
        ) {
          // Carve path by setting the wall between cells to path
          newMaze[y + dy/2][x + dx/2] = CellType.PATH
          // Recursively continue from the new cell
          carvePath(nx, ny)
        }
      }
    }
    
    // Start the recursive maze generation from a random position
    // For a better maze, we can start from a location in the first few rows/columns
    const startX = Math.floor(Math.random() * 2) * 2 // 0 or 2
    const startY = Math.floor(Math.random() * 2) * 2 // 0 or 2
    carvePath(startX, startY)
    
    // Ensure start and goal are paths
    newMaze[start.y][start.x] = CellType.PATH
    newMaze[goal.y][goal.x] = CellType.PATH
    
    // Ensure there's at least one path from start to goal
    // If there isn't already, create a more direct path
    const path = findOptimalPath(newMaze, start, goal)
    if (path.length === 0) {
      // Create a simple path if needed
      let currentX = start.x
      let currentY = start.y
      
      while (currentX < goal.x || currentY < goal.y) {
        if (currentX < goal.x) {
          currentX++
          newMaze[currentY][currentX] = CellType.PATH
        }
        if (currentY < goal.y) {
          currentY++
          newMaze[currentY][currentX] = CellType.PATH
        }
      }
    }
    
    // Find all possible paths for metrics
    const paths = findAllPaths(newMaze, start, goal)
    
    // Store the optimal and alternative paths
    setOptimalPath(paths[0])
    setAlternativePaths(paths.slice(1, Math.min(3, paths.length)))
    
    // Create a balanced maze with some additional paths
    // Add some random shortcuts to create alternative paths
    const addRandomShortcuts = () => {
      const numShortcuts = Math.floor(size / 4)
      
      for (let i = 0; i < numShortcuts; i++) {
        // Find a random wall
        let wx, wy
        
        do {
          wx = Math.floor(Math.random() * (size - 2)) + 1
          wy = Math.floor(Math.random() * (size - 2)) + 1
        } while (newMaze[wy][wx] !== CellType.WALL)
        
        // Check if it has at least two path neighbors opposite each other
        const hasHorizontalPathNeighbors = 
          wx > 0 && wx < size - 1 && 
          newMaze[wy][wx-1] === CellType.PATH && 
          newMaze[wy][wx+1] === CellType.PATH
          
        const hasVerticalPathNeighbors = 
          wy > 0 && wy < size - 1 && 
          newMaze[wy-1][wx] === CellType.PATH && 
          newMaze[wy+1][wx] === CellType.PATH
          
        // Create shortcut if valid
        if (hasHorizontalPathNeighbors || hasVerticalPathNeighbors) {
          newMaze[wy][wx] = CellType.PATH
        }
      }
    }
    
    // Add shortcuts based on difficulty
    if (difficulty !== "hard") {
      addRandomShortcuts()
    }
    
    return {
      maze: newMaze,
      start,
      goal
    }
  }

  // A* algorithm for finding optimal path (unchanged)
  const findOptimalPath = (maze: number[][], start: Position, goal: Position): Position[] => {
    const openSet: PathNode[] = []
    const closedSet = new Set<string>()
    
    // Heuristic function (Manhattan distance)
    const heuristic = (a: Position, b: Position): number => {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
    }
    
    // Get unique key for position
    const posKey = (pos: Position): string => `${pos.x},${pos.y}`
    
    // Add start node to open set
    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: heuristic(start, goal),
      f: heuristic(start, goal),
      parent: null
    }
    
    openSet.push(startNode)
    
    // A* search algorithm
    while (openSet.length > 0) {
      // Sort by f score and get the best node
      openSet.sort((a, b) => a.f - b.f)
      const current = openSet.shift()!
      
      // Check if reached goal
      if (current.x === goal.x && current.y === goal.y) {
        // Reconstruct path
        const path: Position[] = []
        let temp: PathNode | null = current
        
        while (temp !== null) {
          path.push({ x: temp.x, y: temp.y })
          temp = temp.parent
        }
        
        return path.reverse()
      }
      
      // Add to closed set
      closedSet.add(posKey({ x: current.x, y: current.y }))
      
      // Check neighbors
    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }  // left
      ]
      
      for (const { dx, dy } of directions) {
        const nx = current.x + dx
        const ny = current.y + dy
        
        // Check if valid position
        if (
          nx < 0 || nx >= maze[0].length || 
          ny < 0 || ny >= maze.length || 
          maze[ny][nx] === CellType.WALL || // wall
          closedSet.has(posKey({ x: nx, y: ny }))
        ) {
          continue
        }
        
        // Calculate g score for neighbor
        const gScore = current.g + 1
        
        // Create neighbor node
        const neighbor: PathNode = {
          x: nx,
          y: ny,
          g: gScore,
          h: heuristic({ x: nx, y: ny }, goal),
          f: gScore + heuristic({ x: nx, y: ny }, goal),
          parent: current
        }
        
        // Check if already in open set with better score
        const existingIndex = openSet.findIndex(n => n.x === nx && n.y === ny)
        if (existingIndex >= 0 && openSet[existingIndex].g <= gScore) {
          continue
        }
        
        // Add to open set
        if (existingIndex >= 0) {
          openSet[existingIndex] = neighbor
        } else {
          openSet.push(neighbor)
        }
      }
    }
    
    // No path found
    return []
  }
  
  // Find multiple paths (remaining code unchanged...)
  const findAllPaths = (maze: number[][], start: Position, goal: Position): Position[][] => {
    // Find optimal path first
    const optimalPath = findOptimalPath(maze, start, goal)
    if (optimalPath.length === 0) return []
    
    const paths = [optimalPath]
    
    // Try to find alternative paths
    for (let attempt = 0; attempt < 5; attempt++) {
      const tempMaze = maze.map(row => [...row])
      
      // Block some points from optimal path
      const midPathPoints = optimalPath.slice(1, optimalPath.length - 1)
      const blockCount = Math.min(3, Math.floor(midPathPoints.length / 3))
      
      for (let i = 0; i < blockCount; i++) {
        const randomIndex = Math.floor(Math.random() * midPathPoints.length)
        const point = midPathPoints[randomIndex]
        tempMaze[point.y][point.x] = CellType.WALL
        midPathPoints.splice(randomIndex, 1)
      }
      
      // Find new path
      const newPath = findOptimalPath(tempMaze, start, goal)
      
      if (newPath.length > 0) {
        // Check if significantly different
        let isDifferent = true
        for (const existingPath of paths) {
          const overlap = calculatePathOverlap(existingPath, newPath)
          if (overlap > 0.7) {
            isDifferent = false
            break
          }
        }
        
        if (isDifferent) {
          paths.push(newPath)
          if (paths.length >= 3) break
        }
      }
    }
    
    return paths
  }
  
  // Calculate path overlap (unchanged)
  const calculatePathOverlap = (path1: Position[], path2: Position[]): number => {
    const path1Set = new Set(path1.map(p => `${p.x},${p.y}`))
    const path2Set = new Set(path2.map(p => `${p.x},${p.y}`))
    
    let overlapCount = 0
    for (const posKey of path1Set) {
      if (path2Set.has(posKey)) overlapCount++
    }
    
    return overlapCount / Math.max(path1Set.size, path2Set.size)
  }

  // Start game
  const startGame = () => {
    // Generate new maze with our improved algorithm
    const { maze: newMaze, start, goal } = generateMaze()
    
    setMaze(newMaze)
    setPlayerPosition(start)
    setGoalPosition(goal)
    
    // Reset game state
    setIsPlaying(true)
    setStartTime(Date.now())
    setGameTime(0)
    setMoveHistory([{ position: start, time: 0 }])
    setBacktrackCount(0)
    setPathDeviation(0)
    setShowOptimalPath(false)
    
    // Reset tracking
    visitedCellsRef.current.clear()
    visitedCellsRef.current.add(`${start.x},${start.y}`)
    gameCompletedRef.current = false
    
    // Initialize visited positions
    const newVisited = new Set<string>()
    newVisited.add(`${start.x},${start.y}`)
    setVisitedPositions(newVisited)
  }

  // Handle player movement
  const movePlayer = (dx: number, dy: number) => {
    if (!isPlaying || gameCompletedRef.current) return

    const newX = playerPosition.x + dx
    const newY = playerPosition.y + dy

    // Check if valid move
    if (
      newX >= 0 && newX < mazeSize &&
      newY >= 0 && newY < mazeSize &&
      maze[newY][newX] !== CellType.WALL
    ) {
      const newPosition = { x: newX, y: newY }
      
      // Track move
      const moveTime = Date.now() - startTime
      setMoveHistory(prev => [...prev, { position: newPosition, time: moveTime }])
      
      // Check for backtracking
      const posKey = `${newX},${newY}`
      if (visitedCellsRef.current.has(posKey)) {
        setBacktrackCount(prev => prev + 1)
      } else {
        visitedCellsRef.current.add(posKey)
      }
      
      // Update player position
      setPlayerPosition(newPosition)
      
      // Update visited positions for display
      setVisitedPositions(prev => {
        const newSet = new Set(prev)
        newSet.add(posKey)
        return newSet
      })

      // Check if reached goal
      if (newX === goalPosition.x && newY === goalPosition.y) {
        gameComplete()
      }
    }
  }

  // Game completion
  const gameComplete = () => {
    if (!isPlaying || gameCompletedRef.current) return
    
    gameCompletedRef.current = true
    setIsPlaying(false)
    setShowOptimalPath(true)

    // Calculate metrics
    const totalTime = (Date.now() - startTime) / 1000
    
    // Calculate path efficiency
    const playerPathLength = moveHistory.length - 1
    const optimalPathLength = optimalPath.length - 1
    const efficiency = optimalPathLength > 0 ? (optimalPathLength / playerPathLength) * 100 : 0
    
    // Calculate deviation
    const deviation = calculatePathDeviation(moveHistory.map(m => m.position), optimalPath)
    setPathDeviation(deviation)
    
    // Calculate decision times
    const decisionTimes = moveHistory.map((move, index) => {
      if (index === 0) return 0
      return (move.time - moveHistory[index - 1].time) / 1000
    }).slice(1)
    
    const avgDecisionTime = decisionTimes.length > 0 
      ? decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length 
      : 0
    
    // Calculate scores
    const spatialNavigationScore = calculateSpatialNavigationScore(efficiency, backtrackCount, mazeSize)
    const planningScore = calculatePlanningScore(efficiency, backtrackCount, avgDecisionTime)
    
    // Send metrics
    onComplete({
      totalTime,
      pathLength: playerPathLength,
      optimalPathLength,
      efficiency,
      backtrackCount,
      pathDeviation: deviation,
      avgDecisionTime,
      spatialNavigationScore,
      planningScore,
      mazeSize,
      possiblePaths: alternativePaths.length + 1
    })
  }
  
  // Calculate path deviation (unchanged)
  const calculatePathDeviation = (playerPath: Position[], optimalPath: Position[]): number => {
    const optimalSet = new Set(optimalPath.map(p => `${p.x},${p.y}`))
    const playerSet = new Set(playerPath.map(p => `${p.x},${p.y}`))
    
    let deviationCount = 0
    for (const posKey of playerSet) {
      if (!optimalSet.has(posKey)) deviationCount++
    }
    
    return (deviationCount / playerPath.length) * 100
  }

  // Score calculations (unchanged)
  const calculateSpatialNavigationScore = (efficiency: number, backtracks: number, size: number) => {
    let score = efficiency
    const backtrackPenalty = backtracks * (size / 2)
    score = Math.max(0, score - backtrackPenalty)
    const deviationPenalty = pathDeviation * 0.5
    score = Math.max(0, score - deviationPenalty)
    const sizeBonus = (size / 16) * 10
    score = Math.min(100, score + sizeBonus)
    return Math.round(score)
  }

  const calculatePlanningScore = (efficiency: number, backtracks: number, avgTime: number) => {
    let score = efficiency * 0.6
    const optimalThinkTime = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2
    const timeFactor = avgTime > optimalThinkTime ? 
      Math.max(0, 1 - ((avgTime - optimalThinkTime) / 5)) : 1
    score += 30 * timeFactor
    const backtrackPenalty = Math.min(20, backtracks * 2)
    score -= backtrackPenalty
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  // Handle directional button clicks
  const handleDirectionClick = (dx: number, dy: number) => {
    movePlayer(dx, dy)
  }

  // Improved cell rendering with better visual distinction
  const renderCell = (x: number, y: number) => {
    const isPlayer = playerPosition.x === x && playerPosition.y === y
    const isGoal = goalPosition.x === x && goalPosition.y === y
    const isWall = maze[y][x] === CellType.WALL
    const isVisited = visitedPositions.has(`${x},${y}`)
    const isOptimal = showOptimalPath && optimalPath.some(p => p.x === x && p.y === y)
    
    // Determine cell appearance
    let cellClass = "w-full h-full flex items-center justify-center"
    
    if (isPlayer) {
      // Player cell
      cellClass += " bg-blue-500 text-white rounded-full shadow-lg border-2 border-blue-600 z-10"
    } else if (isGoal) {
      // Goal cell
      cellClass += " bg-green-500 text-white rounded-lg shadow-lg border-2 border-green-600"
    } else if (isWall) {
      // Wall cell - with better visual contrast
      cellClass += " bg-gray-800 shadow-inner border border-gray-900"
    } else if (isOptimal && !isPlayer) {
      // Optimal path (only shown after completion or in hint mode)
      cellClass += " bg-yellow-300 shadow-sm border border-yellow-400"
    } else if (isVisited && !isPlayer) {
      // Visited cell (player's path)
      cellClass += " bg-blue-100 border border-blue-200"
    } else {
      // Open path
      cellClass += " bg-gray-100 border border-gray-200"
    }
    
    return (
      <div className={cellClass}>
        {isPlayer && "🧠"}
        {isGoal && !isPlayer && "🏁"}
      </div>
    )
  }

  // Show a hint button to reveal the optimal path temporarily
  const togglePathHint = () => {
    if (isPlaying) {
      setShowOptimalPath(true)
      // Auto-hide after 1 second
      setTimeout(() => {
        setShowOptimalPath(false)
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-2">Maze Run</h2>
      <p className="mb-2 text-center text-sm">
        Navigate through the maze from start to finish using the arrow keys or buttons.
      </p>
      
      {/* Game stats */}
      <div className="mb-2 text-sm text-gray-600 flex gap-4">
        <div>Time: {(gameTime / 1000).toFixed(1)}s</div>
        <div>Moves: {moveHistory.length - 1}</div>
      </div>

      {/* Maze grid with better styling */}
      <div className="mb-6 border-2 border-gray-600 bg-white rounded-md overflow-hidden shadow-lg">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${mazeSize}, minmax(0, 1fr))`,
            width: `${Math.min(480, mazeSize * 30)}px`,
            height: `${Math.min(480, mazeSize * 30)}px`
          }}
        >
          {maze.map((row, y) =>
            row.map((_, x) => (
              <div key={`cell-${x}-${y}`} className="aspect-square">
                {renderCell(x, y)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Controls with clearer buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4 w-48">
        <div></div>
        <Button 
          variant="outline" 
          onClick={() => handleDirectionClick(0, -1)}
          className="h-12 w-12 flex items-center justify-center shadow-md hover:bg-blue-50"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
        <div></div>

        <Button 
          variant="outline" 
          onClick={() => handleDirectionClick(-1, 0)}
          className="h-12 w-12 flex items-center justify-center shadow-md hover:bg-blue-50"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center justify-center">
          {isPlaying && (
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePathHint}
              className="text-xs h-8 px-2"
            >
              Hint
            </Button>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={() => handleDirectionClick(1, 0)}
          className="h-12 w-12 flex items-center justify-center shadow-md hover:bg-blue-50"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>

        <div></div>
        <Button 
          variant="outline" 
          onClick={() => handleDirectionClick(0, 1)}
          className="h-12 w-12 flex items-center justify-center shadow-md hover:bg-blue-50"
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
        <div></div>
      </div>

      {/* Game controls */}
      <div className="flex gap-4">
        {!isPlaying && (
          <Button onClick={startGame} className="shadow-md">
            {moveHistory.length > 1 ? "Play Again" : "Start Game"}
          </Button>
        )}
        
        {isPlaying && (
          <Button onClick={gameComplete} variant="outline" className="shadow-md">
            Skip Game
          </Button>
        )}
      </div>
    </div>
  )
}

