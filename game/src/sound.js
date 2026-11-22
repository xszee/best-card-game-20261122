// Tiny sounds for Lantern Duel, made with the Web Audio API and
// nothing else: no audio files, no network. Every sound is one or
// two short oscillator notes. Sound stays off until the player first
// clicks, so browsers never complain, and the mute button silences it.

let context = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureContext() {
  if (context !== null) return context;
  try {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    context = AudioContext ? new AudioContext() : null;
  } catch {
    context = null;
  }
  return context;
}

function note(frequency, startAt, length, type, volume) {
  const ctx = ensureContext();
  if (ctx === null || muted) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + length);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + length);
  } catch {
    // Sound is garnish: a browser that refuses it still plays the game.
  }
}

export function unlockSound() {
  const ctx = ensureContext();
  if (ctx !== null && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

export function playCardSound(kind) {
  if (kind === 'strike') {
    note(220, 0, 0.12, 'sawtooth', 0.08);
    note(110, 0.05, 0.18, 'square', 0.06);
  } else if (kind === 'guard') {
    note(330, 0, 0.12, 'triangle', 0.08);
    note(440, 0.08, 0.15, 'triangle', 0.06);
  } else {
    note(523, 0, 0.15, 'sine', 0.09);
    note(659, 0.1, 0.2, 'sine', 0.07);
  }
}

export function winSound() {
  note(523, 0, 0.2, 'triangle', 0.09);
  note(659, 0.15, 0.2, 'triangle', 0.09);
  note(784, 0.3, 0.35, 'triangle', 0.1);
}

export function loseSound() {
  note(330, 0, 0.25, 'sawtooth', 0.07);
  note(220, 0.2, 0.4, 'sawtooth', 0.06);
}
