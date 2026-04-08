import React from 'react';

const ConfirmationModal = ({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
