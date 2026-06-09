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
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Live stream: detaching the source stops background buffering and
      // guarantees the next play rejoins the live edge instead of resuming
      // stale buffered audio.
      audio.pause();
      audio.removeAttribute('src');
      // load() discards queued media events, including the pause event from the
      // line above — so isPlaying must be set explicitly here, not via onPause.
      audio.load();
      setIsPlaying(false);
      setIsBuffering(false);
    } else {
      try {
        setIsBuffering(true);
        audio.src = streamUrl;
        audio.load();
        await audio.play();
      } catch (err) {
        console.error("Playback failed", err);
        setIsBuffering(false);
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
      {/* src is managed imperatively in togglePlay so pause can fully detach the stream */}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onPlaying={() => setIsBuffering(false)}
        onWaiting={() => setIsBuffering(true)}
        onError={() => {
          // Fires when the stream drops; ignore the abort caused by detaching src on pause
          if (audioRef.current?.getAttribute('src')) {
            setIsPlaying(false);
            setIsBuffering(false);
          }
        }}
      />
      <button
        onClick={togglePlay}
        title={isPlaying ? "Stop" : "Play"}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
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
