import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'

// Pre-placed mine positions covering the full 800m level (player Z goes ~0 to -800)
const MINE_SPAWNS = Array.from({ length: 52 }, (_, i) => ({
  id: i,
  x: Math.sin(i * 53.71) * 3.1,
  z: -20 - i * 15,                  // z=-20 to z=-785
}))

function MineMesh({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      {/* Puck body */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.32, 0.35, 0.12, 10]} />
        <meshLambertMaterial color="#3a3a3a" />
      </mesh>
      {/* Red LED warning dot */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      {/* Raised detonator nub */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.055, 6, 5]} />
        <meshLambertMaterial color="#222" />
      </mesh>
    </group>
  )
}

export default function Mines({ playerPosRef }) {
  const phase = useGameStore(s => s.phase)
  const loseLife = useGameStore(s => s.loseLife)

  // Ref for collision loop (avoids stale closure issues)
  const activeMinesRef = useRef([...MINE_SPAWNS])
  // State for rendering
  const [renderMines, setRenderMines] = useState([...MINE_SPAWNS])
  // Track recently-hit mines to prevent double-triggers
  const hitCooldowns = useRef(new Set())

  useEffect(() => {
    if (phase === 'playing') {
      activeMinesRef.current = [...MINE_SPAWNS]
      hitCooldowns.current.clear()
      setRenderMines([...MINE_SPAWNS])
    }
  }, [phase])

  useFrame(() => {
    if (phase !== 'playing' || !playerPosRef.current) return
    const { x: px, z: pz, onGround } = playerPosRef.current
    // Only trigger mines when player is on the ground
    if (!onGround) return

    const current = activeMinesRef.current
    let changed = false

    for (let i = current.length - 1; i >= 0; i--) {
      const mine = current[i]
      if (hitCooldowns.current.has(mine.id)) continue
      if (Math.abs(mine.x - px) < 0.78 && Math.abs(mine.z - pz) < 0.78) {
        hitCooldowns.current.add(mine.id)
        loseLife()
        current.splice(i, 1)
        changed = true
      }
    }

    if (changed) setRenderMines([...current])
  })

  if (phase !== 'playing') return null

  return (
    <>
      {renderMines.map(mine => (
        <MineMesh key={mine.id} x={mine.x} z={mine.z} />
      ))}
    </>
  )
}
