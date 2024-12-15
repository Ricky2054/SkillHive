import React, { useState } from 'react';
import Navbar from './components/Navbar';
import VideoCard from './components/VideoCard';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="bg-black min-h-screen">
      <Navbar onSearch={handleSearch} />
      <div className="pt-16">
        <VideoCard topics={searchTerm} />
      </div>
    </div>
  );
}

export default App; 