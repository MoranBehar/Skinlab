import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { productsAPI } from '../services/products.api';
import { Product, FilterOptions, SortBy } from '../types/product.types';
import ProductCard from '../components/products/productCard';
import ProductFilters from '../components/products/productFilters';
import ProductSort from '../components/products/productSort';
import ProductPagination from '../components/products/productPagination';
import { useNavigate } from 'react-router-dom';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to filters
  const [filters, setFilters] = useState({
    category_id: undefined as number | undefined,
    skin_type: undefined as number | undefined,
    target_audience: undefined as number | undefined,
    product_type: undefined as number | undefined,
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined,
    search: '',
  });

  // State to sorting and pagination
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.NEWEST);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // loading filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await productsAPI.getFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };

    loadFilterOptions();
  }, []);

  // loading products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getProducts({
          ...filters,
          sort_by: sortBy,
          page: currentPage,
          limit: 12,
        });
        setProducts(response.products);
        setTotalPages(response.pagination.totalPages);
        setTotalProducts(response.pagination.total);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters, sortBy, currentPage]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // back to first page
  };

  const handleSortChange = (newSort: SortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Sidebar - Filters */}
        <Col lg={3} md={4} className="mb-4">
          {filterOptions && (
            <ProductFilters
              filterOptions={filterOptions}
              currentFilters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </Col>

        {/* Main Content - Products Grid */}
        <Col lg={9} md={8}>
          {/* Header */}
          <Row className="mb-4 align-items-center">
            <Col>
              <h2>Our Products</h2>
              <p className="text-muted">
                {totalProducts} products found
              </p>
            </Col>
            <Col xs="auto">
              <ProductSort currentSort={sortBy} onSortChange={handleSortChange} />
            </Col>
          </Row>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <>
              <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
                {products.map((product) => (
                  <Col key={product.product_id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              {/* No Results */}
              {products.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">No products found matching your criteria.</p>
                </div>
              )}

              {/* Pagination */}
              {products.length > 0 && (
                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductsPage;
