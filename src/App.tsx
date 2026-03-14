import React, { useState } from 'react';
import { NowPlaying } from './components/NowPlaying';
import { HistoryList } from './components/HistoryList';
import { LiveChat } from './components/LiveChat';
import { TrackRequestModal } from './components/TrackRequestModal';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { useRadioData } from './hooks/useRadioData';

export default function App() {
  const { channelData, history, isLoading, error } = useRadioData();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  return (
    <div className="h-[100dvh] bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-cyan-500/30">
      <Header 
        channelData={channelData} 
        isLoading={isLoading} 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar isOpen={isLeftSidebarOpen} onClose={() => setIsLeftSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300">
          <div className="max-w-5xl mx-auto flex flex-col">
            <NowPlaying 
              track={history[0] || null} 
              onRequestClick={() => setIsRequestModalOpen(true)} 
            />

            <div className="mt-8">
              <HistoryList history={history} />
            </div>

            {/* Mobile-only Stream Info */}
            <div className="mt-8 block lg:hidden space-y-8">
              <LiveChat />
            </div>
          </div>
        </main>

        {/* Right Side Panel */}
        <aside 
          className={`bg-zinc-900/30 border-l border-zinc-800/80 hidden lg:flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-80 lg:w-96 opacity-100' : 'w-0 opacity-0 border-l-0'
          }`}
        >
          <div className="w-80 lg:w-96 h-full flex flex-col">
            <LiveChat isSidebar={true} />
          </div>
        </aside>
      </div>

      <TrackRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </div>
  );
}
