import React, { useState, useEffect } from 'react';
import { Music, X, CheckCircle, AlertCircle, Search, Play, Disc, Send } from 'lucide-react';
import { SearchResult } from '../types';
import { API_BASE_URL } from '../utils/constants';

export const TrackRequestModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SearchResult | null>(null);
  
  const [requesterName, setRequesterName] = useState('');
  const [dedication, setDedication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedTrack(null);
      setRequesterName('');
      setDedication('');
      setToast(null);
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSelectedTrack(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/allmusic/?server=1&query=${encodeURIComponent(searchTerm)}&requestable=true&limit=10`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      
      if (data && Array.isArray(data.objects)) {
        setSearchResults(data.objects);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setToast({ type: 'error', message: 'Failed to search tracks. Please try again.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack || !requesterName.trim() || !dedication.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const url = `${API_BASE_URL}/api/playrequest/add/?server=1&allmusic=${selectedTrack.id}&person=${encodeURIComponent(requesterName)}&message=${encodeURIComponent(dedication)}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Request failed');
      
      setToast({ type: 'success', message: 'Request sent successfully!' });
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Submit error:', err);
      setToast({ type: 'error', message: 'Failed to send request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Music size={20} className="text-cyan-500" />
            Request a Song
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {toast && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {toast.type === 'success' ? <CheckCircle size={20} className="shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          )}

          {!selectedTrack ? (
            <>
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Search Library</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Artist or track name..."
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSearching || !searchTerm.trim()}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /> : 'Search'}
                  </button>
                </div>
              </form>

              {searchResults.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Results</label>
                  <div className="space-y-2">
                    {searchResults.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => setSelectedTrack(track)}
                        className="w-full text-left bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 p-3 rounded-xl transition-all group flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="text-zinc-100 font-medium truncate group-hover:text-cyan-400 transition-colors">{track.title}</p>
                          <p className="text-zinc-500 text-sm truncate">{track.author}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-colors">
                          <Play size={14} className="text-zinc-400 group-hover:text-zinc-950 ml-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {searchResults.length === 0 && searchTerm && !isSearching && (
                <div className="text-center py-8 text-zinc-500">
                  <Disc size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No tracks found matching "{searchTerm}"</p>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmitRequest} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-1">Selected Track</p>
                  <p className="text-zinc-100 font-medium">{selectedTrack.title}</p>
                  <p className="text-zinc-500 text-sm">{selectedTrack.author}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedTrack(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-100 underline underline-offset-2"
                >
                  Change
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="e.g. MetalHead99"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Dedication Message</label>
                  <textarea
                    required
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    placeholder="Play this loud!"
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-zinc-600 resize-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !requesterName.trim() || !dedication.trim()}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Send Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
