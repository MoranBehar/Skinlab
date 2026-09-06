import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const menuItems = [
    { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/admin/products', icon: 'bi-box-seam', label: 'Products' },
    { path: '/admin/orders', icon: 'bi-cart-check', label: 'Orders' },
    { path: '/admin/analytics', icon: 'bi-graph-up', label: 'Analytics' },
    { path: '/admin/chat', icon: 'bi-chat-dots', label: 'Chat' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '260px',
          backgroundColor: '#2c3e50',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-bottom border-secondary">
          <h4 className="text-white fw-bold mb-0">
            <i className="bi bi-shield-check me-2"></i>
            Admin Panel
          </h4>
          <p className="text-white-50 small mb-0 mt-1">SkinLab Management</p>
        </div>

        {/* Navigation Menu */}
        <Nav className="flex-column p-3">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`text-white mb-2 rounded ${
                isActive(item.path)
                  ? 'bg-primary'
                  : 'bg-transparent hover-bg-primary'
              }`}
              style={{
                padding: '12px 16px',
                transition: 'all 0.3s ease',
              }}
            >
              <i className={`bi ${item.icon} me-3`}></i>
              {item.label}
            </Nav.Link>
          ))}
        </Nav>

        {/* Divider */}
        <hr className="border-secondary mx-3" />

        {/* Bottom Menu */}
        <Nav className="flex-column p-3">
          <Nav.Link
            href="/"
            className="text-white mb-2 rounded"
            style={{ padding: '12px 16px' }}
          >
            <i className="bi bi-house-door me-3"></i>
            Back to Store
          </Nav.Link>
          <Nav.Link
            href="/logout"
            className="text-white mb-2 rounded"
            style={{ padding: '12px 16px' }}
          >
            <i className="bi bi-box-arrow-right me-3"></i>
            Logout
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: '260px', flex: 1 }}>
        {/* Top Navbar */}
        <Navbar bg="white" className="shadow-sm border-bottom">
          <Container fluid className="px-4">
            <div className="d-flex align-items-center">
              <i className="bi bi-list fs-4 me-3 text-muted"></i>
              <span className="text-muted">
                Welcome, <strong>{user?.full_name || 'Admin'}</strong>
              </span>
            </div>
          </Container>
        </Navbar>

        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>

      <style>{`
        .hover-bg-primary:hover {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }
      `}</style>
    </div>
  );
};