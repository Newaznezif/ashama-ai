
import React, { useEffect, useRef, useState } from 'react';

interface VoiceVisualizerProps {
    isActive: boolean;
    isSpeaking?: boolean;
    audioStream?: MediaStream | null;
    className?: string;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
    isActive,
    isSpeaking = false,
    audioStream = null,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const analyserRef = useRef<AnalyserNode | null>(null);
    const [bars, setBars] = useState<number[]>(new Array(32).fill(0));

    useEffect(() => {
        if (!isActive) {
            // Stop animation
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            setBars(new Array(32).fill(0));
            return;
        }

        if (audioStream) {
            // Real audio visualization
            setupAudioAnalyzer(audioStream);
        } else {
            // Simulated visualization
            animateSimulated();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isActive, audioStream, isSpeaking]);

    const setupAudioAnalyzer = (stream: MediaStream) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        animateReal();
    };

    const animateReal = () => {
        if (!analyserRef.current || !isActive) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Convert to normalized values (0-1)
        const normalizedBars = Array.from(dataArray).map(value => value / 255);
        setBars(normalizedBars);

        animationRef.current = requestAnimationFrame(animateReal);
    };

    const animateSimulated = () => {
        if (!isActive) return;

        const newBars = bars.map((_, i) => {
            if (isSpeaking) {
                // Active speaking animation
                const base = Math.sin(Date.now() / 200 + i * 0.5) * 0.3 + 0.4;
                const variation = Math.random() * 0.3;
                return Math.min(1, base + variation);
            } else {
                // Idle animation
                const base = Math.sin(Date.now() / 500 + i * 0.3) * 0.15 + 0.2;
                return Math.max(0, base);
            }
        });

        setBars(newBars);
        animationRef.current = requestAnimationFrame(animateSimulated);
    };

    return (
        <div className={`voice-visualizer ${className}`}>
            {/* Waveform Bars */}
            <div className="flex items-center justify-center gap-1 h-24">
                {bars.map((height, i) => (
                    <div
                        key={i}
                        className="relative"
                        style={{
                            width: '4px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            className={`w-full rounded-full transition-all duration-100 ${isSpeaking
                                    ? 'bg-gradient-to-t from-red-600 to-red-400'
                                    : 'bg-gradient-to-t from-gray-400 to-gray-300'
                                }`}
                            style={{
                                height: `${Math.max(4, height * 100)}%`,
                                boxShadow: isSpeaking ? '0 0 10px rgba(218, 41, 28, 0.5)' : 'none',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Status Text */}
            <div className="text-center mt-4">
                <p className="text-sm font-bold">
                    {isSpeaking ? (
                        <span className="text-red-600 animate-pulse">🎙️ Dubbachaa jira...</span>
                    ) : (
                        <span className="text-gray-500">🎧 Dhaggeeffachaa jira...</span>
                    )}
                </p>
            </div>

            {/* Circular Pulse Effect */}
            {isSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-32 rounded-full bg-red-600/10 animate-ping" />
                    <div className="absolute w-24 h-24 rounded-full bg-red-600/20 animate-pulse" />
                </div>
            )}
        </div>
    );
};

export default VoiceVisualizer;
