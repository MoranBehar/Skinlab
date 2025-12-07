import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { adminApi } from '../../services/admin.api';
import { Order } from '../../types/admin.types';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<number>(1);
  const [statusComment, setStatusComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus, searchTerm]);

  const fetchOrders = async () => {
    try {
      const data = await adminApi.getAllOrders();
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status.status_name === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.order_id.toString().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status.status_id);
    setStatusComment('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await adminApi.updateOrderStatus(selectedOrder.order_id, {
        status_id: newStatus,
        comments: statusComment,
      });

      // Refresh orders
      await fetchOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
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

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-dark">
            <i className="bi bi-cart-check me-2"></i>
            Orders Management
          </h2>
          <p className="text-muted">Track and manage all customer orders</p>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by order ID, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="canceled">Canceled</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Orders</p>
                  <h4 className="fw-bold mb-0">{orders.length}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cart-check fs-4 text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Shipped</p>
                  <h4 className="fw-bold mb-0">
                    {orders.filter(o => o.status.status_name === 'shipped').length}
                  </h4>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-truck fs-4 text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Delivered</p>
                  <h4 className="fw-bold mb-0">
                    {orders.filter(o => o.status.status_name === 'delivered').length}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-check-circle fs-4 text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Canceled</p>
                  <h4 className="fw-bold mb-0">
                    {orders.filter(o => o.status.status_name === 'canceled').length}
                  </h4>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="bi bi-x-circle fs-4 text-danger"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3 ps-4">Order ID</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Items</th>
                      <th className="py-3">Total</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.order_id}>
                        <td className="ps-4 align-middle">
                          <span className="fw-semibold">#{order.order_id}</span>
                        </td>
                        <td className="align-middle">
                          <div>
                            <div className="fw-semibold">{order.user.full_name}</div>
                            <div className="text-muted small">{order.user.email}</div>
                          </div>
                        </td>
                        <td className="align-middle">
                          {new Date(order.date_placed).toLocaleDateString('he-IL')}
                        </td>
                        <td className="align-middle">
                          {order.shoppingCart.items.length} items
                        </td>
                        <td className="align-middle">
                          <span className="fw-bold">₪{Number(order.price).toFixed(2)}</span>
                        </td>
                        <td className="align-middle">
                          <Badge bg={getStatusBadgeVariant(order.status.status_name)}>
                            {order.status.status_name.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="align-middle text-end pe-4">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            href={`/admin/orders/${order.order_id}`}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleStatusChange(order)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No orders found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Order #{selectedOrder?.order_id}</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(parseInt(e.target.value))}
            >
              <option value="1">Shipped</option>
              <option value="2">Delivered</option>
              <option value="3">Canceled</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Comments (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              placeholder="Add any notes about this status change..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            <i className="bi bi-check-circle me-2"></i>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};