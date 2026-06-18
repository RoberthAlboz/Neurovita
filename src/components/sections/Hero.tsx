import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

const Hero: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const handleActionClick = () => {
    if (isAuthenticated) {
      if (isAdmin) {
        setLocation('/admin');
      } else {
        // CTA 'Agende sua consulta' leva diretamente ao agendamento
        setLocation('/appointment');
      }
    } else {
      setLocation('/login?redirect=/appointment');
    }
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          {/* Hero Text Content */}
          <div className="hero-text">
            <h1>{isAuthenticated && isAdmin ? 'Painel de Gestão Neurovita' : 'Você escolhe suas consultas e exames'}</h1>
            <p>{isAuthenticated && isAdmin ? 'Administre pacientes, profissionais e agendamentos.' : 'A gente escolhe cuidar de você.'}</p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-rounded" onClick={handleActionClick}>
                {isAuthenticated && isAdmin ? 'Acessar Administração' : 'Agende sua consulta'}
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hero-image">
            <img src="/assets/images/cerebro.png" alt="Banner" className="hero-banner-image" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
