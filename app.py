import requests
import imaplib
import email
from email.header import decode_header
import google.generativeai as genai

# Fetch emails and extract insights (job history, client feedback, training materials)
def fetch_emails(username, password, max_emails=3):
    try:
        # Connect to Gmail's IMAP server
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login(username, password)
        mail.select("inbox")
        
        # Search for emails from last 30 days
        status, email_ids = mail.search(None, 'ALL')
        if status != 'OK':
            print(f"Search failed with status: {status}")
            return []

        email_ids = email_ids[0].split()
        if not email_ids:
            print("No emails found in inbox")
            return []
            
        print(f"Found {len(email_ids)} total emails")
        
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
        genai.configure(api_key='AIzaSyCjk3DQoGz-ChVqmuqDwEG9_WrmeFDak4U')  # Replace with your actual API key
        
        # Create the model instance
        model = genai.GenerativeModel('gemini-pro')
        
        # Prepare prompt
        prompt = f"Based on the following topics, suggest learning resources and skills to improve: {', '.join(insights['keywords'])}"
        
        # Generate content
        response = model.generate_content(prompt)
        
        # Extract and format suggestions
        if response.text:
            suggestions = [
                suggestion.strip() 
                for suggestion in response.text.split('\n') 
                if suggestion.strip()
            ]
            return suggestions[:5]  # Limit to 5 suggestions
        
        return []
        
    except Exception as e:
        print(f"Error generating suggestions from Gemini: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

# Main function to execute the process
def main():
    username = input("Enter your email: ")
    password = input("Enter your password: ")
    
    # Fetch emails
    emails = fetch_emails(username, password, max_emails=3)
    
    if emails:
        print(f"Found {len(emails)} relevant emails.")
        
        for email_data in emails:
            print(f"\nSubject: {email_data['Subject']}")
            print(f"From: {email_data['From']}")
            print(f"Date: {email_data['Date']}")
            print(f"Body: {email_data['Body'][:100]}...")  # Displaying only first 100 characters of the body
            print("=" * 50)
            
            # Analyze email content to extract insights
            insights = analyze_email_content(email_data['Body'])
            
            # Generate learning suggestions from Gemini based on the insights
            suggestions = generate_suggestions_from_gemini(insights)
            
            if suggestions:
                print("\nLearning suggestions based on this email:")
                for suggestion in suggestions:
                    print(f"- {suggestion}")
            else:
                print("No relevant learning suggestions generated.")
            
            print("=" * 50)
    else:
        print("No relevant emails found.")

if __name__ == "__main__":
    main()
