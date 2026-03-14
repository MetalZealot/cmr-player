import React from 'react';
import { Radio, MessageSquare, Menu } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { ChannelData } from '../types';

interface HeaderProps {
  channelData: ChannelData | null;
  isLoading: boolean;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  onToggleSidebar?: () => void;
}

export const Header = ({ channelData, isLoading, isSidebarOpen, toggleSidebar, onToggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800/80 p-2 sm:p-3 flex items-center justify-between gap-4 shrink-0 z-10 relative">
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800/50 rounded-lg transition-colors"
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="p-1.5 sm:p-2 bg-zinc-950 rounded-lg text-cyan-500 border border-zinc-800/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
          <Radio size={18} className="sm:w-5 sm:h-5" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tighter text-zinc-100 uppercase leading-none mb-0.5">
            CYBER <span className="text-cyan-500">METAL</span> RADIO
          </h1>
          <p className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">WEB PLAYER APP v1</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-950 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-zinc-800/50">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono font-medium text-zinc-300 flex items-center gap-1 sm:gap-1.5">
            {isLoading && !channelData ? (
              <span className="animate-pulse bg-zinc-800 h-3 w-4 sm:w-6 rounded inline-block"></span>
            ) : (
              <span className="text-zinc-100">{channelData?.listeners_current ?? 0}</span>
            )}
            <span className="hidden sm:inline-block text-zinc-500 uppercase text-[9px] tracking-wider">Listeners</span>
          </span>
        </div>

        {/* Audio Player */}
        <div className="pr-2">
          {channelData?.secure_stream_url ? (
            <AudioPlayer streamUrl={channelData.secure_stream_url} />
          ) : (
            <div className="h-[36px] w-[100px] sm:h-[48px] sm:w-[200px] bg-zinc-900 animate-pulse rounded-full border border-zinc-800/50"></div>
          )}
        </div>

        {/* Sidebar Toggle (Desktop Only) */}
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center justify-center p-2 rounded-lg border transition-colors ${
              isSidebarOpen 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-800/50 hover:text-zinc-100'
            }`}
            title={isSidebarOpen ? "Hide Chat" : "Show Chat"}
          >
            <MessageSquare size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
