import React from 'react';
import './Loading.css';

interface LoadingProps {
  isVisible: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ isVisible, message = 'Carregando...' }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={message}>
      <div className="loading-container">
        <div className="loading-background">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
          <div className="gradient-orb gradient-orb-3"></div>
        </div>

        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>

        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
