"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Hourglass } from "lucide-react"

interface WordPuzzleProps {
  difficulty: string
  onComplete: (metrics: any) => void
}

export default function WordPuzzle({ difficulty, onComplete }: WordPuzzleProps) {
  const [words, setWords] = useState<string[]>([])
  const [scrambledWords, setScrambledWords] = useState<string[]>([])
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [gameTime, setGameTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [wordTimes, setWordTimes] = useState<number[]>([])
  const [lastWordTime, setLastWordTime] = useState<number>(0)
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)

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

  const getWordsByDifficulty = () => {
    const easyWords = ["cat", "dog", "sun", "moon", "star", "book", "tree", "fish", "bird", "cake"]
    const mediumWords = [
      "apple",
      "orange",
      "banana",
      "purple",
      "yellow",
      "window",
      "garden",
      "pencil",
      "school",
      "friend",
    ]
    const hardWords = [
      "elephant",
      "computer",
      "mountain",
      "universe",
      "knowledge",
      "beautiful",
      "adventure",
      "chocolate",
      "butterfly",
      "happiness",
    ]

    if (difficulty === "easy") return easyWords
    if (difficulty === "hard") return hardWords
    return mediumWords
  }

  const scrambleWord = (word: string) => {
    const letters = word.split("")
    let scrambled = ""

    // Keep scrambling until we get a different word
    do {
      scrambled = letters.sort(() => Math.random() - 0.5).join("")
    } while (scrambled === word)

    return scrambled
  }

  const startGame = () => {
    const allWords = getWordsByDifficulty()
    // Select 5 random words
    const selectedWords = allWords.sort(() => Math.random() - 0.5).slice(0, 5)

    const scrambled = selectedWords.map((word) => scrambleWord(word))

    setWords(selectedWords)
    setScrambledWords(scrambled)
    setUserAnswers(Array(selectedWords.length).fill(""))
    setWordTimes([])
    setLastWordTime(0)
    setCurrentWordIndex(0)
    setStartTime(Date.now())
    setIsPlaying(true)
  }

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers]
    newAnswers[index] = value
    setUserAnswers(newAnswers)

    // Record time for first input on this word
    if (userAnswers[index] === "" && value !== "" && index === currentWordIndex) {
      setLastWordTime(Date.now())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (currentWordIndex < words.length - 1) {
      // Record time taken for this word
      if (lastWordTime > 0) {
        setWordTimes([...wordTimes, Date.now() - lastWordTime])
      }

      // Move to next word
      setCurrentWordIndex(currentWordIndex + 1)
      setLastWordTime(0)
    } else {
      // Game complete
      gameComplete()
    }
  }

  const gameComplete = () => {
    setIsPlaying(false)

    // Calculate metrics
    const totalTime = (Date.now() - startTime) / 1000 // in seconds
    const correctAnswers = words.filter((word, index) => word.toLowerCase() === userAnswers[index].toLowerCase()).length

    const accuracy = (correctAnswers / words.length) * 100

    // Calculate average word solving time
    const avgWordTime = wordTimes.length > 0 ? wordTimes.reduce((a, b) => a + b, 0) / wordTimes.length / 1000 : 0

    // Calculate vocabulary score
    const vocabularyScore = calculateVocabularyScore(accuracy, avgWordTime, difficulty)

    // Send metrics to parent
    onComplete({
      totalTime,
      correctAnswers,
      totalWords: words.length,
      accuracy,
      avgWordTime,
      vocabularyScore,
      processingSpeed: calculateProcessingSpeed(avgWordTime, difficulty),
    })
  }

  const calculateVocabularyScore = (accuracy: number, avgTime: number, diff: string) => {
    // Base score on accuracy
    const baseScore = accuracy

    // Adjust for time (faster is better)
    let timeMultiplier = 1
    if (diff === "easy") {
      timeMultiplier = Math.max(0.5, 1 - avgTime / 10) // Expect ~5s per word
    } else if (diff === "medium") {
      timeMultiplier = Math.max(0.5, 1 - avgTime / 15) // Expect ~7.5s per word
    } else {
      timeMultiplier = Math.max(0.5, 1 - avgTime / 20) // Expect ~10s per word
    }

    return Math.round(baseScore * timeMultiplier)
  }

  const calculateProcessingSpeed = (avgTime: number, diff: string) => {
    // Base processing speed (100 is fastest)
    const baseSpeed = 100

    // Adjust for difficulty
    const expectedTime = diff === "easy" ? 5 : diff === "medium" ? 7.5 : 10

    // Calculate speed (faster than expected = higher score)
    return Math.round(Math.max(0, Math.min(100, baseSpeed * (expectedTime / Math.max(1, avgTime)))))
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Word Puzzle</h2>
      <p className="mb-6 text-center">
        Unscramble each word and type the correct answer. Submit to move to the next word.
      </p>

      <div className="flex justify-between w-full mb-4">
        <div className="text-sm">
          <p>
            Word: {currentWordIndex + 1} of {words.length}
          </p>
        </div>
        <div className="flex items-center text-sm">
          <Hourglass className="w-4 h-4 mr-1" />
          <span>{(gameTime / 1000).toFixed(1)}s</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-bold text-center mb-2">{scrambledWords[currentWordIndex]}</h3>
          <Input
            type="text"
            value={userAnswers[currentWordIndex] || ""}
            onChange={(e) => handleInputChange(currentWordIndex, e.target.value)}
            placeholder="Type the unscrambled word"
            className="text-center"
            autoFocus
          />
        </div>

        <Button type="submit" className="w-full">
          {currentWordIndex < words.length - 1 ? "Next Word" : "Finish"}
        </Button>
      </form>

      {!isPlaying && (
        <Button onClick={startGame} className="mt-4">
          Restart Game
        </Button>
      )}
    </div>
  )
}

