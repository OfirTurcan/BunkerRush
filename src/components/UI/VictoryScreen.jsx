import React from 'react'
import { useGameStore } from '../../store/gameStore'

export default function VictoryScreen() {
  const { score, restartGame } = useGameStore()

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a00 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100, color: '#fff',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '0.3em' }}>🏆</div>
      <div style={{
        fontSize: 'clamp(1.5rem, 5vw, 3rem)',
        fontWeight: 900, color: '#ffcc00',
        textShadow: '0 0 30px #ffaa00',
        marginBottom: '0.3em', textAlign: 'center',
      }}>ניצחת!</div>
      <div style={{
        color: '#aaa', marginBottom: '1em',
        fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
        textAlign: 'center', maxWidth: 400, lineHeight: 1.5,
      }}>
        הגעת לבונקר של חמינאי!<br />
        המנהיג הרוחני הסתתר בהצלחה... בינתיים.
      </div>
      <div style={{
        background: 'rgba(255,204,0,0.1)',
        borderRadius: 16, padding: '1.5rem 3rem',
        margin: '1rem 0', textAlign: 'center',
        border: '1px solid #ffcc00',
      }}>
        <div style={{ color: '#ffcc00', fontSize: '2.5rem', fontWeight: 800 }}>
          {score.toLocaleString()}
        </div>
        <div style={{ color: '#aaa', fontSize: '0.9rem' }}>ניקוד סופי</div>
        <div style={{ color: '#44ffaa', marginTop: '0.5em' }}>
          5/5 שלבים הושלמו
        </div>
      </div>
      <button
        onClick={restartGame}
        style={{
          padding: '0.9em 3em',
          fontSize: '1.2rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #ffcc00, #ff8800)',
          color: '#000', border: 'none',
          borderRadius: 50, cursor: 'pointer',
          boxShadow: '0 0 30px rgba(255,200,0,0.5)',
          marginTop: '1rem',
        }}
      >
        שחק שוב
      </button>
    </div>
  )
}
