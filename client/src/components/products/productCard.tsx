import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/product.types';
import AddToCartButton from '../cart/addToCartButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const finalPrice = hasDiscount
    ? Number(product.price) * (1 - product.discount_percentage! / 100)
    : Number(product.price);

  const imageUrl = product.images?.[0]?.image_path || 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <Card 
      className="h-100 product-card" 
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/products/${product.product_id}`)}
    >
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Discount Badge */}
        {hasDiscount && (
          <Badge
            bg="danger"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '0.9rem',
            }}
          >
            -{product.discount_percentage}%
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        {/* Product Name */}
        <Card.Title className="mb-2" style={{ fontSize: '1.1rem' }}>
          {product.name}
        </Card.Title>

        {/* Category & Skin Type */}
        <div className="mb-2">
          <Badge bg="secondary" className="me-2">
            {product.category.category_name.replace('_', ' ')}
          </Badge>
          <Badge bg="info">
            {product.skin_type_rel.skin_type_name}
          </Badge>
        </div>

        {/* Description */}
        <Card.Text className="text-muted small flex-grow-1" style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {product.description}
        </Card.Text>

        {/* Rating */}
        {product.rating && (
          <div className="mb-2">
            {'⭐'.repeat(product.rating)}
            <span className="text-muted ms-2">({product.rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto">
          {hasDiscount ? (
            <>
              <span className="text-decoration-line-through text-muted me-2">
                ₪{Number(product.price).toFixed(2)}
              </span>
              <span className="fw-bold text-danger fs-5">
                ₪{Number(finalPrice).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="fw-bold fs-5">₪{Number(product.price).toFixed(2)}</span>
          )}


          {/* check for place */}
          <AddToCartButton 
            productId={product.product_id} 
            className="w-100"
          />

          
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;