import { YOUTUBE_API_KEY, YOUTUBE_SEARCH_URL } from '../config';
import axios from 'axios';

export async function getVideos(query, method, maxResults) {
  try {
     // https://www.googleapis.com/youtube/v3/search?part=snippet&q=programming&maxResults=10&type=video&order=viewCount&key=YOUR_API_KEY
     const response = await axios.get(YOUTUBE_SEARCH_URL,
      {
        params: {
          part: 'snippet',
          q: query + method,
          maxResults: 10,
          type: 'video',
          order: 'viewCount',
          key: YOUTUBE_API_KEY, 
        }
      });
    const videos = response.data.items.map((video) => {
      return {
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails.high.url
      };
    });
    return videos;
  } catch (error) {
    console.error("Error while fetching videos", error);
    return [];
  }
} 