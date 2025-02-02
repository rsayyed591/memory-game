"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Heart, Star, Sun, Moon, Cloud, Flower2, type LucideIcon } from "lucide-react"
import confetti from "canvas-confetti"

type MemoryCard = {
  id: number
  icon: LucideIcon
  isMatched: boolean
  color: string
}

type GameMode = "single" | "two-player"
type GameState = "welcome" | "register" | "playing" | "finished"

const createCards = () => {
  const iconConfigs = [
    { icon: Heart, color: "text-rose-400" },
    { icon: Star, color: "text-amber-400" },
    { icon: Sun, color: "text-yellow-400" },
    { icon: Moon, color: "text-purple-400" },
    { icon: Cloud, color: "text-sky-400" },
    { icon: Flower2, color: "text-emerald-400" },
  ]

  const cards: MemoryCard[] = []

  iconConfigs.forEach(({ icon, color }, index) => {
    cards.push({ id: index * 2, icon, color, isMatched: false }, { id: index * 2 + 1, icon, color, isMatched: false })
  })

  return cards.sort(() => Math.random() - 0.5)
}

export default function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>(createCards())
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [gameState, setGameState] = useState<GameState>("welcome")
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [scores, setScores] = useState<{ player1: number; player2: number }>({ player1: 0, player2: 0 })
  const [player1Name, setPlayer1Name] = useState("")
  const [player2Name, setPlayer2Name] = useState("")
  const [winner, setWinner] = useState<string | null>(null)

  const handleCardClick = (clickedIndex: number) => {
    if (
      isChecking ||
      cards[clickedIndex].isMatched ||
      flippedIndexes.includes(clickedIndex) ||
      flippedIndexes.length === 2
    )
      return

    const newFlipped = [...flippedIndexes, clickedIndex]
    setFlippedIndexes(newFlipped)

    if (newFlipped.length === 2) {
      setIsChecking(true)
      const [firstIndex, secondIndex] = newFlipped
      const firstCard = cards[firstIndex]
      const secondCard = cards[secondIndex]

      if (firstCard.icon === secondCard.icon) {
        setTimeout(() => {
          setCards(
            cards.map((card, index) =>
              index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card,
            ),
          )
          setFlippedIndexes([])
          setMatches((m) => m + 1)
          setIsChecking(false)

          // Assign points and keep the turn
          setScores((prevScores) => ({
            ...prevScores,
            [currentPlayer === 1 ? 'player1' : 'player2']: prevScores[currentPlayer === 1 ? 'player1' : 'player2'] + 1,
          }))

          // Check for game completion
          if (matches === cards.length / 2 - 1) {
            const winnerName =
              gameMode === "single"
                ? player1Name
                : scores.player1 > scores.player2
                  ? player1Name
                  : scores.player2 > scores.player1
                    ? player2Name
                    : "It's a tie!"
            setWinner(winnerName)
            setGameState("finished")
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            })
          }
        }, 500)
      } else {
        setTimeout(() => {
          setFlippedIndexes([])
          setIsChecking(false)
          if (gameMode === "two-player") {
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
          }
        }, 1000)
      }
    }
  }

  const resetGame = (keepNames = false) => {
    setCards(createCards())
    setFlippedIndexes([])
    setMatches(0)
    setIsChecking(false)
    setScores({ player1: 0, player2: 0 })
    setCurrentPlayer(1)
    setWinner(null)
    if (!keepNames) {
      setPlayer1Name("")
      setPlayer2Name("")
      setGameMode(null)
      setGameState("welcome")
    } else {
      setGameState("playing")
    }
  }

  const startGame = (mode: GameMode) => {
    setGameMode(mode)
    if (mode === "single") {
      setGameState("register")
    } else {
      setGameState("register")
    }
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gameMode === "single" && player1Name) {
      setGameState("playing")
    } else if (gameMode === "two-player" && player1Name && player2Name) {
      setGameState("playing")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
        Memory Match Game
      </h1>

      {gameState === "welcome" && (
        <div className="space-y-4 text-center">
          <p className="text-2xl text-indigo-200 mb-6">Welcome to Memory Game!</p>
          <Button
            onClick={() => startGame("single")}
            variant="outline"
            size="lg"
            className="w-48 bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
          >
            Single Player
          </Button>
          <Button
            onClick={() => startGame("two-player")}
            variant="outline"
            size="lg"
            className="w-48 bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
          >
            Two Players
          </Button>
        </div>
      )}

      {gameState === "register" && (
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Player 1 Name"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            className="bg-indigo-950 border-indigo-700 text-indigo-200"
            required
          />
          {gameMode === "two-player" && (
            <Input
              type="text"
              placeholder="Player 2 Name"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              className="bg-indigo-950 border-indigo-700 text-indigo-200"
              required
            />
          )}
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="w-full bg-indigo-950 border-indigo-700 hover:bg-indigo-900 hover:border-indigo-500 text-indigo-200 hover:text-indigo-100"
          >
            Start Game
          </Button>
        </form>
      )}

      {gameState === "playing" && (
        <>
          <div className="text-center space-y-4">
            {gameMode === "single" ? (
              <p className="text-indigo-200">Score: {scores.player1}</p>
            ) : (
              <div className="flex justify-center space-x-4">
                <p className={`text-indigo-200 ${currentPlayer === 1 ? "font-bold" : ""}`}>
                  {player1Name}: {scores.player1}
                </p>
                <p className={`text-indigo-200 ${currentPlayer === 2 ? "font-bold" : ""}`}>
                  {player2Name}: {scores.player2}
                </p>
              </div>
            )}
            <p className="text-indigo-200">
              Matches found: {matches} of {cards.length / 2}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 p-6 rounded-xl bg-indigo-950/50 backdrop-blur-sm">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ rotateY: 0 }}
                animate={{
                  rotateY: card.isMatched || flippedIndexes.includes(index) ? 180 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="perspective-1000"
              >
                <Card
                  className={`relative w-24 h-24 md:w-32 md:h-32 cursor-pointer transform-style-3d transition-all duration-300 ${
                    card.isMatched
                      ? "bg-indigo-900/50 border-indigo-400/50"
                      : flippedIndexes.includes(index)
                        ? "bg-indigo-800/50 border-indigo-500/50"
                        : "bg-indigo-950 border-indigo-800 hover:border-indigo-600 hover:bg-indigo-900/80"
                  }`}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-500/5 to-white/5" />
                  <AnimatePresence>
                    {(card.isMatched || flippedIndexes.includes(index)) && (
                      <motion.div
                        initial={{ opacity: 0, rotateY: 180 }}
                        animate={{ opacity: 1, rotateY: 180 }}
                        exit={{ opacity: 0, rotateY: 180 }}
                        className="absolute inset-0 flex items-center justify-center backface-hidden"
                      >
                        <card.icon
                          className={`w-12 h-12 ${
                            card.isMatched
                              ? `${card.color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`
                              : card.color
                          }`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <Dialog open={gameState === "finished"} onOpenChange={() => {}}>
        <DialogContent className="bg-indigo-950 border-indigo-700 text-indigo-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">🎉 Congratulations! 🎉</DialogTitle>
            <DialogDescription className="text-center text-xl">
              {winner === "It's a tie!" ? winner : `${winner} wins!`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col space-y-2">
            <Button
              onClick={() => resetGame(true)}
              variant="outline"
              className="w-full bg-indigo-900 border-indigo-700 hover:bg-indigo-800 hover:border-indigo-600 text-indigo-200"
            >
              Restart Current Game
            </Button>
            <Button
              onClick={() => resetGame(false)}
              variant="outline"
              className="w-full bg-indigo-900 border-indigo-700 hover:bg-indigo-800 hover:border-indigo-600 text-indigo-200"
            >
              New Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

