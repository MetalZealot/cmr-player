import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export const AudioPlayer = ({ streamUrl }: { streamUrl: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          setIsBuffering(true);
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.error("Playback failed", err);
          setIsPlaying(false);
        } finally {
          setIsBuffering(false);
        }
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
    if (isMuted) setIsMuted(false);
  };

  return (
    <div className="flex items-center gap-4 bg-zinc-950 p-2 pr-4 rounded-full border border-zinc-800/50 shadow-sm">
      <audio 
        ref={audioRef} 
        src={streamUrl} 
        preload="none"
        onPlaying={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
      />
      <button
        onClick={togglePlay}
        disabled={isBuffering}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
      >
        {isBuffering ? (
          <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" className="ml-0.5" />
        )}
      </button>
      
      <div className="hidden sm:flex items-center gap-2">
        <button onClick={toggleMute} className="text-zinc-400 hover:text-cyan-400 transition-colors">
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
    </div>
  );
};
