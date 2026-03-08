import { useEffect, useRef } from 'react'

export function useControls() {
  const keys = useRef({
    left: false,
    right: false,
    jump: false,
    crouch: false,
  })

  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keys.current.left = true; break
        case 'ArrowRight':
        case 'KeyD':
          keys.current.right = true; break
        case 'Space':
        case 'KeyW':
        case 'ArrowUp':
          keys.current.jump = true; break
        case 'ArrowDown':
        case 'KeyS':
          keys.current.crouch = true; break
      }
    }

    const onKeyUp = (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keys.current.left = false; break
        case 'ArrowRight':
        case 'KeyD':
          keys.current.right = false; break
        case 'Space':
        case 'KeyW':
        case 'ArrowUp':
          keys.current.jump = false; break
        case 'ArrowDown':
        case 'KeyS':
          keys.current.crouch = false; break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return keys
}
