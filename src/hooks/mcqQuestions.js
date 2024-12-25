import { GEMINI_API_KEY } from '../config';
import axios from 'axios';

export async function generateMCQs(query) {
  try {
    const data = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": `Generate 5 multiple choice questions about ${query}. Each question should have 4 options (A, B, C, D) and indicate the correct answer. Format the response as a JSON array of objects, where each object has properties: "question", "options" (array of 4 strings), and "correctAnswer" (index 0-3).`
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
    
    if (candidates && candidates.length > 0) {
      const rawText = candidates[0].content.parts.map(part => part.text).join('');
      let cleanedText = rawText
        .replace(/```json\n/g, '') 
        .replace(/\n```/g, '')
        .replace(/```.*\n/g, '')
        .replace(/(\*\*|__|~~|`|[\*\_\~])/g, '')
        .trim();
      cleanedText = cleanedText.replace(/#.*\n/g, '');
      return cleanedText;
    } else {
      console.log("No candidates generated.");
      return [];
    }
  } catch (error) {
    console.error('Error while generating MCQ questions:', error.response?.data || error.message);
    return [];
  }
} 