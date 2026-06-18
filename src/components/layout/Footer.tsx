import React from 'react';
import { useLocation } from 'wouter';


const Footer: React.FC = () => {
  const [, setLocation] = useLocation();

  const navigateTo = (path: string, sectionId?: string) => {
    setLocation(path);

    if (sectionId) {
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 450);
    }
  };

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <button type="button" className="logo footer-logo-button" onClick={() => navigateTo('/')} style={{ marginBottom: '1rem', background: 'transparent', border: 0, padding: 0, cursor: 'pointer' }}>
              <img 
                src="/assets/images/logoescura.png" 
                alt="Neurovita" 
                className="logo-image" 
              />
            </button>
            <p style={{ fontSize: '0.875rem', color: '#B0B0B0' }}>
              Gerenciamento médico especializado em neurologia
            </p>
          </div>

          <div className="footer-section">
            <h4>Navegação</h4>
            <ul>
              <li><button type="button" onClick={() => navigateTo('/')}>Início</button></li>
              <li><button type="button" onClick={() => navigateTo('/about')}>Sobre</button></li>
              <li><button type="button" onClick={() => navigateTo('/', 'especialidades')}>Especialidades</button></li>
              <li><button type="button" onClick={() => navigateTo('/', 'contato')}>Contato</button></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Serviços</h4>
            <ul>
              <li><button type="button" onClick={() => navigateTo('/', 'especialidades')}>Neurologia Cognitiva</button></li>
              <li><button type="button" onClick={() => navigateTo('/', 'especialidades')}>Neurofisiologia</button></li>
              <li><button type="button" onClick={() => navigateTo('/', 'especialidades')}>Neuropediatria</button></li>
              <li><button type="button" onClick={() => navigateTo('/', 'especialidades')}>Telemedicina</button></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contato</h4>
            <ul>
              <li><a href="mailto:contato@neurovita.com.br">contato@neurovita.com.br</a></li>
              <li><a href="tel:+5511999999999">+55 (11) 9 9999-9999</a></li>
              <li style={{ color: '#808080' }}>São Paulo, SP</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ color: '#808080' }}>© 2026 Neurovita. Todos os direitos reservados.</p>
          <div className="footer-links">
            <button type="button" onClick={() => navigateTo('/about')}>Privacidade</button>
            <button type="button" onClick={() => navigateTo('/about')}>Termos</button>
            <button type="button" onClick={() => navigateTo('/about')}>Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
