import os
import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.text import MIMEText
import random

class CoverLetterGenerator:
    def __init__(self):
        # Define job fields and company details
        self.job_titles = [
            "Software Engineer", 
            "Data Scientist", 
            "Product Manager", 
            "Marketing Specialist"
        ]
        
        self.company_industries = [
            "Technology", 
            "Healthcare", 
            "Finance", 
            "E-commerce"
        ]
        
        self.skills = [
            "problem-solving", 
            "team collaboration", 
            "innovative thinking", 
            "data analysis", 
            "project management"
        ]
    
    def generate_cover_letter(self, job_title, company_name, company_industry):
        """
        Generate a professional cover letter based on input parameters
        
        Args:
            job_title (str): Position applying for
            company_name (str): Name of the company
            company_industry (str): Industry of the company
        
        Returns:
            str: Generated cover letter text
        """
        # Randomly select a skill to highlight
        highlighted_skill = random.choice(self.skills)
        
        cover_letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {job_title} position at {company_name}. 
With my background in {company_industry} and expertise in {highlighted_skill}, 
I am confident that I would be a valuable addition to your team.

Throughout my career, I have consistently demonstrated the ability to:
- Leverage my skills to drive meaningful results
- Collaborate effectively with cross-functional teams
- Adapt quickly to changing business environments

{company_name}'s reputation for innovation and excellence in the {company_industry} sector 
deeply resonates with my professional goals and personal values. I am excited about the 
potential opportunity to contribute to your organization's continued success.

Thank you for considering my application. I look forward to discussing how my skills 
and experience align with the needs of {company_name}.

Sincerely,
Ricky Dey"""
        
        return cover_letter

class GmailSender:
    def __init__(self):
        """
        Initialize Gmail API credentials
        Note: Requires setting up OAuth 2.0 credentials
        """
        SCOPES = ['https://www.googleapis.com/auth/gmail.send']
        
        # Path to your OAuth 2.0 credentials file
        creds_path = 'client_secret_1083105248809-fl40pq9oj30haat993m4harnj2n3rvce.apps.googleusercontent.com.json'
        
        flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
        self.creds = flow.run_local_server(port=0)
        
        self.service = build('gmail', 'v1', credentials=self.creds)
    
    def send_email(self, to_email, subject, body):
        """
        Send an email via Gmail API
        
        Args:
            to_email (str): Recipient's email address
            subject (str): Email subject
            body (str): Email body text
        
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            message = MIMEText(body)
            message['to'] = to_email
            message['subject'] = subject
            
            # Encode the message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Send the message
            self.service.users().messages().send(
                userId='me', 
                body={'raw': raw_message}
            ).execute()
            
            print(f"Cover letter sent successfully to {to_email}")
            return True
        
        except Exception as error:
            print(f"An error occurred: {error}")
            return False

def main():
    # Create instances
    letter_generator = CoverLetterGenerator()
    gmail_sender = GmailSender()
    
    # User inputs
    job_title = input("Enter job title: ")
    company_name = input("Enter company name: ")
    company_industry = input("Enter company industry: ")
    recipient_email = input("Enter recipient's email address: ")
    
    # Generate cover letter
    cover_letter = letter_generator.generate_cover_letter(
        job_title, company_name, company_industry
    )
    
    # Send cover letter
    gmail_sender.send_email(
        recipient_email, 
        f"Application for {job_title} Position", 
        cover_letter
    )

if __name__ == "__main__":
    main()