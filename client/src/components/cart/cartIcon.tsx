import React from 'react';
import { Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/cartContext';

const CartIcon: React.FC = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <div
      onClick={() => navigate('/cart')}
      style={{
        position: 'relative',
        cursor: 'pointer',
        fontSize: '1.5rem',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      <i className="bi bi-cart3" />
      {cartCount > 0 && (
        <Badge
          bg="danger"
          pill
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            fontSize: '0.7rem',
          }}
        >
          {cartCount}
        </Badge>
      )}
    </div>
  );
};

export default CartIcon;
