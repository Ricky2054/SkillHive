import { useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Dummy user data
const userData = {
  username: "Ash310u",
  email: "dev.ash310u@gmail.com",
  joinDate: "December 2024",
  stack: ["React", "Node.js", "MongoDB", "TypeScript"],
  profilePicture: "https://avatars.githubusercontent.com/u/107404699?v=4",
  yearsActive: 1,
  mcqStats: {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      questions: [25, 45, 32, 67, 49, 83],
      accuracy: [65, 70, 75, 68, 72, 80]
    },
    overall: {
      totalQuestions: 301,
      correctAnswers: 228,
      wrongAnswers: 73
    }
  }
};

const Profile = () => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [username, setUsername] = useState(userData.username);
  const [email, setEmail] = useState(userData.email);

  // Chart configurations
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Quiz Performance',
        color: '#0f172a'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(30, 58, 138, 0.1)'
        },
        ticks: {
          color: '#1e3a8a'
        }
      },
      x: {
        grid: {
          color: 'rgba(30, 58, 138, 0.1)'
        },
        ticks: {
          color: '#1e3a8a'
        }
      }
    }
  };

  const lineChartData = {
    labels: userData.mcqStats.monthly.labels,
    datasets: [
      {
        label: 'Questions Attempted',
        data: userData.mcqStats.monthly.questions,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.1,
        fill: true
      },
      {
        label: 'Accuracy (%)',
        data: userData.mcqStats.monthly.accuracy,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  const doughnutChartData = {
    labels: ['Correct', 'Wrong'],
    datasets: [
      {
        data: [
          userData.mcqStats.overall.correctAnswers,
          userData.mcqStats.overall.wrongAnswers
        ],
        backgroundColor: [
          'rgba(37, 99, 235, 0.9)',
          'rgba(96, 165, 250, 0.6)'
        ],
        borderColor: [
          '#2563eb',
          '#60a5fa'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="bg-zinc-50 h-full p-8 overflow-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header Section */}
        <div className="flex items-center space-x-6 mb-8">
          <img 
            src={userData.profilePicture} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{username}</h1>
            <p className="text-gray-600">Active since {userData.joinDate}</p>
          </div>
        </div>

        {/* User Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Account Details</h2>
            
            {/* Username Field */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Username</p>
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border p-1 rounded"
                    />
                    <button 
                      onClick={() => setIsEditingUsername(false)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditingUsername(false)}
                      className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{username}</p>
                    <button 
                      onClick={() => setIsEditingUsername(true)}
                      className="text-blue-500 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Email</p>
                {isEditingEmail ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border p-1 rounded"
                    />
                    <button 
                      onClick={() => setIsEditingEmail(false)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditingEmail(false)}
                      className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{email}</p>
                    <button 
                      onClick={() => setIsEditingEmail(true)}
                      className="text-blue-500 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-gray-600">Years Active</p>
              <p className="font-medium">{userData.yearsActive} years</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {userData.stack.map((tech, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Security</h2>
          <div>
            {isEditingPassword ? (
              <div className="space-y-2">
                <input 
                  type="password" 
                  placeholder="Current password"
                  className="border p-2 rounded w-full max-w-md"
                />
                <input 
                  type="password" 
                  placeholder="New password"
                  className="border p-2 rounded w-full max-w-md"
                />
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  className="border p-2 rounded w-full max-w-md"
                />
                <div className="space-x-2">
                  <button 
                    onClick={() => setIsEditingPassword(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Update Password
                  </button>
                  <button 
                    onClick={() => setIsEditingPassword(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingPassword(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        {/* MCQ Statistics Section */}
        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">MCQ Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Performance Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <Line options={lineChartOptions} data={lineChartData} />
            </div>

            {/* Overall Accuracy Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-blue-800 mb-4 text-center">
                Overall Accuracy
              </h3>
              <div className="w-3/4 mx-auto">
                <Doughnut data={doughnutChartData} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-blue-700">
                  Total Questions: {userData.mcqStats.overall.totalQuestions}
                </p>
                <p className="text-sm text-blue-700">
                  Accuracy Rate: {Math.round((userData.mcqStats.overall.correctAnswers / userData.mcqStats.overall.totalQuestions) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
