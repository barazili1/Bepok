
let audioCtx: AudioContext | null = null;

const getContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
}

export type SoundType = 'click' | 'predict' | 'success' | 'hover' | 'toggle' | 'plane-start' | 'plane-fly' | 'crash';

let planeOscillator: OscillatorNode | null = null;
let planeGain: GainNode | null = null;

export const playSound = (type: SoundType) => {
    if (typeof window === 'undefined') return;
    
    try {
        const ctx = getContext();
        // Resume context if suspended
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;

        switch (type) {
            case 'click':
                const clickOsc = ctx.createOscillator();
                const clickGain = ctx.createGain();
                clickOsc.connect(clickGain);
                clickGain.connect(ctx.destination);
                clickOsc.type = 'sine';
                clickOsc.frequency.setValueAtTime(1000, now);
                clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
                clickGain.gain.setValueAtTime(0.05, now);
                clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                clickOsc.start(now);
                clickOsc.stop(now + 0.05);
                break;

            case 'toggle':
                const toggleOsc = ctx.createOscillator();
                const toggleGain = ctx.createGain();
                toggleOsc.connect(toggleGain);
                toggleGain.connect(ctx.destination);
                toggleOsc.type = 'sine';
                toggleOsc.frequency.setValueAtTime(600, now);
                toggleGain.gain.setValueAtTime(0.03, now);
                toggleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                toggleOsc.start(now);
                toggleOsc.stop(now + 0.05);
                break;

            case 'predict':
                const predOsc = ctx.createOscillator();
                const predGain = ctx.createGain();
                predOsc.connect(predGain);
                predGain.connect(ctx.destination);
                predOsc.type = 'triangle';
                predOsc.frequency.setValueAtTime(150, now);
                predOsc.frequency.linearRampToValueAtTime(600, now + 0.3);
                predGain.gain.setValueAtTime(0.08, now);
                predGain.gain.linearRampToValueAtTime(0, now + 0.3);
                predOsc.start(now);
                predOsc.stop(now + 0.3);
                break;

            case 'success':
                const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                frequencies.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + (i * 0.05));
                    g.gain.setValueAtTime(0.04, now + (i * 0.05));
                    g.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.05) + 0.5);
                    o.start(now + (i * 0.05));
                    o.stop(now + (i * 0.05) + 0.5);
                });
                break;
                
            case 'hover':
                const hoverOsc = ctx.createOscillator();
                const hoverGain = ctx.createGain();
                hoverOsc.connect(hoverGain);
                hoverGain.connect(ctx.destination);
                hoverOsc.type = 'sine';
                hoverOsc.frequency.setValueAtTime(1200, now);
                hoverGain.gain.setValueAtTime(0.01, now);
                hoverGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
                hoverOsc.start(now);
                hoverOsc.stop(now + 0.02);
                break;

            case 'plane-start':
                // Stop previous if exists
                if (planeOscillator) {
                    try { planeOscillator.stop(); } catch(e){}
                }
                planeOscillator = ctx.createOscillator();
                planeGain = ctx.createGain();
                planeOscillator.connect(planeGain);
                planeGain.connect(ctx.destination);
                
                planeOscillator.type = 'sawtooth';
                planeOscillator.frequency.setValueAtTime(100, now);
                planeOscillator.frequency.linearRampToValueAtTime(400, now + 2); // Rising pitch
                
                planeGain.gain.setValueAtTime(0, now);
                planeGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
                
                planeOscillator.start(now);
                break;

            case 'plane-fly':
                 // Usually called after start, maintain pitch or slight rise
                 // If managed by state, just ensure it doesn't stop. 
                 // For this simple implementation, 'plane-start' handles the duration.
                 break;

            case 'crash':
                if (planeOscillator && planeGain) {
                    const stopTime = now;
                    planeOscillator.stop(stopTime);
                    planeOscillator = null;
                }
                
                // White noise burst
                const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const noiseGain = ctx.createGain();
                noise.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                
                noiseGain.gain.setValueAtTime(0.1, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                noise.start(now);
                break;
        }
    } catch (e) {
        console.warn("Audio error", e);
    }
}
