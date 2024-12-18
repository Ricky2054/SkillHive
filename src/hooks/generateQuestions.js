import { GEMINI_API_KEY } from '../config'

import axios from 'axios';

export async function generateQuestions(query) {
  try {
    const data = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": `Please generate a comprehensive step-by-step learning guide on ${query}, formatted as an array of questions. Each question should be clear, relevant, and designed to build understanding progressively. The array should include approximately 50 questions, covering various aspects of the subject in detail. When giving the questions, give them in plain text. The array should only include questions, without any additional symbols, special characters, or extraneous information. After the end of each question, please append the phrase "in English". The format of the response should be a JSON array where each element is a question string, like this: ["What is the basic concept and importance? in English", "What are the core components and architecture? in English", "How do I set up the development environment? in English", "What are the main functionalities and how do I implement them? in English", "How can I optimize performance and ensure best practices? in English", ...]`
            }
          ]
        }
      ]
    });
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      headers: { 
        'Content-Type': 'application/json'
      }, 
      data: data
    };

    const response = await axios.request(config);
    const candidates = response.data.candidates;
    const contentArray = candidates.map(candidate =>
      candidate.content.parts.map(part => part.text).join(' ')
    );
    const allQuestionsText = contentArray[0];
    const cleanedText = allQuestionsText
      .replace(/^\[|\]$/g, '')
      .replace(/\\\"/g, '"')
      .replace(/```json\n|\n```/g, '')  
      .trim();
    const questions = cleanedText
      .split(/,(?=\s*"[^"]*")/) 
      .map(question => question
        .replace(/^"|"$/g, '')
        .trim()
      )
      .filter(question => question.length > 0);
    return questions;
  } catch (error) {
    console.error('Error while generating questions:', error);
    return [];
  }
} 