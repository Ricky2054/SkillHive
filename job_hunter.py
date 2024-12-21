import streamlit as st
from langchain_google_genai import GoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import json
from datetime import datetime
import re

# Set page configuration
st.set_page_config(
    page_title="Job Board Generator",
    page_icon="💼",
    layout="wide"
)

# Title and description
st.title("✨ AI Job Board Generator")
st.write("Generate and display job listings in an attractive tile layout")

def clean_json_string(json_str):
    """Clean and validate the JSON string before parsing."""
    # Remove any leading/trailing whitespace
    json_str = json_str.strip()
    
    # If the response starts with "```json" and ends with "```", remove them
    json_str = re.sub(r'^```json\n?', '', json_str)
    json_str = re.sub(r'\n?```$', '', json_str)
    
    return json_str

def validate_job_listing(job):
    """Validate that a job listing has all required fields."""
    required_fields = [
        'title', 'company', 'location', 'salary_range', 
        'experience_level', 'job_type', 'posted_date',
        'application_url', 'description', 'requirements'
    ]
    
    return all(field in job for field in required_fields)

def generate_job_listings(llm, number_of_jobs, industry, location):
    # Create prompt template with explicit JSON format instructions
    template = """
    Generate exactly {number_of_jobs} job listings for the {industry} industry in {location}.
    Respond ONLY with a JSON array of job objects. Each job object must have these exact fields:
    {{
        "title": "string",
        "company": "string",
        "location": "string",
        "salary_range": "string",
        "experience_level": "string",
        "job_type": "string",
        "posted_date": "string",
        "application_url": "string",
        "description": "string",
        "requirements": ["string"]
    }}
    
    Make all details realistic and varied. Ensure the response is valid JSON.
    Do not include any explanatory text, only the JSON array.
    """
    
    prompt = PromptTemplate(
        input_variables=["number_of_jobs", "industry", "location"],
        template=template
    )
    
    # Create chain
    chain = LLMChain(llm=llm, prompt=prompt)
    
    try:
        # Generate response
        response = chain.run({
            "number_of_jobs": number_of_jobs,
            "industry": industry,
            "location": location
        })
        
        # Clean the response
        cleaned_response = clean_json_string(response)
        
        # Parse JSON response
        job_listings = json.loads(cleaned_response)
        
        # Ensure we got a list
        if not isinstance(job_listings, list):
            raise ValueError("Response is not a list of job listings")
            
        # Validate each job listing
        valid_listings = []
        for job in job_listings:
            if validate_job_listing(job):
                valid_listings.append(job)
        
        if not valid_listings:
            raise ValueError("No valid job listings found in response")
            
        return valid_listings
        
    except json.JSONDecodeError as e:
        st.error(f"Failed to parse AI response: Invalid JSON format")
        st.code(response, language="json")  # Show the problematic response
        return []
    except Exception as e:
        st.error(f"Error generating job listings: {str(e)}")
        return []

# Function to create job tile
def create_job_tile(job):
    with st.container():
        st.markdown("""
        <style>
        .job-tile {
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 20px;
            margin: 10px 0;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .job-title {
            color: #1f77b4;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .company-name {
            color: #2c3e50;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .job-details {
            color: #666;
            font-size: 14px;
            margin-bottom: 15px;
        }
        </style>
        """, unsafe_allow_html=True)
        
        with st.container():
            st.markdown(f"""
            <div class="job-tile">
                <div class="job-title">{job['title']}</div>
                <div class="company-name">{job['company']}</div>
                <div class="job-details">
                    📍 {job['location']}<br>
                    💰 {job['salary_range']}<br>
                    ⏰ {job['job_type']}<br>
                    📅 Posted: {job['posted_date']}
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            with st.expander("View Details"):
                st.write("*Description:*")
                st.write(job['description'])
                st.write("*Requirements:*")
                for req in job['requirements']:
                    st.write(f"• {req}")
                
                st.link_button("Apply Now", job['application_url'], type="primary", use_container_width=True)

# Sidebar for API key
with st.sidebar:
    st.header("Configuration")
    api_key = st.text_input("Enter your Google API Key", type="password")
    st.caption("Get your API key from Google AI Studio")
    
    if not api_key:
        st.warning("Please enter your API key to proceed")

# Main form
with st.form("job_board_form"):
    col1, col2, col3 = st.columns(3)
    
    with col1:
        industry = st.text_input("Industry", placeholder="e.g., Technology")
    with col2:
        location = st.text_input("Location", placeholder="e.g., San Francisco, CA")
    with col3:
        num_jobs = st.number_input("Number of Jobs", min_value=1, max_value=10, value=4)
    
    submit_button = st.form_submit_button("Generate Job Board")

# Generate and display job listings
if submit_button and api_key:
    if not all([industry, location]):
        st.error("Please fill in all fields")
    else:
        try:
            with st.spinner("Generating job listings..."):
                # Initialize Gemini model
                llm = GoogleGenerativeAI(
                    model="gemini-pro",
                    google_api_key=api_key,
                    temperature=0.7
                )
                
                # Generate listings
                job_listings = generate_job_listings(
                    llm,
                    num_jobs,
                    industry,
                    location
                )
                
                if job_listings:
                    # Display jobs in a grid
                    st.success(f"Generated {len(job_listings)} job listings!")
                    
                    # Create columns for the grid layout
                    cols = st.columns(2)  # 2 columns for the grid
                    
                    # Distribute jobs across columns
                    for idx, job in enumerate(job_listings):
                        with cols[idx % 2]:
                            create_job_tile(job)
                
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
elif submit_button and not api_key:
    st.error("Please enter your Google API key in the sidebar")