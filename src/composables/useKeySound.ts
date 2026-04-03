let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function playKeyClick(variant: 'normal' | 'space' = 'normal') {
  const ac = getCtx()
  // Resume context if suspended (browser autoplay policy)
  if (ac.state === 'suspended') ac.resume()

  const now = ac.currentTime

  // --- noise burst (the "click" transient) ---
  const bufferSize = ac.sampleRate * 0.04
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const noise = ac.createBufferSource()
  noise.buffer = buffer

  // Band-pass filter — makes it sound more mechanical
  const bpf = ac.createBiquadFilter()
  bpf.type = 'bandpass'
  bpf.frequency.value = variant === 'space' ? 600 : 1800
  bpf.Q.value = 1.2

  // Fast volume envelope
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.35, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

  noise.connect(bpf)
  bpf.connect(gain)
  gain.connect(ac.destination)
  noise.start(now)
  noise.stop(now + 0.05)

  // --- short tonal "thock" body ---
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(variant === 'space' ? 120 : 180, now)
  osc.frequency.exponentialRampToValueAtTime(variant === 'space' ? 60 : 80, now + 0.06)

  const oscGain = ac.createGain()
  oscGain.gain.setValueAtTime(0.15, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

  osc.connect(oscGain)
  oscGain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.07)
}
