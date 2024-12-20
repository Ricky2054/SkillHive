// import { GEMINI_API_KEY } from '../config'

// import axios from 'axios';

// export async function generateQuestions(language, topics) {
//   try {
//     // const topicsString = topics.join(", "); // Convert topics array to a comma-separated string
//     const topicsString = topics // Temporary
//       const data = JSON.stringify({
//         "contents": [
//           {
//             "parts": [
//               {
//                 "text": `Generate a YouTube search prompt that prioritizes videos in the "${language}" and focuses on the following topics: ${topicsString}. Structure the prompt to be precise and optimize for language-specific results.`
//               }
//             ]
//         }
//       ]
//     });
//     const config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
//       headers: { 
//         'Content-Type': 'application/json'
//       }, 
//       data: data,
//     };

//     const response = await axios.request(config);
//     const candidates = response.data.candidates;
//     const contentArray = candidates.map(candidate =>
//       candidate.content.parts.map(part => part.text).join(' ')
//     );
//     const allQuestionsText = contentArray[0];
//     const cleanedText = allQuestionsText
//       .replace(/^\[|\]$/g, '')
//       .replace(/\\\"/g, '"')
//       .replace(/```json\n|\n```/g, '')  
//       .trim();
//     const questions = cleanedText
//       .split(/,(?=\s*"[^"]*")/) 
//       .map(question => question
//         .replace(/^"|"$/g, '')
//         .trim()
//       )
//       .filter(question => question.length > 0);
//     return questions;
//   } catch (error) {
//     console.error('Error while generating questions:', error);
//     return [];
//   }
// } 