import React, { useRef } from 'react'

// Touch-based virtual controls for mobile
export default function MobileControls({ controlsRef }) {
  const touchStartRef = useRef({})

  const handleTouchStart = (action) => (e) => {
    e.preventDefault()
    if (!controlsRef.current) return
    controlsRef.current[action] = true
  }

  const handleTouchEnd = (action) => (e) => {
    e.preventDefault()
    if (!controlsRef.current) return
    controlsRef.current[action] = false
  }

  const btnStyle = (color = '#ffffff22') => ({
    width: 64, height: 64,
    borderRadius: '50%',
    background: color,
    border: '2px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.5rem',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
    cursor: 'pointer',
  })

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: '1rem 1.5rem',
      zIndex: 50, pointerEvents: 'none',
    }}>
      {/* Left/Right */}
      <div style={{ display: 'flex', gap: 12, pointerEvents: 'all' }}>
        <div
          style={btnStyle('rgba(255,200,0,0.25)')}
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd('left')}
          onPointerDown={handleTouchStart('left')}
          onPointerUp={handleTouchEnd('left')}
        >◀</div>
        <div
          style={btnStyle('rgba(255,200,0,0.25)')}
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd('right')}
          onPointerDown={handleTouchStart('right')}
          onPointerUp={handleTouchEnd('right')}
        >▶</div>
      </div>

      {/* Jump + Crouch */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'all' }}>
        <div
          style={btnStyle('rgba(0,200,255,0.25)')}
          onTouchStart={handleTouchStart('jump')}
          onTouchEnd={handleTouchEnd('jump')}
          onPointerDown={handleTouchStart('jump')}
          onPointerUp={handleTouchEnd('jump')}
        >↑</div>
        <div
          style={btnStyle('rgba(255,100,0,0.25)')}
          onTouchStart={handleTouchStart('crouch')}
          onTouchEnd={handleTouchEnd('crouch')}
          onPointerDown={handleTouchStart('crouch')}
          onPointerUp={handleTouchEnd('crouch')}
        >↓</div>
      </div>
    </div>
  )
}
