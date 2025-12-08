import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { adminApi } from '../../services/admin.api';

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  category: { category_name: string };
  images: Array<{ image_path: string }>;
  discount_percentage?: number;
}

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await adminApi.getAllProducts();
      setProducts(data as Product[]);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      await adminApi.deleteProduct(selectedProduct.product_id);
      setProducts(products.filter(p => p.product_id !== selectedProduct.product_id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-dark">
                <i className="bi bi-box-seam me-2"></i>
                Products Management
              </h2>
              <p className="text-muted">Manage your product inventory</p>
            </div>
            <Button variant="primary" size="lg" href="/admin/products/create">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Product
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3 ps-4">Image</th>
                      <th className="py-3">Product</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Price</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.product_id}>
                        <td className="ps-4 align-middle">
                          <img
                            src={product.images[0]?.image_path || '/placeholder.png'}
                            alt={product.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                          />
                        </td>
                        <td className="align-middle">
                          <div>
                            <div className="fw-semibold">{product.name}</div>
                            <div className="text-muted small">
                              {product.description.substring(0, 60)}...
                            </div>
                          </div>
                        </td>
                        <td className="align-middle">
                          <Badge bg="secondary" className="text-capitalize">
                            {product.category.category_name.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="align-middle">
                          <div>
                            <span className="fw-bold">₪{product.price}</span>
                            {product.discount_percentage && (
                              <Badge bg="danger" className="ms-2">
                                -{product.discount_percentage}%
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="align-middle">
                          <Badge bg={product.is_available ? 'success' : 'danger'}>
                            {product.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </td>
                        <td className="align-middle text-end pe-4">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            href={`/admin/products/edit/${product.product_id}`}
                          >
                            <i className="bi bi-pencil"></i>
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <i className="bi bi-trash"></i>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {products.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-box-seam fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No products found</p>
                  <Button variant="primary" href="">
                    Add Your First Product
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? 
          This action will mark the product as unavailable.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <i className="bi bi-trash me-2"></i>
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};