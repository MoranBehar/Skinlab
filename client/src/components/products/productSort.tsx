import React from 'react';
import { Form } from 'react-bootstrap';
import { SortBy } from '../../types/product.types';

interface ProductSortProps {
  currentSort: SortBy;
  onSortChange: (sort: SortBy) => void;
}

const ProductSort: React.FC<ProductSortProps> = ({ currentSort, onSortChange }) => {
  return (
    <Form.Select
      value={currentSort}
      onChange={(e) => onSortChange(e.target.value as SortBy)}
      style={{ width: 'auto' }}
    >
      <option value={SortBy.NEWEST}>Newest First</option>
      <option value={SortBy.PRICE_ASC}>Price: Low to High</option>
      <option value={SortBy.PRICE_DESC}>Price: High to Low</option>
      <option value={SortBy.RATING_DESC}>Highest Rated</option>
      <option value={SortBy.NAME_ASC}>Name: A to Z</option>
    </Form.Select>
  );
};

export default ProductSort;