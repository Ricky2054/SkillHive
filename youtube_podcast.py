import streamlit as st
import imaplib
import email
from email.header import decode_header
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
import yt_dlp
from googleapiclient.discovery import build
import time
from functools import lru_cache
import json

# Add to existing imports
from googleapiclient.errors import HttpError
from tenacity import retry, stop_after_attempt, wait_exponential
from langchain.output_parsers import CommaSeparatedListOutputParser
from typing import List, Dict

# Load environment variables
load_dotenv()

# Initialize session state
if 'analyzed_emails' not in st.session_state:
    st.session_state.analyzed_emails = []
if 'recommendations' not in st.session_state:
    st.session_state.recommendations = []
if 'current_page' not in st.session_state:
    st.session_state.current_page = 0
if 'quota_usage' not in st.session_state:
    st.session_state.quota_usage = {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'count': 0
    }
if 'cached_results' not in st.session_state:
    st.session_state.cached_results = {}
if 'page' not in st.session_state:
    st.session_state.page = 0
if 'current_playing' not in st.session_state:
    st.session_state.current_playing = None

def extract_email_content(days=7):
    """Extract emails from Gmail"""
    try:
        email_address = os.getenv('EMAIL_ADDRESS')
        password = os.getenv('EMAIL_PASSWORD')
        
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login(email_address, password)
        mail.select('inbox')
        
        date = (datetime.now() - timedelta(days=days)).strftime("%d-%b-%Y")
        _, messages = mail.search(None, f'(SINCE {date})')
        
        progress_bar = st.progress(0)
        total_messages = len(messages[0].split())
        
        email_contents = []
        for i, num in enumerate(messages[0].split()):
            _, msg = mail.fetch(num, '(RFC822)')
            email_message = email.message_from_bytes(msg[0][1])
            content = get_email_text(email_message)
            if content:
                email_contents.append(content)
            progress_bar.progress((i + 1) / total_messages)
            
        mail.logout()
        return email_contents
        
    except Exception as e:
        st.error(f"Error accessing emails: {str(e)}")
        return []

def get_email_text(email_message):
    """Extract text from email message"""
    if email_message.is_multipart():
        text_parts = []
        for part in email_message.walk():
            if part.get_content_type() == "text/plain":
                try:
                    text = part.get_payload(decode=True).decode()
                    text_parts.append(text)
                except:
                    continue
        return "\n".join(text_parts)
    else:
        try:
            return email_message.get_payload(decode=True).decode()
        except:
            return None

def analyze_emails(contents):
    """Process emails with LLM"""
    llm = ChatGoogleGenerativeAI(model="gemini-pro")
    template = """Extract career-related keywords from this email content:
    {text}
    Return only comma-separated keywords."""
    
    prompt = ChatPromptTemplate.from_template(template)
    chain = LLMChain(llm=llm, prompt=prompt)
    
    all_keywords = set()
    for content in contents:
        try:
            response = chain.run(text=content)
            keywords = [k.strip() for k in response.split(',')]
            all_keywords.update(keywords)
        except Exception as e:
            st.warning(f"Analysis error: {str(e)}")
            continue
    
    return list(all_keywords)

@lru_cache(maxsize=100)
def cached_youtube_search(query: str, max_results: int = 3):
    """Cache YouTube search results"""
    cache_file = 'youtube_cache.json'
    
    # Check file cache first
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            cache = json.load(f)
            if query in cache and time.time() - cache[query]['timestamp'] < 86400:
                return cache[query]['results']
    
    # Check quota
    today = datetime.now().strftime('%Y-%m-%d')
    if (st.session_state.quota_usage['date'] != today):
        st.session_state.quota_usage = {'date': today, 'count': 0}
    
    if st.session_state.quota_usage['count'] >= 95:  # Safe limit
        st.warning("Daily quota limit approaching. Using cached results.")
        return []
    
    try:
        youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))
        
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def execute_search():
            request = youtube.search().list(
                part="snippet",
                maxResults=max_results,
                q=f"{query} podcast",
                type="video",
                videoDuration="long",
                fields="items(id/videoId,snippet(title,description,channelTitle))"
            )
            return request.execute()
        
        response = execute_search()
        st.session_state.quota_usage['count'] += 1
        
        # Cache results
        if not os.path.exists(cache_file):
            cache = {}
        else:
            with open(cache_file, 'r') as f:
                cache = json.load(f)
        
        cache[query] = {
            'timestamp': time.time(),
            'results': response
        }
        
        with open(cache_file, 'w') as f:
            json.dump(cache, f)
        
        return response
        
    except HttpError as e:
        if e.resp.status in [403, 429]:  # Quota exceeded
            st.error("YouTube API quota exceeded. Using cached results.")
            return []
        raise e

def fetch_recommendations(keywords: list, per_page: int = 3):
    """Fetch recommendations with proper data structure"""
    try:
        youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))
        
        all_results = []
        unique_videos = set()
        
        for keyword in keywords[:3]:
            request = youtube.search().list(
                part="snippet",
                maxResults=per_page,
                q=f"{keyword} podcast",
                type="video",
                videoDuration="long",
                fields="items(id/videoId,snippet(title,description,channelTitle))"
            )
            
            response = request.execute()
            
            for item in response.get('items', []):
                video_id = item['id']['videoId']
                if video_id not in unique_videos:
                    unique_videos.add(video_id)
                    all_results.append({
                        'video_id': video_id,
                        'title': item['snippet']['title'],
                        'description': item['snippet']['description'],
                        'channel_title': item['snippet']['channelTitle']
                    })
                    
                if len(all_results) >= per_page:
                    break
        
        return all_results[:per_page]
        
    except Exception as e:
        st.error(f"Error fetching recommendations: {str(e)}")
        return []

def get_podcast_recommendations(keywords, max_results=5):
    """Search YouTube for podcasts"""
    youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))
    
    all_results = []
    for keyword in keywords[:3]:
        try:
            request = youtube.search().list(
                part="snippet",
                maxResults=max_results,
                q=f"{keyword} podcast",
                type="video",
                videoDuration="long"
            )
            response = request.execute()
            all_results.extend(response.get('items', []))
        except Exception as e:
            st.error(f"YouTube API error: {str(e)}")
    
    return all_results[:max_results]

def display_podcast(video_id, title):
    """Display audio player"""
    try:
        audio_url = get_audio_url(video_id)
        if audio_url:
            st.markdown(f"### {title}")
            st.audio(audio_url)
    except Exception as e:
        st.error(f"Error playing podcast: {str(e)}")

def get_audio_url(video_id):
    """Get audio stream URL"""
    ydl_opts = {
        'format': 'bestaudio',
        'quiet': True,
        'no_warnings': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
        return info.get('url')

def display_recommendations(recommendations):
    """Display YouTube recommendations"""
    for item in recommendations:
        video_id = item['id']['videoId']
        title = item['snippet']['title']
        display_podcast(video_id, title)

def check_credentials():
    """Check if all required API keys and credentials are present"""
    required_vars = ['EMAIL_ADDRESS', 'EMAIL_PASSWORD', 'YOUTUBE_API_KEY']
    for var in required_vars:
        if not os.getenv(var):
            st.error(f"Missing {var}. Please check your .env file.")
            return False
    return True

def fetch_and_process_emails(days, batch_size, page):
    """Process emails and return analysis results"""
    emails = extract_email_content(days)
    if not emails:
        return [], [], [], 0
    
    start_idx = page * batch_size
    batch_emails = emails[start_idx:start_idx + batch_size]
    keywords = analyze_emails(batch_emails)
    podcasts = fetch_recommendations(keywords)
    
    return batch_emails, podcasts, keywords, len(emails)

def main():
    st.title("🎧 Career Podcast Assistant")
    
    if not check_credentials():
        return
    
    with st.expander("📧 Email Analysis"):
        days = st.slider(
            "Days to analyze", 
            1, 30, 7, 
            key="email_days_slider"
        )
        
        batch_size = st.select_slider(
            "Emails per page", 
            options=[5, 10, 15], 
            value=5,
            key="batch_size_slider"
        )
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("⬅️ Previous", key="prev_btn"):
                if st.session_state.page > 0:
                    st.session_state.page -= 1
                    st.rerun()
        
        with col2:
            if st.button("Next ➡️", key="next_btn"):
                st.session_state.page += 1
                st.rerun()
        
        if st.button("Analyze Emails", key="analyze_btn"):
            with st.spinner("Analyzing emails and finding podcasts..."):
                emails, podcasts, keywords, total = fetch_and_process_emails(
                    days, 
                    batch_size, 
                    st.session_state.page
                )
                
                if emails and podcasts:
                    st.write(f"Processed {len(emails)} emails")
                    st.write(f"Found {len(keywords)} career-related keywords")
                    st.write("### 🎧 Recommended Podcasts")
                    display_audio_cards(podcasts, keywords)
                else:
                    st.info("No results found")

    # Display current page info
    if 'page' in st.session_state:
        st.caption(f"Page: {st.session_state.page + 1}")

def display_audio_cards(podcasts, keywords=None):
    """Display podcasts with error handling"""
    # Add custom CSS
    st.markdown("""
        <style>
        .audio-container {
            width: 100%;
            margin-bottom: 20px;
        }
        .audio-player {
            width: 100%;
            margin: 10px 0;
        }
        .keyword-tag {
            display: inline-block;
            background-color: #e00404;
            padding: 2px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 0.8em;
            color: white;
        }
        .podcast-card {
            padding: 15px;
            border-radius: 10px;
            background: #f8f9fa;
            margin-bottom: 20px;
        }
        </style>
    """, unsafe_allow_html=True)

    # Display keywords
    if keywords:
        st.write("🏷️ Keywords Found:")
        tags_html = " ".join([f'<span class="keyword-tag">{k}</span>' for k in keywords])
        st.markdown(tags_html, unsafe_allow_html=True)
    
    # Display audio players
    cols = st.columns(2)
    for idx, podcast in enumerate(podcasts):
        with cols[idx % 2]:
            try:
                st.markdown('<div class="podcast-card">', unsafe_allow_html=True)
                
                # Safe access to podcast data
                title = podcast.get('title', 'Untitled Podcast')
                description = podcast.get('description', 'No description available')
                channel = podcast.get('channel_title', 'Unknown Channel')
                video_id = podcast.get('video_id')
                
                if not video_id:
                    continue
                
                st.subheader(title)
                
                # Get audio URL and create player
                audio_url = get_audio_url(video_id)
                if audio_url:
                    player_id = f"player_{video_id}_{int(time.time())}"
                    audio_html = f"""
                        <div class="audio-container">
                            <audio id="{player_id}" 
                                   controls 
                                   class="audio-player"
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
                
                st.caption(f"🎙️ {channel}")
                st.write(description[:200] + "...")
                
                if keywords:
                    relevant_keywords = [k for k in keywords 
                                       if k.lower() in podcast['title'].lower() 
                                       or k.lower() in podcast['description'].lower()]
                    if relevant_keywords:
                        st.markdown("**Related Topics:**")
                        tags_html = " ".join([f'<span class="keyword-tag">{k}</span>' 
                                            for k in relevant_keywords])
                        st.markdown(tags_html, unsafe_allow_html=True)
                
                st.markdown('</div>', unsafe_allow_html=True)
                st.divider()
            
            except Exception as e:
                st.error(f"Error displaying podcast {idx + 1}: {str(e)}")
                continue

if __name__ == "__main__":
    main()