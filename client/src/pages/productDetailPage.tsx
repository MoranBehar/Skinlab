import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Spinner, Alert, Carousel } from 'react-bootstrap';
import { productsAPI } from '../services/products.api';
import { Product } from '../types/product.types';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await productsAPI.getProduct(Number(productId));
        setProduct(data);
      } catch (err: any) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Product not found'}</Alert>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </Container>
    );
  }

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const finalPrice = hasDiscount
    ? product.price * (1 - product.discount_percentage! / 100)
    : product.price;

  return (
    <Container className="py-5">
      <Button variant="link" onClick={() => navigate('/products')} className="mb-3">
        ← Back to Products
      </Button>

      <Row>
        {/* Images */}
        <Col md={6}>
          {product.images && product.images.length > 0 ? (
            <Carousel>
              {product.images.map((image) => (
                <Carousel.Item key={image.image_id}>
                  <img
                    className="d-block w-100"
                    src={image.image_path}
                    alt={product.name}
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <img
              src="https://via.placeholder.com/500x500?text=No+Image"
              alt={product.name}
              className="w-100"
            />
          )}
        </Col>

        {/* Product Info */}
        <Col md={6}>
          <h1>{product.name}</h1>

          {/* Badges */}
          <div className="mb-3">
            <Badge bg="secondary" className="me-2">
              {product.category.category_name.replace(/_/g, ' ')}
            </Badge>
            <Badge bg="info" className="me-2">
              {product.skin_type_rel.skin_type_name}
            </Badge>
            <Badge bg="success">
              {product.target_audience_rel.audience_name.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="mb-3">
              {'⭐'.repeat(product.rating)}
              <span className="text-muted ms-2">({product.rating}/5)</span>
            </div>
          )}

          {/* Price */}
          <div className="mb-4">
            {hasDiscount ? (
              <>
                <h3 className="d-inline text-danger">₪{finalPrice.toFixed(2)}</h3>
                <span className="text-decoration-line-through text-muted ms-3 fs-5">
                  ₪{product.price.toFixed(2)}
                </span>
                <Badge bg="danger" className="ms-3">
                  Save {product.discount_percentage}%
                </Badge>
              </>
            ) : (
              <h3>₪{product.price.toFixed(2)}</h3>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <h5>Description</h5>
            <p>{product.description}</p>
          </div>

          {/* How to Use */}
          <div className="mb-4">
            <h5>How to Use</h5>
            <p>{product.how_to_use}</p>
          </div>

          {/* Product Type */}
          <div className="mb-4">
            <p className="mb-1">
              <strong>Product Type:</strong> {product.product_type_rel.product_type_name.replace(/_/g, ' ')}
            </p>
            <p className="mb-1">
              <strong>Skin Type:</strong> {product.skin_type_rel.skin_type_name}
            </p>
            <p className="mb-1">
              <strong>Category:</strong> {product.category.category_name.replace(/_/g, ' ')}
            </p>
          </div>

          {/* Add to Cart Button */}
          <Button variant="dark" size="lg" className="w-100">
            Add to Cart
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;