import React, { useState } from 'react';
import { Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { useCart } from '../../contexts/cartContext';
import { CartItem as CartItemType } from '../../types/cart.types';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(false);

  const { product, quantity } = item;
  const imageUrl = product.images?.[0]?.image_path || 'https://via.placeholder.com/100';

  // Price calculations
  const discount = product.discount_percentage || 0;
  const originalPrice = product.price;
  const finalPrice = originalPrice * (1 - discount / 100);
  const itemTotal = finalPrice * quantity;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setLoading(true);
    try {
      await updateQuantity(product.product_id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeItem(product.product_id);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="py-3 border-bottom align-items-center">
      {/* image */}
      <Col xs={3} md={2}>
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      </Col>

      {/* product details */}
      <Col xs={9} md={4}>
        <h6 className="mb-1">{product.name}</h6>
        <small className="text-muted">
          {product.category.category_name.replace(/_/g, ' ')}
        </small>
        {discount > 0 && (
          <div className="mt-1">
            <span className="badge bg-danger">{discount}% OFF</span>
          </div>
        )}
      </Col>

      {/* price */}
      <Col xs={6} md={2} className="text-center">
        {discount > 0 ? (
          <>
            <div className="text-decoration-line-through text-muted small">
              ₪{Number(originalPrice).toFixed(2)}
            </div>
            <div className="fw-bold text-danger">₪{finalPrice.toFixed(2)}</div>
          </>
        ) : (
          <div className="fw-bold">₪{Number(originalPrice).toFixed(2)}</div>
        )}
      </Col>

      {/* quantity */}
      <Col xs={6} md={2}>
        <div className="d-flex align-items-center justify-content-center">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={loading || quantity <= 1}
          >
            −
          </Button>
          <Form.Control
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value))}
            disabled={loading}
            className="mx-2 text-center"
            style={{ width: '60px' }}
            min="1"
          />
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={loading}
          >
            +
          </Button>
        </div>
      </Col>

      {/* summery and actions */}
      <Col xs={12} md={2} className="text-center text-md-end mt-2 mt-md-0">
        <div className="fw-bold mb-2">₪{itemTotal.toFixed(2)}</div>
        <Button
          variant="link"
          size="sm"
          className="text-danger p-0"
          onClick={handleRemove}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : '🗑️ Remove'}
        </Button>
      </Col>
    </Row>
  );
};

export default CartItem;
