import { useState } from 'react';

// Dummy user data
const userData = {
  username: "Ash310u",
  email: "dev.ash310u@gmail.com",
  joinDate: "December 2024",
  stack: ["React", "Node.js", "MongoDB", "TypeScript"],
  profilePicture: "https://avatars.githubusercontent.com/u/107404699?v=4",
  yearsActive: 1
};

const Profile = () => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  return (
    <div className="bg-zinc-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header Section */}
        <div className="flex items-center space-x-6 mb-8">
          <img 
            src={userData.profilePicture} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{userData.username}</h1>
            <p className="text-gray-600">Active since {userData.joinDate}</p>
          </div>
        </div>

        {/* User Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Account Details</h2>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{userData.email}</p>
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

        {/* Account Settings Section */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
          
          {/* Change Username */}
          <div className="mb-4">
            {isEditingUsername ? (
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  placeholder="New username"
                  className="border p-2 rounded"
                />
                <button 
                  onClick={() => setIsEditingUsername(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button 
                  onClick={() => setIsEditingUsername(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingUsername(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Change Username
              </button>
            )}
          </div>

          {/* Change Password */}
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
      </div>
    </div>
  );
};

export default Profile;
