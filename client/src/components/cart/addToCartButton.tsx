import React, { useState } from 'react';
import { Button, Spinner, Toast } from 'react-bootstrap';
import { useCart } from '../../contexts/cartContext';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

interface AddToCartButtonProps {
  productId: number;
  quantity?: number;
  variant?: string;
  size?: 'sm' | 'lg';
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  quantity = 1,
  variant = 'dark',
  size,
  className = '',
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    // Prevent product details from being opened
    e.stopPropagation(); 

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await addToCart(productId, quantity);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleAddToCart}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Adding...
          </>
        ) : (
          '🛒 Add to Cart'
        )}
      </Button>

      {/* Toast */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
        }}
      >
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2000}
          autohide
          bg="success"
        >
          <Toast.Body className="text-white">
            ✅ Added to cart successfully!
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
};

export default AddToCartButton;