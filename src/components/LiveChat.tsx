import React from 'react';
import { MessageSquare } from 'lucide-react';

export const LiveChat = ({ isSidebar = false }: { isSidebar?: boolean }) => {
  return (
    <div className={`bg-zinc-900 flex flex-col ${isSidebar ? 'h-full w-full' : 'border border-zinc-800 rounded-xl'}`}>
      <div className={`bg-zinc-950 p-3 flex items-center gap-2 border-b border-zinc-800/80 shrink-0 ${isSidebar ? '' : 'rounded-t-xl'}`}>
        <MessageSquare size={16} className="text-cyan-500" />
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Cyber Metal Radio Chat</h2>
      </div>
      <iframe 
        src="https://e.widgetbot.io/channels/1306344081454272513/1404678037890666527" 
        title="Cyber Metal Radio Chat" 
        className={`w-full flex-1 border-none ${isSidebar ? 'h-full' : 'min-h-[500px] rounded-b-xl'}`}
      ></iframe>
    </div>
  );
};
