import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

// Procedural audio - AudioBuffer-based (no deprecated ScriptProcessor)
export default function SoundManager() {
  const phase = useGameStore(s => s.phase)
  const ctxRef = useRef(null)
  const oscRef = useRef(null)
  const sirenRef = useRef(null)
  const sirenLfoRef = useRef(null)
  const timerRef = useRef(null)
  const gunTimerRef = useRef(null)

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  const makeNoiseBuffer = (ctx, seconds) => {
    const len = ctx.sampleRate * seconds
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + w * 0.0555179
      b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.96900 * b2 + w * 0.1538520
      b3 = 0.86650 * b3 + w * 0.3104856
      data[i] = (b0 + b1 + b2 + b3) * 0.12
    }
    return buf
  }

  const startAmbiance = () => {
    try {
      const ctx = getCtx()
      const master = ctx.createGain()
      master.gain.value = 0.28
      master.connect(ctx.destination)

      // Low bass rumble oscillator
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = 36
      const rumbleFilter = ctx.createBiquadFilter()
      rumbleFilter.type = 'lowpass'
      rumbleFilter.frequency.value = 90
      const rumbleGain = ctx.createGain()
      rumbleGain.gain.value = 0.22
      osc.connect(rumbleFilter)
      rumbleFilter.connect(rumbleGain)
      rumbleGain.connect(master)
      osc.start()
      oscRef.current = osc

      // Pink noise ambient wind (looping)
      const noiseBuf = makeNoiseBuffer(ctx, 4)
      const noiseSrc = ctx.createBufferSource()
      noiseSrc.buffer = noiseBuf
      noiseSrc.loop = true
      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.value = 350
      noiseFilter.Q.value = 0.5
      const noiseGain = ctx.createGain()
      noiseGain.gain.value = 0.07
      noiseSrc.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(master)
      noiseSrc.start()

      // High wind whine layer
      const windSrc = ctx.createBufferSource()
      windSrc.buffer = noiseBuf
      windSrc.loop = true
      const windFilter = ctx.createBiquadFilter()
      windFilter.type = 'bandpass'
      windFilter.frequency.value = 2400
      windFilter.Q.value = 1.8
      const windGain = ctx.createGain()
      windGain.gain.value = 0.025
      windSrc.connect(windFilter)
      windFilter.connect(windGain)
      windGain.connect(master)
      windSrc.start()

      // Air raid siren: sawtooth with LFO wail (0.35 Hz)
      const siren = ctx.createOscillator()
      siren.type = 'sawtooth'
      siren.frequency.value = 380
      const sirenFilter = ctx.createBiquadFilter()
      sirenFilter.type = 'bandpass'
      sirenFilter.frequency.value = 620
      sirenFilter.Q.value = 2.5
      const sirenGain = ctx.createGain()
      sirenGain.gain.value = 0.065
      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 0.35
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 190
      lfo.connect(lfoGain)
      lfoGain.connect(siren.frequency)
      siren.connect(sirenFilter)
      sirenFilter.connect(sirenGain)
      sirenGain.connect(master)
      siren.start()
      lfo.start()
      sirenRef.current = siren
      sirenLfoRef.current = lfo

      // Distant explosion booms
      const boom = () => {
        if (!ctxRef.current) return
        playBoom(ctx, master, 0.35)
        timerRef.current = setTimeout(boom, 1800 + Math.random() * 4000)
      }
      timerRef.current = setTimeout(boom, 900)

      // Distant gunshots / cracks
      const gunshot = () => {
        if (!ctxRef.current) return
        playGunshot(ctx, master, 0.1)
        gunTimerRef.current = setTimeout(gunshot, 700 + Math.random() * 2200)
      }
      gunTimerRef.current = setTimeout(gunshot, 1600)

    } catch (_) {}
  }

  const stopAll = () => {
    clearTimeout(timerRef.current)
    clearTimeout(gunTimerRef.current)
    try { oscRef.current?.stop() } catch (_) {}
    try { sirenRef.current?.stop() } catch (_) {}
    try { sirenLfoRef.current?.stop() } catch (_) {}
    oscRef.current = null
    sirenRef.current = null
    sirenLfoRef.current = null
    try { ctxRef.current?.close() } catch (_) {}
    ctxRef.current = null
  }

  useEffect(() => {
    if (phase === 'playing') {
      const t = setTimeout(startAmbiance, 400)
      return () => { clearTimeout(t); stopAll() }
    } else {
      stopAll()
    }
  }, [phase])

  return null
}

function playBoom(ctx, dest, volume) {
  try {
    const now = ctx.currentTime
    const len = Math.floor(ctx.sampleRate * 0.8)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1)

    const src = ctx.createBufferSource()
    src.buffer = buf
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(600, now)
    f.frequency.exponentialRampToValueAtTime(55, now + 0.6)
    const g = ctx.createGain()
    g.gain.setValueAtTime(volume, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
    src.connect(f); f.connect(g); g.connect(dest)
    src.start(now); src.stop(now + 0.8)

    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(65, now)
    osc.frequency.exponentialRampToValueAtTime(22, now + 0.4)
    const og = ctx.createGain()
    og.gain.setValueAtTime(volume * 0.8, now)
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc.connect(og); og.connect(dest)
    osc.start(now); osc.stop(now + 0.4)
  } catch (_) {}
}

function playGunshot(ctx, dest, volume) {
  try {
    const now = ctx.currentTime
    const len = Math.floor(ctx.sampleRate * 0.1)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1)

    const src = ctx.createBufferSource()
    src.buffer = buf
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 900
    const g = ctx.createGain()
    g.gain.setValueAtTime(volume, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    src.connect(f); f.connect(g); g.connect(dest)
    src.start(now); src.stop(now + 0.12)
  } catch (_) {}
}
