import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Disc } from 'lucide-react';
import { HistoryItem } from '../types';

export const HistoryList = ({ history }: { history: HistoryItem[] }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const recentTracks = history.slice(1, 15);

  return (
    <div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 hover:text-zinc-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock size={16} />
          Recent History
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isExpanded && (
        <div className="space-y-3">
          {recentTracks.map((track) => {
            const date = new Date(track.ts);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={track.id} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {track.img_medium_url ? (
                    <img 
                      src={track.img_medium_url} 
                      alt={track.title} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Disc size={16} className="text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm font-medium truncate">{track.title}</p>
                  <p className="text-zinc-500 text-xs truncate">{track.author}</p>
                </div>
                <div className="text-zinc-600 text-xs font-mono shrink-0">
                  {timeString}
                </div>
              </div>
            );
          })}
          {recentTracks.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-4">No recent history available.</p>
          )}
        </div>
      )}
    </div>
  );
};
