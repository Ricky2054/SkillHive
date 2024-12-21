import time
import streamlit as st
import googleapiclient.discovery
import yt_dlp
import os
import google.generativeai as genai

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set page config
st.set_page_config(
    page_title="Podcast Player",
    layout="wide"
)

# Initialize session state
if 'search_results' not in st.session_state:
    st.session_state.search_results = []
if 'saved_playlist' not in st.session_state:
    st.session_state.saved_playlist = []
if 'current_playing' not in st.session_state:
    st.session_state.current_playing = None
if 'autoplay' not in st.session_state:
    st.session_state.autoplay = False

def setup_apis():
    """Setup YouTube and Gemini APIs."""
    try:
        api_service_name = "youtube"
        api_version = "v3"
        YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
        
        youtube = googleapiclient.discovery.build(
            api_service_name, 
            api_version, 
            developerKey=YOUTUBE_API_KEY
        )
        
        GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
        genai.configure(api_key=GOOGLE_API_KEY)
        
        return youtube
    except Exception as e:
        st.error(f"API setup failed: {str(e)}")
        return None

def search_videos(youtube, query, max_results=5):
    """Search YouTube podcasts."""
    try:
        podcast_query = f"{query} podcast"
        
        request = youtube.search().list(
            part="snippet",
            maxResults=max_results,
            q=podcast_query,
            type="video",
            videoDuration="long",
            videoDefinition="high",
            fields="items(id/videoId,snippet(title,description,channelTitle))",
            order="relevance"
        )
        
        response = request.execute()
        
        filtered_results = []
        for item in response.get('items', []):
            title = item['snippet']['title'].lower()
            description = item['snippet']['description'].lower()
            
            is_podcast = any(keyword in title or keyword in description 
                           for keyword in ['podcast', 'episode', 'show'])
            
            if is_podcast:
                filtered_results.append(item)
                
        return filtered_results[:max_results]
    except Exception as e:
        st.error(f"Error searching podcasts: {str(e)}")
        return []

def get_audio_url(video_id):
    """Extract audio URL from YouTube video with error handling"""
    try:
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio/best',
            'extractaudio': True,
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            if not info:
                return None
                
            formats = info.get('formats', [])
            if not formats:
                return info.get('url')  # Fallback to direct URL
                
            # Filter and validate audio formats
            audio_formats = []
            for f in formats:
                if (f.get('acodec') != 'none' and 
                    f.get('vcodec') == 'none' and 
                    isinstance(f.get('abr'), (int, float))):
                    audio_formats.append(f)
            
            if audio_formats:
                # Sort by audio bitrate if available
                best_audio = sorted(
                    audio_formats,
                    key=lambda x: float(x.get('abr', 0) or 0),
                    reverse=True
                )[0]
                return best_audio.get('url')
                
            # Fallback to best available format
            return formats[-1].get('url')
            
    except Exception as e:
        st.error(f"Error extracting audio: {str(e)}")
        return None

def add_to_playlist(video):
    """Add a video to the playlist."""
    if not any(v['id']['videoId'] == video['id']['videoId'] for v in st.session_state.saved_playlist):
        st.session_state.saved_playlist.append(video)
        return True
    return False

def display_audio_player(video, player_id):
    """Display single audio player with auto-stop previous"""
    audio_url = get_audio_url(video['id']['videoId'])
    if audio_url:
        audio_html = f"""
            <div id="player-container-{player_id}">
                <audio id="{player_id}" 
                       controls 
                       style="width: 100%"
                       onplay="stopOtherPlayers(this.id)">
                    <source src="{audio_url}" type="audio/mp4">
                    Your browser does not support the audio element.
                </audio>
            </div>
            <script>
                function stopOtherPlayers(currentPlayerId) {{
                    document.querySelectorAll('audio').forEach(player => {{
                        if (player.id !== currentPlayerId) {{
                            player.pause();
                            player.currentTime = 0;
                        }}
                    }});
                }}
            </script>
        """
        st.markdown(audio_html, unsafe_allow_html=True)

def display_search_results():
    if not st.session_state.search_results:
        return
    
    st.subheader("Search Results")
    
    for idx, video in enumerate(st.session_state.search_results):
        with st.container():
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                st.write(f"**{video['snippet']['title']}**")
                st.write(f"Channel: {video['snippet']['channelTitle']}")
            
            with col2:
                player_id = f"player_{video['id']['videoId']}_{int(time.time())}"
                if st.button("Play", key=f"play_{idx}_{video['id']['videoId']}"):
                    display_audio_player(video, player_id)
            
            with col3:
                if st.button("Add to Playlist", key=f"add_{video['id']['videoId']}"):
                    if add_to_playlist(video):
                        st.success("Added to playlist!")
                        st.rerun()
                    else:
                        st.warning("Already in playlist!")
            
            with st.expander("Show Description"):
                st.write(video['snippet']['description'])

def display_playlist():
    st.subheader("Your Playlist")
    
    if not st.session_state.saved_playlist:
        st.info("Your playlist is empty. Search for podcasts to add them!")
        return
    
    for idx, video in enumerate(st.session_state.saved_playlist):
        with st.container():
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                st.write(f"**{video['snippet']['title']}**")
            
            with col2:
                if st.button("Play", key=f"play_{idx}_{video['id']['videoId']}"):
                    st.session_state.current_playing = idx
                    st.rerun()
            
            with col3:
                if st.button("Remove", key=f"remove_{idx}_{video['id']['videoId']}"):
                    if st.session_state.current_playing == idx:
                        st.session_state.current_playing = None
                    elif st.session_state.current_playing > idx:
                        st.session_state.current_playing -= 1
                    st.session_state.saved_playlist.pop(idx)
                    st.rerun()

def main():
    st.title("🎧 Podcast Player")
    
    # Setup APIs
    youtube = setup_apis()
    if not youtube:
        return
    
    # Search section
    with st.container():
        col1, col2 = st.columns([4, 1])
        with col1:
            search_query = st.text_input("Search for podcasts:", key="search_input")
        with col2:
            if st.button("Search", key="search_button"):
                if search_query:
                    results = search_videos(youtube, search_query)
                    if results:
                        st.session_state.search_results = results
                        st.rerun()
    
    # Display search results
    if st.session_state.search_results:
        st.markdown("---")
        display_search_results()
    
    # Display playlist
    st.markdown("---")
    display_playlist()
    
    # Display current playing audio (only if we have a valid current_playing index)
    if (st.session_state.current_playing is not None and 
        0 <= st.session_state.current_playing < len(st.session_state.saved_playlist)):
        st.markdown("---")
        display_audio_player()

if __name__ == "__main__":
    main()