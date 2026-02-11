
import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';

const VideoGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setError(null);

    // Initial key check as per prompt rules for Veo models
    if (!(window as any).aistudio?.hasSelectedApiKey || !(await (window as any).aistudio.hasSelectedApiKey())) {
        if ((window as any).aistudio?.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    setLoading(true);
    setVideoUrl(null);
    try {
      const url = await generateVideo(prompt, setProgressMsg);
      setVideoUrl(url);
    } catch (e: any) {
      console.error("Video Gen Exception:", e);
      const errorMsg = e.message || JSON.stringify(e);
      
      // FIX: Rule-based handling for "Requested entity was not found" error
      if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("404")) {
        setError("ENTITY NOT FOUND: Maaloo API Key kaffaltii qabu (Paid Billing Project) filadhu. Veo model itti fayyadamuuf billing dirqama.");
        if ((window as any).aistudio?.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
        }
      } else if (errorMsg.includes("403") || errorMsg.includes("permission")) {
        setError("PERMISSION DENIED: Project kaffaltii qabu filachuu kee mirkaneessi.");
        if ((window as any).aistudio?.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
        }
      } else {
        setError(`Dogoggora: ${errorMsg.substring(0, 100)}...`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-white">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-2xl">🎬</div>
        <div>
          <h2 className="text-3xl font-black tracking-tighter">VIIDIYOO SEENAA</h2>
          <p className="text-xs font-black text-red-500 uppercase tracking-widest">Veo 3.1 AI Lab</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative bg-black/40 rounded-[2rem] border-2 border-white/5 overflow-hidden">
        {loading ? (
          <div className="text-center p-12">
            <div className="w-24 h-24 border-t-4 border-red-600 border-solid rounded-full animate-spin mx-auto mb-8"></div>
            <h3 className="text-2xl font-black mb-2 animate-pulse">{progressMsg}</h3>
            <p className="text-gray-500 text-sm">Viidiyoon hojjetamuuf daqiiqaa 1-2 fudhachuu danda'a.</p>
          </div>
        ) : videoUrl ? (
          <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
        ) : error ? (
          <div className="text-center p-12 max-w-lg">
            <div className="text-6xl mb-6">⚠️</div>
            <p className="text-red-500 font-bold mb-6 text-lg leading-relaxed">{error}</p>
            <div className="flex flex-col gap-3">
                <button 
                  onClick={handleGenerate}
                  className="px-8 py-4 bg-white text-black rounded-xl font-black hover:bg-gray-200 transition-all shadow-xl"
                >
                  IRRA DEEBI'II YAALI
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-gray-400 underline font-bold">Billing Documentation Ilaali</a>
            </div>
          </div>
        ) : (
          <div className="text-center opacity-30 p-12">
            <div className="text-8xl mb-6">📽️</div>
            <p className="text-xl font-bold">Waan viidiyoon arguun barbaaddu barreessi.</p>
            <p className="text-xs mt-4">Fkn: "Sirna Gadaa Jimma keessatti", "Abbaa Gadaa dubbachaa jiru"...</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Barreessi..."
          className="flex-1 bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-red-600 font-bold text-lg transition-all"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="px-10 py-5 bg-red-600 hover:bg-red-700 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl disabled:opacity-50"
        >
          {loading ? 'HOJJETAMAA...' : 'VIIDIYOO UUMI'}
        </button>
      </div>
      
      <p className="mt-4 text-[10px] text-gray-500 text-center font-bold uppercase tracking-widest">
        Hubachiisa: Viidiyoo uumuuf project billing qabu qofatu hojjeta.
      </p>
    </div>
  );
};

export default VideoGen;
