import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Third-person camera: behind and slightly above the player
const OFFSET = new THREE.Vector3(0, 3.2, 5.5)     // behind & above
const LOOK_AHEAD = new THREE.Vector3(0, 0.8, -5)   // look ahead of player
const POS_LERP = 0.10
const LOOK_LERP = 0.12

export default function CameraController({ playerPosRef }) {
  const currentLookAt = useRef(new THREE.Vector3())
  const initialized = useRef(false)

  useFrame(({ camera }) => {
    if (!playerPosRef?.current) return

    const { x, y, z } = playerPosRef.current

    const desiredPos = new THREE.Vector3(
      x + OFFSET.x,
      y + OFFSET.y,
      z + OFFSET.z
    )
    const desiredLook = new THREE.Vector3(
      x + LOOK_AHEAD.x,
      y + LOOK_AHEAD.y,
      z + LOOK_AHEAD.z
    )

    if (!initialized.current) {
      camera.position.copy(desiredPos)
      currentLookAt.current.copy(desiredLook)
      initialized.current = true
    }

    camera.position.lerp(desiredPos, POS_LERP)
    currentLookAt.current.lerp(desiredLook, LOOK_LERP)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
