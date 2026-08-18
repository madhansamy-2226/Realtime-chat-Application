import React from 'react';

const Avatar = ({ src, alt = 'Avatar', isOnline, size = 'md', className = '' }) => {
  const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${alt || 'User'}`;

  return (
    <div className={`avatar-container ${size} ${className}`}>
      <img
        src={src || fallback}
        alt={alt}
        className="avatar-img"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallback;
        }}
      />
      {typeof isOnline === 'boolean' && (
        <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
      )}
    </div>
  );
};

export default Avatar;
