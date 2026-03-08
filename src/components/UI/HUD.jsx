import { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { playActivateSound } from '../../utils/sounds'

const LEVEL_NAMES = ['טהרן שקטה', 'גשם טילים', 'סערת כטבמים', 'אפוקליפסה', 'שחר הנקמה']

export default function HUD() {
  const { score, lives, level, levelProgress, restartGame } = useGameStore()
  const ironDomeCount = useGameStore(s => s.ironDomeCount)
  const ironDomeActive = useGameStore(s => s.ironDomeActive)
  const activateIronDome = useGameStore(s => s.activateIronDome)

  // ESC → menu, ENTER → activate Iron Dome
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape') restartGame()
      if (e.code === 'Enter') { activateIronDome(); playActivateSound() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [restartGame, activateIronDome])

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none',
      zIndex: 50,
    }}>
      {/* Iron Dome active - screen border glow */}
      {ironDomeActive && (
        <div style={{
          position: 'absolute', inset: 0,
          border: '4px solid #44aaff',
          boxShadow: 'inset 0 0 40px rgba(68,170,255,0.25), 0 0 20px rgba(68,170,255,0.4)',
          borderRadius: 4,
          pointerEvents: 'none',
        }} />
      )}

      {/* HUD bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '0.7rem 1rem',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        {/* Left: Lives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                width: 26, height: 26, borderRadius: '50%',
                background: i < lives ? '#ff2222' : '#2a2a2a',
                border: '2px solid',
                borderColor: i < lives ? '#ff4444' : '#444',
                boxShadow: i < lives ? '0 0 8px #ff2222' : 'none',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          <div style={{ color: '#888', fontSize: '0.68rem' }}>נשמות</div>
        </div>

        {/* Center: Level + Progress */}
        <div style={{ textAlign: 'center', flex: 1, padding: '0 0.8rem' }}>
          <div style={{
            color: '#ffaa44', fontWeight: 800,
            fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
            textShadow: '0 0 10px #ff6600',
          }}>
            שלב {level}: {LEVEL_NAMES[level - 1]}
          </div>
          <div style={{
            height: 7, borderRadius: 4,
            background: '#1a1a1a', border: '1px solid #333',
            overflow: 'hidden', marginTop: 4,
          }}>
            <div style={{
              height: '100%',
              width: `${levelProgress * 100}%`,
              background: 'linear-gradient(90deg, #ff4400, #ffcc00)',
              borderRadius: 4,
              transition: 'width 0.3s',
              boxShadow: '0 0 6px #ff6600',
            }} />
          </div>
          {level === 5 && (
            <div style={{
              color: '#ff4400', fontSize: '0.65rem', marginTop: 2,
              animation: 'hudPulse 1s infinite',
            }}>
              הבונקר קרוב!
            </div>
          )}
        </div>

        {/* Right: Score + Exit */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, pointerEvents: 'auto' }}>
          <div style={{ pointerEvents: 'none', textAlign: 'right' }}>
            <div style={{
              color: '#44ffaa', fontWeight: 900,
              fontSize: 'clamp(1rem, 3vw, 1.4rem)',
              textShadow: '0 0 10px #00ff88',
            }}>
              {score.toLocaleString()}
            </div>
            <div style={{ color: '#888', fontSize: '0.68rem' }}>ניקוד</div>
          </div>
          <button
            onClick={restartGame}
            title="יציאה (ESC)"
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'rgba(180,40,20,0.8)',
              border: '1.5px solid rgba(255,80,40,0.5)',
              color: '#fff',
              fontSize: '0.9rem', fontWeight: 900,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.15s',
              lineHeight: 1,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,60,20,0.95)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(180,40,20,0.8)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            X
          </button>
        </div>
      </div>

      {/* Iron Dome panel - bottom left */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '1rem',
        display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start',
        pointerEvents: 'auto',
      }}>
        {/* Active banner */}
        {ironDomeActive && (
          <div style={{
            background: 'rgba(0,80,180,0.85)',
            border: '1.5px solid #44aaff',
            color: '#aaddff',
            fontSize: '0.72rem', fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 6,
            boxShadow: '0 0 14px rgba(68,170,255,0.6)',
            animation: 'hudPulse 0.6s infinite',
          }}>
            כיפת ברזל פעילה!
          </div>
        )}
        {/* Charge icons + activate hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                width: 20, height: 20,
                borderRadius: 4,
                background: i < ironDomeCount ? '#1177dd' : '#1a1a2a',
                border: '1.5px solid',
                borderColor: i < ironDomeCount ? '#44aaff' : '#333',
                boxShadow: i < ironDomeCount ? '0 0 6px #44aaff' : 'none',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          <div style={{
            color: ironDomeCount > 0 ? '#66bbff' : '#555',
            fontSize: '0.65rem',
          }}>
            {ironDomeCount > 0 ? 'ENTER להפעיל' : 'כיפת ברזל'}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hudPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}
