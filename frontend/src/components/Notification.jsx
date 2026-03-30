import React, { useEffect } from 'react';

const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="notification-container">
      <div className={`notification ${notification.type}`}>
        <span>{notification.message}</span>
        <button onClick={onClose} className="notification-close">&times;</button>
      </div>
    </div>
  );
};

export default Notification;
