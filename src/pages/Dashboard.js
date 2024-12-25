import { useState, useEffect } from 'react';
import { generateMCQs } from '../hooks/mcqQuestions';
import run from '../api/ocr';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ResultsCharts = ({ topicScores, totalScore, totalQuestions }) => {
  const barChartData = {
    labels: Object.keys(topicScores),
    datasets: [
      {
        label: 'Correct Answers per Topic',
        data: Object.values(topicScores).map(score => score.correct),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Incorrect Answers per Topic',
        data: Object.values(topicScores).map(score => score.total - score.correct),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      }
    ]
  };

  const pieChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [totalScore, totalQuestions - totalScore],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Quiz Performance Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance by Topic</h3>
        <Bar data={barChartData} options={options} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
        <Pie data={pieChartData} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [allQuizzes, setAllQuizzes] = useState({}); // Store all quizzes by topic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [cvAnalysis, setCvAnalysis] = useState(null);

  const topics = [
    // 'JavaScript',
    // 'React',
    'block chain',
    // 'Node.js',
    // 'Python',
    // 'Data Structures',
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await run(file);
      if (!analysis.success) {
        throw new Error(analysis.error);
      }
      setCvAnalysis(analysis);
    } catch (error) {
      setError('Error analyzing CV: ' + error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all quizzes in background when app loads
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const quizPromises = topics.map(topic => generateMCQs(topic));
        const results = await Promise.all(quizPromises);
        
        const quizzesByTopic = {};
        results.forEach((result, index) => {
          quizzesByTopic[topics[index]] = JSON.parse(result);
        });
        
        setAllQuizzes(quizzesByTopic);
      } catch (err) {
        setError('Failed to load quizzes. Please try again later.');
        console.error('Error fetching quizzes:', err);
      }
      
      setLoading(false);
    };

    fetchAllQuizzes();
  }, []);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentTopicIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleAnswerSelect = (topicIndex, questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [`${topicIndex}-${questionIndex}`]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    const currentTopicQuestions = allQuizzes[topics[currentTopicIndex]];
    
    if (currentQuestionIndex < currentTopicQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentTopicIndex < topics.length - 1) {
      setCurrentTopicIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      setShowResults(true);
    }
  };

  const getCurrentQuestion = () => {
    if (!quizStarted || !allQuizzes[topics[currentTopicIndex]]) return null;
    return allQuizzes[topics[currentTopicIndex]][currentQuestionIndex];
  };

  const calculateDetailedScore = () => {
    const topicScores = {};
    let totalCorrect = 4;
    let totalQuestions = 0;

    topics.forEach((topic, topicIndex) => {
      const topicQuestions = allQuizzes[topic];
      if (topicQuestions) {
        let correctForTopic = 0;
        topicQuestions.forEach((_, questionIndex) => {
          const answer = selectedAnswers[`${topicIndex}-${questionIndex}`];
          const correctAnswer = topicQuestions[questionIndex].correctAnswer - 1;
          if (answer === correctAnswer) {
            correctForTopic++;
            totalCorrect++;
          }
          totalQuestions++;
        });

        topicScores[topic] = {
          correct: correctForTopic,
          total: topicQuestions.length
        };
      }
    });

    return { topicScores, totalCorrect, totalQuestions };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Fancy CV Upload Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Upload Your CV</h2>
            <div className="relative">
              <input 
                type="file" 
                accept=".txt,.doc,.docx,.pdf" 
                onChange={handleFileUpload}
                className="hidden" 
                id="cv-upload"
              />
              <label 
                htmlFor="cv-upload" 
                className="cursor-pointer bg-white text-blue-600 px-6 py-3 rounded-lg inline-block hover:bg-gray-100 transition-colors"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* CV Analysis Results */}
          {cvAnalysis && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">CV Analysis Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Profile</h4>
                  <pre className="whitespace-pre-wrap text-gray-100 text-sm">
                    {JSON.stringify(cvAnalysis.profile, null, 2)}
                  </pre>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Job Recommendations</h4>
                  <pre className="whitespace-pre-wrap text-gray-100 text-sm">
                    {JSON.stringify(cvAnalysis.recommendations, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {!quizStarted ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to test your knowledge?</h2>
              <button
                onClick={handleStartQuiz}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Take Quiz
              </button>
            </div>
          ) : (
            <>
              {!showResults ? (
                <div>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">
                      {topics[currentTopicIndex]}
                    </h2>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Topic {currentTopicIndex + 1} of {topics.length}</span>
                      <span>
                        Question {currentQuestionIndex + 1} of {allQuizzes[topics[currentTopicIndex]]?.length}
                      </span>
                    </div>
                  </div>

                  {getCurrentQuestion() && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="font-semibold mb-4">{getCurrentQuestion().question}</h3>
                      <div className="space-y-3">
                        {getCurrentQuestion().options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center">
                            <input
                              type="radio"
                              name={`question-${currentTopicIndex}-${currentQuestionIndex}`}
                              id={`option-${optIndex}`}
                              className="mr-3"
                              checked={selectedAnswers[`${currentTopicIndex}-${currentQuestionIndex}`] === optIndex}
                              onChange={() => handleAnswerSelect(currentTopicIndex, currentQuestionIndex, optIndex)}
                            />
                            <label htmlFor={`option-${optIndex}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={handleNextQuestion}
                        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={selectedAnswers[`${currentTopicIndex}-${currentQuestionIndex}`] === undefined}
                      >
                        Next Question
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold mb-4">Quiz Complete! 🎉</h2>
                  {(() => {
                    const { topicScores, totalCorrect, totalQuestions } = calculateDetailedScore();
                    return (
                      <div>
                        <div className="mb-4">
                          <p className="text-lg">Your Score: {totalCorrect} out of {totalQuestions}</p>
                          <p className="text-lg">Percentage: {((totalCorrect / totalQuestions) * 100).toFixed(1)}%</p>
                        </div>
                        
                        <ResultsCharts 
                          topicScores={topicScores}
                          totalScore={totalCorrect}
                          totalQuestions={totalQuestions}
                        />

                        <button
                          onClick={handleStartQuiz}
                          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Try Again
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;