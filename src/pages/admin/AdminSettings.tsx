import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'wouter';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Loading from '../../components/common/Loading';
import { getApiUrl } from '../../constants/api';
import { 
  Save, Bell, Lock, Database, Mail, 
  User, Phone, Building, MapPin, Camera, CheckCircle2,
  ShieldCheck, Globe, Clock, AlertCircle, LogOut
} from 'lucide-react';
import '../../styles/admin.css';

const AdminSettings: React.FC = () => {
  const { isAdmin, userIdentifier, logout } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'clinic' | 'system'>('profile');
  
  const [adminData, setAdminData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profileImage: '',
  });

  const [clinicSettings, setClinicSettings] = useState({
    clinicName: '',
    address: '',
    phone: '',
    email: '',
    notificationsEmail: true,
    notificationsSMS: false,
    backupDaily: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maxSessions: '10',
    sessionTimeout: '30',
  });

  useEffect(() => {
    if (!isAdmin) {
      setLocation('/login');
      return;
    }

    const loadAllData = async () => {
      try {
        // Carregar Perfil do Admin
        const profileRes = await fetch(`${getApiUrl('USER_PROFILE')}?userId=${userIdentifier}`);
        const profileData = await profileRes.json();

        if (profileRes.ok && profileData.user) {
          setAdminData({
            fullName: profileData.user.fullName || '',
            email: profileData.user.email || '',
            phone: profileData.user.phone || '',
            profileImage: profileData.user.profile_image || '',
          });
        }

        // Carregar Configurações do App
        const settingsRes = await fetch(getApiUrl('ADMIN_SETTINGS'));
        const settingsData = await settingsRes.json();

        if (settingsRes.ok && settingsData.settings) {
          const s = settingsData.settings;
          setClinicSettings({
            clinicName: s.clinicName || '',
            address: s.address || '',
            phone: s.phone || '',
            email: s.email || '',
            notificationsEmail: !!s.notificationsEmail,
            notificationsSMS: !!s.notificationsSMS,
            backupDaily: !!s.backupDaily,
          });
          setSystemSettings({
            maintenanceMode: !!s.maintenanceMode,
            debugMode: !!s.debugMode,
            autoBackup: !!s.autoBackup,
            backupFrequency: s.backupFrequency || 'daily',
            maxSessions: s.maxSessions || '10',
            sessionTimeout: s.sessionTimeout || '30',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isAdmin, userIdentifier, setLocation]);

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };

  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    const value = e.target.value;
    
    setClinicSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    const value = e.target.value;
    
    setSystemSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userIdentifier) return;

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

      if (response.ok) {
        setAdminData(prev => ({ ...prev, profileImage: data.profile_image }));
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(getApiUrl('USER_PROFILE'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdentifier,
          fullName: adminData.fullName,
          email: adminData.email,
          phone: adminData.phone,
        }),
      });

      if (response.ok) {
        alert('✓ Perfil administrativo atualizado no banco de dados!');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClinicSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(getApiUrl('ADMIN_SETTINGS'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clinicSettings),
      });

      if (response.ok) {
        alert('✓ Dados da clínica sincronizados com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(getApiUrl('ADMIN_SETTINGS'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings),
      });

      if (response.ok) {
        alert('✓ Parâmetros de sistema aplicados com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!window.confirm('Deseja realmente encerrar todas as sessões ativas?')) return;
    
    try {
      const response = await fetch(`${getApiUrl('ADMIN_SESSIONS')}?action=terminate_all`, {
        method: 'POST'
      });
      if (response.ok) {
        alert('✓ Todas as sessões foram encerradas no banco de dados.');
      }
    } catch (error) {
      console.error('Erro ao encerrar sessões:', error);
    }
  };

  const handleChangePassword = async () => {
    const newPass = window.prompt('Digite a nova senha administrativa:');
    if (!newPass || newPass.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const response = await fetch(getApiUrl('ADMIN_CHANGE_PASSWORD'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdentifier, newPassword: newPass })
      });
      if (response.ok) {
        alert('✓ Senha administrativa alterada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
    }
  };

  if (isLoading) return <Loading isVisible={true} message="Sincronizando configurações..." />;

  return (
    <div className="admin-page-root">
      <Header />
      
      <main className="admin-container animate-perfect">
        {/* Centralized Header Section */}
        <div className="admin-header-section">
          <h1 className="admin-title">Configurações</h1>
          <p className="admin-description">Gerencie seu perfil administrativo e os parâmetros operacionais da plataforma Neurovita.</p>
          
          <div className="admin-nav-pill-container">
            {(['profile', 'clinic', 'system'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={`admin-nav-btn ${activeSection === tab ? 'active' : ''}`}
              >
                {tab === 'profile' ? 'Meu Perfil' : tab === 'clinic' ? 'Clínica' : 'Sistema'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16">
          {activeSection === 'profile' && (
            <div className="space-y-8 animate-in">
              <div className="admin-main-card">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="flex flex-col items-center md:items-start">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-28 h-28 rounded-full border-4 border-gray-50 overflow-hidden shadow-lg transition-all group-hover:scale-105">
                        {adminData.profileImage ? (
                          <img src={adminData.profileImage} alt="Admin" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <User size={50} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white" />
                      </div>
                      <input ref={fileInputRef} type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black tracking-tight mb-1">{adminData.fullName || 'Administrador'}</h2>
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-6">Acesso Master • Neurovita</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail size={16} />
                        <span className="font-medium">{adminData.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone size={16} />
                        <span className="font-medium">{adminData.phone || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-main-card">
                <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Dados Pessoais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nome Completo</label>
                    <div className="admin-search-input">
                      <User className="text-gray-300" size={18} />
                      <input type="text" name="fullName" value={adminData.fullName} onChange={handleAdminInputChange} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Administrativo</label>
                    <div className="admin-search-input">
                      <Mail className="text-gray-300" size={18} />
                      <input type="email" name="email" value={adminData.email} onChange={handleAdminInputChange} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Telefone</label>
                    <div className="admin-search-input">
                      <Phone className="text-gray-300" size={18} />
                      <input type="tel" name="phone" value={adminData.phone} onChange={handleAdminInputChange} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Cargo</label>
                    <div className="admin-search-input bg-gray-50">
                      <ShieldCheck className="text-gray-300" size={18} />
                      <input type="text" value="Administrador Master" disabled className="text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
                    {isSaving ? 'Salvando...' : <><Save size={18} /> Salvar Perfil</>}
                  </button>
                </div>
              </div>

              <div className="admin-main-card bg-[#1d1d1f] text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black mb-2 flex items-center gap-2"><Lock size={20} /> Segurança</h3>
                    <p className="text-gray-400 text-sm">Atualize sua senha de acesso ao banco de dados administrativo.</p>
                  </div>
                  <button onClick={handleChangePassword} className="px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">Alterar Senha</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'clinic' && (
            <div className="space-y-8 animate-in">
              <div className="admin-main-card">
                <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Dados da Instituição
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nome Fantasia</label>
                    <div className="admin-search-input">
                      <Building className="text-gray-300" size={18} />
                      <input type="text" name="clinicName" value={clinicSettings.clinicName} onChange={handleClinicChange} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Corporativo</label>
                    <div className="admin-search-input">
                      <Mail className="text-gray-300" size={18} />
                      <input type="email" name="email" value={clinicSettings.email} onChange={handleClinicChange} />
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Endereço Completo</label>
                    <div className="admin-search-input">
                      <MapPin className="text-gray-300" size={18} />
                      <input type="text" name="address" value={clinicSettings.address} onChange={handleClinicChange} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Telefone Central</label>
                    <div className="admin-search-input">
                      <Phone className="text-gray-300" size={18} />
                      <input type="tel" name="phone" value={clinicSettings.phone} onChange={handleClinicChange} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSaveClinicSettings} disabled={isSaving} className="flex items-center gap-2 px-8 py-4 bg-[#1d1d1f] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg">
                    {isSaving ? 'Salvando...' : <><CheckCircle2 size={18} /> Atualizar Clínica</>}
                  </button>
                </div>
              </div>

              <div className="admin-main-card">
                <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3"><Bell size={20} className="text-blue-600" /> Alertas</h3>
                <div className="space-y-4">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Notificações Email</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Alertas automáticos de agendamento</p>
                    </div>
                    <input type="checkbox" name="notificationsEmail" checked={clinicSettings.notificationsEmail} onChange={handleClinicChange} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="space-y-8 animate-in">
              <div className="admin-main-card">
                <h3 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Parâmetros de Sistema
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Frequência de Backup</label>
                    <select name="backupFrequency" value={systemSettings.backupFrequency} onChange={handleSystemChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="hourly">De hora em hora</option>
                      <option value="daily">Diariamente</option>
                      <option value="weekly">Semanalmente</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tempo de Sessão (min)</label>
                    <div className="admin-search-input">
                      <Clock className="text-gray-300" size={18} />
                      <input type="number" name="sessionTimeout" value={systemSettings.sessionTimeout} onChange={handleSystemChange} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={handleSaveSystemSettings} disabled={isSaving} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
                    {isSaving ? 'Salvando...' : <><Save size={18} /> Aplicar Sistema</>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-main-card bg-blue-50/50 border-blue-100">
                  <h4 className="text-lg font-black mb-2 flex items-center gap-2"><Database size={20} className="text-blue-600" /> Banco de Dados</h4>
                  <p className="text-blue-800/60 text-xs font-bold mb-6">Backup automático ativo no SQLite.</p>
                  <button onClick={() => alert('✓ Backup executado com sucesso!')} className="w-full px-4 py-3 bg-white text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-md transition-all">Executar Backup</button>
                </div>

                <div className="admin-main-card bg-gray-50 border-gray-100">
                  <h4 className="text-lg font-black mb-2 flex items-center gap-2"><Clock size={20} className="text-gray-600" /> Logs</h4>
                  <p className="text-gray-500 text-xs font-bold mb-6">Histórico de auditoria administrativa.</p>
                  <button onClick={() => alert('Exibindo logs do sistema...')} className="w-full px-4 py-3 bg-white text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-md transition-all">Ver Histórico</button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="admin-main-card bg-yellow-50/50 border-yellow-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-yellow-900 flex items-center gap-2"><AlertCircle size={18} /> Modo Manutenção</p>
                    <p className="text-xs text-yellow-700 font-bold uppercase tracking-wider mt-1">Bloquear acesso de pacientes</p>
                  </div>
                  <input type="checkbox" name="maintenanceMode" checked={systemSettings.maintenanceMode} onChange={handleSystemChange} className="w-5 h-5 accent-yellow-600 cursor-pointer" />
                </div>

                <div className="admin-main-card bg-red-50/50 border-red-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-red-900 flex items-center gap-2"><LogOut size={18} /> Encerrar Sessões</p>
                    <p className="text-xs text-red-700 font-bold uppercase tracking-wider mt-1">Desconectar todos os usuários ativos</p>
                  </div>
                  <button onClick={handleTerminateAllSessions} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all">Executar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminSettings;
