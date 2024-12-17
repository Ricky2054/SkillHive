import Link from '../features/Link';
// import Searchbar from './Searc`hbar';

function Navbar({ onSearch }) {
  return (
    <div className="flex flex-row justify-between items-center bg-gradient-to-r to-blue-400 via-blue-600 from-gray-900 py-3 px-5 w-full">
        <div className="font-bold text-3xl text-slate-200">
          Skill Hive
        </div>
        {/* <Searchbar onSearch={onSearch} /> */}
        <div className="flex flex-row justify-between w-1/4 font-medium text-white">
            <Link to="/login">
                Login 
            </Link>
            <Link to="/dashboard">
                Dashboard
            </Link>
            <Link to="/about">
                About
            </Link>
            <Link to="/learning">
                Learning
            </Link>
              <Link to="/profile">
                Profile
            </Link>
        </div>
    </div>
  );
}

export default Navbar; 