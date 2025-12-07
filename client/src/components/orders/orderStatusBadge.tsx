import React from 'react';

interface OrderStatusBadgeProps {
  statusName: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ statusName }) => {
  
  const getBadgeClass = (status: string): string => {
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
    
    switch (normalizedStatus) {
      case 'shipped':
        return 'bg-info text-white';
      case 'delivered':
        return 'bg-success text-white';
      case 'canceled':
      case 'cancelled':
        return 'bg-danger text-white';
      case 'pending':
        return 'bg-warning text-dark';
      case 'processing':
        return 'bg-primary text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  
  const getIcon = (status: string): string => {
    const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');
    
    switch (normalizedStatus) {
      case 'shipped':
        return 'bi-truck';
      case 'delivered':
        return 'bi-check-circle-fill';
      case 'canceled':
      case 'cancelled':
        return 'bi-x-circle-fill';
      case 'pending':
        return 'bi-clock-fill';
      case 'processing':
        return 'bi-arrow-repeat';
      default:
        return 'bi-circle-fill';
    }
  };

  const formattedStatus = statusName.replace(/_/g, ' ');
  const badgeClass = getBadgeClass(statusName);
  const icon = getIcon(statusName);

  return (
    <span className={`badge ${badgeClass}`}>
      <i className={`bi ${icon} me-1`}></i>
      <span className="text-capitalize">{formattedStatus}</span>
    </span>
  );
};

export default OrderStatusBadge;