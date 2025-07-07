import React from 'react';

const PaymentSuccess = ({ paymentResult, bookingData, user, currency, onNewBooking }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Here you would implement PDF generation
    alert('PDF download feature would be implemented here');
  };

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Payment Successful!</h1>
          <p>Your hotel reservation has been confirmed</p>
        </div>

        <div className="confirmation-details">
          <div className="confirmation-number">
            <h3>Confirmation Number</h3>
            <div className="conf-number">{paymentResult.transactionId}</div>
          </div>

          <div className="booking-details">
            <h3>Booking Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Guest Name:</span>
                <span className="value">{user.firstName} {user.lastName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{user.phone}</span>
              </div>
              <div className="detail-item">
                <span className="label">Room Type:</span>
                <span className="value">{bookingData.roomName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Check-in:</span>
                <span className="value">{bookingData.checkIn}</span>
              </div>
              <div className="detail-item">
                <span className="label">Check-out:</span>
                <span className="value">{bookingData.checkOut}</span>
              </div>
              <div className="detail-item">
                <span className="label">Number of Guests:</span>
                <span className="value">{bookingData.guests}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Amount:</span>
                <span className="value">{currency?.symbol || '₱'}{bookingData.totalPrice.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Method:</span>
                <span className="value">
                  {paymentResult.method === 'credit_card' ? 'Credit Card' :
                   paymentResult.method === 'gcash' ? 'GCash' :
                   paymentResult.method === 'paymaya' ? 'PayMaya' : 'Bank Transfer'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Date:</span>
                <span className="value">{new Date(paymentResult.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <div className="steps-list">
              <div className="step-item">
                <span className="step-icon">📧</span>
                <span>A confirmation email will be sent to {user.email}</span>
              </div>
              <div className="step-item">
                <span className="step-icon">📱</span>
                <span>You'll receive SMS updates about your reservation</span>
              </div>
              <div className="step-item">
                <span className="step-icon">🏨</span>
                <span>Present this confirmation at hotel check-in</span>
              </div>
              <div className="step-item">
                <span className="step-icon">📞</span>
                <span>Contact us at +63 2 1234 5678 for any questions</span>
              </div>
            </div>
          </div>

          <div className="important-notes">
            <h3>Important Notes</h3>
            <ul>
              <li>Check-in time: 3:00 PM</li>
              <li>Check-out time: 12:00 PM</li>
              <li>Please bring a valid ID for check-in</li>
              <li>Cancellation policy: Free cancellation up to 24 hours before check-in</li>
              <li>For special requests, please contact the hotel directly</li>
            </ul>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handlePrint} className="btn-secondary">
            🖨️ Print Confirmation
          </button>
          <button onClick={handleDownloadPDF} className="btn-secondary">
            📄 Download PDF
          </button>
          <button onClick={onNewBooking} className="btn-primary">
            🏨 Make Another Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
