/**
 * @fileoverview Unit tests for the Zustand game store.
 * Tests cover state machine transitions, level/progress math, and guard conditions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../store/gameStore'

// Reset store state before each test using the restartGame action
beforeEach(() => {
  useGameStore.getState().restartGame()
  // Clear any pending timers
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// startGame
// ---------------------------------------------------------------------------
describe('startGame', () => {
  it('sets phase to playing and resets all fields', () => {
    const store = useGameStore.getState()
    store.startGame()
    const s = useGameStore.getState()
    expect(s.phase).toBe('playing')
    expect(s.level).toBe(1)
    expect(s.score).toBe(0)
    expect(s.lives).toBe(3)
    expect(s.distance).toBe(0)
    expect(s.levelProgress).toBe(0)
    expect(s.ironDomeCount).toBe(0)
    expect(s.ironDomeActive).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// addDistance — level progression
// ---------------------------------------------------------------------------
describe('addDistance', () => {
  beforeEach(() => {
    useGameStore.getState().startGame()
  })

  it('accumulates distance and score', () => {
    useGameStore.getState().addDistance(10)
    const s = useGameStore.getState()
    expect(s.distance).toBe(10)
    expect(s.score).toBe(100) // 10 * 10
  })

  it('keeps level 1 within first 160 m', () => {
    useGameStore.getState().addDistance(80)
    expect(useGameStore.getState().level).toBe(1)
  })

  it('advances to level 2 at 160 m', () => {
    useGameStore.getState().addDistance(160)
    expect(useGameStore.getState().level).toBe(2)
  })

  it('advances to level 3 at 320 m', () => {
    useGameStore.getState().addDistance(320)
    expect(useGameStore.getState().level).toBe(3)
  })

  it('advances to level 5 at 640 m', () => {
    useGameStore.getState().addDistance(640)
    expect(useGameStore.getState().level).toBe(5)
  })

  it('levelProgress is correct mid-level', () => {
    // At 200 m: rawProgress = 200/160 = 1.25 → level 2, progress = 0.25
    useGameStore.getState().addDistance(200)
    const s = useGameStore.getState()
    expect(s.level).toBe(2)
    expect(s.levelProgress).toBeCloseTo(0.25)
  })

  it('levelProgress is 0 at exact level boundary', () => {
    // At 160 m exactly: rawProgress = 1.0, floor = 1, progress = 0
    useGameStore.getState().addDistance(160)
    expect(useGameStore.getState().levelProgress).toBeCloseTo(0)
  })

  it('levelProgress is NOT always 0 for levels 2-5 (regression test)', () => {
    // Before the bug fix, levelProgress was always 0 for levels > 1
    useGameStore.getState().addDistance(240) // 80 m into level 2
    const s = useGameStore.getState()
    expect(s.level).toBe(2)
    expect(s.levelProgress).toBeGreaterThan(0)
  })

  it('transitions to victory at 800 m', () => {
    useGameStore.getState().addDistance(800)
    expect(useGameStore.getState().phase).toBe('victory')
  })

  it('sets levelProgress to 1 on victory', () => {
    useGameStore.getState().addDistance(800)
    expect(useGameStore.getState().levelProgress).toBe(1)
  })

  it('does not go past level 5', () => {
    useGameStore.getState().addDistance(750)
    expect(useGameStore.getState().level).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// loseLife
// ---------------------------------------------------------------------------
describe('loseLife', () => {
  beforeEach(() => {
    useGameStore.getState().startGame()
  })

  it('decrements lives by 1', () => {
    useGameStore.getState().loseLife()
    expect(useGameStore.getState().lives).toBe(2)
  })

  it('sets isInvincible true after non-lethal hit', () => {
    useGameStore.getState().loseLife()
    expect(useGameStore.getState().isInvincible).toBe(true)
  })

  it('clears isInvincible after 2 seconds', () => {
    useGameStore.getState().loseLife()
    vi.advanceTimersByTime(2000)
    expect(useGameStore.getState().isInvincible).toBe(false)
  })

  it('is a no-op while isInvincible', () => {
    useGameStore.getState().loseLife() // lives = 2, invincible = true
    useGameStore.getState().loseLife() // should be ignored
    expect(useGameStore.getState().lives).toBe(2)
  })

  it('transitions to gameover when lives reach 0', () => {
    useGameStore.getState().loseLife() // 2 lives
    vi.advanceTimersByTime(2000)       // clear invincibility
    useGameStore.getState().loseLife() // 1 life
    vi.advanceTimersByTime(2000)
    useGameStore.getState().loseLife() // 0 lives
    const s = useGameStore.getState()
    expect(s.lives).toBe(0)
    expect(s.phase).toBe('gameover')
  })
})

// ---------------------------------------------------------------------------
// Iron Dome
// ---------------------------------------------------------------------------
describe('addIronDome', () => {
  beforeEach(() => {
    useGameStore.getState().startGame()
  })

  it('increments ironDomeCount', () => {
    useGameStore.getState().addIronDome()
    expect(useGameStore.getState().ironDomeCount).toBe(1)
  })

  it('caps ironDomeCount at 5', () => {
    for (let i = 0; i < 8; i++) useGameStore.getState().addIronDome()
    expect(useGameStore.getState().ironDomeCount).toBe(5)
  })
})

describe('activateIronDome', () => {
  beforeEach(() => {
    useGameStore.getState().startGame()
  })

  it('is a no-op when count is 0', () => {
    useGameStore.getState().activateIronDome()
    expect(useGameStore.getState().ironDomeActive).toBe(false)
  })

  it('activates and decrements count', () => {
    useGameStore.getState().addIronDome()
    useGameStore.getState().activateIronDome()
    const s = useGameStore.getState()
    expect(s.ironDomeActive).toBe(true)
    expect(s.ironDomeCount).toBe(0)
  })

  it('is a no-op while already active', () => {
    useGameStore.getState().addIronDome()
    useGameStore.getState().addIronDome()
    useGameStore.getState().activateIronDome()
    useGameStore.getState().activateIronDome() // second call ignored
    expect(useGameStore.getState().ironDomeCount).toBe(1) // only decremented once
  })

  it('deactivates after 3 seconds', () => {
    useGameStore.getState().addIronDome()
    useGameStore.getState().activateIronDome()
    vi.advanceTimersByTime(3000)
    expect(useGameStore.getState().ironDomeActive).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// restartGame
// ---------------------------------------------------------------------------
describe('restartGame', () => {
  it('returns all state to initial values and sets phase to menu', () => {
    const store = useGameStore.getState()
    store.startGame()
    store.addDistance(500)
    store.loseLife()
    store.restartGame()
    const s = useGameStore.getState()
    expect(s.phase).toBe('menu')
    expect(s.level).toBe(1)
    expect(s.score).toBe(0)
    expect(s.lives).toBe(3)
    expect(s.distance).toBe(0)
    expect(s.levelProgress).toBe(0)
    expect(s.isInvincible).toBe(false)
    expect(s.ironDomeCount).toBe(0)
    expect(s.ironDomeActive).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getLevelConfig
// ---------------------------------------------------------------------------
describe('getLevelConfig', () => {
  it('returns config for level 1', () => {
    useGameStore.getState().startGame()
    const cfg = useGameStore.getState().getLevelConfig()
    expect(cfg.level).toBe(1)
    expect(cfg.speed).toBe(6)
  })

  it('returns config for level 3 after advancing', () => {
    useGameStore.getState().startGame()
    useGameStore.getState().addDistance(320)
    const cfg = useGameStore.getState().getLevelConfig()
    expect(cfg.level).toBe(3)
    expect(cfg.speed).toBe(11)
  })
})
