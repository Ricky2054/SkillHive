import streamlit as st 
import requests
import imaplib
import email
from email.header import decode_header
from googleapiclient.discovery import build
from youtubesearchpython import VideosSearch
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain.chains import LLMChain
import time
from functools import lru_cache
import tenacity
from langchain_community.tools import YouTubeSearchTool
import json
from typing import List, Dict
from googleapiclient.errors import HttpError

# Load environment variables
load_dotenv()

def check_credentials():
    """Validate required environment variables"""
    required_vars = ['EMAIL_ADDRESS', 'EMAIL_PASSWORD', 'YOUTUBE_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        st.error(f"Missing environment variables: {', '.join(missing_vars)}")
        return False
    return True

def fetch_emails(email_address, password, days=7):
    """Fetch emails with error handling"""
    try:
        if not email_address or not password:
            st.error("Email credentials not provided")
            return []

        # Connect to Gmail
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        try:
            mail.login(email_address, password)
        except imaplib.IMAP4.error as e:
            st.error(f"Login failed: {str(e)}")
            return []

        mail.select('inbox')

        # Calculate date range
        date = (datetime.now() - timedelta(days=days)).strftime("%d-%b-%Y")
        search_criteria = f'(SINCE {date})'

        # Search emails
        _, messages = mail.search(None, search_criteria)
        email_list = []

        if messages and messages[0]:
            message_numbers = messages[0].split()
            total_emails = len(message_numbers)

            if total_emails > 0:
                progress_bar = st.progress(0)

                for i, num in enumerate(message_numbers):
                    try:
                        _, msg = mail.fetch(num, '(RFC822)')
                        email_message = email.message_from_bytes(msg[0][1])

                        subject = decode_header(email_message["subject"])[0][0]
                        if isinstance(subject, bytes):
                            subject = subject.decode()

                        email_list.append({
                            'subject': subject,
                            'date': email_message["date"]
                        })

                        # Update progress
                        progress = min(100, int((i + 1) / total_emails * 100))
                        progress_bar.progress(progress)
                    except Exception as e:
                        st.warning(f"Error processing email {i+1}: {str(e)}")
                        continue

                progress_bar.empty()

        mail.logout()
        return email_list

    except Exception as e:
        st.error(f"Error accessing emails: {str(e)}")
        return []

def get_email_content(email_message) -> str:
    """Safely extract text content from email message"""
    text_parts = []

    if email_message.is_multipart():
        for part in email_message.walk():
            if part.get_content_type() == "text/plain":
                try:
                    payload = part.get_payload(decode=True)
                    if isinstance(payload, bytes):
                        charset = part.get_content_charset() or 'utf-8'
                        text_parts.append(payload.decode(charset, 'ignore'))
                except Exception:
                    continue
    else:
        payload = email_message.get_payload(decode=True)
        if isinstance(payload, bytes):
            charset = email_message.get_content_charset() or 'utf-8'
            text_parts.append(payload.decode(charset, 'ignore'))

    return '\n'.join(filter(None, text_parts)).strip()

def fetch_emails_paginated(days=7, batch_size=5, page=0):
    try:
        email_address = os.getenv('EMAIL_ADDRESS')
        password = os.getenv('EMAIL_PASSWORD')
        
        if not email_address or not password:
            st.error("Email credentials not found")
            return [], 0
        
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login(email_address, password)
        mail.select('inbox')
        
        date = (datetime.now() - timedelta(days=days)).strftime("%d-%b-%Y")
        search_criteria = f'(SINCE {date})'
        
        _, messages = mail.search(None, search_criteria)
        if not messages or not messages[0]:
            return [], 0
            
        message_numbers = messages[0].split()
        total_emails = len(message_numbers)
        
        # Calculate pagination
        start_idx = page * batch_size
        end_idx = min(start_idx + batch_size, total_emails)
        current_batch = message_numbers[start_idx:end_idx]
        
        # Create progress bar placeholder
        progress_placeholder = st.empty()
        email_list = []
        
        for i, num in enumerate(current_batch):
            try:
                # Update progress
                progress = int((i + 1) / len(current_batch) * 100)
                progress_placeholder.progress(progress)
                
                # Fetch email
                _, msg = mail.fetch(num, '(RFC822)')
                email_message = email.message_from_bytes(msg[0][1])
                
                # Get subject and content safely
                subject = decode_header(email_message["subject"])[0][0]
                if isinstance(subject, bytes):
                    subject = subject.decode(errors='ignore')
                elif not isinstance(subject, str):
                    subject = str(subject)
                
                # Extract content safely
                content = get_email_content(email_message)
                
                email_list.append({
                    'subject': subject,
                    'content': content,
                    'date': email_message["date"]
                })
                
                time.sleep(0.5)
                
            except Exception as e:
                st.warning(f"Error processing email {start_idx + i + 1}: {str(e)}")
                continue
        
        # Clear progress
        progress_placeholder.empty()
        mail.logout()
        return email_list, total_emails
        
    except Exception as e:
        st.error(f"Error accessing emails: {str(e)}")
        return [], 0

def fetch_youtube_videos(keywords: List[str], max_results: int = 6) -> List[Dict]:
    """Fetch videos using YouTube Data API v3"""
    try:
        youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))
        search_query = ' '.join(keywords[:5]) + ' career guide'

        request = youtube.search().list(
            part="snippet",
            maxResults=max_results,
            q=search_query,
            type="video",
            videoDuration="medium",
            videoEmbeddable="true",
            fields="items(id/videoId,snippet(title,description,thumbnails/medium,channelTitle))"
        )

        response = request.execute()

        videos = []
        for item in response.get('items', []):
            videos.append({
                'video_id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description'],
                'thumbnail': item['snippet']['thumbnails']['medium']['url'],
                'channel_title': item['snippet']['channelTitle']
            })

        return videos

    except HttpError as e:
        st.error(f"YouTube API error: {str(e)}")
        return []
    except Exception as e:
        st.error(f"Error fetching videos: {str(e)}")
        return []

def setup_langchain():
    """Initialize LangChain with Gemini"""
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",
        google_api_key=os.getenv('GOOGLE_API_KEY'),
        temperature=0.7,
        max_retries=3
    )
    return llm

@lru_cache(maxsize=100)
def cached_analyze_content(email_text):
    """Cache analysis results to reduce API calls"""
    llm = setup_langchain()
    output_parser = CommaSeparatedListOutputParser()

    template = """Analyze this email and extract career keywords:
    {email_text}
    Keywords:"""

    prompt = ChatPromptTemplate.from_template(template)
    chain = LLMChain(llm=llm, prompt=prompt, output_parser=output_parser)
    return chain.run(email_text=email_text)

def analyze_email_content(email_text):
    """Analyze email content with retry logic"""
    try:
        time.sleep(1)  # Rate limiting
        keywords = cached_analyze_content(email_text)
        return keywords
    except tenacity.RetryError as e:
        st.error(f"Error analyzing content after retries: {str(e)}")
        return []
    except Exception as e:
        st.error(f"Error analyzing email content: {str(e)}")
        return []

def fetch_and_process_emails(days=7, batch_size=5, page=0):
    try:
        emails, total = fetch_emails_paginated(days, batch_size, page)
        if not emails:
            return [], [], [], 0
        
        # Process emails and extract keywords
        all_keywords = set()
        for email in emails:
            if 'content' in email:
                keywords = analyze_email_content(email['content'])
                if keywords:
                    all_keywords.update(keywords)
        
        # Convert keywords to list and sort
        keyword_list = sorted(list(all_keywords))
        
        # Fetch videos based on keywords
        videos = fetch_youtube_videos(keyword_list)
        
        return emails, videos, keyword_list, total
    
    except Exception as e:
        st.error(f"Error in processing: {str(e)}")
        return [], [], [], 0

def display_video_cards(videos, keywords=None):
    """Display videos with keyword tags in a grid layout"""
    # Add custom CSS for tags and video containers
    st.markdown("""
        <style>
        .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            margin-bottom: 20px;
        }
        .video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .keyword-tag {
            display: inline-block;
            background-color: #e00404;
            padding: 2px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        .video-card {
            padding: 15px;
            border-radius: 10px;
            background: #f8f9fa;
            margin-bottom: 20px;
        }
        </style>
    """, unsafe_allow_html=True)
    
    # Display keyword summary
    if keywords:
        st.write("🏷️ Keywords Found:")
        tags_html = " ".join([f'<span class="keyword-tag">{k}</span>' for k in keywords])
        st.markdown(tags_html, unsafe_allow_html=True)
    
    # Display videos in grid
    cols = st.columns(2)
    for idx, video in enumerate(videos):
        with cols[idx % 2]:
            st.markdown('<div class="video-card">', unsafe_allow_html=True)
            st.subheader(video['title'])
            
            # Create iframe embed
            video_embed = f"""
                <div class="video-container">
                    <iframe
                        src="https://www.youtube.com/embed/{video['video_id']}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            """
            st.markdown(video_embed, unsafe_allow_html=True)
            
            # Display video metadata
            st.caption(f"📺 {video['channel_title']}")
            st.write(video['description'][:200] + "...")
            
            # Display relevant keywords for this video
            if keywords:
                relevant_keywords = [k for k in keywords if k.lower() in video['title'].lower() or k.lower() in video['description'].lower()]
                if relevant_keywords:
                    st.markdown("**Related Topics:**")
                    tags_html = " ".join([f'<span class="keyword-tag">{k}</span>' for k in relevant_keywords])
                    st.markdown(tags_html, unsafe_allow_html=True)
            
            st.markdown('</div>', unsafe_allow_html=True)
            st.divider()

def main():
    st.title("🎯 Career Insights Assistant")
    
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
        
        # Initialize page in session state
        if 'page' not in st.session_state:
            st.session_state.page = 0
        
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
            with st.spinner("Analyzing emails and finding relevant videos..."):
                emails, videos, keywords, total = fetch_and_process_emails(
                    days, 
                    batch_size, 
                    st.session_state.page
                )
                
                if emails and videos:
                    st.write(f"Processed {len(emails)} emails")
                    st.write(f"Found {len(keywords)} career-related keywords")
                    st.write("### 📺 Recommended Videos")
                    display_video_cards(videos, keywords)  # Pass keywords to display function
                else:
                    st.info("No results found")

    # Display current page info
    if 'page' in st.session_state:
        st.caption(f"Page: {st.session_state.page + 1}")

if __name__ == "__main__":
    main()
