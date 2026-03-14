import { useState, useEffect } from 'react';
import { ChannelData, HistoryItem } from '../types';
import { API_BASE_URL } from '../utils/constants';

export const useRadioData = () => {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v2/channels/?server=1`);
        if (!response.ok) throw new Error('Failed to fetch channel data');
        const data = await response.json();
        
        let channelObj = null;
        if (Array.isArray(data) && data.length > 0) {
          channelObj = data[0];
        } else if (data && Array.isArray(data.results) && data.results.length > 0) {
          channelObj = data.results[0];
        } else if (data && Array.isArray(data.objects) && data.objects.length > 0) {
          channelObj = data.objects[0];
        } else if (data && !Array.isArray(data) && data.secure_stream_url) {
          channelObj = data;
        }

        if (channelObj) {
          setChannelData(channelObj);
          setError(null);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching channel data:', err);
        setError('Failed to load stream data.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v2/history/?server=1&limit=15`);
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setHistory(data);
        } else if (data && Array.isArray(data.results)) {
          setHistory(data.results);
        } else if (data && Array.isArray(data.objects)) {
          setHistory(data.objects);
        } else {
          console.error('Unrecognized history format:', data);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };

    fetchChannelData();
    fetchHistory();
    
    const channelInterval = setInterval(fetchChannelData, 10000);
    const historyInterval = setInterval(fetchHistory, 10000);

    return () => {
      clearInterval(channelInterval);
      clearInterval(historyInterval);
    };
  }, []);

  return { channelData, history, isLoading, error };
};
