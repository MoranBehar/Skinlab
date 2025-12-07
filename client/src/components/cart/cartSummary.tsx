import React from 'react';
import { Card, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CartSummary as CartSummaryType } from '../../types/cart.types';

interface CartSummaryProps {
  summary: CartSummaryType;
}

const CartSummary: React.FC<CartSummaryProps> = ({ summary }) => {
  const navigate = useNavigate();

  return (
    <Card className="sticky-top" style={{ top: '20px' }}>
      <Card.Body>
        <h5 className="mb-3">Order Summary</h5>

        <ListGroup variant="flush">
          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Items ({summary.totalItems}):</span>
            <span>₪{summary.subtotal.toFixed(2)}</span>
          </ListGroup.Item>

          <ListGroup.Item className="d-flex justify-content-between px-0">
            <span>Tax (18%):</span>
            <span>₪{Number(summary.tax).toFixed(2)}</span>
          </ListGroup.Item>

          <ListGroup.Item className="d-flex justify-content-between px-0 border-top border-2">
            <strong>Total:</strong>
            <strong className="text-primary fs-5">
              ₪{Number(summary.total).toFixed(2)}
            </strong>
          </ListGroup.Item>
        </ListGroup>

        <Button
          variant="dark"
          size="lg"
          className="w-100 mt-3"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </Button>

        <Button
          variant="outline-secondary"
          className="w-100 mt-2"
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CartSummary;