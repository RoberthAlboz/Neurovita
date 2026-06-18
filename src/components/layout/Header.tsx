import React, { useState } from "react";
import { Menu, X, User, Sun, Moon } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const closeMenu = () => setIsMenuOpen(false);

  const handleHomeClick = () => {
    closeMenu();
    setLocation("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginClick = () => {
    closeMenu();
    setLocation("/login");
  };

  const handleProfileClick = () => {
    closeMenu();
    setLocation("/profile");
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const handleAboutClick = () => {
    closeMenu();
    setLocation("/about");
  };

  const handlePatientAreaClick = () => {
    closeMenu();
    if (!isAuthenticated) {
      setLocation("/login?redirect=/dashboard");
    } else if (isAdmin) {
      setLocation("/admin");
    } else {
      setLocation("/dashboard");
    }
  };

  const handleAdminClick = () => {
    closeMenu();
    setLocation("/admin");
  };

  return (
    <header>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo cursor-pointer" onClick={handleHomeClick}>
            <img 
              src={isDark ? "/assets/images/logoescura.png" : "/assets/images/logo.png"} 
              alt="Neurovita" 
              className="logo-image" 
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <button onClick={handleHomeClick}>Início</button>
            <button onClick={handleAboutClick}>Quem somos</button>
            {isAdmin ? (
              <button onClick={handleAdminClick} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Área do Admin
              </button>
            ) : (
              <button onClick={handlePatientAreaClick}>Área do paciente</button>
            )}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="header-cta">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <button className="header-profile-btn" onClick={handleProfileClick}>
                  <User size={20} />
                  <span>Perfil</span>
                </button>
                <button className="btn btn-primary" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            ) : (
              <button className="btn btn-primary flex items-center gap-2" onClick={handleLoginClick}>
                <User size={18} />
                <span>Entrar</span>
              </button>
            )}
          </div>

          {/* Mobile: Theme Toggle + Menu Toggle */}
          <div className="mobile-controls">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu" onClick={closeMenu}>
          <nav className="mobile-menu-nav" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-menu-item" onClick={handleHomeClick}>Início</button>
            <button className="mobile-menu-item" onClick={handleAboutClick}>Quem somos</button>
            {isAdmin ? (
              <button className="mobile-menu-item mobile-menu-item--admin" onClick={handleAdminClick}>
                Área do Admin
              </button>
            ) : (
              <button className="mobile-menu-item" onClick={handlePatientAreaClick}>
                Área do paciente
              </button>
            )}
            {isAuthenticated ? (
              <>
                <button className="mobile-menu-item" onClick={handleProfileClick}>
                  Meu Perfil
                </button>
                <button className="mobile-menu-item" onClick={handleLogout}>
                  Sair
                </button>
              </>
            ) : (
              <button className="btn btn-primary mobile-menu-cta" onClick={handleLoginClick}>
                <User size={18} />
                <span>Entrar</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
