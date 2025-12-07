// src/components/homePage.tsx
import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container className="py-5">
      {/* Welcome Card */}
      <Card className="text-center mb-5 shadow">
        <Card.Body className="py-5">
          <Card.Title as="h1" className="mb-3">
            Welcome to Skin Lab! 🧴
          </Card.Title>
          <Card.Text className="lead mb-4">
            Hello, <strong>{user?.full_name || 'User'}</strong>!
          </Card.Text>
          <Card.Text className="text-muted mb-4">
            <small>Logged in as: {user?.email}</small>
          </Card.Text>
          <Button 
            variant="dark" 
            size="lg"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <h3 className="mb-4">Quick Actions</h3>
      <Row>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3" style={{ fontSize: '3rem' }}>🛍️</div>
              <Card.Title>Shop Products</Card.Title>
              <Card.Text className="text-muted">
                Browse our collection of premium skincare products
              </Card.Text>
              <Button 
                variant="outline-dark" 
                onClick={() => navigate('/products')}
              >
                View Products
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3" style={{ fontSize: '3rem' }}>📦</div>
              <Card.Title>My Orders</Card.Title>
              <Card.Text className="text-muted">
                Track your orders and view order history
              </Card.Text>
              <Button 
                variant="outline-dark" 
                onClick={() => navigate('/orders')}
              >
                Orders
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3" style={{ fontSize: '3rem' }}>👤</div>
              <Card.Title>My Profile</Card.Title>
              <Card.Text className="text-muted">
                Manage your account settings and preferences
              </Card.Text>
              <Button 
                variant="outline-dark" 
                disabled
              >
                Coming Soon
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Info Section */}
      <Card className="mt-5 bg-light">
        <Card.Body>
          <Card.Title>💡 Did you know?</Card.Title>
          <Card.Text>
            You can filter products by skin type, category, and price range to find the perfect match for your skin!
          </Card.Text>
          <Button 
            variant="dark" 
            size="sm"
            onClick={() => navigate('/products')}
          >
            Explore Now
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HomePage;