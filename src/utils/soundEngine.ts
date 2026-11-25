/**
 * Procedural Web Audio API sound effects for Yayle Juara.
 * Lightweight, zero external audio files, works 100% offline.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(val: boolean): void {
    this.muted = val;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private jitter(base: number): number {
    return base * (0.94 + Math.random() * 0.12);
  }

  private playTone(freq: number, duration: number, type: OscillatorType, gainPeak = 0.14, endFreq?: number, delay = 0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playLaunch(): void {
    this.playTone(this.jitter(220), 0.16, 'triangle', 0.16, this.jitter(520));
  }

  public playBounce(): void {
    this.playTone(this.jitter(310), 0.12, 'sine', 0.15, this.jitter(490));
  }

  public playScore(combo = 1): void {
    const step = Math.min(combo, 5) * 45;
    this.playTone(523 + step, 0.11, 'triangle', 0.16);
    this.playTone(659 + step, 0.14, 'triangle', 0.16, undefined, 0.07);
    this.playTone(784 + step, 0.2, 'sine', 0.15, undefined, 0.14);
  }

  public playSoftMiss(): void {
    this.playTone(260, 0.16, 'sine', 0.11, 180);
  }

  public playQuizStar(): void {
    this.playTone(587, 0.1, 'sine', 0.15);
    this.playTone(880, 0.18, 'triangle', 0.16, undefined, 0.08);
  }

  public playQuizCorrect(): void {
    [523, 659, 784, 1046].forEach((n, idx) => {
      this.playTone(n, 0.16, 'triangle', 0.15, undefined, idx * 0.07);
    });
  }

  public playQuizWrong(): void {
    this.playTone(320, 0.16, 'triangle', 0.12, 240);
    this.playTone(230, 0.22, 'triangle', 0.11, 190, 0.12);
  }

  public playVictory(): void {
    [523, 659, 784, 1046, 1318].forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', 0.16, undefined, idx * 0.085);
    });
  }

  public playButton(): void {
    this.playTone(this.jitter(560), 0.06, 'sine', 0.09, this.jitter(680));
  }
}

export const soundEngine = new SoundEngine();
