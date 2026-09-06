import React from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Outlet, useNavigate } from 'react-router-dom';
import CartIcon from './cart/cartIcon';
import ChatWidget from './chat/chatWidget';
import { useAuth } from '../contexts/authContext';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isManager = isAuthenticated && user?.role_id === 1;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container fluid>
          <Navbar.Brand 
            onClick={() => navigate('/products')} 
            style={{ cursor: 'pointer' }}
          >
            SKIN LAB
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && (
                <Nav.Link>
                  <CartIcon />
                </Nav.Link>
              )}

              <Nav.Link onClick={() => navigate('/products')}>
                Products
              </Nav.Link>

              {isAuthenticated && (
                <Nav.Link onClick={() => navigate('/home')}>
                  my skinlab
                </Nav.Link>
              )}

              {isManager && (
                <Nav.Link onClick={() => navigate('/admin/dashboard')}>
                  Admin Dashboard
                </Nav.Link>
              )}
            </Nav>

            <Nav>
              {isAuthenticated ? (
                <>
                  <Navbar.Text className="me-3">
                    Welcome, {user?.full_name || 'User'}
                  </Navbar.Text>
                  <Button 
                    variant="outline-light" 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline-light" 
                    size="sm" 
                    className="me-2"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className='container-fluid py-4'>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <Container>
          <p className="mb-0">&copy; 2025 Skin Lab. All rights reserved.</p>
        </Container>
      </footer>

      {isAuthenticated && !isManager && <ChatWidget />}
    </>
  );
};

export default MainLayout;