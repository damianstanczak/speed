let audioCtx: AudioContext | null = null;
let isAudioMuted = false;
let lastAlertTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isAudioMuted = muted;
}

export function getSoundMuted(): boolean {
  return isAudioMuted;
}

/**
 * Krótki sygnał ostrzegawczy o przekroczeniu limitu prędkości
 */
export function playOverspeedWarning() {
  if (isAudioMuted) return;
  const now = Date.now();
  if (now - lastAlertTime < 2500) return; // nie częściej niż co 2.5s
  lastAlertTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    // Ignoruj błędy audio context
  }
}

/**
 * Głośny, alarmujący sygnał przy zagrożeniu utratą prawa jazdy (+50 km/h)
 */
export function playLicenseLossAlarm() {
  if (isAudioMuted) return;
  const now = Date.now();
  if (now - lastAlertTime < 2000) return;
  lastAlertTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Dwa tony alarmowe (syrena policja/ostrzeżenie)
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.02, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playTone(950, ctx.currentTime, 0.25);
    playTone(1350, ctx.currentTime + 0.25, 0.35);
  } catch (e) {
    // ignoruj
  }
}
