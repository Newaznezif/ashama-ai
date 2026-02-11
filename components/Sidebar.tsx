
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession
}) => {
  return (
    <aside className="w-72 bg-[#171717] h-full flex flex-col text-white">
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full py-3 px-4 rounded-xl border border-white/20 hover:bg-white/10 transition-all flex items-center gap-3 font-bold text-sm mb-6"
        >
          <span className="text-xl">+</span> Haaraa Jalqabi
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Seenaa Marii (History)</p>
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group relative w-full text-left px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
              activeSessionId === session.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-xs opacity-50">💬</span>
              <span className="truncate text-sm font-medium">{session.title || 'Marii Haaraa'}</span>
            </div>
            <button 
              onClick={(e) => onDeleteSession(session.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-lg">NN</div>
           <div className="leading-none">
              <p className="text-[10px] font-black uppercase text-gray-500">Ashama AI</p>
              <p className="text-xs font-black text-gray-300">Newaz Nezif</p>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
