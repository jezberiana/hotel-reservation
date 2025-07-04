import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';

function App() {
  const [formData, setFormData] = useState({
    // Guest Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Reservation Details
    checkIn: '',
    checkOut: '',
    roomType: 'standard',
    guests: 1,
    
    // Additional Services
    breakfast: false,
    parking: false,
    wifi: false,
    spa: false,
    
    // Special Requests
    specialRequests: '',

    // Payment Information
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    gcashNumber: '',
    payMayaNumber: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Room prices per night (in Philippine Pesos)
  const roomPrices = {
    standard: 6800,   // ~$120 USD
    deluxe: 10200,    // ~$180 USD
    suite: 15800,     // ~$280 USD
    presidential: 28000 // ~$500 USD
  };

  // Additional service prices (in Philippine Pesos)
  const servicePrices = {
    breakfast: 1400,  // ~$25 USD
    parking: 850,     // ~$15 USD
    wifi: 560,        // ~$10 USD
    spa: 4200         // ~$75 USD
  };

  // Calculate total price
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const nights = differenceInDays(checkOutDate, checkInDate);
      
      if (nights > 0) {
        let basePrice = roomPrices[formData.roomType] * nights;
        let servicesPrice = 0;
        
        Object.keys(servicePrices).forEach(service => {
          if (formData[service]) {
            servicesPrice += servicePrices[service] * nights;
          }
        });
        
        setTotalPrice(basePrice + servicesPrice);
      }
    }
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsLoading(false);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  const isFormValid = () => {
    const basicInfoValid = formData.firstName && 
                           formData.lastName && 
                           formData.email && 
                           formData.phone && 
                           formData.checkIn && 
                           formData.checkOut &&
                           new Date(formData.checkOut) > new Date(formData.checkIn);

    let paymentValid = false;
    if (formData.paymentMethod === 'credit_card') {
      paymentValid = formData.cardNumber && 
                     formData.cardName && 
                     formData.expiryDate && 
                     formData.cvv;
    } else if (formData.paymentMethod === 'gcash') {
      paymentValid = formData.gcashNumber;
    } else if (formData.paymentMethod === 'paymaya') {
      paymentValid = formData.payMayaNumber;
    }

    return basicInfoValid && paymentValid;
  };

  const getNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      return differenceInDays(checkOutDate, checkInDate);
    }
    return 0;
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🏨 Hotel Reservation</h1>
        <p>Book your perfect stay with us</p>
      </div>
      
      <div className="form-container">
        {isSubmitted && (
          <div className="success-message">
            ✅ Your reservation has been successfully submitted! Confirmation details will be sent to your email.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Guest Information Section */}
          <div className="form-section">
            <h2 className="section-title">Guest Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Reservation Details Section */}
          <div className="form-section">
            <h2 className="section-title">Reservation Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="checkIn" className="form-label">Check-in Date *</label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  className="form-input"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="checkOut" className="form-label">Check-out Date *</label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  className="form-input"
                  min={formData.checkIn || format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="roomType" className="form-label">Room Type</label>
                <select
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="standard">Standard Room - ₱6,800/night</option>
                  <option value="deluxe">Deluxe Room - ₱10,200/night</option>
                  <option value="suite">Suite - ₱15,800/night</option>
                  <option value="presidential">Presidential Suite - ₱28,000/night</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="guests" className="form-label">Number of Guests</label>
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Services Section */}
          <div className="form-section">
            <h2 className="section-title">Additional Services</h2>
            <div className="form-grid">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="breakfast"
                  name="breakfast"
                  checked={formData.breakfast}
                  onChange={handleInputChange}
                  className="checkbox"
                />
                <label htmlFor="breakfast" className="checkbox-label">
                  Breakfast included (+₱1,400/night)
                </label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="parking"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleInputChange}
                  className="checkbox"
                />
                <label htmlFor="parking" className="checkbox-label">
                  Parking space (+₱850/night)
                </label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="wifi"
                  name="wifi"
                  checked={formData.wifi}
                  onChange={handleInputChange}
                  className="checkbox"
                />
                <label htmlFor="wifi" className="checkbox-label">
                  Premium WiFi (+₱560/night)
                </label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="spa"
                  name="spa"
                  checked={formData.spa}
                  onChange={handleInputChange}
                  className="checkbox"
                />
                <label htmlFor="spa" className="checkbox-label">
                  Spa access (+₱4,200/night)
                </label>
              </div>
            </div>
          </div>

          {/* Special Requests Section */}
          <div className="form-section">
            <h2 className="section-title">Special Requests</h2>
            <div className="form-group">
              <label htmlFor="specialRequests" className="form-label">
                Any special requests or preferences?
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Let us know about any special requirements, dietary restrictions, accessibility needs, or preferences..."
              />
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="form-section">
            <h2 className="section-title">Payment Information</h2>
            <div className="form-group">
              <label htmlFor="paymentMethod" className="form-label">Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="credit_card">Credit/Debit Card</option>
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {formData.paymentMethod === 'credit_card' && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="cardNumber" className="form-label">Card Number *</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
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
                    value={formData.cardName}
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
                    value={formData.expiryDate}
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
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === 'gcash' && (
              <div className="form-group">
                <label htmlFor="gcashNumber" className="form-label">GCash Mobile Number *</label>
                <input
                  type="tel"
                  id="gcashNumber"
                  name="gcashNumber"
                  value={formData.gcashNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>
            )}

            {formData.paymentMethod === 'paymaya' && (
              <div className="form-group">
                <label htmlFor="payMayaNumber" className="form-label">PayMaya Mobile Number *</label>
                <input
                  type="tel"
                  id="payMayaNumber"
                  name="payMayaNumber"
                  value={formData.payMayaNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>
            )}

            {formData.paymentMethod === 'bank_transfer' && (
              <div className="payment-info-box">
                <h4>Bank Transfer Details</h4>
                <p><strong>Bank:</strong> BDO Unibank</p>
                <p><strong>Account Name:</strong> LuxuryStay Hotel Corp</p>
                <p><strong>Account Number:</strong> 1234-5678-9012</p>
                <p><strong>Swift Code:</strong> BNORPHMM</p>
                <p style={{fontSize: '14px', color: '#6b7280', marginTop: '12px'}}>
                  Please transfer the total amount and email the receipt to reservations@luxurystay.ph
                </p>
              </div>
            )}
          </div>

          {/* Price Summary */}
          {getNights() > 0 && (
            <div className="price-summary">
              <h3 className="section-title">Booking Summary</h3>
              <div className="price-row">
                <span>Room ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                <span>₱{(roomPrices[formData.roomType] * getNights()).toLocaleString()}</span>
              </div>
              {formData.breakfast && (
                <div className="price-row">
                  <span>Breakfast ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                  <span>₱{(servicePrices.breakfast * getNights()).toLocaleString()}</span>
                </div>
              )}
              {formData.parking && (
                <div className="price-row">
                  <span>Parking ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                  <span>₱{(servicePrices.parking * getNights()).toLocaleString()}</span>
                </div>
              )}
              {formData.wifi && (
                <div className="price-row">
                  <span>Premium WiFi ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                  <span>₱{(servicePrices.wifi * getNights()).toLocaleString()}</span>
                </div>
              )}
              {formData.spa && (
                <div className="price-row">
                  <span>Spa Access ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                  <span>₱{(servicePrices.spa * getNights()).toLocaleString()}</span>
                </div>
              )}
              <div className="price-row">
                <span>Total Amount</span>
                <span>₱{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? '🔄 Processing Reservation...' : '🎯 Book Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
