import { useStore } from '@/store/useStore'

let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioCtx = new Ctor()
  }
  return audioCtx
}

function playTone(freqs: number[], durationEach = 0.12, type: OscillatorType = 'sine') {
  if (!useStore.getState().settings.soundOn) return
  const ctx = getContext()
  if (!ctx) return

  let startTime = ctx.currentTime
  for (const freq of freqs) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationEach)
    osc.connect(gain).connect(ctx.destination)
    osc.start(startTime)
    osc.stop(startTime + durationEach)
    startTime += durationEach * 0.8
  }
}

/** A short upward chime for completing a task or activity. */
export function playSuccessChime(): void {
  playTone([523.25, 659.25, 783.99]) // C5 E5 G5
}

/** A soft click for game interactions (spin, roll, flip, open). */
export function playTick(): void {
  playTone([400], 0.06, 'square')
}

/** A bright celebratory flourish for certificates and big milestones. */
export function playCelebration(): void {
  playTone([523.25, 659.25, 783.99, 1046.5], 0.14)
}

/** A gentle descending tone for the screen-time 5-minute warning. */
export function playWarningChime(): void {
  playTone([659.25, 523.25], 0.18)
}

/** A clear double-beep for "time's up". */
export function playTimesUpChime(): void {
  playTone([440, 440], 0.2, 'triangle')
}
