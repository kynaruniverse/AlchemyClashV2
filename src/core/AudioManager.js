/**
 * ALCHEMY CLASH: AUDIO MANAGER
 * Web Audio API with HTMLAudio fallback.
 * Alchemy-appropriate sound manifest.
 */

export class AudioManager {
    constructor() {
        this.manifest = {
            'SNAP':   'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
            'REVEAL': 'https://assets.mixkit.co/active_storage/sfx/2591/2591-preview.mp3',
            'CLICK':  'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
            'SLIDE':  'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
            'SURGE':  'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3'
        };

        this.audioContext  = null;
        this.masterGain    = null;
        this.buffers       = new Map();
        this.enabled       = false;
        this.masterVolume  = 0.6;

        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain   = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
        } catch (e) {
            console.warn("AudioManager: Web Audio API unavailable, using HTMLAudio fallback.");
            this.audioContext = null;
        }

        // Preload all buffers
        Object.entries(this.manifest).forEach(([key, url]) => {
            this.loadBuffer(key, url);
        });

        // Unlock audio on first interaction (browser policy)
        const unlock = () => {
            this.enabled = true;
            if (this.audioContext?.state === 'suspended') {
                this.audioContext.resume();
            }
            window.removeEventListener('click',      unlock);
            window.removeEventListener('touchstart', unlock);
        };

        window.addEventListener('click',      unlock);
        window.addEventListener('touchstart', unlock);
    }

    async loadBuffer(key, url) {
        if (!this.audioContext) return;
        try {
            const response    = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer      = await this.audioContext.decodeAudioData(arrayBuffer);
            this.buffers.set(key, buffer);
        } catch (e) {
            console.warn(`AudioManager: Failed to load "${key}".`, e);
        }
    }

    play(key, volume = 1.0, loop = false) {
        if (!this.enabled) return;

        if (this.audioContext && this.buffers.has(key)) {
            const source   = this.audioContext.createBufferSource();
            source.buffer  = this.buffers.get(key);
            source.loop    = loop;

            const gain           = this.audioContext.createGain();
            gain.gain.value      = Math.min(1, volume * this.masterVolume);

            source.connect(gain);
            gain.connect(this.masterGain);
            source.start(0);

        } else if (!this.audioContext && this.manifest[key]) {
            // HTMLAudio fallback
            const audio   = new Audio(this.manifest[key]);
            audio.volume  = Math.min(1, volume * this.masterVolume);
            audio.loop    = loop;
            audio.play().catch(e => console.warn(`AudioManager: Playback blocked for "${key}".`, e));
        }
    }

    fadeVolume(targetVolume = 1.0, duration = 1.0) {
        if (!this.masterGain) return;
        const start = this.masterGain.gain.value;
        const diff  = targetVolume - start;
        const steps = 30;
        let i = 0;
        const interval = setInterval(() => {
            i++;
            this.masterGain.gain.value = start + diff * (i / steps);
            if (i >= steps) clearInterval(interval);
        }, (duration * 1000) / steps);
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (this.masterGain) this.masterGain.gain.value = this.masterVolume;
    }
}
