import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetails } from '../hooks/useOrders';
import OrderStatusBadge from '../components/orders/orderStatusBadge';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, tracking, loading, error, updateStatus } = useOrderDetails(Number(orderId));

  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [canceling, setCanceling] = useState<boolean>(false);

  
  const handleCancelOrder = async () => {
    try {
      setCanceling(true);
      await updateStatus(3, 'Canceled by customer');
      setShowCancelModal(false);
    } catch (err: any) {
      // Error is handled by the hook
    } finally {
      setCanceling(false);
    }
  };

  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error || 'Order not found'}
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/orders')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Orders
        </button>
      </div>
    );
  }

  const canCancel = order.status_name.toLowerCase() === 'shipped';

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="mb-4">
        <button 
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate('/orders')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Orders
        </button>
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Order Summary */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Order #{order.order_id}</h4>
                <OrderStatusBadge statusName={order.status_name} />
              </div>
              <p className="text-muted mb-4">
                <i className="bi bi-calendar3 me-2"></i>
                Placed on {formatDate(order.date_placed)}
              </p>

              {/* Order Items */}
              <h5 className="mt-4 mb-3 fw-bold">Order Items</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.product_id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.image_path && (
                              <img
                                src={item.image_path}
                                alt={item.product_name}
                                className="me-3 rounded"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              />
                            )}
                            <span className="fw-medium">{item.product_name}</span>
                          </div>
                        </td>
                        <td className="text-center align-middle">{item.quantity}</td>
                        <td className="text-end align-middle">₪{Number(item.price).toFixed(2)}</td>
                        <td className="text-end align-middle fw-bold">
                          ₪{Number(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={3} className="text-end fw-bold fs-5">Total</td>
                      <td className="text-end fw-bold text-primary fs-5">
                        ₪{Number(order.price).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Order Tracking */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4">
                <i className="bi bi-geo-alt me-2"></i>
                Order Tracking
              </h5>
              <div className="timeline">
                {tracking.map((track, index) => (
                  <div key={index} className="d-flex mb-4 position-relative">
                    <div className="me-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '45px', 
                          height: '45px',
                          backgroundColor: track.status_name.toLowerCase() === 'delivered' ? '#198754' :
                                          track.status_name.toLowerCase() === 'shipped' ? '#0dcaf0' :
                                          track.status_name.toLowerCase() === 'canceled' ? '#dc3545' : '#6c757d',
                          color: 'white'
                        }}
                      >
                        <i className="bi bi-check-lg fs-5"></i>
                      </div>
                      {index < tracking.length - 1 && (
                        <div 
                          style={{ 
                            width: '2px', 
                            height: '50px', 
                            backgroundColor: '#dee2e6',
                            marginLeft: '21px',
                            marginTop: '5px'
                          }}
                        ></div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold">
                        <OrderStatusBadge statusName={track.status_name} />
                      </h6>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {formatDate(track.date)}
                      </small>
                      {track.comments && (
                        <p className="text-muted mb-0 mt-2">
                          <em>{track.comments}</em>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Shipping Info */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">
                <i className="bi bi-truck me-2"></i>
                Shipping Information
              </h6>
              <p className="mb-2 text-capitalize">
                <i className="bi bi-box-seam me-2 text-muted"></i>
                {order.shipping_type_name.replace(/_/g, ' ')}
              </p>
              {order.shipping_address && (
                <div className="mt-3 p-3 bg-light rounded">
                  <strong className="d-block mb-2">Delivery Address:</strong>
                  <p className="mb-0 small">
                    <i className="bi bi-house-door me-2"></i>
                    {order.shipping_address.address}<br />
                    <i className="bi bi-building me-2"></i>
                    Apt {order.shipping_address.apartment_number}, Floor {order.shipping_address.floor_number}<br />
                    <i className="bi bi-geo-alt me-2"></i>
                    {order.shipping_address.city}<br />
                    <i className="bi bi-telephone me-2"></i>
                    {order.shipping_address.phone_number}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">
                <i className="bi bi-credit-card me-2"></i>
                Payment Information
              </h6>
              <div className="d-flex align-items-center">
                <i className="bi bi-credit-card-2-front fs-4 me-3 text-primary"></i>
                <div>
                  <div className="fw-medium">{order.credit_card_brand}</div>
                  <small className="text-muted">
                    •••• •••• •••• {order.credit_card_last_four_digits}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Order Button */}
          {canCancel && (
            <div className="card shadow-sm border-danger">
              <div className="card-body">
                <h6 className="card-title text-danger fw-bold mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Cancel Order
                </h6>
                <p className="small text-muted mb-3">
                  You can cancel this order while it's being shipped.
                </p>
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={() => setShowCancelModal(true)}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel This Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={() => !canceling && setShowCancelModal(false)}
          ></div>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                    Cancel Order?
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowCancelModal(false)}
                    disabled={canceling}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-0">
                    Are you sure you want to cancel order <strong>#{order.order_id}</strong>? 
                    This action cannot be undone
                  </p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCancelModal(false)}
                    disabled={canceling}
                  >
                    No, Keep Order
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleCancelOrder}
                    disabled={canceling}
                  >
                    {canceling ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Canceling...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-x-circle me-2"></i>
                        Yes, Cancel Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetails;