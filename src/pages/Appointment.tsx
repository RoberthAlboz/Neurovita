import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { formatCPF, cleanCPF } from '../utils/cpfValidator';
import FloatingLines from '../components/backgrounds/FloatingLines/FloatingLines';
import Loading from '../components/common/Loading';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../constants/api';
import { Calendar, User, ShieldCheck, ArrowRight, CheckCircle2, Star, Info, Award, Clock, ChevronLeft, ChevronRight, CreditCard, Wallet, Landmark } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/appointment.css';

type AppointmentType = 'consultation' | 'rehabilitation';
type PlanType = 'convenio' | 'particular';
type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';

interface Professional {
  id: string;
  name: string;
  role: string;
  rating: number;
  crm: string;
  image?: string;
  specialtyId: string;
}

interface Specialty {
  id: string;
  title: string;
}

const convenios = [
  { id: 'unimed', name: 'Unimed', plans: ['Básico', 'Especial', 'Pleno'] },
  { id: 'bradesco', name: 'Bradesco Saúde', plans: ['Bronze', 'Prata', 'Ouro'] },
  { id: 'sulamerica', name: 'SulAmérica', plans: ['Direto', 'Exato', 'Especial'] },
  { id: 'amil', name: 'Amil', plans: ['S380', 'S450', 'S750'] }
];

const availableTimes = [
  "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const prices: Record<AppointmentType, number> = {
  consultation: 250,
  rehabilitation: 180,
};

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'pix', label: 'Pix', icon: <Wallet size={18} /> },
  { id: 'cartao_credito', label: 'Crédito', icon: <CreditCard size={18} /> },
  { id: 'cartao_debito', label: 'Débito', icon: <Landmark size={18} /> },
  { id: 'dinheiro', label: 'Dinheiro', icon: <Wallet size={18} /> },
];

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const specialtyIdMap: Record<string, string> = {
  'neuro-geral': 'neuro-geral',
  'neuro-cirurgia': 'neuro-cirurgia',
  'neuro-pediatria': 'neuro-pediatria',
  'reabilitacao': 'reabilitacao'
};

const Appointment: React.FC = () => {
  const [, setLocation] = useLocation();
  const { userIdentifier, user } = useAuth();
  const { isDark } = useTheme();
  
  const searchParams = new URLSearchParams(window.location.search);
  const initialSpecialtyRaw = searchParams.get('specialty');
  const initialSpecialty = initialSpecialtyRaw ? specialtyIdMap[initialSpecialtyRaw] || initialSpecialtyRaw : '';

  const [appointmentType, setAppointmentType] = useState<AppointmentType>(
    initialSpecialty === 'reabilitacao' ? 'rehabilitation' : 'consultation'
  );
  
  const [planType, setPlanType] = useState<PlanType>('convenio');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  const loggedUserCPF = user?.cpf ? formatCPF(user.cpf) : '';
  const isCPFMatchingLoggedUser = (cpf: string) => Boolean(loggedUserCPF) && cleanCPF(cpf) === cleanCPF(loggedUserCPF);

  const [cpfState, setCPFState] = useState({
    showCPFInput: true,
    cpfEntered: loggedUserCPF,
    cpfValidated: false,
  });

  const [formData, setFormData] = useState({
    professionalId: '',
    specialty: initialSpecialty,
    convenio: '',
    plan: '',
    paymentMethod: '' as PaymentMethod | '',
    date: '',
    time: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const response = await fetch(getApiUrl('CONTENT_DATA'));
        if (!response.ok) throw new Error('Erro ao carregar dados');
        const data = await response.json();
        if (data.professionals) setProfessionals(data.professionals);
        if (data.specialties) setSpecialties(data.specialties);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do sistema');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (appointmentType === 'rehabilitation' && professionals.length > 0) {
      const sofia = professionals.find(p => p.specialtyId === 'reabilitacao');
      setFormData(prev => ({
        ...prev,
        specialty: 'reabilitacao',
        professionalId: sofia ? sofia.id : ''
      }));
    }
  }, [appointmentType, professionals]);

  const handleTypeChange = (type: AppointmentType) => {
    setAppointmentType(type);
    if (type === 'rehabilitation' && professionals.length > 0) {
      const sofia = professionals.find(p => p.specialtyId === 'reabilitacao');
      setFormData(prev => ({ ...prev, specialty: 'reabilitacao', professionalId: sofia ? sofia.id : '', time: '' }));
    } else {
      setFormData(prev => ({ ...prev, specialty: '', professionalId: '', time: '' }));
    }
  };

  const filteredProfessionals = professionals.filter(p => p.specialtyId === formData.specialty);
  const filteredSpecialties = specialties.filter(s => s.id !== 'reabilitacao');

  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCPFState(prev => ({ ...prev, cpfEntered: formatted }));
  };

  const handleCPFSubmit = () => {
    if (!loggedUserCPF) {
      alert('Não foi possível localizar o CPF da sua conta. Faça login novamente para continuar.');
      setLocation('/login');
      return;
    }

    if (!isCPFMatchingLoggedUser(cpfState.cpfEntered)) {
      alert('O CPF informado não corresponde ao CPF cadastrado na conta logada. Use o CPF da sua própria conta para continuar.');
      return;
    }

    setCPFState(prev => ({ ...prev, cpfValidated: true, showCPFInput: false }));
  };

  const currentPrice = prices[appointmentType];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'specialty') {
      setFormData(prev => ({ ...prev, professionalId: '', time: '', [name]: value }));
    } else if (name === 'convenio') {
      setFormData(prev => ({ ...prev, plan: '', [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const selectDate = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate < today) {
      alert("Não é possível selecionar uma data passada.");
      return;
    }
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, date: formattedDate, time: '' }));
  };

  const handleSubmitAppointment = async () => {
    if (!userIdentifier) {
      alert('Você precisa estar logado para agendar.');
      setLocation('/login');
      return;
    }

    if (!isCPFMatchingLoggedUser(cpfState.cpfEntered)) {
      alert('O CPF do agendamento precisa ser o mesmo CPF da conta logada. Valide novamente para continuar.');
      setCPFState(prev => ({ ...prev, showCPFInput: true, cpfValidated: false }));
      return;
    }

    if (!formData.professionalId || !formData.specialty || !formData.date || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios (incluindo o horário).');
      return;
    }

    if (planType === 'convenio' && (!formData.convenio || !formData.plan)) {
      alert('Por favor, selecione o convênio e o plano.');
      return;
    }

    if (planType === 'particular' && !formData.paymentMethod) {
      alert('Por favor, selecione o método de pagamento.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedProf = professionals.find(p => p.id === formData.professionalId);
      const selectedSpec = specialties.find(s => s.id === formData.specialty);
      
      const response = await fetch(getApiUrl('APPOINTMENT'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdentifier,
          cpf: cpfState.cpfEntered,
          appointmentType,
          planType,
          professional: selectedProf?.name,
          professionalCrm: selectedProf?.crm,
          specialty: selectedSpec?.title || formData.specialty,
          scheduledDate: formData.date,
          scheduledTime: formData.time,
          convenio: formData.convenio,
          plan: formData.plan,
          paymentMethod: planType === 'particular' ? formData.paymentMethod : 'convenio_billing',
          appointmentValue: currentPrice
        }),
      });

      if (response.ok) {
        alert('Agendamento realizado com sucesso!');
        setLocation('/dashboard');
      } else {
        const data = await response.json();
        alert(data.message || 'Erro ao realizar agendamento.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <Loading isVisible={true} message="Carregando dados..." />;
  }

  if (error) {
    return (
      <div className="login-container">
        <div className="login-right">
          <div className="login-form-container" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Erro ao carregar</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
            <button onClick={() => setLocation('/')} className="form-submit-button">Voltar para Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (cpfState.showCPFInput && !cpfState.cpfValidated) {
    return (
      <div className="login-container">
        <div className="login-left">
          <div className="login-left-bg">
            <FloatingLines linesGradient={['#457EAC', '#9191E9', '#C2AFF0']} enabledWaves={['top', 'middle', 'bottom']} lineCount={[8, 8, 8]} lineDistance={[8, 8, 8]} animationSpeed={1} interactive={true} bendRadius={5.0} bendStrength={-0.5} parallax={true} parallaxStrength={0.2} mixBlendMode="normal" />
          </div>
          <button onClick={() => setLocation('/')} className="login-back-button"><i className="bi bi-arrow-left"></i> Voltar</button>
          <div className="login-left-content">
            <div className="login-illustration"><div className="illustration-placeholder"><ShieldCheck size={80} color="white" /></div></div>
            <h1 className="login-left-title">Segurança em primeiro lugar</h1>
            <p className="login-left-bottom" style={{ marginTop: '2rem' }}>Validamos seu CPF para proteger seus dados e agendamentos.</p>
          </div>
        </div>
        <div className="login-right">
          <div className="login-form-container">
            <div className="login-logo">
              <img 
                src={isDark ? "/assets/images/logoescura.png" : "/assets/images/logo.png"} 
                alt="Neurovita" 
                className="logo-image-login" 
              />
            </div>
            <div className="login-form-header">
              <h2 className="login-form-title">Validação de CPF</h2>
              <p className="login-form-subtitle">Para agendar, precisamos validar o CPF cadastrado na sua conta.</p>
            </div>
            <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleCPFSubmit(); }}>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-person-vcard" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9191E9' }}></i>
                  <input type="text" value={cpfState.cpfEntered} onChange={handleCPFChange} placeholder={loggedUserCPF || 'XXX.XXX.XXX-XX'} className="form-input" style={{ paddingLeft: '3rem' }} maxLength={14} required />
                </div>
              </div>
              <button type="submit" className="form-submit-button" disabled={!isCPFMatchingLoggedUser(cpfState.cpfEntered)}>Validar CPF</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <Loading isVisible={isSubmitting} message="Registrando agendamento..." />
      <div className="login-left">
        <div className="login-left-bg">
          <FloatingLines linesGradient={['#457EAC', '#9191E9', '#C2AFF0']} enabledWaves={['top', 'middle', 'bottom']} lineCount={[8, 8, 8]} lineDistance={[8, 8, 8]} animationSpeed={1} interactive={true} bendRadius={5.0} bendStrength={-0.5} parallax={true} parallaxStrength={0.2} mixBlendMode="normal" />
        </div>
        <button onClick={() => setCPFState(prev => ({ ...prev, showCPFInput: true, cpfValidated: false }))} className="login-back-button"><i className="bi bi-arrow-left"></i> Alterar CPF</button>
        <div className="login-left-content">
          <div className="login-illustration"><div className="illustration-placeholder"><Calendar size={80} color="white" /></div></div>
          <h1 className="login-left-title">Agende seu atendimento</h1>
          <p className="login-left-bottom" style={{ marginTop: '2rem' }}>Escolha o profissional e a melhor data para você.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container appointment-form-container">
          {/* Estilos em src/styles/appointment.css */}
          
          <div className="appointment-header">
            <h2 className="appointment-title">Agendamento</h2>
            <div className="appointment-cpf-badge">
              <ShieldCheck size={16} />
              <span>{cpfState.cpfEntered}</span>
            </div>
          </div>

          <span className="section-label">Tipo de Atendimento</span>
          <div className="appointment-tabs">
            <button 
              type="button" 
              className={`appointment-tab ${appointmentType === 'consultation' ? 'active' : ''}`} 
              onClick={() => handleTypeChange('consultation')}
            >
              <div className="tab-icon-box"><User size={24} /></div>
              Consulta Médica
            </button>
            <button 
              type="button" 
              className={`appointment-tab ${appointmentType === 'rehabilitation' ? 'active' : ''}`} 
              onClick={() => handleTypeChange('rehabilitation')}
            >
              <div className="tab-icon-box"><Calendar size={24} /></div>
              Reabilitação
            </button>
          </div>

          <span className="section-label">Forma de Pagamento</span>
          <div className="plan-selector">
            <div 
              className={`plan-option ${planType === 'convenio' ? 'active' : ''}`}
              onClick={() => setPlanType('convenio')}
            >
              <div className="plan-radio"></div>
              <div className="plan-info">
                <h3>Convênio</h3>
                <p>Cobertura pelo seu plano</p>
              </div>
            </div>
            <div 
              className={`plan-option ${planType === 'particular' ? 'active' : ''}`}
              onClick={() => setPlanType('particular')}
            >
              <div className="plan-radio"></div>
              <div className="plan-info">
                <h3>Particular</h3>
                <p>Pagamento direto na clínica</p>
              </div>
            </div>
          </div>

          <span className="section-label">Especialidade</span>
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <div className="specialty-select-wrapper">
              <Info size={18} className="specialty-select-icon" />
              <select 
                name="specialty" 
                value={formData.specialty} 
                onChange={handleInputChange} 
                className="form-input appointment-select"
                style={{ paddingLeft: '3.2rem' }}
                disabled={appointmentType === 'rehabilitation'}
              >
                <option value="">Selecione a especialidade</option>
                {filteredSpecialties.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>

          <span className="section-label">Profissional Disponível</span>
          <div className="professionals-selection-grid">
            {filteredProfessionals.length > 0 ? (
              filteredProfessionals.map(p => (
                <div 
                  key={p.id} 
                  className={`professional-card-select ${formData.professionalId === p.id ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, professionalId: p.id }))}
                >
                  <div className="professional-card-top">
                    <div className="professional-card-image-wrapper">
                      <img src={p.image || '/assets/images/logo.png'} alt={p.name} className="professional-card-img" />
                      <div className="professional-card-rating">
                        <Star size={12} fill="#FFD700" color="#FFD700" />
                        <span>{p.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <h4 className="professional-card-name">{p.name}</h4>
                  </div>
                  <p className="professional-card-role">{p.role}</p>
                  <div className="professional-card-footer">
                    <div className="professional-card-badge">
                      <Award size={14} />
                      <span>{p.crm}</span>
                    </div>
                    {formData.professionalId === p.id && <CheckCircle2 size={20} color="#4361EE" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-professionals-message" style={{ gridColumn: 'span 2', padding: '2.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Info size={32} color="#9191E9" style={{ margin: '0 auto' }} />
                <span style={{ fontWeight: '600' }}>Selecione uma especialidade acima para ver nossos profissionais de excelência.</span>
              </div>
            )}
          </div>

          {planType === 'convenio' ? (
            <>
              <span className="section-label">Dados do Plano</span>
              <div className="convenio-selects-grid">
                <div className="form-group">
                  <select name="convenio" value={formData.convenio} onChange={handleInputChange} className="form-input appointment-select">
                    <option value="">Convênio</option>
                    {convenios.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <select name="plan" value={formData.plan} onChange={handleInputChange} className="form-input appointment-select" disabled={!formData.convenio}>
                    <option value="">Plano</option>
                    {formData.convenio && convenios.find(c => c.name === formData.convenio)?.plans.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="section-label">Método de Pagamento</span>
              <div className="payment-methods-grid">
                {paymentMethods.map(m => (
                  <div 
                    key={m.id} 
                    className={`payment-method-card ${formData.paymentMethod === m.id ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: m.id }))}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <span className="section-label">Selecione a Data</span>
          <div className="calendar-container">
            <div className="calendar-header">
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={() => {
                  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
                  const today = new Date();
                  const firstOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  if (prevMonth >= firstOfCurrentMonth) setCurrentDate(prevMonth);
                }}
                disabled={new Date(currentDate.getFullYear(), currentDate.getMonth() - 1) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                style={{ opacity: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1) < new Date(new Date().getFullYear(), new Date().getMonth(), 1) ? 0.3 : 1 }}
              ><ChevronLeft size={20} /></button>
              <span className="calendar-month">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
              <button type="button" className="calendar-nav-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}><ChevronRight size={20} /></button>
            </div>
            <div className="calendar-grid-days">
              <span className="day-label">DOM</span><span className="day-label">SEG</span><span className="day-label">TER</span><span className="day-label">QUA</span><span className="day-label">QUI</span><span className="day-label">SEX</span><span className="day-label">SAB</span>
            </div>
            <div className="calendar-grid">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = formData.date === dateStr;
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const today = new Date();
                today.setHours(0,0,0,0);
                const isPast = dateObj < today;
                
                return (
                  <button 
                    key={day} 
                    type="button" 
                    disabled={isPast}
                    onClick={() => selectDate(day)} 
                    className={`calendar-day ${isSelected ? 'selected' : ''}`}
                    style={{ opacity: isPast ? 0.3 : 1, cursor: isPast ? 'not-allowed' : 'pointer' }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {formData.date && (
            <>
              <span className="section-label">Horários Disponíveis</span>
              <div className="time-grid">
                {availableTimes.map(time => (
                  <button 
                    key={time} 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, time }))} 
                    className={`time-btn ${formData.time === time ? 'active' : ''}`}
                  >
                    <Clock size={16} />
                    {time}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="price-summary">
            <div className="summary-info">
              <h4>Total do Atendimento</h4>
              <p>{formatCurrency(currentPrice)}</p>
            </div>
            <div className="summary-badge">
              {appointmentType === 'consultation' ? 'Consulta Médica' : 'Reabilitação'}
            </div>
          </div>

          <button 
            type="button" 
            className="appointment-submit-btn" 
            disabled={
              !formData.professionalId ||
              !formData.date ||
              !formData.time ||
              (planType === 'particular' ? !formData.paymentMethod : (!formData.convenio || !formData.plan))
            }
            onClick={handleSubmitAppointment}
          >
            Confirmar Agendamento <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
