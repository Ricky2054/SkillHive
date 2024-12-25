import React, { useState, useEffect } from 'react';
import { getVideos } from '../api/getVideos';
import VideoModal from './VideoModal';

function VideoCard({ topics }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const searchVideos = async () => {
      if (!topics || topics.trim() === '') {
        setVideos([]);
        return;
      }

      setLoading(true);
      try {
        const results = await getVideos(topics);
        setVideos(results);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    searchVideos();
  }, [topics]);

  const handleVideoClick = (e, video) => {
    e.preventDefault();
    if (video && video.url) {
      setSelectedVideo(video.url);
    }
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 font-semibold pt-10">Loading videos...</div>;
  }

  if (!topics || topics.trim() === '') {
    return <div className="text-center text-xl text-gray-600 font-semibold pt-10">Enter a topic to search for videos</div>;
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center text-xl text-gray-600 font-semibold pt-10">
        No videos found for "{topics}". Try a different search term.
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8 px-4 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-max w-full">
        {videos.map((video, index) => (
          <div key={`${video.url}-${index}`} className="max-w-sm bg-white rounded-lg overflow-hidden shadow-lg">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-48 object-cover cursor-pointer"
              onClick={(e) => handleVideoClick(e, video)}
            />
            <div className="px-6 py-4">
              <div className="font-bold text-lg text-gray-800 mb-2">{video.title}</div>
              <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
              <button
                onClick={(e) => handleVideoClick(e, video)}
                className="inline-block mt-4 text-blue-600 font-semibold hover:text-blue-700"
              >
                {video.type === 'playlist' ? 'Play Playlist' : 'Watch Video'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <VideoModal
          videoUrl={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

export default VideoCard; 