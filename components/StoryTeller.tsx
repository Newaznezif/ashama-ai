
import React, { useState } from 'react';
import { generateStoryConversation, decodeAudio, decodeAudioToBuffer } from '../services/geminiService';

const StoryTeller: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [topic, setTopic] = useState('Seenaa Gadaa');
  const [error, setError] = useState<string | null>(null);

  const playStory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { audio } = await generateStoryConversation(topic);
      if (audio) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await decodeAudioToBuffer(decodeAudio(audio), ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        setPlaying(true);
        source.onended = () => setPlaying(false);
        source.start();
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || "Dogoggorri uumameera.";
      setError(errorMsg.includes("non-audio") ? "Model-ichi sagalee uumuu hin dandeenye. Maaloo mata-duree biraa yaali." : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl p-10 border border-gray-100">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black tracking-tighter mb-4 underline decoration-red-600 decoration-8 underline-offset-8">ODUU DURII</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Multi-Speaker AI Theater</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="flex items-center gap-16">
          <div className={`text-center transition-all duration-500 ${playing ? 'scale-110' : 'opacity-40'}`}>
            <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center text-5xl mb-4 shadow-xl border-4 border-white">👴</div>
            <p className="font-black text-sm">Jaalalaa</p>
          </div>
          <div className="flex gap-1 h-16 items-center">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 bg-red-600 rounded-full transition-all duration-300 ${playing ? 'animate-bounce' : 'h-2 opacity-10'}`}
                style={{ animationDelay: `${i * 0.1}s`, height: playing ? `${20 + Math.random() * 40}px` : '8px' }}
              />
            ))}
          </div>
          <div className={`text-center transition-all duration-500 ${playing ? 'scale-110' : 'opacity-40'}`}>
            <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center text-5xl mb-4 shadow-xl border-4 border-white">👦</div>
            <p className="font-black text-sm">Boonaa</p>
          </div>
        </div>

        {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold text-center text-sm mb-4">
                {error}
            </div>
        )}

        <div className="w-full max-w-md">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Mata-duree Marii</label>
          <select 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-red-600 font-bold text-lg mb-8"
          >
            <option>Seenaa Gadaa</option>
            <option>Kunuunsa Naannoo</option>
            <option>Kabaja Maanguddoo</option>
            <option>Barnoota fi Guddina</option>
          </select>

          <button
            onClick={playStory}
            disabled={loading || playing}
            className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'QOPHEESSAA JIRA...' : playing ? 'DHAGGEEFADHU...' : 'MARII JALQABI'}
          </button>
        </div>
      </div>
      
      <div className="mt-10 p-4 bg-gray-50 rounded-2xl text-center">
         <p className="text-xs text-gray-500 italic">"Jaalalaa fi Boonaan waa'ee seenaa fi aadaa siif dhiyeessu."</p>
      </div>
    </div>
  );
};

export default StoryTeller;
