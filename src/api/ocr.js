import { GoogleGenerativeAI } from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Initialize Google Gemini
const setupGemini = () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Error setting up Gemini:', error);
    return null;
  }
};

// Extract text from PDF
const extractTextFromPDF = async (pdfFile) => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

// Analyze CV using Gemini
const analyzeCV = async (cvText, model) => {
  const template = `You are a professional CV analyzer. Analyze the provided CV and extract relevant information in a structured JSON format.
    
  Instructions:
  1. Extract all information that matches the JSON structure below
  2. Return ONLY valid JSON, no other text or explanations
  3. Ensure all fields have valid values (empty string or empty array if not found)
  4. Do not include any markdown formatting
  
  Required JSON Structure:
  {
    "personal_info": {
      "name": "",
      "email": "",
      "location": "",
      "summary": ""
    },
    "skills": [],
    "technical_skills": [],
    "soft_skills": [],
    "experience": [],
    "education": [],
    "interests": [],
    "preferred_roles": [],
    "industry_preferences": []
  }

  CV Text:
  ${cvText}

  Response (JSON only):`;

  try {
    const response = await model.generateContent(template);
    const content = response.response.text();
    return JSON.parse(content.trim());
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return {};
  }
};

// Get job recommendations
const getJobRecommendations = async (profile, model) => {
  const template = `Based on this candidate profile, suggest 5 specific job opportunities in JSON format. Return ONLY the JSON array, no other text:
  
  Profile: ${JSON.stringify(profile)}
  
  Return array of jobs in this format:
  [
    {
      "title": "",
      "company_type": "",
      "description": "",
      "required_skills": [],
      "salary_range": "",
      "career_growth": "",
      "industry": ""
    }
  ]`;

  try {
    const response = await model.generateContent(template);
    const content = response.response.text();
    return JSON.parse(content.trim());
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

// Main run function that orchestrates the entire process
const run = async (file) => {
  try {
    // Validate file
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Please upload a valid PDF file');
    }

    // Initialize Gemini
    const model = setupGemini();
    if (!model) {
      throw new Error('Failed to initialize Gemini model');
    }

    // Extract text from PDF
    const cvText = await extractTextFromPDF(file);
    if (!cvText) {
      throw new Error('No text could be extracted from PDF');
    }

    // Analyze CV
    const profile = await analyzeCV(cvText, model);
    if (Object.keys(profile).length === 0) {
      throw new Error('Failed to analyze CV');
    }

    // Get job recommendations
    const recommendations = await getJobRecommendations(profile, model);

    return {
      success: true,
      profile,
      recommendations,
      error: null
    };

  } catch (error) {
    console.error('Error processing PDF:', error);
    return {
      success: false,
      profile: null,
      recommendations: null,
      error: error.message
    };
  }
};

export default run;