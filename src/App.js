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
import servicesData from './data/services.json';

function App() {
  // Hotel Company Configuration - From JSON data
  const hotelConfig = hotelConfigData.hotel;
  
  // Room types with details - From JSON data
  const roomTypes = roomTypesData;
  
  // Additional services - From JSON data
  const services = servicesData;
  
  // Legacy servicePrices for backward compatibility
  const servicePrices = Object.keys(services).reduce((acc, key) => {
    acc[key] = services[key].price;
    return acc;
  }, {});
  
  // Get enabled services only
  const enabledServices = Object.keys(services).filter(key => services[key].enabled);
  
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

  const [formData, setFormData] = useState(() => {
    const initialData = {
      // Reservation Details
      checkIn: '',
      checkOut: '',
      roomQuantities: {}, // Object to track quantity per room type
      guests: 1,
      
      // Special Requests
      specialRequests: ''
    };
    
    // Dynamically add enabled services
    Object.keys(servicesData).forEach(serviceKey => {
      if (servicesData[serviceKey].enabled) {
        initialData[serviceKey] = false;
      }
    });
    
    return initialData;
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
        // Calculate base price for all selected rooms with quantities
        let basePrice = 0;
        Object.keys(formData.roomQuantities).forEach(roomType => {
          const quantity = formData.roomQuantities[roomType];
          if (quantity > 0) {
            basePrice += roomPrices[roomType] * nights * quantity;
          }
        });
        
        let servicesPrice = 0;
        Object.keys(services).forEach(serviceKey => {
          if (services[serviceKey].enabled && formData[serviceKey]) {
            servicesPrice += services[serviceKey].price * nights;
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

  const handleRoomQuantityChange = (roomKey, quantity) => {
    setFormData(prev => ({
      ...prev,
      roomQuantities: {
        ...prev.roomQuantities,
        [roomKey]: Math.max(0, parseInt(quantity) || 0)
      }
    }));
  };

  const handleRoomSelection = (roomKey) => {
    setFormData(prev => {
      const currentQuantity = prev.roomQuantities[roomKey] || 0;
      const newQuantity = currentQuantity > 0 ? 0 : 1;
      
      return {
        ...prev,
        roomQuantities: {
          ...prev.roomQuantities,
          [roomKey]: newQuantity
        }
      };
    });
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
    
    // Add room prices with quantities
    Object.keys(formData.roomQuantities).forEach(roomType => {
      const quantity = formData.roomQuantities[roomType];
      if (quantity > 0) {
        priceBreakdown.push({
          description: `${roomTypes[roomType].name} (${quantity} room${quantity > 1 ? 's' : ''} × ${nights} night${nights > 1 ? 's' : ''})`,
          amount: roomPrices[roomType] * nights * quantity
        });
      }
    });
    
    // Add service prices
    Object.keys(services).forEach(serviceKey => {
      if (services[serviceKey].enabled && formData[serviceKey]) {
        const service = services[serviceKey];
        priceBreakdown.push({
          description: `${service.name} (${nights} night${nights > 1 ? 's' : ''})`,
          amount: service.price * nights
        });
      }
    });
    
    const booking = {
      ...formData,
      roomNames: Object.keys(formData.roomQuantities)
        .filter(roomType => formData.roomQuantities[roomType] > 0)
        .map(roomType => `${roomTypes[roomType].name} (${formData.roomQuantities[roomType]})`),
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
    
    const hasRoomsSelected = Object.values(formData.roomQuantities).some(quantity => quantity > 0);
    
    return basicInfoValid && hasRoomsSelected;
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
    handleRoomSelection(roomKey);
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
    
    // Dynamically reset form data
    const resetData = {
      checkIn: '',
      checkOut: '',
      roomQuantities: {},
      guests: 1,
      specialRequests: ''
    };
    
    // Reset all enabled services to false
    Object.keys(services).forEach(serviceKey => {
      if (services[serviceKey].enabled) {
        resetData[serviceKey] = false;
      }
    });
    
    setFormData(resetData);
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
              {Object.entries(roomTypes).map(([key, room]) => {
                const quantity = formData.roomQuantities[key] || 0;
                return (
                  <div 
                    key={key}
                    className={`room-card ${quantity > 0 ? 'selected' : ''}`}
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
                    
                    {/* Room Quantity Controls */}
                    <div className="room-quantity-controls">
                      <label htmlFor={`quantity-${key}`} className="quantity-label">
                        Quantity:
                      </label>
                      <div className="quantity-input-group">
                        <button
                          type="button"
                          onClick={() => handleRoomQuantityChange(key, quantity - 1)}
                          className="quantity-btn decrease"
                          disabled={quantity <= 0}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id={`quantity-${key}`}
                          min="0"
                          max="10"
                          value={quantity}
                          onChange={(e) => handleRoomQuantityChange(key, e.target.value)}
                          className="quantity-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleRoomQuantityChange(key, quantity + 1)}
                          className="quantity-btn increase"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Room Action Buttons */}
                    <div className="room-actions">
                      <button
                        type="button"
                        onClick={() => handleViewRoomDetails(key)}
                        className="room-details-btn"
                      >
                        📋 View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoomSelection(key)}
                        className={`room-select-btn ${quantity > 0 ? 'selected' : ''}`}
                      >
                        {quantity > 0 ? '✓ Selected' : 'Select Room'}
                      </button>
                    </div>
                    
                    <div className="room-selector">
                      <input
                        type="checkbox"
                        name="roomTypes"
                        value={key}
                        checked={quantity > 0}
                        onChange={() => handleRoomSelection(key)}
                        className="room-checkbox"
                      />
                      <span className="checkmark">✓</span>
                      {quantity > 0 && (
                        <span className="quantity-badge">{quantity}</span>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  {Array.from({ 
                    length: Object.keys(formData.roomQuantities).reduce((maxGuests, roomType) => {
                      const quantity = formData.roomQuantities[roomType] || 0;
                      return maxGuests + (roomTypes[roomType].maxGuests * quantity);
                    }, 0) || 1
                  }, (_, i) => i + 1).map(num => (
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
              {enabledServices.map(serviceKey => {
                const service = services[serviceKey];
                return (
                  <div key={serviceKey} className="checkbox-group">
                    <input
                      type="checkbox"
                      id={serviceKey}
                      name={serviceKey}
                      checked={formData[serviceKey] || false}
                      onChange={handleInputChange}
                      className="checkbox"
                    />
                    <label htmlFor={serviceKey} className="checkbox-label">
                      {service.icon} {service.name} (+{currency.symbol}{service.price.toLocaleString()}/night)
                    </label>
                  </div>
                );
              })}
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
              {Object.keys(formData.roomQuantities).map(roomType => {
                const quantity = formData.roomQuantities[roomType];
                if (quantity > 0) {
                  return (
                    <div key={roomType} className="price-row">
                      <span>Room: {roomTypes[roomType].name} ({quantity} room{quantity > 1 ? 's' : ''} × {getNights()} night{getNights() > 1 ? 's' : ''})</span>
                      <span>{currency.symbol}{(roomPrices[roomType] * getNights() * quantity).toLocaleString()}</span>
                    </div>
                  );
                }
                return null;
              })}
              {enabledServices.map(serviceKey => {
                const service = services[serviceKey];
                if (formData[serviceKey]) {
                  return (
                    <div key={serviceKey} className="price-row">
                      <span>{service.name} ({getNights()} night{getNights() > 1 ? 's' : ''})</span>
                      <span>{currency.symbol}{(service.price * getNights()).toLocaleString()}</span>
                    </div>
                  );
                }
                return null;
              })}
              <div className="price-row total-row">
                <span><strong>Total Amount</strong></span>
                <span><strong>{currency.symbol}{totalPrice.toLocaleString()}</strong></span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid()}
          >
            {!Object.values(formData.roomQuantities).some(quantity => quantity > 0) 
              ? '🏨 Please select at least one room' 
              : user ? '▶️ Continue to Payment' : '🔐 Sign In to Continue'}
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
                isSelected={(formData.roomQuantities[selectedRoomForDetails] || 0) > 0}
                currency={currency}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
