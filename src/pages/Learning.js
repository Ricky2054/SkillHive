import { useState } from 'react';
import Searchbar from '../components/Searchbar';
import VideoCard from '../components/VideoCard';

const Learning = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-md">
              <Searchbar onSearch={handleSearch} />
            </div>
          </div>
          <VideoCard topics={searchTerm} />
        </div>
      </div>
    </div>
  )
}

export default Learning;