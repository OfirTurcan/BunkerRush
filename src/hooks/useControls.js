import { useEffect, useRef } from 'react'

/**
 * Custom React hook that tracks keyboard input for game controls.
 *
 * Returns a stable ref whose `.current` object is mutated in place on every
 * keydown / keyup event — avoiding React re-renders while giving `useFrame`
 * callbacks the latest key state on every animation frame.
 *
 * Supported mappings:
 *  - left:   ArrowLeft, A
 *  - right:  ArrowRight, D
 *  - jump:   Space, W, ArrowUp
 *  - crouch: ArrowDown, S
 *
 * @returns {React.MutableRefObject<{left:boolean, right:boolean, jump:boolean, crouch:boolean}>}
 */
export function useControls() {
  const keys = useRef({
    left: false,
    right: false,
    jump: false,
    crouch: false,
  })

  useEffect(() => {
    /**
     * Sets the pressed key's flag to true.
     * @param {KeyboardEvent} e
     */
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

    /**
     * Clears the released key's flag to false.
     * @param {KeyboardEvent} e
     */
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
