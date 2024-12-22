import { YOUTUBE_API_KEY } from '../config';
import axios from 'axios';

export async function getVideos(query, method = '', maxResults = 12) {
  try {
    // const searchQuery = method ? `${query} ${method}` : query;
    const language = 'Hindi';
    const searchQuery = `${language}" following topics: ${query}`
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        maxResults: maxResults,
        type: 'video',        // Only fetch videos (not playlists) to use duration filter
        videoDuration: 'long', // Only long videos (> 20 minutes)
        order: 'relevance',
        key: YOUTUBE_API_KEY,
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    // Get video IDs for fetching duration information
    const videoIds = response.data.items.map(item => item.id.videoId).join(',');

    // Fetch additional video details including duration
    const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails,statistics',
        id: videoIds,
        key: YOUTUBE_API_KEY,
      }
    });

    // Create a map of video details
    const videoDetails = new Map(
      videoDetailsResponse.data.items.map(item => [
        item.id,
        {
          duration: item.contentDetails.duration,
          viewCount: item.statistics.viewCount
        }
      ])
    );

    const videos = response.data.items
      .map(item => {
        const details = videoDetails.get(item.id.videoId) || {};
        return {
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          type: 'video',
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle,
          duration: details.duration, // ISO 8601 duration format
          viewCount: details.viewCount
        };
      })
      .filter(video => {
        // Parse duration to ensure it's actually a long video
        const duration = parseDuration(video.duration);
        return duration >= 1200; // Filter videos longer than 20 minutes (1200 seconds)
      });

    return videos;

  } catch (error) {
    console.error("Error while fetching videos:", error);
    if (error.response) {
      console.error("API Error Response:", error.response.data);
    }
    return [];
  }
}

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration) {
  if (!duration) return 0;
  
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = (match[1] || '').replace('H', '') || 0;
  const minutes = (match[2] || '').replace('M', '') || 0;
  const seconds = (match[3] || '').replace('S', '') || 0;
  
  return (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds);
}

// Helper function to get video details
async function getVideoDetails(videoId) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY
      }
    });

    const video = response.data.items[0];
    return {
      duration: video.contentDetails.duration, // Returns in ISO 8601 format
      viewCount: video.statistics.viewCount
    };
  } catch (error) {
    console.error("Error fetching video details:", error);
    return { duration: null, viewCount: null };
  }
}

// Helper function to get playlist details
async function getPlaylistDetails(playlistId) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
      params: {
        part: 'contentDetails',
        id: playlistId,
        key: YOUTUBE_API_KEY
      }
    });

    const playlist = response.data.items[0];
    return {
      videoCount: playlist.contentDetails.itemCount,
      totalDuration: null // You can calculate this by fetching all videos if needed
    };
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    return { videoCount: null, totalDuration: null };
  }
} 