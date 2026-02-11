
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ThemeSwitcher from './components/ThemeSwitcher';
import NotificationContainer from './components/NotificationContainer';
import { ChatSession } from './types';
import { useGestures } from './services/gestureService';
import { themeService } from './services/themeService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Setup gesture controls for mobile
  useGestures(appRef, {
    onSwipeRight: () => setIsSidebarOpen(true),
    onSwipeLeft: () => setIsSidebarOpen(false),
  });

  // Initialize theme service
  useEffect(() => {
    themeService.initialize();
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ashama_ai_v3_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    } else {
      handleNewChat();
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('ashama_ai_v3_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Marii Haaraa',
      messages: [],
      lastTimestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleUpdateSession = (sessionId: string, messages: any[], newTitle?: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Auto-generate title from first message if not set
        const title = newTitle || (s.title === 'Marii Haaraa' && messages.length > 0
          ? messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : '')
          : s.title);

        return {
          ...s,
          messages,
          lastTimestamp: Date.now(),
          title
        };
      }
      return s;
    }).sort((a, b) => b.lastTimestamp - a.lastTimestamp));
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <div ref={appRef} className="flex h-screen bg-[#FDFDFD] overflow-hidden text-gray-900 font-sans">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}>
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => { setActiveSessionId(id); setIsSidebarOpen(false); }}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-black text-sm shadow-lg">
                A
              </div>
              <div className="leading-none">
                <h1 className="text-lg font-black">ASHAMA AI</h1>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gargaaraa AI Afaan Oromoo</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Developer</p>
              <p className="text-xs font-black">Newaz Nezif</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {activeSession ? (
            <ChatInterface
              session={activeSession}
              onUpdateSession={(messages) => handleUpdateSession(activeSession.id, messages)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-black text-4xl shadow-2xl mb-6">
                A
              </div>
              <h2 className="text-3xl font-black mb-2">Baga Nagaan Dhuftan!</h2>
              <p className="text-gray-500 mb-8 max-w-xs">Marii haaraa jalqabuuf gubbaa cuqaasi ykn bitaa irraa filadhu.</p>
              <button onClick={handleNewChat} className="px-10 py-4 bg-black text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all">Marii Jalqabi</button>
            </div>
          )}
        </main>
      </div>

      {/* Notification Container */}
      <NotificationContainer />
    </div>
  );
};

export default App;
