export interface ChannelData {
  secure_stream_url: string;
  listeners_current: number;
}

export interface HistoryItem {
  id: number;
  ts: number;
  author: string;
  title: string;
  length: number;
  img_large_url: string | null;
  img_medium_url: string | null;
  all_music_id: number;
  playlist_title?: string;
  comment?: string | null;
}

export interface SearchResult {
  id: number;
  author: string;
  title: string;
}
