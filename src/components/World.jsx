import React, { useMemo, memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Lazy-created propaganda poster textures (CanvasTexture, created once)
let _posters = null
function getPosters() {
  if (_posters) return _posters

  const configs = [
    { bg: '#8a0a0a', fg: '#ffdd00', line1: 'مرگ بر اسرائیل', line2: 'مرگ بر آمریکا' },
    { bg: '#003a00', fg: '#ffffff', line1: 'الله اکبر', line2: 'خامنه‌ای رهبر' },
    { bg: '#00205a', fg: '#ff9900', line1: 'مرگ بر آمریکا', line2: 'پیروزی نزدیک است' },
    { bg: '#5a2a00', fg: '#ffe066', line1: 'ایران قوی', line2: 'مقاومت همیشه' },
  ]

  _posters = configs.map(({ bg, fg, line1, line2 }) => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 512
    const c = canvas.getContext('2d')

    // Wall background
    c.fillStyle = bg
    c.fillRect(0, 0, 256, 512)

    // Khamenei portrait - black turban
    c.fillStyle = '#111'
    c.beginPath()
    c.ellipse(128, 95, 62, 48, 0, 0, Math.PI * 2)
    c.fill()
    c.fillRect(66, 95, 124, 20)

    // Face
    c.fillStyle = '#c4906a'
    c.beginPath()
    c.ellipse(128, 148, 50, 62, 0, 0, Math.PI * 2)
    c.fill()

    // Glasses frames
    c.strokeStyle = '#1a1a1a'
    c.lineWidth = 4
    c.beginPath(); c.arc(108, 140, 18, 0, Math.PI * 2); c.stroke()
    c.beginPath(); c.arc(148, 140, 18, 0, Math.PI * 2); c.stroke()
    c.beginPath(); c.moveTo(126, 140); c.lineTo(130, 140); c.stroke()
    c.beginPath(); c.moveTo(90, 140); c.lineTo(78, 136); c.stroke()
    c.beginPath(); c.moveTo(166, 140); c.lineTo(178, 136); c.stroke()

    // Beard
    c.fillStyle = '#2e2828'
    c.beginPath()
    c.ellipse(128, 205, 46, 42, 0, 0, Math.PI * 2)
    c.fill()

    // Robe / cloak
    c.fillStyle = '#111'
    c.fillRect(30, 240, 196, 272)

    // Gold border
    c.strokeStyle = fg
    c.lineWidth = 10
    c.strokeRect(6, 6, 244, 500)

    // Persian slogans
    c.fillStyle = fg
    c.font = 'bold 30px serif'
    c.textAlign = 'center'
    c.fillText(line1, 128, 380)
    c.font = 'bold 22px serif'
    c.fillStyle = '#ffffff'
    c.fillText(line2, 128, 425)

    return new THREE.CanvasTexture(canvas)
  })

  return _posters
}

// Animated fire (flicker via useFrame)
function Fire({ x, y, z }) {
  const innerRef = useRef()
  useFrame((state) => {
    if (innerRef.current) {
      const s = 0.38 + Math.sin(state.clock.elapsedTime * 12.3) * 0.12
      innerRef.current.scale.set(s, s + Math.sin(state.clock.elapsedTime * 8.7) * 0.08, s)
    }
  })
  return (
    <group position={[x, y, z]}>
      <mesh>
        <coneGeometry args={[0.55, 2.2, 6]} />
        <meshBasicMaterial color="#ff4400" />
      </mesh>
      <mesh ref={innerRef} position={[0, 0.2, 0]}>
        <coneGeometry args={[0.5, 2, 6]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
    </group>
  )
}

function Smoke({ x, y, z }) {
  return (
    <mesh position={[x, y + 3, z]}>
      <sphereGeometry args={[2, 5, 4]} />
      <meshBasicMaterial color="#0e0b06" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}

function BurntCar({ x, z, angle }) {
  return (
    <group position={[x, 0.18, z]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.8, 0.5, 0.9]} />
        <meshLambertMaterial color="#1a1008" />
      </mesh>
      <mesh position={[0, 0.55, 0.05]}>
        <boxGeometry args={[1.0, 0.28, 0.76]} />
        <meshLambertMaterial color="#111008" />
      </mesh>
    </group>
  )
}

function Lamp({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 5.6, 5]} />
        <meshLambertMaterial color="#3a3a3a" />
      </mesh>
      <mesh position={[0.55, 5.6, 0]}>
        <boxGeometry args={[1.1, 0.08, 0.08]} />
        <meshLambertMaterial color="#3a3a3a" />
      </mesh>
      <mesh position={[0.55, 5.5, 0]}>
        <boxGeometry args={[0.3, 0.14, 0.2]} />
        <meshBasicMaterial color="#ffee66" />
      </mesh>
    </group>
  )
}

// 2D-style building facade panel: thin box in YZ plane at road edge
// side=-1 → left (x≈-8.2), side=+1 → right (x≈+8.2)
const BuildingPanel = memo(function BuildingPanel({
  side, centerZ, h, bw, wallColor, winColor, damage, hasFire, hasSmoke, posterIdx
}) {
  const x = side * 8.2
  const winX = x + side * 0.12
  const rows = Math.max(1, Math.floor(h / 2.8))
  // Poster face direction: left building faces +X (rotY=-π/2), right faces -X (rotY=+π/2)
  const posterRotY = side < 0 ? -Math.PI / 2 : Math.PI / 2

  return (
    <group>
      {/* Main wall panel */}
      <mesh position={[x, h / 2, centerZ]}>
        <boxGeometry args={[0.2, h, bw]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      {/* Window rows */}
      {Array.from({ length: rows }, (_, row) => (
        <mesh key={row} position={[winX, 1.3 + row * 2.8, centerZ]}>
          <boxGeometry args={[0.07, 0.85, bw * 0.74]} />
          <meshBasicMaterial color={winColor} />
        </mesh>
      ))}
      {/* Damage burn patch */}
      {damage > 0.52 && (
        <mesh position={[winX, h * 0.28, centerZ + bw * 0.16]}>
          <boxGeometry args={[0.08, h * 0.3, bw * 0.26]} />
          <meshLambertMaterial color="#060302" />
        </mesh>
      )}
      {/* Propaganda poster (plane rotated to face road) */}
      {posterIdx >= 0 && (
        <mesh
          position={[x + side * 0.14, h * 0.48, centerZ]}
          rotation={[0, posterRotY, 0]}
        >
          <planeGeometry args={[bw * 0.55, h * 0.62]} />
          <meshBasicMaterial map={getPosters()[posterIdx]} side={THREE.FrontSide} />
        </mesh>
      )}
      {hasFire && <Fire x={x} y={h + 0.1} z={centerZ} />}
      {hasSmoke && <Smoke x={x} y={h - 0.5} z={centerZ} />}
    </group>
  )
})

const SEGMENT_LEN = 40

// Vivid wall color palette for variety (propaganda city feel)
const WALL_PALETTES = [
  (lum) => `hsl(${18 + Math.random() * 20}, 10%, ${lum}%)`,   // damaged concrete
  () => '#8a1010',    // deep red propaganda
  () => '#003a10',    // dark green
  () => '#001a4a',    // dark blue
  () => '#4a2a00',    // burnt ochre
]

const Segment = memo(function Segment({ index }) {
  const zBase = -index * SEGMENT_LEN

  const items = useMemo(() => {
    const r = (n) => { const v = Math.sin(n * 127.1 + index * 311.7) * 43758.5; return v - Math.floor(v) }

    const panels = []
    for (const side of [-1, 1]) {
      let z = zBase - 0.5
      let bi = 0
      while (z > zBase - SEGMENT_LEN + 0.5) {
        const s = index * 400 + (side < 0 ? 0 : 200) + bi
        const bw = 4 + r(s * 1.7) * 7
        const h = 8 + r(s * 3.3) * 17
        const lum = 22 + r(s * 7) * 20

        // 25% chance of vivid painted wall, else concrete
        const paletteRoll = r(s * 11)
        let wallColor
        if (paletteRoll < 0.12) wallColor = '#8a1010'
        else if (paletteRoll < 0.20) wallColor = '#003a10'
        else if (paletteRoll < 0.27) wallColor = '#002050'
        else if (paletteRoll < 0.33) wallColor = '#5a3500'
        else wallColor = `hsl(${18 + r(s) * 30}, 12%, ${lum}%)`

        // Window glow: sometimes warm orange/yellow for warmth
        const winRoll = r(s * 17)
        let winColor
        if (winRoll < 0.25) winColor = `hsl(38, 55%, ${12 + r(s * 9) * 10}%)`
        else if (winRoll < 0.4) winColor = `hsl(200, 40%, ${8 + r(s * 9) * 8}%)`
        else winColor = `hsl(200, 18%, ${5 + r(s * 9) * 10}%)`

        // Poster on 28% of buildings
        const posterIdx = r(s * 13) < 0.28 ? Math.floor(r(s * 17) * 4) : -1

        panels.push({
          key: `pnl-${index}-${side}-${bi}`,
          side,
          centerZ: z - bw / 2,
          h, bw,
          wallColor,
          winColor,
          damage: r(s * 6.1),
          hasFire: r(s * 8) < 0.18,
          hasSmoke: r(s * 9) < 0.32,
          posterIdx,
        })
        z -= bw + 0.3
        bi++
      }
    }

    const cars = []
    for (let i = 0; i < 2; i++) {
      const s = index * 500 + i
      cars.push({
        key: `car-${index}-${i}`,
        x: (r(s) - 0.5) * 6,
        z: zBase - 8 - r(s * 2) * (SEGMENT_LEN - 16),
        angle: r(s * 3) * Math.PI,
      })
    }

    return { panels, cars }
  }, [index, zBase])

  return (
    <group>
      {/* Road */}
      <mesh position={[0, -0.01, zBase - SEGMENT_LEN / 2]}>
        <boxGeometry args={[10, 0.02, SEGMENT_LEN]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      {/* Road center line */}
      <mesh position={[0, 0.001, zBase - SEGMENT_LEN / 2]}>
        <boxGeometry args={[0.15, 0.005, SEGMENT_LEN]} />
        <meshLambertMaterial color="#444" />
      </mesh>
      {/* Sidewalks */}
      <mesh position={[-5.5, 0.06, zBase - SEGMENT_LEN / 2]}>
        <boxGeometry args={[1, 0.12, SEGMENT_LEN]} />
        <meshLambertMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[5.5, 0.06, zBase - SEGMENT_LEN / 2]}>
        <boxGeometry args={[1, 0.12, SEGMENT_LEN]} />
        <meshLambertMaterial color="#2a2a2a" />
      </mesh>

      {items.panels.map(p => <BuildingPanel key={p.key} {...p} />)}
      {items.cars.map(c => <BurntCar key={c.key} x={c.x} z={c.z} angle={c.angle} />)}

      <Lamp x={-5} z={zBase - SEGMENT_LEN * 0.25} />
      <Lamp x={5}  z={zBase - SEGMENT_LEN * 0.75} />
    </group>
  )
})

export function Bunker({ z }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[12, 4, 10]} />
        <meshLambertMaterial color="#484848" />
      </mesh>
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[13, 0.7, 11]} />
        <meshLambertMaterial color="#333" />
      </mesh>
      <mesh position={[0, 1.2, 5.05]}>
        <boxGeometry args={[2, 2.4, 0.12]} />
        <meshLambertMaterial color="#0e0e0e" />
      </mesh>
      {[-4, -2, 0, 2, 4].map((bx, i) => (
        <mesh key={i} position={[bx, 0.3, 5.7]}>
          <capsuleGeometry args={[0.27, 0.55, 4, 8]} />
          <meshLambertMaterial color="#6a5a38" />
        </mesh>
      ))}
      <mesh position={[-5.5, 3.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 7, 5]} />
        <meshLambertMaterial color="#666" />
      </mesh>
      <mesh position={[-4.1, 6.2, 0]}>
        <planeGeometry args={[3, 0.8]} />
        <meshBasicMaterial color="#006600" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-4.1, 5.6, 0]}>
        <planeGeometry args={[3, 0.8]} />
        <meshBasicMaterial color="#f5f5f5" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-4.1, 5.0, 0]}>
        <planeGeometry args={[3, 0.8]} />
        <meshBasicMaterial color="#cc0000" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 5.5, 6]}>
        <sphereGeometry args={[0.3, 6, 5]} />
        <meshBasicMaterial color="#ffdd00" />
      </mesh>
    </group>
  )
}

const TOTAL_SEGMENTS = 10

export default function World() {
  return (
    <>
      {/* Ground */}
      <mesh position={[0, -0.12, -(TOTAL_SEGMENTS * SEGMENT_LEN) / 2]}>
        <boxGeometry args={[300, 0.24, TOTAL_SEGMENTS * SEGMENT_LEN + 100]} />
        <meshLambertMaterial color="#1e1e1e" />
      </mesh>

      {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
        <Segment key={i} index={i} />
      ))}

      <Bunker z={-(TOTAL_SEGMENTS * SEGMENT_LEN + 18)} />

      {/* Bomb craters */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={`c-${i}`}
          position={[Math.sin(i * 73) * 3.5, 0.003, -8 - i * 50]}
          rotation={[-Math.PI / 2, 0, i * 0.7]}
        >
          <ringGeometry args={[0.3 + (i % 3) * 0.3, 1.0 + (i % 3) * 0.5, 10]} />
          <meshBasicMaterial color="#0d0d0d" />
        </mesh>
      ))}
    </>
  )
}
