import React from 'react';

const UserProfile = ({ user, onLogout }) => {
  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div className="user-details">
          <span className="user-name">{user.firstName} {user.lastName}</span>
          <span className="user-email">{user.email}</span>
        </div>
      </div>
      <button 
        onClick={onLogout}
        className="logout-btn"
      >
        🚪 Logout
      </button>
    </div>
  );
};

export default UserProfile;
