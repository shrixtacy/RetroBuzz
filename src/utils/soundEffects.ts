// Retro sound effects simulation
export class SoundEffects {
  private static instance: SoundEffects;
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('Audio not supported');
      this.enabled = false;
    }
  }

  static getInstance(): SoundEffects {
    if (!SoundEffects.instance) {
      SoundEffects.instance = new SoundEffects();
    }
    return SoundEffects.instance;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Windows 95 style sounds
  playStartup(): void {
    // Classic Windows startup sound simulation
    setTimeout(() => this.playTone(523, 0.2), 0);    // C5
    setTimeout(() => this.playTone(659, 0.2), 200);  // E5
    setTimeout(() => this.playTone(784, 0.2), 400);  // G5
    setTimeout(() => this.playTone(1047, 0.4), 600); // C6
  }

  playClick(): void {
    this.playTone(800, 0.05, 'square');
  }

  playDoubleClick(): void {
    this.playTone(1000, 0.03, 'square');
    setTimeout(() => this.playTone(1000, 0.03, 'square'), 50);
  }

  playWindowOpen(): void {
    this.playTone(440, 0.1);
    setTimeout(() => this.playTone(554, 0.1), 50);
    setTimeout(() => this.playTone(659, 0.15), 100);
  }

  playWindowClose(): void {
    this.playTone(659, 0.1);
    setTimeout(() => this.playTone(554, 0.1), 50);
    setTimeout(() => this.playTone(440, 0.15), 100);
  }

  playError(): void {
    // Classic error beep
    this.playTone(200, 0.3, 'sawtooth');
  }

  playNotification(): void {
    this.playTone(800, 0.1);
    setTimeout(() => this.playTone(1000, 0.1), 100);
  }

  playAIComment(): void {
    // Futuristic AI sound
    this.playTone(1200, 0.05);
    setTimeout(() => this.playTone(1400, 0.05), 30);
    setTimeout(() => this.playTone(1600, 0.1), 60);
  }

  playDialUp(): void {
    // Simulate dial-up modem sounds
    const frequencies = [697, 770, 852, 941, 1209, 1336, 1477];
    frequencies.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sawtooth'), index * 100);
    });
  }

  playGameStart(): void {
    // Game start sound
    this.playTone(440, 0.1);
    setTimeout(() => this.playTone(554, 0.1), 100);
    setTimeout(() => this.playTone(659, 0.2), 200);
  }

  playGameOver(): void {
    // Game over sound
    this.playTone(330, 0.2, 'sawtooth');
    setTimeout(() => this.playTone(277, 0.2, 'sawtooth'), 200);
    setTimeout(() => this.playTone(220, 0.4, 'sawtooth'), 400);
  }

  playGameWin(): void {
    // Victory sound
    this.playTone(523, 0.15);
    setTimeout(() => this.playTone(659, 0.15), 150);
    setTimeout(() => this.playTone(784, 0.15), 300);
    setTimeout(() => this.playTone(1047, 0.3), 450);
  }

  playTetrisLine(): void {
    // Tetris line clear sound
    this.playTone(880, 0.1);
    setTimeout(() => this.playTone(1108, 0.1), 50);
    setTimeout(() => this.playTone(1318, 0.2), 100);
  }

  playSnakeEat(): void {
    // Snake eating food sound
    this.playTone(1000, 0.05, 'square');
    setTimeout(() => this.playTone(1200, 0.05, 'square'), 50);
  }

  playTicTacToeMove(): void {
    // Tic-tac-toe move sound
    this.playTone(600, 0.1, 'triangle');
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}