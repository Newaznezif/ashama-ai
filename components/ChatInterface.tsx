
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, Message, AppMode } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import LiveVoiceOverlay from './LiveVoiceOverlay';

const ChatInterface: React.FC<{ 
  session: ChatSession; 
  onUpdate: (messages: Message[], title?: string) => void 
}> = ({ session, onUpdate }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    const newMessages = [...session.messages, userMsg];
    onUpdate(newMessages);
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result = await getGeminiResponse(currentInput, AppMode.LANGUAGE, []);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: Date.now(),
        sources: result.sources,
        maps: result.maps
      };

      onUpdate([...newMessages, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceMessage = (role: 'user' | 'assistant', content: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now(),
      isAudio: true
    };
    onUpdate([...session.messages, msg]);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full relative">
      {showVoice && (
        <LiveVoiceOverlay 
          onClose={() => setShowVoice(false)} 
          onNewMessage={handleVoiceMessage}
        />
      )}

      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 space-y-12 custom-scrollbar">
        {session.messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center py-24">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-8">✨</div>
            <h3 className="text-2xl font-black mb-3">Ashama AI si gargaaruuf qophaa'adha.</h3>
            <p className="max-w-xs text-sm font-bold text-gray-500">Afaan Oromoon dhimmoota barbaadde hunda na gaafachuu dandeessa.</p>
          </div>
        )}
        
        {session.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`flex gap-4 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-[11px] shadow-sm ${
                msg.role === 'user' ? 'bg-black text-white' : 'bg-red-600 text-white'
              }`}>
                {msg.role === 'user' ? 'YU' : 'AS'}
              </div>
              <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-[1.25rem] p-4 md:p-6 shadow-sm border ${
                  msg.role === 'user' ? 'bg-gray-100 border-gray-100 text-gray-800' : 'bg-white border-gray-100 text-gray-900'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed font-medium text-[16px]">{msg.content}</p>
                  
                  {/* Grounding Sources (Search) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                       <p className="text-[10px] font-black uppercase text-gray-400">Odeeffannoo Dabalataa (Sources):</p>
                       <div className="flex flex-wrap gap-2">
                         {msg.sources.map((s, idx) => (
                           <a 
                             key={idx} 
                             href={s.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-[11px] font-bold text-red-600 hover:underline bg-red-50 px-2 py-1 rounded-md"
                           >
                             {s.title}
                           </a>
                         ))}
                       </div>
                    </div>
                  )}

                  {/* Grounding Sources (Maps) */}
                  {msg.maps && msg.maps.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                       <p className="text-[10px] font-black uppercase text-gray-400">Argama Bakkaa (Maps):</p>
                       <div className="flex flex-wrap gap-2">
                         {msg.maps.map((m, idx) => (
                           <a 
                             key={idx} 
                             href={m.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-[11px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1"
                           >
                             📍 {m.title}
                           </a>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
                {msg.isAudio && (
                  <div className="flex items-center gap-2 px-3 opacity-40">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">🎙️ Voice Log</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start pl-12">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-10">
        <div className="relative max-w-3xl mx-auto flex items-end gap-3 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-2.5 pl-5">
          <button 
            onClick={() => setShowVoice(true)}
            className="p-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
            title="Haasa'uuf (Voice Mode)"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v10a3 3 0 01-3 33 3 0 01-3-3V6a3 3 0 013-3z" /></svg>
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ashamaa na gaafadhu..."
            rows={1}
            className="flex-1 bg-transparent py-3.5 focus:outline-none font-medium resize-none max-h-32 text-gray-800 text-lg"
            style={{ height: 'auto' }}
          />

          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-4 bg-red-600 text-white rounded-2xl shadow-lg hover:bg-red-700 transition-all disabled:opacity-20 active:scale-95"
          >
            <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
          </button>
        </div>
        
        <p className="text-center text-[10px] text-gray-400 mt-8 font-bold uppercase tracking-widest opacity-60">
          Software Engineer: <span className="text-black">Newaz Nezif</span> &bull; Saqqaa Coqorsaa &bull; Jimma AI Lab
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
