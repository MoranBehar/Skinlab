import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { adminApi } from '../../services/admin.api';
import { Order } from '../../types/order.types';
import { OrderDetail } from '../../types/admin.types';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const data = await adminApi.getOrderById(parseInt(id!));
      setOrder(data as OrderDetail);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'canceled':
        return 'danger';
      default:
        return 'secondary';
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

  if (!order) {
    return (
      <Container className="py-5 text-center">
        <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
        <p className="mt-3">Order not found</p>
        <Button variant="primary" onClick={() => navigate('/admin/orders')}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Button
            variant="outline-secondary"
            className="mb-3"
            onClick={() => navigate('/admin/orders')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Orders
          </Button>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                Order #{order.order_id}
              </h2>
              <p className="text-muted mb-0">
                Placed on {new Date(order.date_placed).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge
              bg={getStatusBadgeVariant(order.status.status_name)}
              className="fs-6 px-3 py-2"
            >
              {order.status.status_name.toUpperCase()}
            </Badge>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Left Column */}
        <Col lg={8}>
          {/* Order Items */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-box-seam me-2"></i>
                Order Items
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 ps-4">Product</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Quantity</th>
                    <th className="py-3 text-end pe-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.shoppingCart.items.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-4 align-middle">
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product.images[0]?.image_path || '/placeholder.png'}
                            alt={item.product.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                            className="me-3"
                          />
                          <span className="fw-semibold">{item.product.name}</span>
                        </div>
                      </td>
                      <td className="align-middle">₪{Number(item.product.price).toFixed(2)}</td>
                      <td className="align-middle">
                        <Badge bg="secondary">{item.quantity}</Badge>
                      </td>
                      <td className="align-middle text-end pe-4">
                        <span className="fw-bold">
                          ₪{Number(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-end fw-bold py-3 pe-4">
                      Total Amount:
                    </td>
                    <td className="text-end fw-bold py-3 pe-4 fs-5 text-primary">
                      ₪{Number(order.price).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>
          </Card>

          {/* Order Tracking */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Order Tracking History
              </h5>
            </Card.Header>
            <Card.Body>
              {order.tracking.map((track, index) => (
                <div key={index} className="d-flex mb-4 position-relative">
                  <div className="me-3">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center ${
                        track.status.status_name === 'delivered'
                          ? 'bg-success'
                          : track.status.status_name === 'shipped'
                          ? 'bg-primary'
                          : 'bg-danger'
                      }`}
                      style={{ width: '40px', height: '40px' }}
                    >
                      <i
                        className={`bi ${
                          track.status.status_name === 'delivered'
                            ? 'bi-check-circle'
                            : track.status.status_name === 'shipped'
                            ? 'bi-truck'
                            : 'bi-x-circle'
                        } text-white`}
                      ></i>
                    </div>
                    {index < order.tracking.length - 1 && (
                      <div
                        className="bg-secondary"
                        style={{
                          width: '2px',
                          height: '40px',
                          marginLeft: '19px',
                          marginTop: '8px',
                        }}
                      ></div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-capitalize">
                      {track.status.status_name.replace('_', ' ')}
                    </div>
                    <div className="text-muted small">
                      {new Date(track.date).toLocaleString('he-IL')}
                    </div>
                    {track.comments && (
                      <div className="text-muted small mt-1">
                        <i className="bi bi-chat-left-text me-1"></i>
                        {track.comments}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col lg={4}>
          {/* Customer Information */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-person me-2"></i>
                Customer Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="text-muted small mb-1">Name</div>
                <div className="fw-semibold">{order.user.full_name}</div>
              </div>
              <div className="mb-3">
                <div className="text-muted small mb-1">Email</div>
                <div>{order.user.email}</div>
              </div>
              {order.user.phone && (
                <div>
                  <div className="text-muted small mb-1">Phone</div>
                  <div>{order.user.phone}</div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Shipping Information */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-geo-alt me-2"></i>
                Shipping Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="text-muted small mb-1">Shipping Method</div>
                <Badge bg="info" className="text-capitalize">
                  {order.shippingType.type_name.replace('_', ' ')}
                </Badge>
              </div>
              {order.shippingAddress && (
                <>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Address</div>
                    <div>
                      {order.shippingAddress.address}, Apt {order.shippingAddress.apartment_number}
                      , Floor {order.shippingAddress.floor_number}
                    </div>
                    <div>{order.shippingAddress.city}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Phone</div>
                    <div>{order.shippingAddress.phone_number}</div>
                  </div>
                  {order.shippingAddress.comments && (
                    <div>
                      <div className="text-muted small mb-1">Delivery Notes</div>
                      <div className="small">{order.shippingAddress.comments}</div>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>

          {/* Payment Information */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-credit-card me-2"></i>
                Payment Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <div className="text-muted small mb-1">Payment Method</div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-credit-card fs-5 me-2"></i>
                  <span className="text-capitalize">{order.credit_card_brand}</span>
                  <span className="ms-2">****{order.credit_card_last_four_digits}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};