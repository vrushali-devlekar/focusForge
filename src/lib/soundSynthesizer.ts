"use client";

// Web Audio API Synthesizer for alerts, chimes, and ambient noise
class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private isNoisePlaying: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play gentle bell chime for study / break transitions and milestones
  public playChime(type: "phase-switch" | "complete" | "milestone" | "alert" = "phase-switch") {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === "milestone") {
        // Grand celebratory arpeggio (C5 -> E5 -> G5 -> C6 -> E6)
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 2.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 2.6);
        });
        return;
      }

      if (type === "complete") {
        // Harmonious major chord
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.type = "sine";
          chordOsc.frequency.setValueAtTime(freq, now + idx * 0.08);

          chordGain.gain.setValueAtTime(0, now + idx * 0.08);
          chordGain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.8);

          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.start(now + idx * 0.08);
          chordOsc.stop(now + idx * 0.08 + 2);
        });
        return;
      }

      if (type === "phase-switch") {
        // Two-tone soothing bell
        [440, 659.25].forEach((freq, idx) => {
          const switchOsc = ctx.createOscillator();
          const switchGain = ctx.createGain();
          switchOsc.type = "triangle";
          switchOsc.frequency.setValueAtTime(freq, now + idx * 0.15);

          switchGain.gain.setValueAtTime(0, now + idx * 0.15);
          switchGain.gain.linearRampToValueAtTime(0.25, now + idx * 0.15 + 0.02);
          switchGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 1.2);

          switchOsc.connect(switchGain);
          switchGain.connect(ctx.destination);
          switchOsc.start(now + idx * 0.15);
          switchOsc.stop(now + idx * 0.15 + 1.3);
        });
        return;
      }

      // Default alert
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {
      console.warn("Audio synthesis not allowed before user interaction", e);
    }
  }

  // Rain / Ambient noise generator
  public startAmbientRain(volume: number = 0.3) {
    if (this.isNoisePlaying) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      this.noiseNode = noiseSource;
      this.isNoisePlaying = true;
    } catch (e) {
      console.warn("Could not start ambient noise", e);
    }
  }

  public stopAmbientRain() {
    if (!this.isNoisePlaying || !this.noiseNode) return;
    try {
      (this.noiseNode as AudioBufferSourceNode).stop();
      this.noiseNode.disconnect();
    } catch {}
    this.noiseNode = null;
    this.isNoisePlaying = false;
  }

  public isRainActive(): boolean {
    return this.isNoisePlaying;
  }
}

export const soundSynthesizer = new AudioSynthesizer();
export default soundSynthesizer;
