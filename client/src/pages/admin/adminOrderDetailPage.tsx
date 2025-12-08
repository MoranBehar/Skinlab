import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { adminApi } from '../../services/admin.api';
import { AdminOrder, OrderDetail } from '../../types/admin.types';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orderDetail, setOrderDetail] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const result = await adminApi.getOrderById(parseInt(id!));

            console.log("***", result);

      setOrderDetail({
        ...result.orderResponse, 
        tracking: result.tracking,
      });

      console.log("***", orderDetail);
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

  if (!orderDetail) {
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
                Order #{orderDetail.order_id}
              </h2>
              <p className="text-muted mb-0">
                Placed on {new Date(orderDetail.date_placed).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge
              bg={getStatusBadgeVariant(orderDetail.status?.status_name)}
              className="fs-6 px-3 py-2"
            >
              {orderDetail.status.status_name.toUpperCase()}
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
                  {(orderDetail.items || []).map((item, index) => (
                    <tr key={index}>
                      <td className="ps-4 align-middle">
                        <div className="d-flex align-items-center">
                          <img
                            src={item.image_path ?? '/placeholder.png'}
                            alt={item.product_name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                            className="me-3"
                          />
                          <span className="fw-semibold">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="align-middle">₪{Number(item.price).toFixed(2)}</td>
                      <td className="align-middle">
                        <Badge bg="secondary">{item.quantity}</Badge>
                      </td>
                      <td className="align-middle text-end pe-4">
                        <span className="fw-bold">
                          ₪{Number(item.price * item.quantity).toFixed(2)}
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
                      ₪{Number(orderDetail.price).toFixed(2)}
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
              {orderDetail.tracking.map((track, index) => (
                <div key={index} className="d-flex mb-4 position-relative">
                  <div className="me-3">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center ${
                        track.status_name === 'delivered'
                          ? 'bg-success'
                          : track.status_name === 'shipped'
                          ? 'bg-primary'
                          : 'bg-danger'
                      }`}
                      style={{ width: '40px', height: '40px' }}
                    >
                      <i
                        className={`bi ${
                          track.status_name === 'delivered'
                            ? 'bi-check-circle'
                            : track.status_name === 'shipped'
                            ? 'bi-truck'
                            : 'bi-x-circle'
                        } text-white`}
                      ></i>
                    </div>
                    {index < orderDetail.tracking.length - 1 && (
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
                      {track.status_name.replace('_', ' ')}
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
                <div className="fw-semibold">{orderDetail.user.full_name}</div>
              </div>
              <div className="mb-3">
                <div className="text-muted small mb-1">Email</div>
                <div>{orderDetail.user.email}</div>
              </div>
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
                  {orderDetail.shipping_type?.shipping_type_name.replace('_', ' ')}
                </Badge>
              </div>
              {orderDetail.shipping_address && (
                <>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Address</div>
                    <div>
                      {orderDetail.shipping_address.address}, Apt {orderDetail.shipping_address.apartment_number}
                      , Floor {orderDetail.shipping_address.floor_number}
                    </div>
                    <div>{orderDetail.shipping_address.city}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Phone</div>
                    <div>{orderDetail.shipping_address.phone_number}</div>
                  </div>
                  {orderDetail.shipping_address.comments && (
                    <div>
                      <div className="text-muted small mb-1">Delivery Notes</div>
                      <div className="small">{orderDetail.shipping_address.comments}</div>
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
                  <span className="text-capitalize">{orderDetail.credit_card_brand}</span>
                  <span className="ms-2">****{orderDetail.credit_card_last_four_digits}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};