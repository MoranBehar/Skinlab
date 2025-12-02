import React, { useEffect } from 'react';
import { authService } from '../services/auth.service';

interface GoogleAuthSuccessProps {
  onSuccess: () => void;
}

const GoogleAuthSuccess: React.FC<GoogleAuthSuccessProps> = ({ onSuccess }) => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('access_token', token);
      
      authService.fetchUserData(token)
        .then(userData => {
          localStorage.setItem('user', JSON.stringify(userData));
          onSuccess();
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          window.location.href = '/';
        });
    }
  }, [onSuccess]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Completing Google sign in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;