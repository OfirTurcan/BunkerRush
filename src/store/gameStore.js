import { create } from 'zustand'

const LEVELS = [
  { level: 1, speed: 6,  obstacleRate: 0.8, name: 'טהרן שקטה' },
  { level: 2, speed: 8,  obstacleRate: 1.4, name: 'גשם טילים' },
  { level: 3, speed: 11, obstacleRate: 2.0, name: 'סערת כטבמים' },
  { level: 4, speed: 14, obstacleRate: 2.8, name: 'אפוקליפסה' },
  { level: 5, speed: 18, obstacleRate: 3.8, name: 'שחר הנקמה' },
]

export const useGameStore = create((set, get) => ({
  phase: 'menu',           // menu | playing | paused | gameover | victory
  character: null,         // 'bibi' | 'trump'
  level: 1,
  score: 0,
  lives: 3,
  distance: 0,
  levelProgress: 0,        // 0..1 within current level
  isInvincible: false,
  ironDomeCount: 0,
  ironDomeActive: false,

  getLevelConfig: () => LEVELS[get().level - 1],

  selectCharacter: (char) => set({ character: char }),

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

  addScore: (pts) => set(s => ({ score: s.score + pts })),

  addIronDome: () => set(s => ({ ironDomeCount: Math.min(s.ironDomeCount + 1, 5) })),

  activateIronDome: () => {
    const { ironDomeCount, ironDomeActive } = get()
    if (ironDomeCount <= 0 || ironDomeActive) return
    set({ ironDomeCount: ironDomeCount - 1, ironDomeActive: true })
    setTimeout(() => set({ ironDomeActive: false }), 3000)
  },

  addDistance: (d) => {
    const state = get()
    const newDist = state.distance + d
    const levelLength = 160  // meters per level (5 × 160 = 800m = 20 segments × 40m)
    const totalLength = levelLength * 5
    const newProgress = Math.min(newDist / levelLength, 1)
    const newLevel = Math.min(Math.floor(newDist / levelLength) + 1, 5)

    if (newDist >= totalLength) {
      set({ distance: newDist, levelProgress: 1, phase: 'victory' })
      return
    }

    set({
      distance: newDist,
      level: newLevel,
      levelProgress: newProgress - Math.floor(newProgress),
      score: state.score + Math.round(d * 10),
    })
  },

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
