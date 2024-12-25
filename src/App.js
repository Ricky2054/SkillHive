import Route from './features/Route';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Learning from './pages/Learning';
import Navbar from './components/Navbar';
// import useNavigation from './hooks/useNavigation';
import Profile from './pages/Profile';
// import { useEffect } from 'react';

function App() {
  // const { currentPath, navigate } = useNavigation();

  // Check for UUID in localStorage when app loads
  // useEffect(() => {
  //   const authToken = window.localStorage.getItem('authToken')
  //   console.log(authToken)
  //   if (authToken && authToken !== 'null') {
  //     navigate('/dashboard')
  //   }

  // }, [currentPath, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Route path="/"><Login /></Route>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/learning">
          <Learning />
        </Route>
        <Route path="/profile">
          <Profile />
        </Route>
      </main>
    </div>
  );
}

export default App; 