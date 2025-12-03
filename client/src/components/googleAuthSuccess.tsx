import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/authContext';
import { authService } from '../services/auth.service';

const GoogleAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // קבלת token מה-URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
          // שמירת token
          localStorage.setItem('access_token', token);
          
          // קבלת פרטי משתמש
          const user = await authService.getMe();
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          navigate('/home');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [navigate, setUser]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <Spinner animation="border" role="status" className="mb-3" />
        <p>Completing Google authentication...</p>
      </div>
    </Container>
  );
};

export default GoogleAuthSuccess;