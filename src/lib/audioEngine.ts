import { prepareAudioForPlayback } from "./iosAudio";

const BASE_FREQUENCY = 250;
const MIN_FREQUENCY = 80;
const MAX_FREQUENCY = 2000;

interface WindowWithAudioContext extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

export function yToFrequency(y: number): number {
  const frequency = BASE_FREQUENCY * Math.pow(2, y / 12);
  return Math.min(MAX_FREQUENCY, Math.max(MIN_FREQUENCY, frequency));
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;

  private oscillator: OscillatorNode | null = null;

  private gainNode: GainNode | null = null;

  private isPlaying = false;

  public async start(): Promise<void> {
    prepareAudioForPlayback();

    const audioContext = this.getAudioContext();
    if (audioContext === null) {
      return;
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (this.oscillator === null || this.gainNode === null) {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.0001;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();

      this.oscillator = oscillator;
      this.gainNode = gainNode;
    }

    this.isPlaying = true;
    const now = audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setTargetAtTime(0.04, now, 0.03);
  }

  public stop(): void {
    if (this.audioContext === null || this.gainNode === null) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = false;
    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setTargetAtTime(0.0001, now, 0.03);
  }

  public updateFromY(y: number): void {
    if (!this.isPlaying || this.audioContext === null || this.oscillator === null) {
      return;
    }

    const frequency = yToFrequency(y);
    const now = this.audioContext.currentTime;
    this.oscillator.frequency.cancelScheduledValues(now);
    this.oscillator.frequency.setTargetAtTime(frequency, now, 0.02);
  }

  public dispose(): void {
    this.stop();
    this.oscillator?.stop();
    this.oscillator?.disconnect();
    this.gainNode?.disconnect();
    this.oscillator = null;
    this.gainNode = null;
    void this.audioContext?.close();
    this.audioContext = null;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") {
      return null;
    }

    const windowWithAudioContext = window as WindowWithAudioContext;
    const AudioContextConstructor =
      windowWithAudioContext.AudioContext ?? windowWithAudioContext.webkitAudioContext;
    if (AudioContextConstructor === undefined) {
      return null;
    }

    this.audioContext ??= new AudioContextConstructor();

    return this.audioContext;
  }
}
