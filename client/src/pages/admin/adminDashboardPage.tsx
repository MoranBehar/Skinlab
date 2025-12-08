import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { adminApi } from '../../services/admin.api';
import { DashboardStats, OrderStats, ProductStats } from '../../types/admin.types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [orderStats, productStats] = await Promise.all([
        adminApi.getOrderStats() as Promise<OrderStats>,
        adminApi.getProductStats() as Promise<ProductStats>,
      ]);

      setStats({
        ...orderStats,
        ...productStats,
      } as DashboardStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-dark">
            <i className="bi bi-speedometer2 me-2"></i>
            Admin Dashboard
          </h2>
          <p className="text-muted">Welcome to your management panel</p>
        </Col>
      </Row>

      {/* Statistics Cards Row 1 */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Orders</p>
                  <h3 className="fw-bold mb-0">{stats?.totalOrders || 0}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cart-check fs-2 text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Revenue</p>
                  <h3 className="fw-bold mb-0">₪{stats?.totalRevenue.toFixed(2) || 0}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-currency-dollar fs-2 text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Today's Orders</p>
                  <h3 className="fw-bold mb-0">{stats?.todayOrders || 0}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-clock-history fs-2 text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Today's Revenue</p>
                  <h3 className="fw-bold mb-0">₪{stats?.todayRevenue.toFixed(2) || 0}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-graph-up-arrow fs-2 text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards Row 2 */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-bag-check me-2"></i>
                Orders by Status
              </h5>
            </Card.Header>
            <Card.Body>
              {stats?.ordersByStatus.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <div 
                      className={`badge ${
                        item.status === 'shipped' ? 'bg-primary' :
                        item.status === 'delivered' ? 'bg-success' :
                        'bg-danger'
                      } me-2`}
                    >
                      {item.count}
                    </div>
                    <span className="text-capitalize">{item.status.replace('_', ' ')}</span>
                  </div>
                  <div className="progress flex-grow-1 ms-3" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar ${
                        item.status === 'shipped' ? 'bg-primary' :
                        item.status === 'delivered' ? 'bg-success' :
                        'bg-danger'
                      }`}
                      style={{ width: `${(item.count / (stats?.totalOrders || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-box-seam me-2"></i>
                Products Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <h2 className="fw-bold text-primary mb-1">{stats?.totalProducts || 0}</h2>
                    <p className="text-muted mb-0 small">Available Products</p>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <h2 className="fw-bold text-danger mb-1">{stats?.unavailableProducts || 0}</h2>
                    <p className="text-muted mb-0 small">Unavailable Products</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-lightning-charge me-2"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <a href="/admin/products/create" className="btn btn-primary w-100">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Product
                  </a>
                </Col>
                <Col md={3}>
                  <a href="/admin/products" className="btn btn-outline-primary w-100">
                    <i className="bi bi-box-seam me-2"></i>
                    Manage Products
                  </a>
                </Col>
                <Col md={3}>
                  <a href="/admin/orders" className="btn btn-outline-success w-100">
                    <i className="bi bi-cart-check me-2"></i>
                    View All Orders
                  </a>
                </Col>
                <Col md={3}>
                  <a href="/admin/analytics" className="btn btn-outline-info w-100">
                    <i className="bi bi-graph-up me-2"></i>
                    View Analytics
                  </a>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};