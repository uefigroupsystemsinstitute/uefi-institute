/**
 * AssessPrep Execution Environment - Native Audio Synthesis Engine
 * Replaces external binary MP3 resources with highly resilient physical audio modeling.
 */

const AssessmentAudioEngine = (function() {
    'use strict';

    function createCrowHarmonicNode(context, baseFrequency, volume, startOffset, sustainDuration) {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        // Sawtooth waves simulate the complex overtones of an animal crow
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(baseFrequency, context.currentTime + startOffset);
        
        // Linear pitch bend upwards to match a rooster's natural pitch curve
        oscillator.frequency.linearRampToValueAtTime(
            baseFrequency * 1.12, 
            context.currentTime + startOffset + (sustainDuration * 0.4)
        );
        
        // Exponential falloff
        oscillator.frequency.exponentialRampToValueAtTime(
            baseFrequency * 0.95,
            context.currentTime + startOffset + sustainDuration
        );

        // Amplitude envelope profiling
        gainNode.gain.setValueAtTime(0, context.currentTime + startOffset);
        gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + startOffset + 0.05);
        gainNode.gain.setValueAtTime(volume, context.currentTime + startOffset + (sustainDuration * 0.7));
        gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + startOffset + sustainDuration);

        // Component Routing Matrix
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(context.currentTime + startOffset);
        oscillator.stop(context.currentTime + startOffset + sustainDuration);
    }

    return {
        triggerCockCrowAlarm: function() {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return;
                
                const context = new AudioContextClass();
                
                // Segment 1: "Cock-"
                createCrowHarmonicNode(context, 550, 0.25, 0.00, 0.22);
                createCrowHarmonicNode(context, 1100, 0.08, 0.00, 0.22); // Upper Harmonic Octave
                
                // Segment 2: "-a-"
                createCrowHarmonicNode(context, 680, 0.22, 0.26, 0.18);
                
                // Segment 3: "-doodle-"
                createCrowHarmonicNode(context, 610, 0.28, 0.48, 0.35);
                createCrowHarmonicNode(context, 1220, 0.06, 0.48, 0.35);
                
                // Segment 4: "-DOOOO!" (Sustained Crest Note)
                createCrowHarmonicNode(context, 820, 0.35, 0.88, 1.40);
                createCrowHarmonicNode(context, 1640, 0.10, 0.88, 1.30);
                createCrowHarmonicNode(context, 410, 0.15, 0.95, 1.20); // Sub-harmonic undertone
                
            } catch (error) {
                console.error("Audio Synthesis Execution Blocked or Unsupported: ", error);
            }
        }
    };
})();
