import React from 'react';
import './Modal.css';

export type ModalType = 'success' | 'error' | 'info';

interface ModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  onClose: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  actionButton,
  children,
}) => {
  if (!isOpen) return null;

  const getIconClass = () => {
    switch (type) {
      case 'success':
        return 'bi bi-check-circle-fill modal-icon modal-icon-success';
      case 'error':
        return 'bi bi-x-circle-fill modal-icon modal-icon-error';
      default:
        return 'bi bi-info-circle-fill modal-icon modal-icon-info';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>

        <div className={`modal-body modal-${type}`}>
          <i className={getIconClass()} style={{ fontSize: '48px' }}></i>

          <h2 className="modal-title">{title}</h2>
          {message && <p className="modal-message">{message}</p>}
          
          {children}

          <div className="modal-actions">
            <button className="modal-btn modal-btn-primary" onClick={onClose}>
              Fechar
            </button>
            {actionButton && (
              <button className="modal-btn modal-btn-secondary" onClick={actionButton.onClick}>
                {actionButton.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
