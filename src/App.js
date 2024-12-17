import Route from './features/Route';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Learning from './pages/Learning';
import Navbar from './components/Navbar';
import { useState } from 'react';
import useNavigation from './hooks/useNavigation';
import Profile from './pages/Profile';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentPath, navigate } = useNavigation();

  if (currentPath === '/') {
    navigate('/login');
  }

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="bg-zinc-50 w-screen h-screen flex flex-col flex-1justify-between">
      <Navbar onSearch={handleSearch} />
      <div className="flex flex-col justify-between overflow-hidden">
        <Route path="/login"><Login /></Route>
        <Route path="/dashboard"><Dashboard searchTerm={searchTerm} /></Route>
        <Route path="/about"><About /></Route>
        <Route path="/learning"><Learning /></Route>
        <Route path="/profile"><Profile /></Route>
      </div>
    </div>
  );
}

export default App; 