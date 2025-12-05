import React from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/cartContext';
import { useAuth } from '../contexts/authContext';
import CartItemComponent from '../components/cart/cartItem';
import CartSummary from '../components/cart/cartSummary';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Please Login</Alert.Heading>
          <p>You need to be logged in to view your cart.</p>
          <Button variant="dark" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        alert('Failed to clear cart');
      }
    }
  };

  const isEmpty = !cart || !cart.cart.items || cart.cart.items.length === 0;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Shopping Cart</h2>
        </Col>
        {!isEmpty && (
          <Col xs="auto">
            <Button variant="outline-danger" size="sm" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </Col>
        )}
      </Row>

      {isEmpty ? (
        <Card className="text-center py-5">
          <Card.Body>
            <div style={{ fontSize: '4rem' }}>🛒</div>
            <h4 className="mt-3">Your cart is empty</h4>
            <p className="text-muted">Add some products to get started!</p>
            <Button variant="dark" onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {/* Cart Items */}
          <Col lg={8}>
            <Card>
              <Card.Body>
                {cart.cart.items.map((item) => (
                  <CartItemComponent key={item.product_id} item={item} />
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Cart Summary */}
          <Col lg={4}>
            <CartSummary summary={cart.summary} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;