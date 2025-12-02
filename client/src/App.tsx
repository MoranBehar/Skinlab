import React, { useState, useEffect } from 'react';
import { authService } from './services/auth.service';
import { User } from './types/auth.types';
import LoginPage from './components/loginPage';
import SignupPage from './components/signupPage';
import HomePage from './components/homePage';
import GoogleAuthSuccess from './components/googleAuthSuccess';

type PageType = 'login' | 'signup' | 'home' | 'google-success';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if already logged in
    const token = authService.getToken();
    const savedUser = authService.getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
      setCurrentPage('home');
    }

    // Check for Google OAuth callback
    if (window.location.pathname === '/auth/google/success') {
      setCurrentPage('google-success');
    }
  }, []);

  const handleLogin = () => {
    const savedUser = authService.getUser();
    setUser(savedUser);
    setCurrentPage('home');
  };

  const handleSignup = () => {
    const savedUser = authService.getUser();
    setUser(savedUser);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('login');
  };

  const handleGoogleSuccess = () => {
    const savedUser = authService.getUser();
    setUser(savedUser);
    setCurrentPage('home');
  };

  if (currentPage === 'google-success') {
    return <GoogleAuthSuccess onSuccess={handleGoogleSuccess} />;
  }

  if (currentPage === 'login') {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onNavigateToSignup={() => setCurrentPage('signup')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <SignupPage 
        onSignup={handleSignup}
        onNavigateToLogin={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'home' && user) {
    return <HomePage user={user} onLogout={handleLogout} />;
  }

  return null;
};

export default App;