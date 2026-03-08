import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'

export default function StartScreen() {
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const selectCharacter = useGameStore(s => s.selectCharacter)
  const startGame = useGameStore(s => s.startGame)

  const handleStart = () => {
    if (!selected) return
    selectCharacter(selected)
    startGame()
  }

  const characters = [
    {
      id: 'bibi',
      image: '/images/bibi.jpg',
      name: 'בנימין נתניהו',
      title: 'ראש הממשלה',
      desc: 'בורח מהטילים לבונקר הבטוח',
    },
    {
      id: 'trump',
      image: '/images/trump.jpg',
      name: 'דונלד טראמפ',
      title: 'הנשיא ה-47 של ארה"ב',
      desc: 'MAGA Mission – Make it to the Bunker!',
    },
  ]

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #100804 0%, #1e0c0c 40%, #0a0a1a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100, color: '#fff',
      fontFamily: "'Arial', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Background smoke vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 15% 85%, rgba(120,40,0,0.35) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 15%, rgba(150,20,0,0.25) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 100%, rgba(40,20,0,0.5) 0%, transparent 40%)
        `,
      }} />

      {/* Title */}
      <div style={{
        position: 'relative', zIndex: 1,
        fontSize: 'clamp(2.2rem, 6.5vw, 4.5rem)',
        fontWeight: 900, letterSpacing: '0.06em',
        color: '#ff4400',
        textShadow: '0 0 30px #ff4400, 0 0 70px #cc1100, 0 2px 8px rgba(0,0,0,0.8)',
        marginBottom: '0.15em',
        textAlign: 'center',
      }}>
        BUNKER RUSH
      </div>
      <div style={{
        position: 'relative', zIndex: 1,
        fontSize: 'clamp(0.85rem, 2.2vw, 1.25rem)',
        color: '#ffaa44', marginBottom: '1.8em',
        opacity: 0.9, textAlign: 'center',
        letterSpacing: '0.12em',
      }}>
        ריצה לבונקר | Operation Tehran Escape
      </div>

      {/* Character Selection */}
      <div style={{
        position: 'relative', zIndex: 1,
        fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
        color: '#ffcc44', marginBottom: '1.2em',
        textAlign: 'center', letterSpacing: '0.05em',
      }}>
        בחר את הגיבור שלך
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', gap: 'clamp(1rem, 3vw, 2.5rem)',
        flexWrap: 'wrap', justifyContent: 'center',
        marginBottom: '2em',
      }}>
        {characters.map(c => {
          const isSel = selected === c.id
          const isHov = hovered === c.id
          return (
            <div
              key={c.id}
              onClick={() => setSelected(c.id)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 'clamp(140px, 22vw, 200px)',
                borderRadius: 18,
                border: isSel ? '3px solid #ff4400' : '2px solid rgba(255,255,255,0.12)',
                background: isSel
                  ? 'rgba(255,68,0,0.18)'
                  : isHov
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(0,0,0,0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isSel ? 'scale(1.05) translateY(-4px)' : isHov ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSel
                  ? '0 0 30px rgba(255,68,0,0.5), 0 8px 32px rgba(0,0,0,0.6)'
                  : '0 4px 16px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                overflow: 'hidden',
                textAlign: 'center',
              }}
            >
              {/* Photo */}
              <div style={{
                width: '100%',
                paddingTop: '110%',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <img
                  src={c.image}
                  alt={c.name}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    filter: isSel
                      ? 'brightness(1.05) contrast(1.05)'
                      : 'brightness(0.85) contrast(1)',
                    transition: 'filter 0.2s',
                  }}
                />
                {/* Selected overlay */}
                {isSel && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(0deg, rgba(255,68,0,0.25) 0%, transparent 60%)',
                  }} />
                )}
                {/* Selection checkmark */}
                {isSel && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#ff4400',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 900, color: '#fff',
                    boxShadow: '0 0 12px #ff4400',
                  }}>
                    V
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '0.8rem 0.6rem 1rem' }}>
                <div style={{
                  fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                  fontWeight: 800,
                  color: isSel ? '#ff6622' : '#eee',
                  marginBottom: '0.2em',
                  transition: 'color 0.2s',
                }}>
                  {c.name}
                </div>
                <div style={{
                  fontSize: '0.72rem', color: '#ffaa44',
                  marginBottom: '0.3em', opacity: 0.9,
                }}>
                  {c.title}
                </div>
                <div style={{
                  fontSize: '0.68rem', color: '#999',
                  lineHeight: 1.4,
                }}>
                  {c.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!selected}
        style={{
          position: 'relative', zIndex: 1,
          padding: '0.85em 3.5em',
          fontSize: 'clamp(1rem, 2.8vw, 1.35rem)',
          fontWeight: 800,
          background: selected
            ? 'linear-gradient(135deg, #ff4400 0%, #cc1100 100%)'
            : '#1e1e1e',
          color: selected ? '#fff' : '#444',
          border: selected ? '2px solid rgba(255,100,0,0.4)' : '2px solid #333',
          borderRadius: 50,
          cursor: selected ? 'pointer' : 'not-allowed',
          boxShadow: selected ? '0 0 35px rgba(255,68,0,0.55), 0 4px 20px rgba(0,0,0,0.5)' : 'none',
          transition: 'all 0.25s ease',
          letterSpacing: '0.12em',
          transform: selected ? 'translateY(0)' : 'none',
        }}
        onMouseEnter={e => { if (selected) e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)' }}
      >
        {selected ? 'צא לדרך!' : 'בחר גיבור תחילה'}
      </button>

      {/* Controls hint */}
      <div style={{
        position: 'relative', zIndex: 1,
        marginTop: '1.8rem',
        padding: '0.9rem 2rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        fontSize: '0.78rem', color: '#888',
        textAlign: 'center', lineHeight: 1.9,
        backdropFilter: 'blur(4px)',
        maxWidth: 380,
      }}>
        <span style={{ color: '#ffaa44', fontWeight: 700 }}>שליטה:</span>
        {' '} ← → / A D — תנועה {'  '}
        Space / W — קפיצה {'  '}
        ↓ / S — כריעה
        <br />
        <span style={{ color: '#ffaa44', fontWeight: 700 }}>מטרה:</span>
        {' '} הגע לבונקר של חמינאי! | 5 שלבים | הימנע מטילים וכטב"מים
      </div>
    </div>
  )
}
