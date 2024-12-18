import { YOUTUBE_API_KEY, YOUTUBE_SEARCH_URL } from '../config';
import axios from 'axios';

export async function getVideos(query, method, maxResults) {
  try {
    const response = await axios.get(YOUTUBE_SEARCH_URL,
      {
        params: {
          part: 'snippet',
          q: query + method,
          maxResults: maxResults,
          key: YOUTUBE_API_KEY,
          type: 'video'
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