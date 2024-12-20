import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { YOUTUBE_API_KEY } from '../config';

function VideoModal({ videoUrl, onClose }) {
  const [playlistItems, setPlaylistItems] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [loading, setLoading] = useState(true);

  const isPlaylist = videoUrl.includes('list=');
  const playlistId = isPlaylist ? videoUrl.split('list=')[1].split('&')[0] : null;
  const initialVideoId = !isPlaylist ? videoUrl.split('v=')[1].split('&')[0] : '';

  useEffect(() => {
    if (isPlaylist) {
      fetchPlaylistItems();
    } else {
      setCurrentVideoId(initialVideoId);
      setLoading(false);
    }
  }, [videoUrl]);

  const fetchPlaylistItems = async () => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet',
          maxResults: 50,
          playlistId: playlistId,
          key: YOUTUBE_API_KEY
        }
      });

      const items = response.data.items.map(item => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
      }));

      setPlaylistItems(items);
      setCurrentVideoId(items[0]?.id || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg w-full max-w-6xl h-[80vh] flex">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row w-full h-full">
          <div className="flex-grow h-full md:w-3/4">
            <div className="relative w-full h-full">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-l-lg"
                src={`https://www.youtube.com/embed/${currentVideoId}${isPlaylist ? '?playlist=' + playlistId : ''}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {isPlaylist && playlistItems.length > 0 && (
            <div className="md:w-1/4 h-full bg-gray-50 rounded-r-lg overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Playlist Videos</h3>
                  <div className="space-y-4">
                    {playlistItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-start space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
                          currentVideoId === item.id ? 'bg-gray-200' : ''
                        }`}
                        onClick={() => setCurrentVideoId(item.id)}
                      >
                        <img src={item.thumbnail} alt="" className="w-20 h-auto rounded" />
                        <p className="text-sm text-gray-800 line-clamp-2">{item.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoModal; 