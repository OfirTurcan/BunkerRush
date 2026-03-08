import React, { useRef, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from '../hooks/useControls'
import { useGameStore } from '../store/gameStore'

const MOVE_SPEED_X = 5.5
const JUMP_FORCE = 8.5
const GRAVITY = -20
const GROUND_Y = 0.62
const LANE_LIMIT = 3.5

// PERF: switched to meshLambertMaterial, reduced mesh count
// Netanyahu: dark suit, white hair, glasses, red tie
function BibiMesh() {
  return (
    <group>
      {/* Legs (single box, split by color) */}
      <mesh position={[0, -0.44, 0]}>
        <boxGeometry args={[0.38, 0.34, 0.22]} />
        <meshLambertMaterial color="#111122" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.06, 0]}>
        <capsuleGeometry args={[0.26, 0.45, 6, 10]} />
        <meshLambertMaterial color="#1a1a2e" />
      </mesh>
      {/* Tie */}
      <mesh position={[0, 0.14, 0.27]}>
        <boxGeometry args={[0.09, 0.36, 0.02]} />
        <meshLambertMaterial color="#cc0000" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.36, 0.04, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.075, 0.28, 4, 8]} />
        <meshLambertMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.36, 0.04, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.075, 0.28, 4, 8]} />
        <meshLambertMaterial color="#1a1a2e" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.23, 12, 10]} />
        <meshLambertMaterial color="#d4956a" />
      </mesh>
      {/* Hair - white */}
      <mesh position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.2, 10, 7]} />
        <meshLambertMaterial color="#eeeeee" />
      </mesh>
      {/* Glasses - left lens */}
      <mesh position={[-0.1, 0.61, 0.21]}>
        <torusGeometry args={[0.062, 0.011, 5, 12]} />
        <meshLambertMaterial color="#222" />
      </mesh>
      {/* Glasses - right lens */}
      <mesh position={[0.1, 0.61, 0.21]}>
        <torusGeometry args={[0.062, 0.011, 5, 12]} />
        <meshLambertMaterial color="#222" />
      </mesh>
    </group>
  )
}

// Trump: navy suit, golden hair, long red tie, orange face
function TrumpMesh() {
  return (
    <group>
      {/* Legs */}
      <mesh position={[0, -0.46, 0]}>
        <boxGeometry args={[0.4, 0.34, 0.24]} />
        <meshLambertMaterial color="#111830" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.08, 0]}>
        <capsuleGeometry args={[0.29, 0.52, 6, 10]} />
        <meshLambertMaterial color="#1c2340" />
      </mesh>
      {/* Signature long red tie */}
      <mesh position={[0, 0.12, 0.3]}>
        <boxGeometry args={[0.1, 0.48, 0.02]} />
        <meshLambertMaterial color="#dd0000" />
      </mesh>
      <mesh position={[0, -0.2, 0.3]}>
        <boxGeometry args={[0.12, 0.14, 0.02]} />
        <meshLambertMaterial color="#dd0000" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.42, 0.1, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.085, 0.36, 4, 8]} />
        <meshLambertMaterial color="#1c2340" />
      </mesh>
      <mesh position={[0.42, 0.1, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.085, 0.36, 4, 8]} />
        <meshLambertMaterial color="#1c2340" />
      </mesh>
      {/* Head - orange */}
      <mesh position={[0, 0.68, 0]}>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshLambertMaterial color="#e0784a" />
      </mesh>
      {/* Golden hair */}
      <mesh position={[0, 0.88, -0.04]}>
        <sphereGeometry args={[0.22, 10, 7]} />
        <meshLambertMaterial color="#c8a020" />
      </mesh>
      {/* Comb-over sweep */}
      <mesh position={[0.14, 0.96, 0]} rotation={[0.1, 0, -0.55]}>
        <capsuleGeometry args={[0.07, 0.2, 4, 6]} />
        <meshLambertMaterial color="#c0980e" />
      </mesh>
    </group>
  )
}

export const Character = forwardRef(function Character({ controlsRef, playerPosRef }, ref) {
  const character = useGameStore(s => s.character)
  const isInvincible = useGameStore(s => s.isInvincible)
  const getLevelConfig = useGameStore(s => s.getLevelConfig)
  const phase = useGameStore(s => s.phase)

  const groupRef = useRef()
  const meshGroupRef = useRef()
  const posRef = useRef(new THREE.Vector3(0, GROUND_Y, 0))
  const velY = useRef(0)
  const isOnGround = useRef(true)
  const jumpLock = useRef(false)
  const targetRotY = useRef(0)
  const flashTimer = useRef(0)

  useFrame((state, delta) => {
    if (!groupRef.current || phase !== 'playing') return

    const keys = controlsRef.current
    const config = getLevelConfig()
    const dt = Math.min(delta, 0.05)

    // X movement
    let vx = 0
    if (keys.left)       { vx = -MOVE_SPEED_X; targetRotY.current =  Math.PI * 0.45 }
    else if (keys.right) { vx =  MOVE_SPEED_X; targetRotY.current = -Math.PI * 0.45 }
    else                 { targetRotY.current = 0 }

    // Jump - only on fresh keypress
    if (keys.jump && isOnGround.current && !jumpLock.current) {
      velY.current = JUMP_FORCE
      isOnGround.current = false
      jumpLock.current = true
    }
    if (!keys.jump) jumpLock.current = false

    // Gravity only when airborne
    if (!isOnGround.current) {
      velY.current += GRAVITY * dt
    }

    // Integrate position
    posRef.current.x += vx * dt
    posRef.current.y += velY.current * dt
    posRef.current.z -= config.speed * dt   // forward = -Z

    // Ground clamp
    if (posRef.current.y <= GROUND_Y) {
      posRef.current.y = GROUND_Y
      velY.current = 0
      isOnGround.current = true
    }

    // Lane clamp
    posRef.current.x = THREE.MathUtils.clamp(posRef.current.x, -LANE_LIMIT, LANE_LIMIT)

    // Apply to scene
    groupRef.current.position.copy(posRef.current)

    // Smooth rotation toward movement dir
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        meshGroupRef.current.rotation.y,
        targetRotY.current,
        0.18
      )
    }

    // Invincibility flash
    flashTimer.current += dt
    if (meshGroupRef.current) {
      meshGroupRef.current.visible = isInvincible
        ? Math.floor(flashTimer.current / 0.1) % 2 === 0
        : true
    }

    // Crouch squish animation (smooth lerp on meshGroupRef scale + offset)
    const isCrouching = !!(keys.crouch && isOnGround.current)
    if (meshGroupRef.current) {
      meshGroupRef.current.scale.y = THREE.MathUtils.lerp(
        meshGroupRef.current.scale.y, isCrouching ? 0.58 : 1.0, 0.22
      )
      meshGroupRef.current.position.y = THREE.MathUtils.lerp(
        meshGroupRef.current.position.y, isCrouching ? -0.24 : 0, 0.22
      )
    }

    // Publish position for camera + collision
    if (playerPosRef) {
      playerPosRef.current.x = posRef.current.x
      playerPosRef.current.y = posRef.current.y + 0.5
      playerPosRef.current.z = posRef.current.z
      playerPosRef.current.crouch = !!(keys.crouch && isOnGround.current)
      playerPosRef.current.onGround = isOnGround.current
    }
  })

  return (
    <group ref={groupRef} position={[0, GROUND_Y, 0]}>
      <group ref={meshGroupRef}>
        {character === 'bibi' ? <BibiMesh /> : <TrumpMesh />}
      </group>
    </group>
  )
})
