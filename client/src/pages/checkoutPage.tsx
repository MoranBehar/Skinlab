import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { CreateOrderRequest } from '../types/order.types';
import { useCart } from '../contexts/cartContext';
import { ShippingAddressForm } from '../types/checkout.types'

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { createOrder } = useOrders();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form state
  const [shippingType, setShippingType] = useState<number>(1);
  const [cardBrand, setCardBrand] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressForm>({
    address: '',
    apartment_number: 0,
    floor_number: 0,
    city: '',
    phone_number: '',
    comments: '',
  });

  const homeDeliveryType = 1;
  const pickupType = 112;

  // Format card number with spaces (1234 5678 9012 3456)
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };


  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    
    // Only allow digits
    if (!/^\d*$/.test(value)) {
      return;
    }
    
    if (value.length <= 16) {
      setCardNumber(value);
    }
  };


  const handleShippingTypeChange = (type: number) => {
    setShippingType(type);
    
    // Reset address if switching to pickup
    if (type === pickupType) {
      setShippingAddress({
        address: '',
        apartment_number: 0,
        floor_number: 0,
        city: '',
        phone_number: '',
        comments: '',
      });
    }
  };
  
  const handleAddressChange = (field: keyof ShippingAddressForm, value: string | number) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!cardBrand.trim()) {
      setError('Please enter card brand');
      return;
    }

    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    if (cleanCardNumber.length !== 16) {
      setError('Please enter a valid 16 digits card number');
      return;
    }

    if (!/^\d{16}$/.test(cleanCardNumber)) {
      setError('Card number must contain only digits');
      return;
    }

    // Validate shipping address if home delivery
    if (shippingType === homeDeliveryType) {
      if (!shippingAddress.address.trim()) {
        setError('Please enter your address');
        return;
      }

      if (!shippingAddress.city.trim()) {
        setError('Please enter your city');
        return;
      }

      if (!shippingAddress.phone_number.trim()) {
        setError('Please enter your phone number');
        return;
      }

      if (shippingAddress.apartment_number <= 0) {
        setError('Please enter a valid apartment number');
        return;
      }

      if (shippingAddress.floor_number < 0) {
        setError('Please enter a valid floor number');
        return;
      }
    }

    setLoading(true);

    try {
      // Extract last 4 digits
      const lastFourDigits = cleanCardNumber.slice(-4);

      const orderData: CreateOrderRequest = {
        shipping_type_id: shippingType,
        credit_card_brand: cardBrand,
        credit_card_last_four_digits: lastFourDigits,
        shipping_address: ((shippingType === homeDeliveryType) ? shippingAddress : undefined)
      };

      const order = await createOrder(orderData);

      await clearCart();
      
      // Navigate to order confirmation page
      navigate(`/orders/${order.order_id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
      setLoading(false);
    }
  };


  if (cartLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // If cart is empty or unavailable, show message
  if (!cart || cart.summary.totalItems === 0) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-info">
              <h4 className="alert-heading">Your cart is empty</h4>
              <p>Please add items to your cart before checking out</p>
              <hr />
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/products')}
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">
        <i className="bi bi-cart-check me-2"></i>
        Checkout
      </h2>

      <div className="row">
        {/* Order Summary */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Items:</span>
                <span className="fw-bold">{cart.summary.totalItems}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span>₪{Number(cart.summary.subtotal).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax (18%):</span>
                <span>₪{Number(cart.summary.tax).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="text-primary fs-4">₪{Number(cart.summary.total).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Payment & Shipping</h5>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError('')}
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Shipping Type */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-truck me-2"></i>
                    Shipping Method
                  </label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="shippingType"
                      id="homeDelivery"
                      value={homeDeliveryType}
                      checked={shippingType === homeDeliveryType}
                      onChange={(e) => handleShippingTypeChange(Number(e.target.value))}
                    />
                    <label className="form-check-label" htmlFor="homeDelivery">
                      Home Delivery
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="shippingType"
                      id="pickup"
                      value={pickupType}
                      checked={shippingType === pickupType}
                      onChange={(e) => handleShippingTypeChange(Number(e.target.value))}
                    />
                    <label className="form-check-label" htmlFor="pickup">
                      Pickup at Store
                    </label>
                  </div>
                </div>

                {/* Shipping Address - Only show if Home Delivery */}
                {shippingType === homeDeliveryType && (
                  <div className="mb-4 p-3 border rounded bg-light">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-geo-alt me-2"></i>
                      Delivery Address
                    </h6>
                    
                    <div className="row">
                      <div className="col-md-8 mb-3">
                        <label htmlFor="address" className="form-label">
                          Street Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          placeholder="Enter your street address"
                          value={shippingAddress.address}
                          onChange={(e) => handleAddressChange('address', e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label htmlFor="city" className="form-label">
                          City <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="apartmentNumber" className="form-label">
                          Apartment # <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="apartmentNumber"
                          placeholder="Apt"
                          min="1"
                          value={shippingAddress.apartment_number || ''}
                          onChange={(e) => handleAddressChange('apartment_number', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label htmlFor="floorNumber" className="form-label">
                          Floor # <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="floorNumber"
                          placeholder="Floor"
                          min="0"
                          value={shippingAddress.floor_number || ''}
                          onChange={(e) => handleAddressChange('floor_number', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label htmlFor="phoneNumber" className="form-label">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phoneNumber"
                          placeholder="05X-XXX-XXXX"
                          value={shippingAddress.phone_number}
                          onChange={(e) => handleAddressChange('phone_number', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="comments" className="form-label">
                        Delivery Instructions (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="comments"
                        rows={2}
                        placeholder="Any special delivery instructions..."
                        value={shippingAddress.comments}
                        onChange={(e) => handleAddressChange('comments', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="mb-4">
                  <h6 className="fw-bold">
                    <i className="bi bi-credit-card me-2"></i>
                    Payment Details
                  </h6>
                  
                  <div className="mb-3">
                    <label htmlFor="cardBrand" className="form-label">
                      Card Brand <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="cardBrand"
                      placeholder="Visa, Mastercard, etc."
                      value={cardBrand}
                      onChange={(e) => setCardBrand(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="cardNumber" className="form-label">
                      Credit Card Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(cardNumber)}
                      onChange={handleCardNumberChange}
                      required
                    />
                    <div className="form-text">
                      Enter your credit card number
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Place Order - ₪{Number(cart.summary.total).toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;