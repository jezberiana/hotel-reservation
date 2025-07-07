import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import RoomDetailsModal from './components/RoomDetailsModal';
import Payment from './components/Payment';
import PaymentSuccess from './components/PaymentSuccess';
import roomTypesData from './data/roomTypes.json';
import hotelConfigData from './data/hotelConfig.json';

function App() {
  // Hotel Company Configuration - From JSON data
  const hotelConfig = hotelConfigData.hotel;
  
  // Room types with details - From JSON data
  const roomTypes = roomTypesData;
  
  // Additional service prices - From JSON data
  const servicePrices = hotelConfigData.servicePrices;
  
  // Currency configuration - From JSON data
  const currency = hotelConfigData.currency;

  // Authentication state
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // App flow state
  const [currentStep, setCurrentStep] = useState('booking'); // 'booking', 'payment', 'success'
  const [bookingData, setBookingData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  
  // Room details modal state
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const [formData, setFormData] = useState({
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
    specialRequests: ''
  });

  const [totalPrice, setTotalPrice] = useState(0);

  // Room prices for backwards compatibility
  const roomPrices = Object.keys(roomTypes).reduce((acc, key) => {
    acc[key] = roomTypes[key].price;
    return acc;
  }, {});

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
    
    // Check if user is authenticated before proceeding with checkout
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Prepare booking data for payment step
    const nights = getNights();
    const priceBreakdown = [];
    
    // Add room price
    priceBreakdown.push({
      description: `${roomTypes[formData.roomType].name} (${nights} night${nights > 1 ? 's' : ''})`,
      amount: roomPrices[formData.roomType] * nights
    });
    
    // Add service prices
    if (formData.breakfast) {
      priceBreakdown.push({
        description: `Breakfast (${nights} night${nights > 1 ? 's' : ''})`,
        amount: servicePrices.breakfast * nights
      });
    }
    if (formData.parking) {
      priceBreakdown.push({
        description: `Parking (${nights} night${nights > 1 ? 's' : ''})`,
        amount: servicePrices.parking * nights
      });
    }
    if (formData.wifi) {
      priceBreakdown.push({
        description: `Premium WiFi (${nights} night${nights > 1 ? 's' : ''})`,
        amount: servicePrices.wifi * nights
      });
    }
    if (formData.spa) {
      priceBreakdown.push({
        description: `Spa Access (${nights} night${nights > 1 ? 's' : ''})`,
        amount: servicePrices.spa * nights
      });
    }
    
    const booking = {
      ...formData,
      roomName: roomTypes[formData.roomType].name,
      checkIn: format(new Date(formData.checkIn), 'MMM dd, yyyy'),
      checkOut: format(new Date(formData.checkOut), 'MMM dd, yyyy'),
      nights: nights,
      totalPrice: totalPrice,
      priceBreakdown: priceBreakdown
    };
    
    setBookingData(booking);
    setCurrentStep('payment');
    
    // Close any open modals when transitioning to payment
    setShowAuthModal(false);
    setShowRoomModal(false);
  };

  const isFormValid = () => {
    const basicInfoValid = formData.checkIn && 
                           formData.checkOut &&
                           new Date(formData.checkOut) > new Date(formData.checkIn);
    return basicInfoValid;
  };

  const getNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      return differenceInDays(checkOutDate, checkInDate);
    }
    return 0;
  };

  // Authentication functions
  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    // In a real app, you'd store this in localStorage or a state management solution
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    // In a real app, you'd store this in localStorage or a state management solution
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Don't reset form data when logging out - let them continue browsing
  };

  // Check for existing user session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Room details modal handlers
  const handleViewRoomDetails = (roomKey) => {
    setSelectedRoomForDetails(roomKey);
    setShowRoomModal(true);
  };

  const handleCloseRoomModal = () => {
    setShowRoomModal(false);
    setSelectedRoomForDetails(null);
  };

  const handleSelectRoomFromModal = (roomKey) => {
    setFormData(prev => ({ ...prev, roomType: roomKey }));
  };

  // Payment flow handlers
  const handlePaymentComplete = (paymentData) => {
    setPaymentResult(paymentData);
    setCurrentStep('success');
    // Close any open modals
    setShowAuthModal(false);
    setShowRoomModal(false);
  };

  const handleBackToBooking = () => {
    setCurrentStep('booking');
    // Close any open modals
    setShowAuthModal(false);
    setShowRoomModal(false);
  };

  const handleNewBooking = () => {
    setCurrentStep('booking');
    setBookingData(null);
    setPaymentResult(null);
    // Close any open modals
    setShowAuthModal(false);
    setShowRoomModal(false);
    setFormData({
      checkIn: '',
      checkOut: '',
      roomType: 'standard',
      guests: 1,
      breakfast: false,
      parking: false,
      wifi: false,
      spa: false,
      specialRequests: ''
    });
  };

  return (
    <div className="app">
      {currentStep === 'payment' && bookingData ? (
        <Payment 
          bookingData={bookingData}
          user={user}
          currency={currency}
          onPaymentComplete={handlePaymentComplete}
          onBack={handleBackToBooking}
        />
      ) : currentStep === 'success' && paymentResult ? (
        <PaymentSuccess 
          paymentResult={paymentResult}
          bookingData={bookingData}
          user={user}
          currency={currency}
          onNewBooking={handleNewBooking}
        />
      ) : (
        <>
          <div className="header">
            <div className="header-content">
              <div className="header-text">
                <h1>{hotelConfig.icon} {hotelConfig.name}</h1>
                <p>{hotelConfig.tagline}</p>
              </div>
              {user ? (
                <UserProfile user={user} onLogout={handleLogout} />
              ) : (
                <div className="auth-buttons">
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="auth-btn-header login"
                  >
                    🔐 Sign In
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="auth-btn-header signup"
                  >
                    🎯 Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-container">
        
        <form onSubmit={handleSubmit}>
          {/* Room Selection Section */}
          <div className="form-section">
            <h2 className="section-title">Choose Your Room</h2>
            <div className="room-grid">
              {Object.entries(roomTypes).map(([key, room]) => (
                <div 
                  key={key}
                  className={`room-card ${formData.roomType === key ? 'selected' : ''}`}
                >
                  <div className="room-image">
                    <img src={room.image} alt={room.name} />
                    <div className="room-price">{currency.symbol}{room.price.toLocaleString()}/night</div>
                  </div>
                  <div className="room-details">
                    <h3 className="room-name">{room.name}</h3>
                    <p className="room-description">{room.description}</p>
                    <div className="room-features">
                      {room.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                    <div className="room-capacity">
                      <span>👥 Up to {room.maxGuests} guests</span>
                    </div>
                  </div>
                  
                  {/* Room Action Buttons */}
                  <div className="room-actions">
                    <button
                      onClick={() => handleViewRoomDetails(key)}
                      className="room-details-btn"
                    >
                      📋 View Details
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, roomType: key }))}
                      className={`room-select-btn ${formData.roomType === key ? 'selected' : ''}`}
                    >
                      {formData.roomType === key ? '✓ Selected' : 'Select Room'}
                    </button>
                  </div>
                  
                  <div className="room-selector">
                    <input
                      type="radio"
                      name="roomType"
                      value={key}
                      checked={formData.roomType === key}
                      onChange={() => {}}
                      className="room-radio"
                    />
                    <span className="checkmark">✓</span>
                  </div>
                </div>
              ))}
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
                <label htmlFor="guests" className="form-label">Number of Guests</label>
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {Array.from({ length: roomTypes[formData.roomType].maxGuests }, (_, i) => i + 1).map(num => (
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
                  Breakfast included (+{currency.symbol}{servicePrices.breakfast.toLocaleString()}/night)</label>
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
                  Parking space (+{currency.symbol}{servicePrices.parking.toLocaleString()}/night)</label>
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
                  Premium WiFi (+{currency.symbol}{servicePrices.wifi.toLocaleString()}/night)</label>
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
                  Spa access (+{currency.symbol}{servicePrices.spa.toLocaleString()}/night)</label>
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

          {/* Price Summary */}
          {getNights() > 0 && (
            <div className="price-summary">
              <h3 className="section-title">Booking Summary</h3>
              <div className="price-row">
                <span>Room: {roomTypes[formData.roomType].name} ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                <span>{currency.symbol}{(roomPrices[formData.roomType] * getNights()).toLocaleString()}</span>
              </div>
              {formData.breakfast && (
                <div className="price-row">
                  <span>Breakfast ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                  <span>{currency.symbol}{(servicePrices.breakfast * getNights()).toLocaleString()}</span>
                </div>
              )}
              {formData.parking && (
                <div className="price-row">
                  <span>Parking ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                  <span>{currency.symbol}{(servicePrices.parking * getNights()).toLocaleString()}</span>
                </div>
              )}
              {formData.wifi && (
                <div className="price-row">
                  <span>Premium WiFi ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                  <span>{currency.symbol}{(servicePrices.wifi * getNights()).toLocaleString()}</span>
                </div>
              )}
              {formData.spa && (
                <div className="price-row">
                  <span>Spa Access ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                  <span>{currency.symbol}{(servicePrices.spa * getNights()).toLocaleString()}</span>
                </div>
              )}
              <div className="price-row">
                <span>Total Amount</span>
                <span>{currency.symbol}{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid()}
          >
            {user ? '▶️ Continue to Payment' : '🔐 Sign In to Continue'}
          </button>
        </form>

            {/* Authentication Modal - Only show on booking step */}
            {showAuthModal && currentStep === 'booking' && (
              <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
                <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="modal-close"
                    onClick={() => setShowAuthModal(false)}
                  >
                    ×
                  </button>
                  {authMode === 'login' ? (
                    <Login 
                      onLogin={handleLogin}
                      onSwitchToSignup={() => setAuthMode('signup')}
                    />
                  ) : (
                    <Signup 
                      onSignup={handleSignup}
                      onSwitchToLogin={() => setAuthMode('login')}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Room Details Modal - Only show on booking step */}
            {showRoomModal && selectedRoomForDetails && currentStep === 'booking' && (
              <RoomDetailsModal 
                room={roomTypes[selectedRoomForDetails]}
                roomKey={selectedRoomForDetails}
                isOpen={showRoomModal}
                onClose={handleCloseRoomModal}
                onSelect={handleSelectRoomFromModal}
                isSelected={formData.roomType === selectedRoomForDetails}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
