import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: number | string;
  fullName?: string;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  role?: 'patient' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userIdentifier: string | null;
  user: AuthUser | null;
  login: (userOrIdentifier: AuthUser | string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('neurovita_user');
    const storedIdentifier = localStorage.getItem('user_identifier');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        const id = parsedUser?.id ? String(parsedUser.id) : null;

        if (id) {
          setUser(parsedUser);
          setUserIdentifier(id);
          setIsAuthenticated(true);
          return;
        }
      } catch {
        localStorage.removeItem('neurovita_user');
      }
    }

    if (storedIdentifier) {
      setUserIdentifier(storedIdentifier);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userOrIdentifier: AuthUser | string) => {
    // Garantir limpeza de estados anteriores
    localStorage.removeItem('user_identifier');
    localStorage.removeItem('neurovita_user');

    if (typeof userOrIdentifier === 'string') {
      localStorage.setItem('user_identifier', userOrIdentifier);
      setUserIdentifier(userOrIdentifier);
      setUser(null);
      setIsAuthenticated(true);
      return;
    }

    const identifier = String(userOrIdentifier.id);
    localStorage.setItem('user_identifier', identifier);
    localStorage.setItem('neurovita_user', JSON.stringify(userOrIdentifier));
    setUserIdentifier(identifier);
    setUser(userOrIdentifier);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Preserva o tema antes de limpar o localStorage
    const savedTheme = localStorage.getItem('neurovita_theme');
    
    // Hard Reset: Limpa tudo para evitar sessões presas
    localStorage.clear();
    sessionStorage.clear();
    
    // Restaura o tema após o clear
    if (savedTheme) {
      localStorage.setItem('neurovita_theme', savedTheme);
    }
    
    setUserIdentifier(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Força o reload para limpar estados de memória e redirecionar
    window.location.href = '/';
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, userIdentifier, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
