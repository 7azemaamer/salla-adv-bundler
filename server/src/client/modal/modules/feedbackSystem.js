/**
 * Feedback System Module
 * Handles audio and haptic feedback for user interactions
 */
export const feedbackSystem = {
  audioContext: null,
  sounds: {
    click: null,
    progress: null,
    complete: null,
    success: null
  },
  
  initAudio() {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.createSounds();
    } catch (e) {
      console.log('Audio not supported:', e);
    }
  },

  createSounds() {
    this.sounds.click = () => this.playTone(800, 0.05, 'sine', 0.1);

    this.sounds.progress = () => {
      this.playTone(600, 0.1, 'square', 0.05);
      setTimeout(() => this.playTone(800, 0.1, 'square', 0.05), 50);
    };

    this.sounds.complete = () => {
      this.playTone(523, 0.15, 'sine', 0.2); 
      setTimeout(() => this.playTone(659, 0.15, 'sine', 0.2), 100); // E5
      setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200); // G5
    };
    
    this.sounds.success = () => {
      this.playTone(523, 0.1, 'triangle', 0.15); 
      setTimeout(() => this.playTone(659, 0.1, 'triangle', 0.15), 75); // E5
      setTimeout(() => this.playTone(784, 0.1, 'triangle', 0.15), 150); // G5
      setTimeout(() => this.playTone(1047, 0.2, 'triangle', 0.25), 225); // C6
    };
  },

  playTone(frequency, duration, type = 'sine', volume = 0.1) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  },
  
  triggerHaptic(type = 'light') {
    // iOS Haptic Engine API (iOS 10+)
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
      try {
        const hapticTypes = {
          light: 'impact-light',
          medium: 'impact-medium',
          heavy: 'impact-heavy',
          success: 'notification-success',
          progress: 'selection',
          click: 'selection',
          complete: 'notification-success'
        };
        window.webkit.messageHandlers.haptic.postMessage(hapticTypes[type] || 'impact-light');
      } catch (e) {
        console.log('iOS haptic not available:', e);
      }
    }
    
    // Try Haptic API for newer iOS devices
    if (window.navigator && typeof window.navigator.vibrate === 'function') {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100],
        success: [50, 50, 50, 50, 100],
        progress: [20],
        click: [10],
        complete: [100, 50, 100]
      };

      try {
        window.navigator.vibrate(patterns[type] || patterns.light);
      } catch (e) {
        console.log('Vibration not supported:', e);
      }
    }
    
    // Try AudioContext for subtle haptic simulation on iOS Safari
    if (!window.navigator.vibrate && window.AudioContext) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 10;
        gainNode.gain.setValueAtTime(0.00001, audioContext.currentTime);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.01);
      } catch (e) {
        // Silent fail for haptic simulation
      }
    }
  },
  
  triggerFeedback(type) {
    // Audio removed - keeping haptic feedback only
    const actions = {
      click: () => {
        this.triggerHaptic('click');
      },
      progress: () => {
        this.triggerHaptic('progress');
      },
      complete: () => {
        this.triggerHaptic('complete');
      },
      success: () => {
        this.triggerHaptic('success');
      }
    };

    actions[type]?.();
  }
};


