// Shared Web Audio sound effects - callable from any component
let _ctx = null

function getCtx() {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

// Pleasant ascending chime - played when collecting Iron Dome package
export function playPickupSound() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime
    const freqs = [660, 880, 1320]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now + i * 0.09)
      gain.gain.linearRampToValueAtTime(0.38, now + i * 0.09 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.38)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.09)
      osc.stop(now + i * 0.09 + 0.4)
    })
  } catch (_) {}
}

// Sci-fi power-up activation sound - played when Iron Dome is activated
export function playActivateSound() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime

    // Rising frequency sweep
    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(110, now)
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.35)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35)
    filter.Q.value = 4
    const gain1 = ctx.createGain()
    gain1.gain.setValueAtTime(0.55, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
    osc1.connect(filter)
    filter.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.45)

    // High shimmer sparkle
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(2400, now + 0.1)
    osc2.frequency.linearRampToValueAtTime(3000, now + 0.45)
    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0.22, now + 0.1)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.1)
    osc2.stop(now + 0.6)

    // Low thump
    const osc3 = ctx.createOscillator()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(80, now)
    osc3.frequency.exponentialRampToValueAtTime(40, now + 0.15)
    const gain3 = ctx.createGain()
    gain3.gain.setValueAtTime(0.6, now)
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc3.connect(gain3)
    gain3.connect(ctx.destination)
    osc3.start(now)
    osc3.stop(now + 0.2)
  } catch (_) {}
}
