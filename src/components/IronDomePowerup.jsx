import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import { playPickupSound } from '../utils/sounds'

// Iron Dome packages covering the full 800m level (player Z goes ~0 to -800)
const DOME_SPAWNS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.sin(i * 91.37) * 2.8,
  z: -30 - i * 43,                  // z=-30 to z=-801
}))

function DomeMesh({ x, z }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 1.4
    }
  })
  return (
    <group position={[x, 1.35, z]} ref={groupRef}>
      {/* Inner glowing cube */}
      <mesh>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshBasicMaterial color="#44bbff" />
      </mesh>
      {/* Outer translucent shell */}
      <mesh scale={[1.35, 1.35, 1.35]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshBasicMaterial color="#1166dd" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* Vertical glow pillar hint */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 5]} />
        <meshBasicMaterial color="#44bbff" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function IronDomePowerup({ playerPosRef }) {
  const phase = useGameStore(s => s.phase)
  const addIronDome = useGameStore(s => s.addIronDome)

  const activeRef = useRef([...DOME_SPAWNS])
  const [renderItems, setRenderItems] = useState([...DOME_SPAWNS])
  const collectedSet = useRef(new Set())

  useEffect(() => {
    if (phase === 'playing') {
      activeRef.current = [...DOME_SPAWNS]
      collectedSet.current.clear()
      setRenderItems([...DOME_SPAWNS])
    }
  }, [phase])

  useFrame(() => {
    if (phase !== 'playing' || !playerPosRef.current) return
    const { x: px, z: pz } = playerPosRef.current

    const current = activeRef.current
    let changed = false

    for (let i = current.length - 1; i >= 0; i--) {
      const item = current[i]
      if (collectedSet.current.has(item.id)) continue
      if (Math.abs(item.x - px) < 1.0 && Math.abs(item.z - pz) < 1.0) {
        collectedSet.current.add(item.id)
        addIronDome()
        playPickupSound()
        current.splice(i, 1)
        changed = true
      }
    }

    if (changed) setRenderItems([...current])
  })

  if (phase !== 'playing') return null

  return (
    <>
      {renderItems.map(item => (
        <DomeMesh key={item.id} x={item.x} z={item.z} />
      ))}
    </>
  )
}
