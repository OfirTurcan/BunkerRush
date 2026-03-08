/**
 * @fileoverview Smoke tests for the sounds utility module.
 * Verifies that exports exist and are callable without throwing.
 * The Web Audio API is stubbed via vi.stubGlobal because jsdom does not implement it.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

// ---------------------------------------------------------------------------
// Build the AudioContext stub.  Must use a regular `function` (not an arrow
// function) so it is valid as a constructor (`new AudioContext()`).
// ---------------------------------------------------------------------------
const mockCtx = {
  state: 'running',
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(function () {
    return {
      type: 'sine',
      frequency: {
        value: 440,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
  }),
  createGain: vi.fn(function () {
    return {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }
  }),
  createBiquadFilter: vi.fn(function () {
    return {
      type: 'bandpass',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      Q: { value: 1 },
      connect: vi.fn(),
    }
  }),
  resume: vi.fn(),
}

// Regular function → valid constructor for `new AudioContext()`
vi.stubGlobal('AudioContext', function AudioContextMock() { return mockCtx })
vi.stubGlobal('webkitAudioContext', function AudioContextMock() { return mockCtx })

afterAll(() => {
  vi.unstubAllGlobals()
})

// Import AFTER stubs are in place via dynamic import
let playPickupSound, playActivateSound

beforeAll(async () => {
  const sounds = await import('../utils/sounds')
  playPickupSound = sounds.playPickupSound
  playActivateSound = sounds.playActivateSound
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('sounds exports', () => {
  it('playPickupSound is a function', () => {
    expect(typeof playPickupSound).toBe('function')
  })

  it('playActivateSound is a function', () => {
    expect(typeof playActivateSound).toBe('function')
  })
})

describe('playPickupSound', () => {
  it('does not throw', () => {
    expect(() => playPickupSound()).not.toThrow()
  })

  it('creates 3 oscillators (one per note)', () => {
    mockCtx.createOscillator.mockClear()
    playPickupSound()
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(3)
  })
})

describe('playActivateSound', () => {
  it('does not throw', () => {
    expect(() => playActivateSound()).not.toThrow()
  })

  it('creates 3 oscillators (sweep, shimmer, thump)', () => {
    mockCtx.createOscillator.mockClear()
    playActivateSound()
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(3)
  })

  it('creates a bandpass filter for the sweep', () => {
    mockCtx.createBiquadFilter.mockClear()
    playActivateSound()
    expect(mockCtx.createBiquadFilter).toHaveBeenCalledTimes(1)
  })
})
