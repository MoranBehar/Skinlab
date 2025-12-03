import React, { useState } from 'react';
import { Card, Form, Button, Accordion } from 'react-bootstrap';
import { FilterOptions } from '../../types/product.types';

interface ProductFiltersProps {
  filterOptions: FilterOptions;
  currentFilters: {
    category_id?: number;
    skin_type?: number;
    target_audience?: number;
    product_type?: number;
    min_price?: number;
    max_price?: number;
    search?: string;
  };
  onFilterChange: (filters: any) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filterOptions,
  currentFilters,
  onFilterChange,
}) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const handleChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      category_id: undefined,
      skin_type: undefined,
      target_audience: undefined,
      product_type: undefined,
      min_price: undefined,
      max_price: undefined,
      search: '',
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Filters</h5>
          <Button variant="link" size="sm" onClick={handleReset}>
            Reset All
          </Button>
        </div>

        <Accordion defaultActiveKey={['0', '1', '2']} alwaysOpen>
          {/* Search */}
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={localFilters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>Category</Accordion.Header>
            <Accordion.Body>
              <Form.Select
                value={localFilters.category_id || ''}
                onChange={(e) => handleChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name.replace(/_/g, ' ')}
                  </option>
                ))}
              </Form.Select>
            </Accordion.Body>
          </Accordion.Item>

          {/* Skin Type Filter */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>Skin Type</Accordion.Header>
            <Accordion.Body>
              <Form.Select
                value={localFilters.skin_type || ''}
                onChange={(e) => handleChange('skin_type', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Skin Types</option>
                {filterOptions.skinTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name.replace(/_/g, ' ')}
                  </option>
                ))}
              </Form.Select>
            </Accordion.Body>
          </Accordion.Item>

          {/* Target Audience Filter */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>Target Audience</Accordion.Header>
            <Accordion.Body>
              <Form.Select
                value={localFilters.target_audience || ''}
                onChange={(e) => handleChange('target_audience', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All</option>
                {filterOptions.targetAudiences.map((audience) => (
                  <option key={audience.id} value={audience.id}>
                    {audience.name.replace(/_/g, ' ')}
                  </option>
                ))}
              </Form.Select>
            </Accordion.Body>
          </Accordion.Item>

          {/* Product Type Filter */}
          <Accordion.Item eventKey="3">
            <Accordion.Header>Product Type</Accordion.Header>
            <Accordion.Body>
              <Form.Select
                value={localFilters.product_type || ''}
                onChange={(e) => handleChange('product_type', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Types</option>
                {filterOptions.productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name.replace(/_/g, ' ')}
                  </option>
                ))}
              </Form.Select>
            </Accordion.Body>
          </Accordion.Item>

          {/* Price Range Filter */}
          <Accordion.Item eventKey="4">
            <Accordion.Header>Price Range</Accordion.Header>
            <Accordion.Body>
              <div className="mb-2">
                <Form.Label className="small">Min Price (₪)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={localFilters.min_price || ''}
                  onChange={(e) => handleChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
              </div>
              <div>
                <Form.Label className="small">Max Price (₪)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="1000"
                  value={localFilters.max_price || ''}
                  onChange={(e) => handleChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default ProductFilters;