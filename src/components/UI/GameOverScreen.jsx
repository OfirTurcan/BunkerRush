import React from 'react'
import { useGameStore } from '../../store/gameStore'

export default function GameOverScreen() {
  const { score, level, restartGame } = useGameStore()

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100, color: '#fff',
    }}>
      <div style={{
        fontSize: 'clamp(3rem, 10vw, 6rem)',
        marginBottom: '0.2em',
        filter: 'drop-shadow(0 0 20px red)',
      }}>💥</div>
      <div style={{
        fontSize: 'clamp(2rem, 6vw, 3.5rem)',
        fontWeight: 900, color: '#ff2222',
        textShadow: '0 0 20px #ff0000',
        marginBottom: '0.3em',
      }}>נפלת!</div>
      <div style={{ color: '#aaa', marginBottom: '0.5em', fontSize: '1rem' }}>
        הטילים האיראנים ניצחו הפעם...
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 16, padding: '1.5rem 3rem',
        margin: '1rem 0', textAlign: 'center',
        border: '1px solid #333',
      }}>
        <div style={{ color: '#44ffaa', fontSize: '2rem', fontWeight: 800 }}>
          {score.toLocaleString()}
        </div>
        <div style={{ color: '#aaa', fontSize: '0.9rem' }}>ניקוד סופי</div>
        <div style={{ color: '#ffaa44', marginTop: '0.5em' }}>
          הגעת לשלב {level} מתוך 5
        </div>
      </div>
      <button
        onClick={restartGame}
        style={{
          padding: '0.9em 3em',
          fontSize: '1.2rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #ff4400, #cc2200)',
          color: '#fff', border: 'none',
          borderRadius: 50, cursor: 'pointer',
          boxShadow: '0 0 30px rgba(255,68,0,0.5)',
          marginTop: '1rem',
        }}
      >
        נסה שוב
      </button>
    </div>
  )
}
