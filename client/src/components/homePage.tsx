import React from 'react';
import { User } from '../types/auth.types';

interface HomePageProps {
  user: User;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout }) => {
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-bold">SKIN LAB</span>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white">Welcome, {user.full_name}!</span>
            <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container py-5">
        <div className="text-center">
          <h1 className="display-1 fw-bold mb-4">HOME PAGE</h1>
          <div className="card mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-body p-4">
              <h3 className="card-title mb-4">Your Profile</h3>
              <div className="text-start">
                <p className="mb-2"><strong>Name:</strong> {user.full_name}</p>
                <p className="mb-2"><strong>Email:</strong> {user.email}</p>
                <p className="mb-2"><strong>Points:</strong> {user.points}</p>
                <p className="mb-0"><strong>Role:</strong> {user.role_id === 0 ? 'Regular User' : 'Manager'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

