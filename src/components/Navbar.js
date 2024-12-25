import Link from '../features/Link';

const navLinks = [
  {
    path: '/dashboard',
    name: 'Dashboard'
  },
  {
    path: '/about',
    name: 'About'
  },
  {
    path: '/learning',
    name: 'Learning'
  },
  {
    path: '/profile',
    name: 'Profile'
  }
];

const Navbar = ({ onSearch }) => {
  return (
    <div className="flex flex-row justify-between items-center bg-gradient-to-r to-blue-400 via-blue-600 from-gray-900 py-3 px-5 w-full">
      <div className="font-bold text-xl md:text-3xl text-slate-200">
        Skill Hive
      </div>
      <nav className="flex flex-row items-center gap-1 sm:gap-2 md:gap-4 font-medium text-white text-xs sm:text-sm md:text-base">
        {navLinks.map((link, index) => (
          <Link 
            key={index} 
            to={link.path} 
            className="px-1 sm:px-2 hover:text-blue-200 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Navbar; 