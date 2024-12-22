import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import useNavigation from '../hooks/useNavigation';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { navigate } = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute; 