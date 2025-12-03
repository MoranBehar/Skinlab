import React from 'react';
import { Pagination } from 'react-bootstrap';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // If there are few pages, display all
      for (let index = 1; index <= totalPages; index++) {
        pages.push(index);
      }
    } else {
      // Always show the first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      //Pages around the current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show the last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <Pagination>
        <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={handlePrevious} disabled={currentPage === 1} />

        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <Pagination.Item
              key={index}
              active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Pagination.Item>
          ) : (
            <Pagination.Ellipsis key={index} disabled />
          )
        ))}

        <Pagination.Next onClick={handleNext} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    </div>
  );
};

export default ProductPagination;