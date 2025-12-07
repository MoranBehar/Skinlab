import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { adminApi } from '../../services/admin.api';
import { RevenueData } from '../../types/admin.types';

export const AdminAnalytics: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      const data = await adminApi.getRevenueStats(period);
      setRevenueData(data as RevenueData[]);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return revenueData.reduce((sum, item) => sum + parseFloat(item.revenue.toString()), 0);
  };

  const getTotalOrders = () => {
    return revenueData.reduce((sum, item) => sum + parseInt(item.orders.toString()), 0);
  };

  const getAverageOrderValue = () => {
    const total = getTotalRevenue();
    const orders = getTotalOrders();
    return orders > 0 ? total / orders : 0;
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-dark">
                <i className="bi bi-graph-up me-2"></i>
                Analytics & Reports
              </h2>
              <p className="text-muted">Track your business performance</p>
            </div>
            <Form.Select
              style={{ width: '200px' }}
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Revenue</p>
                  <h2 className="fw-bold text-success mb-0">
                    ₪{getTotalRevenue().toFixed(2)}
                  </h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-currency-dollar fs-1 text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Orders</p>
                  <h2 className="fw-bold text-primary mb-0">{getTotalOrders()}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cart-check fs-1 text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Avg Order Value</p>
                  <h2 className="fw-bold text-info mb-0">
                    ₪{getAverageOrderValue().toFixed(2)}
                  </h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-graph-up-arrow fs-1 text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Revenue Over Time
              </h5>
            </Card.Header>
            <Card.Body>
              {revenueData.length > 0 ? (
                <div className="position-relative" style={{ height: '400px' }}>
                  {/* Simple Bar Chart */}
                  <div className="d-flex align-items-end justify-content-between h-100 gap-2">
                    {revenueData.map((item, index) => {
                      const maxRevenue = Math.max(...revenueData.map(d => parseFloat(d.revenue.toString())));
                      const heightPercent = (parseFloat(item.revenue.toString()) / maxRevenue) * 100;
                      
                      return (
                        <div
                          key={index}
                          className="d-flex flex-column align-items-center flex-grow-1"
                        >
                          <div
                            className="bg-primary rounded-top w-100 position-relative"
                            style={{
                              height: `${heightPercent}%`,
                              minHeight: '20px',
                              transition: 'all 0.3s ease',
                            }}
                            title={`₪${parseFloat(item.revenue.toString()).toFixed(2)}`}
                          >
                            <div
                              className="position-absolute top-0 start-50 translate-middle-x bg-dark text-white px-2 py-1 rounded small"
                              style={{ fontSize: '0.7rem', marginTop: '-30px', whiteSpace: 'nowrap' }}
                            >
                              ₪{parseFloat(item.revenue.toString()).toFixed(0)}
                            </div>
                          </div>
                          <div className="mt-2 text-center small text-muted">
                            <div>{new Date(item.date).toLocaleDateString('he-IL', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}</div>
                            <div className="small text-muted">
                              {item.orders} orders
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-graph-up fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No data available for selected period</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-table me-2"></i>
                Detailed Revenue Breakdown
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3 ps-4">Date</th>
                      <th className="py-3">Orders</th>
                      <th className="py-3">Revenue</th>
                      <th className="py-3 pe-4">Avg Order Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item, index) => (
                      <tr key={index}>
                        <td className="ps-4 align-middle">
                          {new Date(item.date).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="align-middle">
                          <span className="badge bg-primary">{item.orders}</span>
                        </td>
                        <td className="align-middle">
                          <span className="fw-bold text-success">
                            ₪{parseFloat(item.revenue.toString()).toFixed(2)}
                          </span>
                        </td>
                        <td className="pe-4 align-middle">
                          ₪{(parseFloat(item.revenue.toString()) / parseInt(item.orders.toString())).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};