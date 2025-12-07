import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import OrderList from '../components/orders/orderList';

const UserOrders: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, error, fetchOrders } = useOrders();

  
  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button 
          className="btn btn-primary"
          onClick={fetchOrders}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <i className="bi bi-receipt" style={{ fontSize: '5rem', color: '#6c757d' }}></i>
          <h3 className="mt-4">No Orders Yet</h3>
          <p className="text-muted">You haven't placed any orders yet</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/products')}
          >
            <i className="bi bi-shop me-2"></i>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-bag-check me-2"></i>
          My Orders
        </h2>
        <span className="badge bg-secondary">{orders.length} Orders</span>
      </div>

      <OrderList orders={orders} />
    </div>
  );
};

export default UserOrders;