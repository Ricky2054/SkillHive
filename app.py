import requests
import imaplib
import email
from email.header import decode_header
import google.generativeai as genai
from datetime import datetime, timedelta

# Fetch emails and extract insights (job history, client feedback, training materials)
def fetch_emails(username, password, max_emails=100):
    try:
        # Connect to Gmail's IMAP server
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login(username, password)
        mail.select("inbox")
        
        # Calculate date 7 days ago
        seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%d-%b-%Y")
        
        # Search for emails from last 7 days
        search_criteria = f'(SINCE "{seven_days_ago}")'
        status, email_ids = mail.search(None, search_criteria)
        
        if status != 'OK':
            print(f"Search failed with status: {status}")
            return []

        email_ids = email_ids[0].split()
        if not email_ids:
            print("No emails found in last 7 days")
            return []
            
        print(f"Found {len(email_ids)} emails from last 7 days")
        
        emails = []
        # Broaden relevant keywords
        relevant_keywords = [
            'job', 'career', 'interview', 'resume', 
            'opportunity', 'position', 'work', 'role',
            'application', 'hiring', 'offer', 'salary',
            'training', 'learning', 'skill', 'development'
        ]
        
        # Process most recent emails first
        for email_id in reversed(email_ids):
            if len(emails) >= max_emails:
                break

            print(f"Processing email ID: {email_id}")
            status, email_data = mail.fetch(email_id, '(RFC822)')
            
            if status != 'OK':
                print(f"Failed to fetch email {email_id}")
                continue

            for response_part in email_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject = decode_header(msg['subject'])[0][0]
                    if isinstance(subject, bytes):
                        subject = subject.decode()
                    
                    # Get email body
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                try:
                                    body = part.get_payload(decode=True).decode()
                                    break
                                except:
                                    continue
                    else:
                        try:
                            body = msg.get_payload(decode=True).decode()
                        except:
                            body = msg.get_payload()

                    # Check content for keywords
                    content = f"{subject} {body}".lower()
                    if any(keyword in content for keyword in relevant_keywords):
                        print(f"Found relevant email: {subject}")
                        emails.append({
                            'Subject': subject,
                            'From': msg['from'],
                            'Date': msg['date'],
                            'Body': body
                        })

        print(f"Found {len(emails)} relevant emails")
        return emails

    except Exception as e:
        print(f"Error in fetch_emails: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

# Analyze email content to extract keywords for study suggestions
def analyze_email_content(email_body):
    keywords = []
    # Example keywords to search for in the email body
    if 'job' in email_body.lower():
        keywords.append('Job')
    if 'client feedback' in email_body.lower():
        keywords.append('Client Feedback')
    if 'training materials' in email_body.lower():
        keywords.append('Training Materials')
    if 'communication skills' in email_body.lower():
        keywords.append('Communication Skills')
    if 'leadership skills' in email_body.lower():
        keywords.append('Leadership Skills')
    if 'internship' in email_body.lower():
        keywords.append('Internship')
    if 'resume' in email_body.lower():
        keywords.append('Resume')
    if 'cover letter' in email_body.lower():
        keywords.append('Cover Letter')
    if 'job application' in email_body.lower():
        keywords.append('Job Application')
    if 'interview' in email_body.lower():
        keywords.append('Interview')
    if 'salary' in email_body.lower():
        keywords.append('Salary')
    if 'job offer' in email_body.lower():
        keywords.append('Job Offer')
    if 'promotion' in email_body.lower():
        keywords.append('Promotion')
    if 'career development' in email_body.lower():
        keywords.append('Career Development')
    
    return {"keywords": keywords}

# Use Google Generative AI (Gemini) to generate learning suggestions based on insights
def generate_suggestions_from_gemini(insights):
    try:
        # Configure the Gemini API
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Structured prompt template
        prompt = f"""Based on the email analysis showing interests in: {', '.join(insights['keywords'])},
        provide a structured learning path in the following format:

        Create a response with exactly this structure:
        "Based on your recent email activities, here's your personalized learning path:

        Priority List of Recommended Courses:
        1. [Course Name] - [Platform] - [Duration]
        2. [Course Name] - [Platform] - [Duration]
        3. [Course Name] - [Platform] - [Duration]

        Key Skills to Develop:
        1. [Primary Skill] - [Specific aspects to focus on]
        2. [Secondary Skill] - [Specific aspects to focus on]
        3. [Supporting Skill] - [Specific aspects to focus on]

        Suggested Timeline:
        - Month 1: [Focus Areas]
        - Month 2: [Focus Areas]
        - Month 3: [Focus Areas]"

        Keep recommendations highly specific and actionable.
        """
        
        response = model.generate_content(prompt)
        return [response.text] if response.text else []
        
    except Exception as e:
        print(f"Error generating suggestions: {str(e)}")
        return []

# Main function to execute the process
def main():
    username = input("Enter your email: ")
    password = input("Enter your password: ")
    
    # Fetch emails from last 7 days
    emails = fetch_emails(username, password, max_emails=100)
    
    if not emails:
        print("No emails found in the last 7 days!")
        return
    
    # Collect all keywords across emails
    all_keywords = set()
    email_count = 0
    
    print("\nAnalyzing emails from the last 7 days...")
    for email_data in emails:
        email_count += 1
        insights = analyze_email_content(email_data['Body'])
        all_keywords.update(insights['keywords'])
    
    # Generate one final set of recommendations
    if all_keywords:
        print(f"\nSummary:")
        print(f"- Analyzed {email_count} emails")
        print(f"- Found topics: {', '.join(all_keywords)}")
        print("\nGenerating personalized recommendations based on your email activity...\n")
        
        suggestions = generate_suggestions_from_gemini({"keywords": list(all_keywords)})
        if suggestions:
            print("Recommended Learning Path:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"{i}. {suggestion}")
    else:
        print("No relevant career or skill-related content found in your recent emails.")

if __name__ == "__main__":
    main()
