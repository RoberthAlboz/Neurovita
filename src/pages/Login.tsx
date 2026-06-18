import React, { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, User, Mail, Calendar, CalendarPlus, Sparkles, Stethoscope, ShieldCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import FloatingLines from '../components/backgrounds/FloatingLines/FloatingLines';
import Modal, { ModalType } from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../constants/api';

type AuthMode = 'login' | 'signup';
type LoginMethod = 'cpf' | 'email';
type UserProfile = 'patient' | 'admin';

interface LoginFormData {
  cpf: string;
  email: string;
  password: string;
}

interface SignupFormData {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const Login: React.FC = () => {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const floatingLinesConfig = useMemo(() => ({
    linesGradient: ['#457EAC', '#9191E9', '#C2AFF0'],
    enabledWaves: ['top', 'middle', 'bottom'],
    lineCount: [8, 8, 8],
    lineDistance: [8, 8, 8],
    animationSpeed: 1,
    interactive: false,
    bendRadius: 5.0,
    bendStrength: -0.5,
    parallax: false,
    parallaxStrength: 0.2,
    mixBlendMode: 'normal' as const,
  }), []);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('cpf');
  const [userProfile, setUserProfile] = useState<UserProfile>('patient');
  const [isLoading, setIsLoading] = useState(false);

  // Capturar parâmetros de redirecionamento da URL
  const searchParams = new URLSearchParams(window.location.search);
  const redirectPath = searchParams.get('redirect');
  const specialtyParam = searchParams.get('specialty');
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handlePostAuthRedirect = (userRole?: string) => {
    if (userRole === 'admin') {
      setLocation('/admin');
      return;
    }
    setIsLoading(false);

    if (redirectPath) {
      const finalPath = specialtyParam ? `${redirectPath}?specialty=${specialtyParam}` : redirectPath;
      setLocation(finalPath);
    } else {
      setLocation('/');
    }
  };

  // Máscara de CPF
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os 3 primeiros dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os 6 primeiros dígitos
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca hífen após os 9 primeiros dígitos
      .replace(/(-\d{2})\d+?$/, '$1'); // Limita em 11 dígitos (14 caracteres com máscara)
  };

  // Login Form State
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    cpf: '',
    email: '',
    password: '',
  });

  // Signup Form State
  const [signupForm, setSignupForm] = useState<SignupFormData>({
    fullName: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleBackToHome = () => {
    setLocation('/');
  };

  // Login Handlers
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setLoginForm(prev => ({ ...prev, [name]: maskCPF(value) }));
    } else if (name === 'password') {
      if (value.length <= 14) {
        setLoginForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setLoginForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const identifier = userProfile === 'admin' ? loginForm.email : (loginMethod === 'cpf' ? loginForm.cpf : loginForm.email);
      const response = await fetch(getApiUrl('LOGIN'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (userProfile === 'admin' && data.user.role !== 'admin') {
          setModalConfig({
            isOpen: true,
            type: 'error',
            title: 'Acesso administrativo negado',
            message: 'As credenciais informadas não pertencem a um administrador.',
          });
          return;
        }

        if (userProfile === 'patient' && data.user.role === 'admin') {
          setModalConfig({
            isOpen: true,
            type: 'error',
            title: 'Perfil incorreto',
            message: 'Para acessar como administrador, selecione a opção Admin antes de entrar.',
          });
          return;
        }

        login(data.user);
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Bem-vindo ao Neurovita!',
          message: data.user.role === 'admin' ? 'Acesso administrativo concedido.' : 'Login realizado com sucesso. Você será redirecionado em instantes.',
        });
        setLoginForm({ cpf: '', email: '', password: '' });
        setTimeout(() => handlePostAuthRedirect(data.user.role), 2000);
      } else {
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Erro no Login',
          message: data.message || 'Não foi possível realizar o acesso. Verifique seus dados.',
        });
      }
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Erro de Conexão',
        message: 'Não foi possível conectar ao servidor do Neurovita. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Signup Handlers
  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setSignupForm(prev => ({ ...prev, [name]: maskCPF(value) }));
    } else if (name === 'password' || name === 'confirmPassword') {
      if (value.length <= 14) {
        setSignupForm(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setSignupForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Senhas Diferentes',
        message: 'As senhas digitadas não coincidem. Por favor, verifique.',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(getApiUrl('SIGNUP'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: signupForm.fullName,
          email: signupForm.email,
          cpf: signupForm.cpf,
          phone: signupForm.phone,
          password: signupForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Cadastro Concluído!',
          message: 'Sua conta no Neurovita foi criada com sucesso. Você será redirecionado em instantes.',
        });
        setSignupForm({ fullName: '', email: '', cpf: '', phone: '', password: '', confirmPassword: '' });
        setTimeout(handlePostAuthRedirect, 2000);
      } else {
        setModalConfig({
          isOpen: true,
          type: 'error',
          title: 'Erro no Cadastro',
          message: data.message || 'Ocorreu um problema ao criar sua conta. Tente novamente.',
        });
      }
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Erro de Conexão',
        message: 'Não foi possível conectar ao servidor do Neurovita. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isLoginValid = userProfile === 'admin'
    ? loginForm.email && loginForm.password
    : (loginMethod === 'cpf' ? loginForm.cpf.length === 14 && loginForm.password : loginForm.email && loginForm.password);
  const isSignupValid = signupForm.fullName && signupForm.email && signupForm.cpf.length === 14 && signupForm.phone && signupForm.password && signupForm.confirmPassword && signupForm.password === signupForm.confirmPassword;

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-left-bg">
          <FloatingLines {...floatingLinesConfig} />
        </div>

        <button onClick={handleBackToHome} className="login-back-button">← Voltar</button>

        <div className="login-left-content">
          <div className="login-illustration">
            <div className="illustration-placeholder">
              <Stethoscope size={80} className="illustration-icon" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="login-left-title">Seu assistente de saúde pra toda a vida</h1>
          <div className="login-quick-access">
            <div className="quick-access-header">
              <span className="quick-access-label">ACESSO FÁCIL</span>
              <Sparkles size={16} className="quick-access-star" />
            </div>
            <div className="quick-access-buttons">
              <button type="button" className="quick-access-card" onClick={() => {
                if (!isAuthenticated) {
                  setModalConfig({
                    isOpen: true,
                    type: 'info',
                    title: 'Login Obrigatório',
                    message: 'Você precisa estar logado para acessar seus agendamentos. Faça login ou crie uma conta.',
                  });
                } else {
                  setLocation('/dashboard');
                }
              }}>
                <div className="card-content">
                  <div className="icon-container"><Calendar className="icon-coral" size={24} /></div>
                  <span className="card-text">Meus Agendamentos</span>
                </div>
                <ArrowRight size={18} className="card-arrow" />
              </button>
              <button type="button" className="quick-access-card" onClick={() => {
                if (!isAuthenticated) {
                  setModalConfig({
                    isOpen: true,
                    type: 'info',
                    title: 'Login Obrigatório',
                    message: 'Você precisa estar logado para agendar uma consulta. Faça login ou crie uma conta.',
                  });
                } else {
                  setLocation('/appointment');
                }
              }}>
                <div className="card-content">
                  <div className="icon-container"><CalendarPlus className="icon-coral" size={24} /></div>
                  <span className="card-text">Agendar Consulta</span>
                </div>
                <ArrowRight size={18} className="card-arrow" />
              </button>
            </div>
          </div>
          <p className="login-left-bottom">Conecte você a laboratórios de todo o país</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-logo mb-12">
            <img 
              src={isDark ? "/assets/images/logoescura.png" : "/assets/images/logo.png"} 
              alt="Neurovita" 
              className="logo-image-login" 
            />
          </div>

          <div className="auth-mode-toggle mb-10">
            <button className={`mode-button ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Entrar</button>
            <button className={`mode-button ${authMode === 'signup' ? 'active' : ''}`} onClick={() => { setAuthMode('signup'); setUserProfile('patient'); }}>Cadastrar</button>
          </div>

          {authMode === 'login' ? (
            <>
              <div className="login-form-header mb-8">
                <h2 className="login-form-title text-2xl font-bold mb-2">Acesse sua conta</h2>
                <p className="login-form-subtitle text-[#86868b]">Agende consultas, exames e acompanhe seus resultados.</p>
              </div>

              <div className="login-tabs mb-6">
                <button type="button" className={`login-tab ${userProfile === 'patient' ? 'active' : ''}`} onClick={() => { setUserProfile('patient'); setLoginMethod('cpf'); setLoginForm({ cpf: '', email: '', password: '' }); }}><User size={18} /> Paciente</button>
                <button type="button" className={`login-tab ${userProfile === 'admin' ? 'active' : ''}`} onClick={() => { setUserProfile('admin'); setLoginMethod('email'); setLoginForm({ cpf: '', email: '', password: '' }); }}><ShieldCheck size={18} /> Admin</button>
              </div>

              {userProfile === 'patient' && (
                <div className="login-tabs mb-8">
                  <button type="button" className={`login-tab ${loginMethod === 'cpf' ? 'active' : ''}`} onClick={() => setLoginMethod('cpf')}><User size={18} /> CPF</button>
                  <button type="button" className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`} onClick={() => setLoginMethod('email')}><Mail size={18} /> Email</button>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="login-form">
                {userProfile === 'patient' && loginMethod === 'cpf' ? (
                  <div className="form-group mb-6">
                    <label className="form-label">CPF</label>
                    <input type="text" name="cpf" placeholder="000.000.000-00" value={loginForm.cpf} onChange={handleLoginInputChange} className="form-input" maxLength={14} />
                  </div>
                ) : (
                  <div className="form-group mb-6">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" placeholder={userProfile === 'admin' ? 'admin@neurovita.com.br' : 'seu@email.com'} value={loginForm.email} onChange={handleLoginInputChange} className="form-input" />
                  </div>
                )}
                <div className="form-group mb-8">
                  <label className="form-label">Senha</label>
                  <input type="password" name="password" placeholder="Digite sua senha" value={loginForm.password} onChange={handleLoginInputChange} className="form-input" maxLength={14} />
                </div>
                <button type="submit" disabled={isLoading || !isLoginValid} className="form-submit-button w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">{isLoading ? 'Processando...' : (userProfile === 'admin' ? 'Entrar como Admin' : 'Entrar')}</button>
              </form>
            </>
          ) : (
            <form onSubmit={handleSignupSubmit} className="login-form">
              <div className="form-group mb-4">
                <label className="form-label">Nome Completo</label>
                <input type="text" name="fullName" placeholder="Digite seu nome completo" value={signupForm.fullName} onChange={handleSignupInputChange} className="form-input" />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Email</label>
                <input type="email" name="email" placeholder="seu@email.com" value={signupForm.email} onChange={handleSignupInputChange} className="form-input" />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">CPF</label>
                <input type="text" name="cpf" placeholder="000.000.000-00" value={signupForm.cpf} onChange={handleSignupInputChange} className="form-input" maxLength={14} />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Telefone</label>
                <input type="text" name="phone" placeholder="(00) 00000-0000" value={signupForm.phone} onChange={handleSignupInputChange} className="form-input" />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Senha</label>
                <input type="password" name="password" placeholder="Mínimo 6 caracteres" value={signupForm.password} onChange={handleSignupInputChange} className="form-input" maxLength={14} />
              </div>
              <div className="form-group mb-8">
                <label className="form-label">Confirmar Senha</label>
                <input type="password" name="confirmPassword" placeholder="Repita sua senha" value={signupForm.confirmPassword} onChange={handleSignupInputChange} className="form-input" maxLength={14} />
              </div>
              <button type="submit" disabled={isLoading || !isSignupValid} className="form-submit-button w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">{isLoading ? 'Processando...' : 'Criar Conta'}</button>
            </form>
          )}
        </div>
      </div>

      <Modal 
        isOpen={modalConfig.isOpen} 
        type={modalConfig.type} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default Login;
