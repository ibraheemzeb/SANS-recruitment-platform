// Web Speech API Synthesis Utility for Real Voice Audio Playback

export interface SpeechPlaybackOptions {
  text: string;
  lang: 'ar' | 'en';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class VoiceManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public getAvailableVoices(lang: 'ar' | 'en'): SpeechSynthesisVoice[] {
    const prefix = lang === 'ar' ? 'ar' : 'en';
    return this.voices.filter(v => v.lang.startsWith(prefix));
  }

  public speak(options: SpeechPlaybackOptions) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported on this device/browser.');
      if (options.onStart) options.onStart();
      setTimeout(() => {
        if (options.onEnd) options.onEnd();
      }, 3000);
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.lang = options.lang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = options.lang === 'ar' ? 0.95 : 1.0;
    utterance.pitch = 1.0;

    // Pick best voice if available
    const matchedVoices = this.getAvailableVoices(options.lang);
    if (matchedVoices.length > 0) {
      utterance.voice = matchedVoices[0];
    }

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (options.onError) options.onError(e);
      if (options.onEnd) options.onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking;
  }
}

export const voiceManager = new VoiceManager();
