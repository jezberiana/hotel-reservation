import React, { useState } from 'react';

const Payment = ({ bookingData, user, currency, onPaymentComplete, onBack }) => {
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    gcashNumber: '',
    payMayaNumber: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      // Simulate payment API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Here you would integrate with actual payment gateways like:
      // - PayMongo (Philippines)
      // - Stripe
      // - PayPal
      // - GCash API
      // - PayMaya API
      
      const paymentResult = {
        success: true,
        transactionId: `TXN-${Date.now()}`,
        amount: bookingData.totalPrice,
        method: paymentData.paymentMethod,
        timestamp: new Date().toISOString()
      };

      onPaymentComplete(paymentResult);
    } catch (err) {
      setError('Payment failed. Please try again or use a different payment method.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isPaymentValid = () => {
    if (paymentData.paymentMethod === 'credit_card') {
      return paymentData.cardNumber && 
             paymentData.cardName && 
             paymentData.expiryDate && 
             paymentData.cvv;
    } else if (paymentData.paymentMethod === 'gcash') {
      return paymentData.gcashNumber;
    } else if (paymentData.paymentMethod === 'paymaya') {
      return paymentData.payMayaNumber;
    } else if (paymentData.paymentMethod === 'bank_transfer') {
      return true;
    }
    return false;
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Booking
        </button>
        <h1>🏨 Complete Your Payment</h1>
        <p>Secure payment for your hotel reservation</p>
      </div>

      <div className="payment-content">
        {/* Booking Summary Card */}
        <div className="booking-summary-card">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <div className="guest-info">
              <h4>Guest Information</h4>
              <p><strong>{user.firstName} {user.lastName}</strong></p>
              <p>{user.email}</p>
              <p>{user.phone}</p>
            </div>
            
            <div className="reservation-info">
              <h4>Reservation Details</h4>
              <p><strong>Room:</strong> {bookingData.roomName}</p>
              <p><strong>Check-in:</strong> {bookingData.checkIn}</p>
              <p><strong>Check-out:</strong> {bookingData.checkOut}</p>
              <p><strong>Guests:</strong> {bookingData.guests}</p>
              <p><strong>Nights:</strong> {bookingData.nights}</p>
            </div>

            <div className="price-breakdown">
              <h4>Price Breakdown</h4>
              {bookingData.priceBreakdown.map((item, index) => (
                <div key={index} className="price-item">
                  <span>{item.description}</span>
                  <span>{currency?.symbol || '₱'}{item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="total-amount">
                <span><strong>Total Amount</strong></span>
                <span><strong>{currency?.symbol || '₱'}{bookingData.totalPrice.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="payment-form-card">
          <h3>Payment Information</h3>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label htmlFor="paymentMethod" className="form-label">Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={paymentData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="credit_card">Credit/Debit Card</option>
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {paymentData.paymentMethod === 'credit_card' && (
              <div className="card-payment-section">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="cardNumber" className="form-label">Card Number *</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cardName" className="form-label">Cardholder Name *</label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={paymentData.cardName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="expiryDate" className="form-label">Expiry Date *</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv" className="form-label">CVV *</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="123"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentData.paymentMethod === 'gcash' && (
              <div className="digital-payment-section">
                <div className="payment-logo">
                  <h4>💙 GCash Payment</h4>
                  <p>Pay securely using your GCash account</p>
                </div>
                <div className="form-group">
                  <label htmlFor="gcashNumber" className="form-label">GCash Mobile Number *</label>
                  <input
                    type="tel"
                    id="gcashNumber"
                    name="gcashNumber"
                    value={paymentData.gcashNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="09XX XXX XXXX"
                    required
                  />
                </div>
              </div>
            )}

            {paymentData.paymentMethod === 'paymaya' && (
              <div className="digital-payment-section">
                <div className="payment-logo">
                  <h4>💚 PayMaya Payment</h4>
                  <p>Pay securely using your PayMaya account</p>
                </div>
                <div className="form-group">
                  <label htmlFor="payMayaNumber" className="form-label">PayMaya Mobile Number *</label>
                  <input
                    type="tel"
                    id="payMayaNumber"
                    name="payMayaNumber"
                    value={paymentData.payMayaNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="09XX XXX XXXX"
                    required
                  />
                </div>
              </div>
            )}

            {paymentData.paymentMethod === 'bank_transfer' && (
              <div className="bank-transfer-section">
                <div className="payment-info-box">
                  <h4>🏦 Bank Transfer Details</h4>
                  <div className="bank-details">
                    <p><strong>Bank:</strong> BDO Unibank</p>
                    <p><strong>Account Name:</strong> LuxuryStay Hotel Corp</p>
                    <p><strong>Account Number:</strong> 1234-5678-9012</p>
                    <p><strong>Swift Code:</strong> BNORPHMM</p>
                    <p><strong>Amount:</strong> {currency?.symbol || '₱'}{bookingData.totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="bank-instructions">
                    <p>Please transfer the exact amount and email the receipt to:</p>
                    <p><strong>reservations@luxurystay.ph</strong></p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="security-notice">
              <div className="security-icon">🔒</div>
              <div className="security-text">
                <p><strong>Your payment is secure</strong></p>
                <p>All transactions are encrypted and protected by industry-standard security measures.</p>
              </div>
            </div>

            {/* Payment Button */}
            <button
              type="submit"
              className="payment-btn"
              disabled={!isPaymentValid() || isProcessing}
            >
              {isProcessing ? (
                '🔄 Processing Payment...'
              ) : (
                `💳 Pay ${currency?.symbol || '₱'}${bookingData.totalPrice.toLocaleString()}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
