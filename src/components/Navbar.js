import React from 'react';
import Searchbar from './Searchbar';

function Navbar({ onSearch }) {
  return (
    <div className="flex items-center justify-between bg-black p-3 fixed z-10 w-full">
      <div className="font-bold text-3xl text-slate-200 italic">
        Skill Hive
      </div>
      <Searchbar onSearch={onSearch} />
    </div>
  );
}

export default Navbar; 