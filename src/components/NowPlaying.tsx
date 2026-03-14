import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Disc, MessageSquare, Activity, Music } from 'lucide-react';
import { HistoryItem } from '../types';
import { formatTime } from '../utils/formatters';
import { API_BASE_URL } from '../utils/constants';

export const NowPlaying = ({ track, onRequestClick }: { track: HistoryItem | null, onRequestClick?: () => void }) => {
  const [progress, setProgress] = useState({ elapsed: 0, percentage: 0 });
  const [imgError, setImgError] = useState(false);
  const [voteStatus, setVoteStatus] = useState<'none' | 'up' | 'down'>('none');
  const [voteCounts, setVoteCounts] = useState<{ up: number, down: number } | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteMsg, setVoteMsg] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

  const getPlaylistBadgeColor = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('hits')) return '#ff3b30';
    if (t.includes('classics')) return '#ff9500';
    if (t.includes('live')) return '#34c759';
    if (t.includes('featured')) return '#0a84ff';
    if (t.includes('new')) return '#ffee58';
    if (t.includes('countdown')) return '#9b59b6';
    if (t.includes('surge')) return '#07d1ea';
    if (t.includes('oldies')) return '#cd7f32';
    if (t.includes('halloween')) return '#000000';
    if (t.includes('xmas') || t.includes('christmas')) return '#ffffff';
    return '#07d1ea'; // Default to cyan
  };

  const renderComment = (comment: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = comment.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const el = textRef.current;
        const hasPadding = el.classList.contains('pr-12');
        
        // Temporarily remove padding to get natural text width
        if (hasPadding) el.classList.remove('pr-12');
        
        const textWidth = el.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        
        setIsTitleOverflowing(textWidth > containerWidth);
        
        // Restore padding if it was there
        if (hasPadding) el.classList.add('pr-12');
      }
    };

    checkOverflow();
    // Add a small delay for initial render to ensure fonts are loaded and layout is complete
    const timeoutId = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [track?.title]);

  useEffect(() => {
    setImgError(false);
    setVoteStatus('none');
    setVoteCounts(null);
    setVoteMsg(null);
  }, [track?.id]);

  useEffect(() => {
    if (!track) return;

    const updateProgress = () => {
      const now = Date.now();
      const ts = track.ts || now;
      const length = track.length || 1; // Prevent division by zero
      const elapsed = Math.max(0, now - ts);
      const percentage = Math.min(100, (elapsed / length) * 100);
      setProgress({ elapsed, percentage });
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [track]);

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!track || !track.all_music_id || isVoting) return;
    
    setIsVoting(true);
    setVoteMsg(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/v2/music/${track.all_music_id}/${type}/`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const data = await res.json();
          if (data.result === 'already_voted') {
            setVoteMsg({ text: 'You have already voted for this track.', type: 'error' });
            return;
          }
        }
        throw new Error('Vote failed');
      }
      
      const data = await res.json();
      setVoteCounts({ up: data.up, down: data.down });
      setVoteStatus(type === 'like' ? 'up' : 'down');
      setVoteMsg({ text: 'Vote recorded!', type: 'success' });
      
      setTimeout(() => setVoteMsg(null), 3000);
    } catch (err) {
      console.error('Voting error:', err);
      setVoteMsg({ text: 'Failed to record vote.', type: 'error' });
    } finally {
      setIsVoting(false);
    }
  };

  if (!track) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-pulse h-64">
        <div className="w-16 h-16 bg-zinc-800 rounded-full mb-4"></div>
        <div className="h-6 w-48 bg-zinc-800 rounded mb-2"></div>
        <div className="h-4 w-32 bg-zinc-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Now Playing Card */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 flex flex-col shadow-lg relative overflow-hidden shrink-0">
        {track.img_large_url && !imgError && (
          <div 
            className="absolute inset-0 opacity-10 blur-3xl scale-150 pointer-events-none"
            style={{ backgroundImage: `url(${track.img_large_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        
        {/* Header Row Inside Card */}
        <div className="relative z-10 flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-cyan-500" />
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Radio Player</h2>
          </div>
          
          {onRequestClick && (
            <button 
              onClick={onRequestClick}
              className="hidden sm:flex bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-2 px-4 rounded-lg items-center gap-2 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)] text-sm"
            >
              <Music size={16} />
              Request Song
            </button>
          )}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-4 sm:gap-6 items-center">
          <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-2xl mx-auto md:mx-0">
            {track.img_large_url && !imgError ? (
              <img 
                src={track.img_large_url} 
                alt={`${track.title} cover`} 
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <Disc size={64} className="text-zinc-700 md:w-24 md:h-24" />
            )}
          </div>

        <div className="relative z-10 flex-1 w-full min-w-0 flex flex-col justify-center text-center md:text-left">
          <div className="mb-2">
            {track.playlist_title && track.playlist_title.trim() !== '' && (
              <div className="flex justify-center md:justify-start mb-3">
                <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase text-zinc-300">
                  <span 
                    className="w-2 h-2 rounded-full shadow-sm" 
                    style={{ backgroundColor: getPlaylistBadgeColor(track.playlist_title) }}
                  />
                  {track.playlist_title}
                </span>
              </div>
            )}

            {voteMsg && (
              <div className={`text-xs font-medium mb-2 ${voteMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {voteMsg.text}
              </div>
            )}

            <div className="w-full min-w-0 overflow-hidden relative group">
              <h2 
                ref={containerRef}
                className={`text-2xl md:text-3xl font-black text-zinc-100 tracking-tight leading-tight mb-1 block w-full overflow-hidden whitespace-nowrap ${isTitleOverflowing ? 'text-left' : 'text-center md:text-left'}`}
              >
                <span 
                  className={`inline-block ${isTitleOverflowing ? 'animate-marquee group-hover:[animation-play-state:paused]' : ''}`}
                >
                  <span ref={textRef} className={isTitleOverflowing ? "pr-12" : ""}>{track.title}</span>
                  {isTitleOverflowing && <span className="pr-12">{track.title}</span>}
                </span>
              </h2>
            </div>
            <p className="text-lg md:text-xl text-zinc-400 font-medium line-clamp-1">
              {track.author}
            </p>

            {track.comment && track.comment.trim() !== '' && (
              <div className="mt-3 flex items-start gap-2 text-sm text-zinc-300 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/50">
                <MessageSquare size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                <div className="leading-snug text-left">
                  {renderComment(track.comment)}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center md:justify-start mt-2 mb-4">
            {/* Voting Widget */}
            <div className="inline-flex items-center justify-center gap-4 sm:gap-3 bg-zinc-950/50 px-4 sm:px-3 py-1.5 rounded-full border border-zinc-800/50">
              <button 
                onClick={() => handleVote('like')}
                disabled={isVoting}
                className={`flex items-center gap-1.5 transition-colors ${voteStatus === 'up' ? 'text-cyan-400' : 'text-zinc-400 hover:text-cyan-400'} disabled:opacity-50 p-1 sm:p-0`}
                title="Like"
              >
                <ThumbsUp className={`w-5 h-5 sm:w-4 sm:h-4 ${voteStatus === 'up' ? 'fill-cyan-400/20' : ''}`} />
                {voteCounts && voteStatus === 'up' && <span className="text-xs font-bold">{voteCounts.up}</span>}
              </button>
              <div className="w-px h-5 sm:h-4 bg-zinc-800"></div>
              <button 
                onClick={() => handleVote('dislike')}
                disabled={isVoting}
                className={`flex items-center gap-1.5 transition-colors ${voteStatus === 'down' ? 'text-red-400' : 'text-zinc-400 hover:text-red-400'} disabled:opacity-50 p-1 sm:p-0`}
                title="Dislike"
              >
                <ThumbsDown className={`w-5 h-5 sm:w-4 sm:h-4 ${voteStatus === 'down' ? 'fill-red-400/20' : ''}`} />
                {voteCounts && voteStatus === 'down' && <span className="text-xs font-bold">{voteCounts.down}</span>}
              </button>
            </div>
          </div>

          <div className="mt-2">
            <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
              <div 
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-linear"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs font-mono text-zinc-500">
              <span>{formatTime(progress.elapsed)}</span>
              <span>{formatTime(track.length)}</span>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile Request Button */}
      {onRequestClick && (
        <div className="mt-6 flex sm:hidden justify-center">
          <button 
            onClick={onRequestClick}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Music size={20} />
            Request a Song
          </button>
        </div>
      )}
    </div>
  );
};
