# SkillHive 🎓

SkillHive is an innovative AI-powered learning platform designed for gig workers and freelancers. By leveraging AI technology, it generates Multiple Choice Questions (MCQs) from educational videos and analyzes Gmail communications (with explicit consent) to identify skill gaps and deliver personalized learning content.

Through intelligent analysis of job histories, client feedback, and work-related communications, SkillHive creates tailored learning paths that help users enhance their skillsets and stay competitive in the gig economy.

![SkillHive Banner](path/to/banner.png)

## ✨ Features

- 🎥 **Video Learning**: Seamless integration of educational videos
- 🤖 **AI-Powered MCQs**: Automatic generation of relevant quiz questions
- 🔍 **Smart Search**: Filter videos by topics and categories
- ⚡ **Real-time Feedback**: Instant assessment of quiz responses
- 📧 **Gmail Integration**: Analyzes email history (with consent) to identify skill sets, client feedback, and work history
- 🎯 **Personalized Check-In**: Custom questions about role, skill gaps, and career goals in preferred language
- 📚 **Curated Learning Content**: Instantly tailored learning modules including videos, infographics, and quizzes
- 🌐 **Language Support**: Content delivery in user's preferred language
- 📈 **Dynamic Recommendations**: Continuously updated learning paths based on progress and skill acquisition

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Gmail API credentials (Follow [Google’s guide](https://developers.google.com/gmail/api/quickstart/python) to obtain credentials.)
- A modern web browser (for user authentication).
- Node.js (v14.0.0 or higher)
- npm or yarn
- GEMINI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/ash310u/skillhive.git
cd skillhive
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Start the development server
```bash
npm start
```

Visit `http://localhost:3000` to see the application running.

## 🏗️ Project Structure

```
SkillHive/
├── src/
│   ├── components/    # React components
│   ├── api/           # API integration
│   ├── hooks/         # Custom React hooks
│   └── config.js      # Configuration
├── public/            # Static assets
└── README.md
```

## 🔧 Core Components

### VideoCard
- Displays video content with thumbnails
- Handles video playback
- Integrates with MCQ generation

### MCQ Generator
- AI-powered question generation
- Real-time feedback
- Progress tracking

## 🛠️ Technologies Used

- **Frontend**: React.js
- **Styling**: Tailwind CSS
- **AI Integration**: GEMINI API
- **State Management**: React Hooks
- **Video Processing**: [Video Processing Library]

## 📚 API Documentation

### Video API
```javascript
GET /api/videos
GET /api/videos/:id
POST /api/videos/generate-mcq
```

### MCQ API
```javascript
POST /api/mcq/generate
GET /api/mcq/:videoId
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

```env
REACT_APP_GEMINI_API_KEY=your_api_key
REACT_APP_YOUTUBE_API_KEY=your_api_key
REACT_APP_YOUTUBE_SEARCH_URL=your_api_url
```

## 👥 Authors

- [@Ricky Dey](https://github.com/Ricky2054)
- [@Sorbojit Mondal](https://github.com/33sorbojitmondal)
- [@Ashutosh Saha](https://github.com/Ash310u)
- [@Anurag Dey](https://github.com/anuragcode-16)
- [@Piyush Goenka](https://github.com/piyushgoenka2005)