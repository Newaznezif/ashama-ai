
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { SYSTEM_INSTRUCTIONS } from '../constants';

interface LiveVoiceOverlayProps {
  onClose: () => void;
  onNewMessage: (role: 'user' | 'assistant', content: string) => void;
}

const LiveVoiceOverlay: React.FC<LiveVoiceOverlayProps> = ({ onClose, onNewMessage }) => {
  const [status, setStatus] = useState('Gariirsaa jira...');
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const transcriptBuffer = useRef({ user: '', assistant: '' });

  useEffect(() => {
    startLiveSession();
    return () => stopLiveSession();
  }, []);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startLiveSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

      let stream;
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Browser kee mic hin deeggaru.");
        }
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        console.error("Mic Error:", err);
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.message?.includes('device not found')) {
          setErrorMessage("Mic-ni (microphoniin) hin argamne. Maaloo mic kee check godhi.");
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage("Eeyyama mic dhorkatteetta. Maaloo settings keessatti eeyyami.");
        } else {
          setErrorMessage(`Dogoggora mic: ${err.message || "Hin argamne"}`);
        }
        return;
      }

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputCtx = audioContextRef.current;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus("Haasa'aa Jiru");
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              let sum = 0;
              for (let i = 0; i < input.length; i++) {
                int16[i] = input[i] * 32768;
                sum += Math.abs(input[i]);
              }
              setIsUserTalking(sum > 1.2);

              sessionPromise.then(s => s.sendRealtimeInput({
                media: {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000'
                }
              }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.turnComplete) {
              setIsAiTalking(false);
              if (transcriptBuffer.current.assistant) {
                onNewMessage('assistant', transcriptBuffer.current.assistant);
                transcriptBuffer.current.assistant = '';
              }
              if (transcriptBuffer.current.user) {
                onNewMessage('user', transcriptBuffer.current.user);
                transcriptBuffer.current.user = '';
              }
            }

            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.text) {
                  transcriptBuffer.current.assistant += part.text;
                }

                if (part.inlineData?.data) {
                  setIsAiTalking(true);
                  const audioData = decode(part.inlineData.data);
                  const buffer = await decodeAudioData(audioData, audioContextRef.current!);

                  // CRITICAL FIX: Stop all previous audio sources to prevent echo/duplicate playback
                  sourcesRef.current.forEach(source => {
                    try {
                      source.stop();
                      source.disconnect();
                    } catch (e) {
                      // Source might already be stopped
                    }
                  });
                  sourcesRef.current.clear();

                  // Create and play new audio source
                  const source = audioContextRef.current!.createBufferSource();
                  source.buffer = buffer;
                  source.connect(audioContextRef.current!.destination);

                  const startTime = Math.max(audioContextRef.current!.currentTime, nextStartTimeRef.current);
                  source.start(startTime);
                  nextStartTimeRef.current = startTime + buffer.duration;

                  // Track this source
                  sourcesRef.current.add(source);

                  // Clean up when done
                  source.onended = () => {
                    sourcesRef.current.delete(source);
                    source.disconnect();
                    if (sourcesRef.current.size === 0) {
                      setIsAiTalking(false);
                    }
                  };
                }
              }
            }

            if (msg.serverContent?.inputTranscription) {
              transcriptBuffer.current.user += msg.serverContent.inputTranscription.text;
            }
            if (msg.serverContent?.outputTranscription) {
              transcriptBuffer.current.assistant += msg.serverContent.outputTranscription.text;
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiTalking(false);
            }
          },
          onclose: () => onClose(),
          onerror: (e) => {
            console.error(e);
            setErrorMessage("Walitti bu'iinsi uumameera. Maaloo irra deebi'ii yaali.");
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTIONS.LIVE,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e: any) {
      console.error(e);
      setErrorMessage("Dogoggora: " + e.message);
    }
  };

  const stopLiveSession = () => {
    sessionRef.current?.close();
    if (audioContextRef.current) audioContextRef.current.close();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-between p-10 animate-in fade-in duration-700">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${errorMessage ? 'bg-orange-500' : 'bg-red-600'}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${errorMessage ? 'text-orange-500' : 'text-red-600'}`}>
            {errorMessage ? 'Dogoggora' : 'Live Voice Session'}
          </span>
        </div>
        <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-20 w-full">
        {errorMessage ? (
          <div className="text-center space-y-8 animate-in zoom-in-95">
            <div className="text-8xl mb-4">🔇</div>
            <h2 className="text-2xl font-black text-white max-w-sm">{errorMessage}</h2>
            <button onClick={() => { setErrorMessage(null); startLiveSession(); }} className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black">Irra Deebi'ii Yaali</button>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className={`absolute inset-0 rounded-full bg-red-600/30 blur-[100px] transition-all duration-700 ${isAiTalking ? 'scale-150 opacity-100' : 'scale-75 opacity-20'}`}></div>
              <div className={`absolute inset-0 rounded-full bg-red-500/20 blur-[60px] transition-all duration-300 ${isUserTalking ? 'scale-110 opacity-80' : 'scale-50 opacity-0'}`}></div>

              <div className={`w-64 h-64 rounded-full border-2 border-white/5 flex items-center justify-center relative transition-all duration-500 ${isUserTalking ? 'border-red-600/40 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : ''}`}>
                <div className="flex gap-2 items-center h-24">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 bg-red-600 rounded-full transition-all duration-150 ${isAiTalking || isUserTalking ? 'animate-waveform' : 'h-3 opacity-20'}`}
                      style={{
                        animationDelay: `${i * 0.08}s`,
                        height: isAiTalking ? `${40 + Math.random() * 60}%` : isUserTalking ? `${25 + Math.random() * 40}%` : '12px'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-4xl font-black text-white tracking-tighter italic min-h-[48px]">
                {isAiTalking ? 'Ashamaa Dubbachaa Jira...' : isUserTalking ? 'Si Dhaggeeffachaa Jira...' : status}
              </h2>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest animate-pulse">
                Afaan Oromoon gaaffii kee gaafadhu
              </p>
            </div>
          </>
        )}
      </div>

      <div className="w-full max-w-2xl text-center space-y-6">
        <div className="h-[1px] bg-white/5 w-full"></div>
        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.4em]">
          Jimma AI Lab &bull; Newaz Nezif &bull; Real-time AI Audio
        </p>
      </div>

      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(1); opacity: 0.8; }
          50% { transform: scaleY(2.2); opacity: 1; }
        }
        .animate-waveform {
          animation: waveform 0.7s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LiveVoiceOverlay;
