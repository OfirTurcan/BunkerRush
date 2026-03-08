import { create } from 'zustand'

/**
 * Level configuration array — defines speed and obstacle spawn rate per level.
 * @type {Array<{level: number, speed: number, obstacleRate: number, name: string}>}
 */
const LEVELS = [
  { level: 1, speed: 6,  obstacleRate: 0.8, name: 'טהרן שקטה' },
  { level: 2, speed: 8,  obstacleRate: 1.4, name: 'גשם טילים' },
  { level: 3, speed: 11, obstacleRate: 2.0, name: 'סערת כטבמים' },
  { level: 4, speed: 14, obstacleRate: 2.8, name: 'אפוקליפסה' },
  { level: 5, speed: 18, obstacleRate: 3.8, name: 'שחר הנקמה' },
]

/**
 * Central Zustand game store.
 *
 * State shape:
 *  - phase            {string}  'menu' | 'playing' | 'gameover' | 'victory'
 *  - character        {string|null} 'bibi' | 'trump'
 *  - level            {number}  1–5
 *  - score            {number}  accumulated points
 *  - lives            {number}  remaining lives (starts at 3)
 *  - distance         {number}  total metres travelled this run
 *  - levelProgress    {number}  0–1 fraction of current level completed
 *  - isInvincible     {boolean} brief invincibility window after a hit
 *  - ironDomeCount    {number}  stored Iron Dome charges (0–5)
 *  - ironDomeActive   {boolean} true while Iron Dome is intercepting threats
 */
export const useGameStore = create((set, get) => ({
  phase: 'menu',
  character: null,
  level: 1,
  score: 0,
  lives: 3,
  distance: 0,
  levelProgress: 0,
  isInvincible: false,
  ironDomeCount: 0,
  ironDomeActive: false,

  /**
   * Returns the LEVELS entry for the current level.
   * @returns {{level:number, speed:number, obstacleRate:number, name:string}}
   */
  getLevelConfig: () => LEVELS[get().level - 1],

  /**
   * Stores the chosen character without starting the game.
   * @param {'bibi'|'trump'} char
   */
  selectCharacter: (char) => set({ character: char }),

  /**
   * Resets all transient state and starts a new run.
   * Called after character selection on the StartScreen.
   */
  startGame: () => set({
    phase: 'playing',
    level: 1,
    score: 0,
    lives: 3,
    distance: 0,
    levelProgress: 0,
    ironDomeCount: 0,
    ironDomeActive: false,
  }),

  /**
   * Adds arbitrary points to the score (unused directly; score accrues via addDistance).
   * @param {number} pts - Points to add.
   */
  addScore: (pts) => set(s => ({ score: s.score + pts })),

  /**
   * Increments the stored Iron Dome charge count (max 5).
   * Called by IronDomePowerup when the player collects a package.
   */
  addIronDome: () => set(s => ({ ironDomeCount: Math.min(s.ironDomeCount + 1, 5) })),

  /**
   * Activates the Iron Dome for 3 seconds if at least one charge is available and
   * none is currently active.  Decrements ironDomeCount and auto-deactivates after 3 s.
   * While active, Obstacles clears the screen and pauses spawning.
   */
  activateIronDome: () => {
    const { ironDomeCount, ironDomeActive } = get()
    if (ironDomeCount <= 0 || ironDomeActive) return
    set({ ironDomeCount: ironDomeCount - 1, ironDomeActive: true })
    setTimeout(() => set({ ironDomeActive: false }), 3000)
  },

  /**
   * Advances the run by `d` metres, updates score, level, and levelProgress.
   * Transitions to 'victory' when the full 800 m has been covered.
   *
   * @param {number} d - Distance increment in metres (typically speed × delta).
   */
  addDistance: (d) => {
    const state = get()
    const newDist = state.distance + d
    const levelLength = 160  // metres per level (5 × 160 = 800 m)
    const totalLength = levelLength * 5
    const rawProgress = newDist / levelLength
    const newLevel = Math.min(Math.floor(rawProgress) + 1, 5)
    const levelProgress = rawProgress - Math.floor(rawProgress)  // 0..1 within current level

    if (newDist >= totalLength) {
      set({ distance: newDist, levelProgress: 1, phase: 'victory' })
      return
    }

    set({
      distance: newDist,
      level: newLevel,
      levelProgress,
      score: state.score + Math.round(d * 10),
    })
  },

  /**
   * Removes one life.  Grants a 2-second invincibility window after non-lethal hits.
   * Transitions to 'gameover' when lives reach 0.
   * No-op while isInvincible is true.
   */
  loseLife: () => {
    const { lives, isInvincible } = get()
    if (isInvincible) return
    const newLives = lives - 1
    if (newLives <= 0) {
      set({ lives: 0, phase: 'gameover' })
    } else {
      set({ lives: newLives, isInvincible: true })
      setTimeout(() => set({ isInvincible: false }), 2000)
    }
  },

  /**
   * Returns all state to its initial values and sends the player back to the menu.
   * Called by the ESC key, the X button in the HUD, and end-screen buttons.
   */
  restartGame: () => set({
    phase: 'menu',
    level: 1,
    score: 0,
    lives: 3,
    distance: 0,
    levelProgress: 0,
    isInvincible: false,
    ironDomeCount: 0,
    ironDomeActive: false,
  }),
}))
