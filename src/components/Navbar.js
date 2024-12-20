import Link from '../features/Link';

const navLinks = [
  {
    path: '/login',
    name: 'Login'
  },
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
        <div className="font-bold text-3xl text-slate-200">
          Skill Hive
        </div>
        <div className="flex flex-row justify-between w-1/4 font-medium text-white">
            {navLinks.map((link, index) => (
              <Link key={index} to={link.path}>
                {link.name}
              </Link>
            ))}
        </div>
    </div>
  );
};

export default Navbar; 