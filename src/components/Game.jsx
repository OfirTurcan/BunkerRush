import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useGameStore } from '../store/gameStore'
import { useControls } from '../hooks/useControls'
import { Character } from './Character'
import Obstacles from './Obstacles'
import Mines from './Mines'
import IronDomePowerup from './IronDomePowerup'
import World from './World'
import CameraController from './CameraController'
import SoundManager from './SoundManager'
import HUD from './UI/HUD'
import MobileControls from './UI/MobileControls'

function Lights() {
  return (
    <>
      {/* Strong ambient for visibility */}
      <ambientLight intensity={2.4} color="#d8c090" />
      {/* Main sun from above-left */}
      <directionalLight position={[-5, 20, 10]} intensity={2.6} color="#fff5d8" />
      {/* Fill from right */}
      <directionalLight position={[8, 10, -5]} intensity={1.2} color="#ffd090" />
      {/* Fire glow */}
      <pointLight position={[0, 8, -20]} color="#ff6600" intensity={5} distance={70} />
    </>
  )
}

function GameRunner() {
  const addDistance = useGameStore(s => s.addDistance)
  const getLevelConfig = useGameStore(s => s.getLevelConfig)
  const phase = useGameStore(s => s.phase)

  useFrame((_, delta) => {
    if (phase !== 'playing') return
    addDistance(getLevelConfig().speed * delta)
  })

  return null
}

export default function Game() {
  const controlsRef = useControls()
  const playerPosRef = useRef({ x: 0, y: 0.62, z: 0, crouch: false, onGround: true })

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows={false}
        camera={{ fov: 60, near: 0.1, far: 400, position: [0, 4, 6] }}
        gl={{
          antialias: false,          // PERF: disable MSAA
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
        style={{ background: '#1a0e06' }}
        frameloop="always"
      >
        <fog attach="fog" color="#3a2010" near={80} far={240} />
        <color attach="background" args={['#261408']} />

        <Lights />
        <World />
        <Character controlsRef={controlsRef} playerPosRef={playerPosRef} />
        <Obstacles playerPosRef={playerPosRef} />
        <Mines playerPosRef={playerPosRef} />
        <IronDomePowerup playerPosRef={playerPosRef} />
        <CameraController playerPosRef={playerPosRef} />
        <GameRunner />
      </Canvas>

      <SoundManager />
      <HUD />
      <MobileControls controlsRef={controlsRef} />
    </div>
  )
}
