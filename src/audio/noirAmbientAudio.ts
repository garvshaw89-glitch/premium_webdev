/**
 * Lightweight, silent-by-default Web Audio API cinematic ambient soundscape for NOIR®.
 * Never autoplays audibly — only initializes on explicit user gesture ("SOUND ON").
 * Generates a subtle low-pass atmospheric drone, soft silk texture whisper,
 * and gentle harmonic transition swell without external audio dependencies.
 */
export class NoirAmbientAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private silkGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private isEnabled = false;
  private isDisposed = false;

  public toggle(): boolean {
    if (this.isDisposed) return false;
    if (this.isEnabled) {
      this.mute();
      return false;
    }
    return this.enable();
  }

  public enable(): boolean {
    if (this.isDisposed || typeof window === 'undefined') return false;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtx) return false;

    try {
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.buildGraph(this.ctx);
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      if (this.masterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.085, now + 0.8);
      }
      this.isEnabled = true;
      return true;
    } catch {
      return false;
    }
  }

  public mute(): void {
    this.isEnabled = false;
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.35);
    } catch {
      // Ignore audio state errors on teardown
    }
  }

  /** Subtle silk whisper swell for fabric reveal and homepage silk sweep */
  public pulseFabric(duration = 1.4, intensity = 0.035): void {
    if (!this.isEnabled || !this.ctx || !this.silkGain) return;
    try {
      const now = this.ctx.currentTime;
      this.silkGain.gain.cancelScheduledValues(now);
      this.silkGain.gain.setValueAtTime(0.004, now);
      this.silkGain.gain.linearRampToValueAtTime(intensity, now + duration * 0.42);
      this.silkGain.gain.linearRampToValueAtTime(0.005, now + duration);
    } catch {
      // Ignore scheduling errors
    }
  }

  /** Soft warm shimmer accent when NOIR® wordmark reveals or transitions */
  public playTransitionSwell(): void {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(196.0, now); // Warm G3
      osc.frequency.exponentialRampToValueAtTime(220.0, now + 1.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(520, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.0);
    } catch {
      // Ignore scheduling errors
    }
  }

  /** Smooth fade-out and complete resource cleanup when intro ends */
  public fadeOutAndDispose(fadeSec = 0.9): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.isEnabled = false;

    const ctx = this.ctx;
    const masterGain = this.masterGain;

    if (!ctx) return;

    try {
      if (masterGain) {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
      }
      window.setTimeout(() => {
        try {
          this.oscillators.forEach((o) => {
            try {
              o.stop();
            } catch {
              // Already stopped
            }
          });
          this.oscillators = [];
          if (this.noiseSource) {
            try {
              this.noiseSource.stop();
            } catch {
              // Already stopped
            }
            this.noiseSource = null;
          }
          if (ctx.state !== 'closed') {
            void ctx.close();
          }
        } catch {
          // Ignore teardown errors
        }
        this.ctx = null;
        this.masterGain = null;
        this.silkGain = null;
      }, Math.ceil(fadeSec * 1000) + 120);
    } catch {
      this.ctx = null;
    }
  }

  private buildGraph(ctx: AudioContext): void {
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.connect(ctx.destination);
    this.masterGain = master;

    // Warm low-pass cinema drone (C2 + G2 fifth)
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(240, ctx.currentTime);
    droneFilter.Q.setValueAtTime(0.7, ctx.currentTime);
    droneFilter.connect(master);

    const freqs = [65.41, 98.0, 130.81];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(idx === 0 ? 0.45 : idx === 1 ? 0.22 : 0.1, ctx.currentTime);
      osc.connect(g);
      g.connect(droneFilter);
      osc.start();
      this.oscillators.push(osc);
    });

    // Soft bandpass-filtered noise for subtle silk air movement
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.035 * white) / 1.035;
      lastOut = data[i];
      data[i] *= 1.8;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const silkFilter = ctx.createBiquadFilter();
    silkFilter.type = 'bandpass';
    silkFilter.frequency.setValueAtTime(420, ctx.currentTime);
    silkFilter.Q.setValueAtTime(1.1, ctx.currentTime);

    const silkGain = ctx.createGain();
    silkGain.gain.setValueAtTime(0.005, ctx.currentTime);

    noise.connect(silkFilter);
    silkFilter.connect(silkGain);
    silkGain.connect(master);
    noise.start();

    this.noiseSource = noise;
    this.silkGain = silkGain;
  }
}
