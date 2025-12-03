// src/components/signupPage.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // בדיקת התאמת סיסמאות
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // בדיקת אורך סיסמה
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await signup(fullName, email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={8} lg={6} className="mx-auto">
          <div className="text-center mb-4">
            <h1>SIGN UP</h1>
            <p className="text-muted">Create your account and start your skincare journey</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            <Col md={6} className="d-flex align-items-center justify-content-center mb-4 mb-md-0">
              <div className="text-center">
                <h5 className="mb-3">Sign up with</h5>
                <Button
                  variant="outline-secondary"
                  onClick={handleGoogleSignup}
                  className="px-5"
                >
                  <span>🔍</span> Google
                </Button>
                <p className="text-muted mt-3">Quick and easy</p>
              </div>
            </Col>

            <Col md={6}>
              <div className="text-center mb-3">
                <h5>OR</h5>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Must be at least 6 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button 
                  variant="dark" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'SIGN UP'}
                </Button>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/login')}
                  >
                    Already have an account? Log in
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupPage;