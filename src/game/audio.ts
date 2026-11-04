let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

function ctor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (ctx && master) {
    master.gain.setTargetAtTime(on ? 0.7 : 0, ctx.currentTime, 0.02);
  }
}

export function unlockAudio() {
  const AudioCtx = ctor();
  if (!AudioCtx) return;
  if (!ctx) {
    ctx = new AudioCtx({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = enabled ? 0.7 : 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export function bindAudioLifecycle(): () => void {
  if (typeof document === "undefined") return () => {};
  const onVis = () => {
    if (document.visibilityState === "visible") resumeAudio();
  };
  document.addEventListener("visibilitychange", onVis);
  return () => document.removeEventListener("visibilitychange", onVis);
}

function tone(freq: number, duration: number, type: OscillatorType, gain: number, delay = 0) {
  if (!ctx || !master || !enabled) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
  osc.onended = () => {
    osc.disconnect();
    amp.disconnect();
  };
}

export function sfxDeal() {
  tone(196, 0.05, "triangle", 0.08);
  tone(262, 0.06, "sine", 0.05, 0.04);
}

export function sfxPlay() {
  tone(520, 0.035, "square", 0.03);
  tone(180, 0.06, "triangle", 0.07);
}

export function sfxBid() {
  tone(523, 0.07, "triangle", 0.07);
  tone(659, 0.09, "sine", 0.05, 0.06);
}

export function sfxTake() {
  tone(392, 0.08, "sine", 0.07);
  tone(523, 0.11, "sine", 0.05, 0.07);
}

export function sfxYouTake() {
  tone(523, 0.07, "sine", 0.08);
  tone(659, 0.09, "sine", 0.07, 0.06);
  tone(784, 0.13, "sine", 0.06, 0.12);
}

export function sfxMiss() {
  tone(196, 0.16, "triangle", 0.06);
  tone(146, 0.2, "sine", 0.05, 0.08);
}

export function sfxWin() {
  [523, 659, 784, 1046].forEach((freq, i) => tone(freq, 0.16, "sine", 0.07, i * 0.09));
}

export function sfxLose() {
  tone(220, 0.16, "triangle", 0.05);
  tone(174, 0.22, "sine", 0.045, 0.1);
}
