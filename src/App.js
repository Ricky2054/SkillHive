import Route from './features/Route';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Learning from './pages/Learning';
import Navbar from './components/Navbar';
import useNavigation from './hooks/useNavigation';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { currentPath, navigate } = useNavigation();

  if (currentPath === '/') {
    navigate('/login');
  }

  return (
    <AuthProvider>
      <div className="min-h-screen w-full flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Route path="/login"><Login /></Route>
          <Route path="/dashboard">
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          </Route>
          <Route path="/about">
            <ProtectedRoute><About /></ProtectedRoute>
          </Route>
          <Route path="/learning">
            <ProtectedRoute><Learning /></ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute><Profile /></ProtectedRoute>
          </Route>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App; 