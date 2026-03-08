import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

// Missile - 3 meshes total
function MissileMesh() {
  return (
    <group rotation={[0, Math.PI / 2, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 1.8, 7]} />
        <meshLambertMaterial color="#4a4a60" />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.12, 0.4, 7]} />
        <meshLambertMaterial color="#cc2200" />
      </mesh>
      <mesh position={[0, -1.0, 0]}>
        <sphereGeometry args={[0.14, 6, 5]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>
    </group>
  )
}

// Drone - 3 meshes
function DroneMesh() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.2, 0.12, 1.0]} />
        <meshLambertMaterial color="#8b7355" />
      </mesh>
      <mesh>
        <boxGeometry args={[2.0, 0.05, 0.4]} />
        <meshLambertMaterial color="#7a6245" />
      </mesh>
      <mesh position={[0, 0, -0.55]}>
        <coneGeometry args={[0.08, 0.22, 5]} />
        <meshLambertMaterial color="#555" />
      </mesh>
    </group>
  )
}

let nextId = 0

function ObstacleItem({ obstacle, playerPosRef, onHit, onRemove }) {
  const meshRef = useRef()
  const hitCooled = useRef(false)
  const posZ = useRef(obstacle.z)

  useFrame((_, delta) => {
    if (!meshRef.current) return

    posZ.current += obstacle.speed * delta
    meshRef.current.position.z = posZ.current

    // Remove when past player
    if (posZ.current > 15) {
      onRemove(obstacle.id)
      return
    }

    // AABB collision
    if (!hitCooled.current && playerPosRef.current) {
      const { x: px, y: py, z: pz, crouch } = playerPosRef.current
      const dx = Math.abs(obstacle.x - px)
      const dz = Math.abs(posZ.current - pz)

      if (dx < (obstacle.type === 'missile' ? 0.9 : 1.1) && dz < 0.65) {
        const playerTopY = py + (crouch ? 0.1 : 0.55)
        const playerBotY = py - 0.4
        const obsHalfH = obstacle.type === 'missile' ? 0.18 : 0.14
        if (obstacle.y + obsHalfH > playerBotY && obstacle.y - obsHalfH < playerTopY) {
          hitCooled.current = true
          onHit()
          setTimeout(() => { hitCooled.current = false }, 2200)
        }
      }
    }
  })

  return (
    <group ref={meshRef} position={[obstacle.x, obstacle.y, obstacle.z]}>
      {obstacle.type === 'missile' ? <MissileMesh /> : <DroneMesh />}
    </group>
  )
}

export default function Obstacles({ playerPosRef }) {
  const [obstacles, setObstacles] = useState([])
  const getLevelConfig = useGameStore(s => s.getLevelConfig)
  const loseLife = useGameStore(s => s.loseLife)
  const phase = useGameStore(s => s.phase)
  const ironDomeActive = useGameStore(s => s.ironDomeActive)
  const spawnTimer = useRef(0)

  // When Iron Dome activates: destroy all current obstacles and reset spawn timer
  useEffect(() => {
    if (ironDomeActive) {
      setObstacles([])
      spawnTimer.current = 0
    }
  }, [ironDomeActive])

  const removeObstacle = useCallback((id) => {
    setObstacles(prev => prev.filter(o => o.id !== id))
  }, [])

  useFrame((_, delta) => {
    if (phase !== 'playing' || ironDomeActive) return
    const config = getLevelConfig()
    spawnTimer.current += delta

    if (spawnTimer.current >= 1 / config.obstacleRate) {
      spawnTimer.current -= 1 / config.obstacleRate

      const playerZ = playerPosRef.current?.z ?? 0
      const type = Math.random() < 0.6 ? 'missile' : 'drone'

      let y
      if (type === 'missile') {
        const r = Math.random()
        if (r < 0.35) y = 0.4
        else if (r < 0.72) y = 1.1
        else y = 2.1
      } else {
        y = 0.9 + Math.random() * 1.5
      }

      setObstacles(prev => [...prev, {
        id: nextId++,
        type,
        x: (Math.random() - 0.5) * 6.5,
        y,
        z: playerZ - 38,
        speed: config.speed * 0.5 + 4,
      }])
    }
  })

  if (phase !== 'playing') return null

  return (
    <>
      {obstacles.map(obs => (
        <ObstacleItem
          key={obs.id}
          obstacle={obs}
          playerPosRef={playerPosRef}
          onHit={loseLife}
          onRemove={removeObstacle}
        />
      ))}
    </>
  )
}
