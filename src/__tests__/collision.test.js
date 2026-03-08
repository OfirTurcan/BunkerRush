/**
 * @fileoverview Unit tests for AABB collision detection logic.
 * The functions are extracted from Obstacles.jsx and Mines.jsx and tested in isolation.
 */

import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// Pure AABB helpers — mirroring the logic in Obstacles.jsx / Mines.jsx
// ---------------------------------------------------------------------------

/**
 * Checks collision between player and a missile/drone obstacle.
 * @param {object} player - {x, y, z}
 * @param {object} obs    - {x, y, z, yMin, yMax, halfW, halfD}
 * @returns {boolean}
 */
function checkObstacleCollision(player, obs) {
  const dx = Math.abs(player.x - obs.x)
  const dz = Math.abs(player.z - obs.z)
  const playerY = player.y + 0.9 // approximate player centre height
  const inY = playerY >= obs.yMin && playerY <= obs.yMax
  return dx < obs.halfW && dz < obs.halfD && inY
}

/**
 * Checks collision between player and a ground mine.
 * Mines only trigger while the player is on the ground (onGround).
 * @param {object} player   - {x, z}
 * @param {object} mine     - {x, z}
 * @param {boolean} onGround
 * @returns {boolean}
 */
function checkMineCollision(player, mine, onGround) {
  if (!onGround) return false
  const dx = Math.abs(player.x - mine.x)
  const dz = Math.abs(player.z - mine.z)
  return dx < 0.78 && dz < 0.78
}

// ---------------------------------------------------------------------------
// Obstacle collision tests
// ---------------------------------------------------------------------------
describe('checkObstacleCollision', () => {
  const obs = { x: 0, y: 0, z: -5, yMin: 0.5, yMax: 2.5, halfW: 1.0, halfD: 1.5 }

  it('detects collision when fully inside bounding box', () => {
    const player = { x: 0, y: 0, z: -5 } // playerY = 0.9, in range 0.5–2.5
    expect(checkObstacleCollision(player, obs)).toBe(true)
  })

  it('misses when player is too far left', () => {
    const player = { x: -2, y: 0, z: -5 }
    expect(checkObstacleCollision(player, obs)).toBe(false)
  })

  it('misses when player is too far right', () => {
    const player = { x: 2, y: 0, z: -5 }
    expect(checkObstacleCollision(player, obs)).toBe(false)
  })

  it('misses when player is too far in front (dz too large)', () => {
    const player = { x: 0, y: 0, z: -10 }
    expect(checkObstacleCollision(player, obs)).toBe(false)
  })

  it('misses when player is above the obstacle Y range (jumping over)', () => {
    const player = { x: 0, y: 3.0, z: -5 } // playerY = 3.9, above yMax 2.5
    expect(checkObstacleCollision(player, obs)).toBe(false)
  })

  it('misses when player is below the obstacle Y range (ducking)', () => {
    // low obstacle yMin=1.5 — crouching player at y=0 has playerY=0.9, below 1.5
    const lowObs = { ...obs, yMin: 1.5, yMax: 3.0 }
    const player = { x: 0, y: 0, z: -5 }
    expect(checkObstacleCollision(player, lowObs)).toBe(false)
  })

  it('hits exactly at the X boundary (edge touch)', () => {
    // dx = halfW exactly → should NOT collide (strict less-than)
    const player = { x: obs.halfW, y: 0, z: -5 }
    expect(checkObstacleCollision(player, obs)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Mine collision tests
// ---------------------------------------------------------------------------
describe('checkMineCollision', () => {
  const mine = { x: 0, z: -20 }

  it('detects collision when on ground and close', () => {
    expect(checkMineCollision({ x: 0, z: -20 }, mine, true)).toBe(true)
  })

  it('does NOT trigger while airborne (jumping)', () => {
    expect(checkMineCollision({ x: 0, z: -20 }, mine, false)).toBe(false)
  })

  it('misses when x distance exceeds threshold', () => {
    expect(checkMineCollision({ x: 1.5, z: -20 }, mine, true)).toBe(false)
  })

  it('misses when z distance exceeds threshold', () => {
    expect(checkMineCollision({ x: 0, z: -22 }, mine, true)).toBe(false)
  })

  it('detects collision at corner (both dx and dz near threshold)', () => {
    // dx=0.5, dz=0.5 — both well within 0.78
    expect(checkMineCollision({ x: 0.5, z: -20.5 }, mine, true)).toBe(true)
  })

  it('boundary: dx exactly 0.78 should NOT collide', () => {
    expect(checkMineCollision({ x: 0.78, z: -20 }, mine, true)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Level distance math (mirrors addDistance logic in gameStore)
// ---------------------------------------------------------------------------
describe('level distance math', () => {
  const LEVEL_LENGTH = 160

  function computeLevel(totalDist) {
    const raw = totalDist / LEVEL_LENGTH
    return Math.min(Math.floor(raw) + 1, 5)
  }

  function computeProgress(totalDist) {
    const raw = totalDist / LEVEL_LENGTH
    return raw - Math.floor(raw)
  }

  it('level 1 at 0 m', () => expect(computeLevel(0)).toBe(1))
  it('level 1 at 159 m', () => expect(computeLevel(159)).toBe(1))
  it('level 2 at 160 m', () => expect(computeLevel(160)).toBe(2))
  it('level 3 at 320 m', () => expect(computeLevel(320)).toBe(3))
  it('level 5 at 640 m', () => expect(computeLevel(640)).toBe(5))
  it('level 5 at 799 m (capped)', () => expect(computeLevel(799)).toBe(5))

  it('progress 0 at level boundary', () => {
    expect(computeProgress(160)).toBeCloseTo(0)
    expect(computeProgress(320)).toBeCloseTo(0)
  })

  it('progress 0.5 at level midpoint', () => {
    expect(computeProgress(80)).toBeCloseTo(0.5)   // mid level 1
    expect(computeProgress(240)).toBeCloseTo(0.5)  // mid level 2
  })

  it('progress is non-zero mid-level (regression: was always 0 for levels 2-5)', () => {
    // Previously Math.min(raw, 1) capped raw at 1 for levels > 1, giving progress = 0
    expect(computeProgress(200)).toBeCloseTo(0.25) // 40 m into level 2
    expect(computeProgress(400)).toBeCloseTo(0.5)  // 80 m into level 3
  })
})
