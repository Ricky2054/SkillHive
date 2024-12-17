import React from 'react';
import { FaGraduationCap, FaRobot, FaSearch, FaBolt, FaEnvelope, FaBullseye, FaBook, FaGlobe, FaChartLine } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaGraduationCap className="text-4xl text-blue-500" />,
      title: "Video Learning",
      description: "Seamless integration of educational videos for effective learning"
    },
    {
      icon: <FaRobot className="text-4xl text-green-500" />,
      title: "AI-Powered MCQs",
      description: "Automatic generation of relevant quiz questions from video content"
    },
    {
      icon: <FaSearch className="text-4xl text-purple-500" />,
      title: "Smart Search",
      description: "Filter videos by topics and categories for targeted learning"
    },
    {
      icon: <FaBolt className="text-4xl text-yellow-500" />,
      title: "Real-time Feedback",
      description: "Instant assessment of quiz responses for better understanding"
    },
    {
      icon: <FaEnvelope className="text-4xl text-red-500" />,
      title: "Gmail Integration",
      description: "Analyzes email history to identify skill sets and work history"
    },
    {
      icon: <FaBullseye className="text-4xl text-indigo-500" />,
      title: "Personalized Check-In",
      description: "Custom questions about role, skill gaps, and career goals"
    },
    {
      icon: <FaBook className="text-4xl text-orange-500" />,
      title: "Curated Learning",
      description: "Tailored learning modules including videos and quizzes"
    },
    {
      icon: <FaGlobe className="text-4xl text-teal-500" />,
      title: "Language Support",
      description: "Content delivery in user's preferred language"
    },
    {
      icon: <FaChartLine className="text-4xl text-pink-500" />,
      title: "Dynamic Recommendations",
      description: "Continuously updated learning paths based on progress"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to SkillHive 🎓
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          An innovative AI-powered learning platform designed for gig workers and freelancers. 
          We help you identify skill gaps and deliver personalized learning content to keep you 
          competitive in the gig economy.
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto mt-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Our Team
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {[
            { name: "Ricky Dey", github: "Ricky2054" },
            { name: "Sorbojit Mondal", github: "33sorbojitmondal" },
            { name: "Ashutosh Saha", github: "Ash310u" },
            { name: "Anurag Dey", github: "anuragcode-16" },
            { name: "Piyush Goenka", github: "piyushgoenka2005" }
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-medium text-gray-900">{member.name}</h3>
              <a 
                href={`https://github.com/${member.github}`}
                className="text-blue-500 hover:text-blue-700 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                @{member.github}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="max-w-7xl mx-auto mt-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Built With
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {["React.js", "Tailwind CSS", "GEMINI API", "Gmail API", "YouTube API"].map((tech, index) => (
            <span 
              key={index}
              className="px-4 py-2 bg-gray-100 rounded-full text-gray-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;