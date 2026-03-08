import React from 'react'
import { useGameStore } from './store/gameStore'
import StartScreen from './components/UI/StartScreen'
import Game from './components/Game'
import GameOverScreen from './components/UI/GameOverScreen'
import VictoryScreen from './components/UI/VictoryScreen'

export default function App() {
  const phase = useGameStore(s => s.phase)

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {phase === 'menu' && <StartScreen />}
      {(phase === 'playing' || phase === 'paused') && <Game />}
      {phase === 'gameover' && <GameOverScreen />}
      {phase === 'victory' && <VictoryScreen />}
    </div>
  )
}
