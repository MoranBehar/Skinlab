import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/admin.api';
import { Product } from '../../types/product.types';
import { ProductFormData } from '../../types/admin.types';

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category_id: 1111,
    price: 0,
    target_audience: 1,
    skin_type: 2221,
    product_type: 30,
    how_to_use: '',
    discount_percentage: 0,
    is_available: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const product = await adminApi.getProductById(parseInt(id!)) as Product;
      setFormData({
        name: product.name,
        description: product.description,
        category_id: (product as any).product.category_id,
        price: product.price,
        target_audience: (product as any).product.target_audience,
        skin_type: (product as any).product.skin_type,
        product_type: (product as any).product.product_type,
        how_to_use: product.how_to_use,
        discount_percentage: product.discount_percentage,
        is_available: product.is_available,
      });
      setPreviewImages(product.images.map((img: any) => img.image_path));
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      is_available: e.target.checked,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      if (isEditMode) {
        await adminApi.updateProduct(parseInt(id!), formDataToSend);
      } else {
        await adminApi.createProduct(formDataToSend);
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-dark">
            <i className="bi bi-box-seam me-2"></i>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-muted">
            {isEditMode ? 'Update product information' : 'Fill in the details to add a new product'}
          </p>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 pt-3">
                <h5 className="fw-bold mb-0">Product Information</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product description"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>How to Use *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="how_to_use"
                    value={formData.how_to_use}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter usage instructions"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₪) *</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="discount_percentage"
                        value={formData.discount_percentage}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 pt-3">
                <h5 className="fw-bold mb-0">Product Images</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Images {!isEditMode && '*'}</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!isEditMode}
                  />
                  <Form.Text className="text-muted">
                    You can upload up to 5 images. First image will be the main product image.
                  </Form.Text>
                </Form.Group>

                {previewImages.length > 0 && (
                  <div className="d-flex gap-2 flex-wrap">
                    {previewImages.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-0 pt-3">
                <h5 className="fw-bold mb-0">Categories</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1111">Daily Routine</option>
                    <option value="1112">Dermo Care</option>
                    <option value="1113">Pro Aging</option>
                    <option value="1114">Sun Protection</option>
                    <option value="1115">Young</option>
                    <option value="1116">Classic</option>
                    <option value="1117">Men</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Skin Type *</Form.Label>
                  <Form.Select
                    name="skin_type"
                    value={formData.skin_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="2221">Normal</option>
                    <option value="2222">Dry</option>
                    <option value="2223">Oily</option>
                    <option value="2224">Combination</option>
                    <option value="2225">Sensitive</option>
                    <option value="2226">Acne Prone</option>
                    <option value="2227">Mature</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Product Type *</Form.Label>
                  <Form.Select
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="30">Cleanser</option>
                    <option value="31">Toner</option>
                    <option value="32">Serum</option>
                    <option value="33">Moisturizer</option>
                    <option value="34">Day Cream</option>
                    <option value="35">Night Cream</option>
                    <option value="36">Eye Cream</option>
                    <option value="37">Sunscreen</option>
                    <option value="38">Exfoliator</option>
                    <option value="39">Mask</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Target Audience *</Form.Label>
                  <Form.Select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">Women</option>
                    <option value="2">Men</option>
                    <option value="3">Teenagers</option>
                    <option value="4">Adults</option>
                    <option value="5">Sensitive Skin</option>
                    <option value="6">All</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Product is available"
                    checked={formData.is_available}
                    onChange={handleCheckboxChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {isEditMode ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </Button>
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};