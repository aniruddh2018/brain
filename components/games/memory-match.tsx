"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Hourglass } from "lucide-react"

interface MemoryMatchProps {
  difficulty: string
  onComplete: (metrics: any) => void
}

interface CardType {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

export default function MemoryMatch({ difficulty, onComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<CardType[]>([])
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [matches, setMatches] = useState(0)
  const [errors, setErrors] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastFlipTime, setLastFlipTime] = useState(0)

  // Set up game based on difficulty
  useEffect(() => {
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

  const startGame = () => {
    const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"]
    let pairCount = 6 // Default medium

    if (difficulty === "easy") pairCount = 4
    else if (difficulty === "hard") pairCount = 8

    const gameEmojis = emojis.slice(0, pairCount)
    let gameCards: CardType[] = []

    gameEmojis.forEach((emoji, index) => {
      gameCards.push({ id: index * 2, emoji, flipped: false, matched: false })
      gameCards.push({ id: index * 2 + 1, emoji, flipped: false, matched: false })
    })

    // Shuffle cards
    gameCards = gameCards.sort(() => Math.random() - 0.5)

    setCards(gameCards)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setErrors(0)
    setReactionTimes([])
    setStartTime(Date.now())
    setIsPlaying(true)
  }

  const handleCardClick = (card: CardType) => {
    if (!isPlaying || card.flipped || card.matched || flippedCards.length >= 2) return

    // Calculate reaction time
    const now = Date.now()
    if (lastFlipTime > 0) {
      setReactionTimes((prev) => [...prev, now - lastFlipTime])
    }
    setLastFlipTime(now)

    // Flip card
    const newCards = cards.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
    setCards(newCards)

    const newFlippedCards = [...flippedCards, card]
    setFlippedCards(newFlippedCards)

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)

      if (newFlippedCards[0].emoji === newFlippedCards[1].emoji) {
        // Match found
        setTimeout(() => {
          setCards(
            cards.map((c) =>
              c.id === newFlippedCards[0].id || c.id === newFlippedCards[1].id
                ? { ...c, matched: true, flipped: false }
                : c,
            ),
          )
          setMatches(matches + 1)
          setFlippedCards([])

          // Check if game is complete
          if (matches + 1 === cards.length / 2) {
            gameComplete()
          }
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards(
            newCards.map((c) =>
              c.id === newFlippedCards[0].id || c.id === newFlippedCards[1].id ? { ...c, flipped: false } : c,
            ),
          )
          setErrors(errors + 1)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const gameComplete = () => {
    setIsPlaying(false)

    // Calculate metrics
    const totalTime = (Date.now() - startTime) / 1000 // in seconds
    const avgReactionTime =
      reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000 : 0
    const accuracy = moves > 0 ? (matches / moves) * 100 : 0

    // Send metrics to parent
    onComplete({
      totalTime,
      moves,
      matches,
      errors,
      avgReactionTime,
      accuracy,
      memoryScore: calculateMemoryScore(totalTime, moves, cards.length / 2),
    })
  }

  const calculateMemoryScore = (time: number, moves: number, pairs: number) => {
    // Lower time and fewer moves = better score
    const baseScore = 100
    const timeWeight = 0.5
    const movesWeight = 0.5

    const perfectMoves = pairs // Minimum possible moves
    const timeScore = Math.max(0, baseScore - time * timeWeight)
    const movesScore = Math.max(0, baseScore - (moves - perfectMoves) * movesWeight * 10)

    return Math.round((timeScore + movesScore) / 2)
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Memory Match</h2>
      <p className="mb-6 text-center">Flip cards to find matching pairs. Remember the positions to match all cards.</p>

      <div className="flex justify-between items-center w-full mb-3">
        <div className="flex gap-3">
          <div className="text-sm font-medium">
            <span>Moves: </span>
            <span className="font-bold">{moves}</span>
          </div>
          <div className="text-sm font-medium">
            <span>Matches: </span>
            <span className="font-bold">{matches}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm font-medium">
          <Hourglass className="w-3 h-3 mr-1" />
          <span>{(gameTime / 1000).toFixed(1)}s</span>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 mb-3 w-full justify-items-center">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`aspect-square w-full max-w-[80px] perspective-500 cursor-pointer transform transition-transform ${
              card.matched ? "opacity-70" : ""
            }`}
            onClick={() => handleCardClick(card)}
          >
            <div
              className={`w-full h-full relative transition-all duration-300 transform-style-3d ${
                card.flipped ? "rotate-y-180" : ""
              }`}
            >
              <div className="absolute w-full h-full rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white backface-hidden shadow-md">
                <span className="text-2xl">?</span>
              </div>
              <div className="absolute w-full h-full rounded-lg bg-white flex items-center justify-center rotate-y-180 backface-hidden border-2 border-indigo-200 shadow-md">
                <span className="text-3xl">{card.emoji}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isPlaying && (
        <Button 
          onClick={startGame} 
          size="lg"
          className="mt-3 rounded-full text-base h-10 min-w-[120px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:opacity-90 hover:shadow-lg transition-all"
        >
          {matches > 0 ? "Play Again" : "Start Game"}
        </Button>
      )}
    </div>
  )
}

