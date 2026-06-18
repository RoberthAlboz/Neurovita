import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import Loading from '../components/common/Loading';
import FloatingLines from '../components/backgrounds/FloatingLines/FloatingLines';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getApiUrl } from '../constants/api';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PatientAttachments from '../components/patient/PatientAttachments';
import ConsentForm from '../components/legal/ConsentForm';
import { User, Camera, Mail, CreditCard, Phone, Edit3, LogOut, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import '../styles/profile.css';

const UserProfile: React.FC = () => {
  const [, setLocation] = useLocation();
  const { logout, userIdentifier, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cpf: '',
    phone: '',
    profileImage: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!userIdentifier) {
        setIsLoading(false);
        return;
      }

      try {
        const userResponse = await fetch(`${getApiUrl('USER_PROFILE')}?userId=${userIdentifier}`);
        const userData = await userResponse.json();

        if (userResponse.ok && userData.user) {
          setFormData({
            fullName: userData.user.fullName || '',
            email: userData.user.email || '',
            cpf: userData.user.cpf || '',
            phone: userData.user.phone || '',
            profileImage: userData.user.profile_image || '',
          });
        }
      } catch (error) {
        console.error('Erro de conexão ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userIdentifier]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userIdentifier) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('photo', file);
    uploadFormData.append('userId', userIdentifier);

    setIsUploading(true);

    try {
      const response = await fetch(getApiUrl('UPLOAD_PHOTO'), {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok && data.profile_image) {
        setFormData(prev => ({ ...prev, profileImage: data.profile_image }));
        alert('Foto atualizada com sucesso!');
      } else {
        alert('Erro ao fazer upload da foto. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro de conexão ao fazer upload da foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userIdentifier) return;

    setIsSaving(true);

    try {
      const response = await fetch(getApiUrl('USER_PROFILE'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdentifier,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Perfil atualizado com sucesso!');
        setIsEditing(false);
      } else {
        alert(data.message || 'Erro ao atualizar perfil.');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro de conexão ao atualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loading isVisible={true} message="Carregando seu perfil..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Loading isVisible={isSaving || isUploading} message={isUploading ? "Atualizando foto..." : "Salvando perfil..."} />
      
      <main className="profile-main">
        {/* Background Animado */}
        <div className="profile-bg-container">
          <FloatingLines
            linesGradient={isDark ? ['#1e293b', '#4361ee', '#1e293b'] : ['#e2e8f0', '#4361ee', '#e2e8f0']}
            animationSpeed={0.5}
          />
        </div>

        <div className="profile-container">
          {/* Sidebar Sidebar */}
          <aside className="profile-sidebar animate-in">
            <div className="profile-avatar-container">
              <div className="profile-avatar-main">
                <div className="profile-avatar-inner">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Perfil" className="profile-avatar-img" />
                  ) : (
                    <User size={64} className="text-slate-400" />
                  )}
                </div>
              </div>
              <label className="profile-avatar-upload">
                <Camera size={20} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <h2 className="profile-user-name">{formData.fullName || 'Usuário'}</h2>
            <span className="profile-user-role">{isAdmin ? 'Administrador' : 'Paciente'}</span>
            
            <div className="w-full mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  logout();
                  setLocation('/');
                }}
                className="p-btn p-btn-danger"
              >
                <LogOut size={18} />
                Sair da Conta
              </button>
            </div>
          </aside>

          {/* Content Content Area */}
          <div className="profile-content-area animate-in">
            {/* Dados Pessoais Card */}
            <section className="profile-card">
              <h3 className="profile-card-title">
                <ShieldCheck size={24} />
                Dados Cadastrais
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                <div className="profile-form-grid">
                  <div className="profile-form-group full">
                    <label className="profile-label">Nome Completo</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="profile-input-modern"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label className="profile-label">E-mail</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="profile-input-modern"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-label">Telefone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="profile-input-modern"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="profile-form-group full">
                    <label className="profile-label">CPF (Documento)</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      disabled
                      className="profile-input-modern opacity-60"
                    />
                  </div>
                </div>

                <div className="profile-btn-group">
                  {isEditing ? (
                    <>
                      <button type="submit" className="p-btn p-btn-primary">
                        <CheckCircle2 size={18} />
                        Confirmar Alterações
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)} 
                        className="p-btn p-btn-secondary"
                      >
                        Descartar
                      </button>
                    </>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(true)} 
                      className="p-btn p-btn-primary"
                    >
                      <Edit3 size={18} />
                      Editar Perfil
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Documentos Card */}
            <section className="profile-card">
              <h3 className="profile-card-title">
                <FileText size={24} />
                Documentos e Exames
              </h3>
              <div className="mt-4">
                {userIdentifier && <PatientAttachments userId={parseInt(userIdentifier)} />}
              </div>
            </section>

            {/* LGPD Card */}
            {!isAdmin && userIdentifier && (
              <section className="profile-card">
                <h3 className="profile-card-title">
                  <ShieldCheck size={24} />
                  Privacidade e Termos
                </h3>
                <div className="mt-4">
                  <ConsentForm userId={parseInt(userIdentifier)} />
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
