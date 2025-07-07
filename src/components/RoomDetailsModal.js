import React from 'react';

const RoomDetailsModal = ({ room, roomKey, isOpen, onClose, onSelect, isSelected }) => {
  if (!isOpen) return null;

  const handleSelect = () => {
    onSelect(roomKey);
    onClose();
  };

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="room-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>
        
        <div className="room-modal-content">
          {/* Room Image Gallery */}
          <div className="room-modal-image">
            <img src={room.image} alt={room.name} />
            <div className="room-modal-price">₱{room.price.toLocaleString()}/night</div>
            <div className="room-modal-capacity">
              <span>👥 Up to {room.maxGuests} guests</span>
            </div>
          </div>

          {/* Room Details */}
          <div className="room-modal-details">
            <div className="room-modal-header">
              <h2 className="room-modal-title">{room.name}</h2>
              <p className="room-modal-description">{room.description}</p>
            </div>

            {/* All Features */}
            <div className="room-modal-section">
              <h3 className="room-modal-section-title">Room Features & Amenities</h3>
              <div className="room-modal-features">
                {room.features.map((feature, index) => (
                  <div key={index} className="room-modal-feature">
                    <span className="feature-icon">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Specifications */}
            <div className="room-modal-section">
              <h3 className="room-modal-section-title">Room Specifications</h3>
              <div className="room-specs">
                <div className="spec-item">
                  <span className="spec-label">Maximum Guests:</span>
                  <span className="spec-value">{room.maxGuests} people</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Room Size:</span>
                  <span className="spec-value">
                    {roomKey === 'standard' ? '25-30 sqm' : 
                     roomKey === 'deluxe' ? '35-40 sqm' :
                     roomKey === 'suite' ? '50-60 sqm' : '80-100 sqm'}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Bed Type:</span>
                  <span className="spec-value">
                    {roomKey === 'standard' ? 'Queen Bed' : 
                     roomKey === 'deluxe' ? 'King Bed' :
                     roomKey === 'suite' ? 'King Bed + Sofa Bed' : 'King Bed + Living Area'}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">View:</span>
                  <span className="spec-value">
                    {roomKey === 'standard' ? 'City View' : 
                     roomKey === 'deluxe' ? 'Ocean View' :
                     roomKey === 'suite' ? 'Ocean View' : 'Panoramic Ocean View'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="room-modal-section">
              <h3 className="room-modal-section-title">Included Services</h3>
              <div className="included-services">
                <div className="service-item">
                  <span className="service-icon">🏨</span>
                  <span>24/7 Room Service</span>
                </div>
                <div className="service-item">
                  <span className="service-icon">🧹</span>
                  <span>Daily Housekeeping</span>
                </div>
                <div className="service-item">
                  <span className="service-icon">🚗</span>
                  <span>Complimentary Airport Shuttle</span>
                </div>
                {roomKey !== 'standard' && (
                  <div className="service-item">
                    <span className="service-icon">🥂</span>
                    <span>Welcome Drinks</span>
                  </div>
                )}
                {(roomKey === 'suite' || roomKey === 'presidential') && (
                  <div className="service-item">
                    <span className="service-icon">👔</span>
                    <span>Personal Concierge</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="room-modal-actions">
              <button 
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
              <button 
                onClick={handleSelect}
                className={`btn-primary ${isSelected ? 'selected' : ''}`}
              >
                {isSelected ? '✓ Selected' : 'Select This Room'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;
