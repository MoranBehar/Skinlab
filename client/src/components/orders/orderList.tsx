import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types/order.types';
import OrderStatusBadge from './orderStatusBadge';

interface OrderListProps {
  orders: Order[];
}


const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  const navigate = useNavigate();

  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (orders.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        No orders to display
      </div>
    );
  }

  return (
    <div className="order-list">
      {orders.map((order) => (
        <div 
          key={order.order_id} 
          className="card shadow-sm mb-3"
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigate(`/orders/${order.order_id}`)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div className="card-body">
            <div className="row align-items-center">
              {/* Order Number & Date */}
              <div className="col-md-3 mb-2 mb-md-0">
                <h6 className="mb-0 fw-bold">Order #{order.order_id}</h6>
                <small className="text-muted">
                  <i className="bi bi-calendar3 me-1"></i>
                  {formatDate(order.date_placed)}
                </small>
              </div>

              {/* Status Badge */}
              <div className="col-md-2 mb-2 mb-md-0">
                <OrderStatusBadge statusName={order.status_name} />
              </div>

              {/* Number of Items */}
              <div className="col-6 col-md-2 mb-2 mb-md-0">
                <small className="text-muted d-block">Items</small>
                <span className="fw-bold">
                  {order.items.length}
                </span>
              </div>

              {/* Total Price */}
              <div className="col-6 col-md-2 mb-2 mb-md-0">
                <small className="text-muted d-block">Total</small>
                <span className="text-primary fw-bold fs-5">
                  ₪{Number(order.price).toFixed(2)}
                </span>
              </div>

              {/* Shipping Type */}
              <div className="col-md-2 mb-2 mb-md-0">
                <small className="text-muted d-block">Shipping</small>
                <small className="text-capitalize">
                  {order.shipping_type_name.replace(/_/g, ' ')}
                </small>
              </div>

              {/* Arrow Icon */}
              <div className="col-md-1 text-end">
                <i className="bi bi-chevron-right text-muted"></i>
              </div>
            </div>

            {/* Order Items Preview */}
            {order.items.length > 0 && (
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <span 
                      key={item.product_id}
                      className="badge bg-light text-dark border"
                    >
                      {item.product_name} ({item.quantity})
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="badge bg-secondary">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderList;