import React, { useState, useEffect } from 'react';
import { Calendar, FileText, TrendingUp, Heart, AlertCircle, Clock, CheckCircle, XCircle, Droplets, Activity, Moon, Utensils } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../constants/api';
import './Dashboard.css';

interface Appointment {
  id: number;
  appointmentType: string;
  planType: string;
  professional?: string;
  specialty: string;
  scheduledDate: string;
  scheduledTime?: string;
  convenio?: string | null;
  plan?: string | null;
  status: string;
  createdAt: string;
}

interface ExamResult {
  id: number;
  examType: string;
  result: string;
  date: string;
  status: string;
}

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalExams: number;
}

const Dashboard: React.FC = () => {
  const { userIdentifier } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalExams: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'exams'>('overview');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userIdentifier) {
        setIsLoading(false);
        return;
      }

      try {
        const [appointmentsResponse, examsResponse] = await Promise.all([
          fetch(`${getApiUrl('APPOINTMENT')}?userId=${userIdentifier}`),
          fetch(`${getApiUrl('EXAM_RESULTS')}?userId=${userIdentifier}`).catch(() => null),
        ]);

        const appointmentsData = await appointmentsResponse.json();

        if (appointmentsResponse.ok && appointmentsData.appointments) {
          setAppointments(appointmentsData.appointments);

          const pending = appointmentsData.appointments.filter(
            (apt: Appointment) => apt.status === 'pending'
          ).length;
          const completed = appointmentsData.appointments.filter(
            (apt: Appointment) => apt.status === 'completed' || apt.status === 'confirmed' || apt.status === 'finished'
          ).length;

          setStats(prev => ({
            ...prev,
            totalAppointments: appointmentsData.appointments.length,
            pendingAppointments: pending,
            completedAppointments: completed,
          }));
        }

        if (examsResponse && examsResponse.ok) {
          const examsData = await examsResponse.json();
          if (examsData.exams) {
            setExamResults(examsData.exams);
            setStats(prev => ({
              ...prev,
              totalExams: examsData.exams.length,
            }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [userIdentifier]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatAppointmentType = (type: string) =>
    type === 'rehabilitation' ? 'Reabilitação' : 'Consulta';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
      case 'finished':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'in_service':
        return <Activity size={16} className="text-blue-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      case 'faltou':
        return <AlertCircle size={16} className="text-orange-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
      case 'finished':
        return 'Concluído';
      case 'confirmed':
        return 'Confirmado';
      case 'in_service':
        return 'Em Atendimento';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'faltou':
        return 'Faltou';
      default:
        return 'Desconhecido';
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Carregando seu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header do Dashboard */}
      <div className="dashboard-header-section">
        <h2 className="dashboard-title">Minha Saúde</h2>
        <p className="dashboard-subtitle">Acompanhe seu histórico médico e agendamentos no Neurovita.</p>
      </div>

      {/* Tabs de Navegação */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={18} />
          Visão Geral
        </button>
        <button
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <Calendar size={18} />
          Consultas
        </button>
        <button
          className={`tab-button ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          <FileText size={18} />
          Resultados
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'overview' && (
        <div className="dashboard-overview">
          {/* Cards de Estatísticas */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)' }}>
                <Calendar size={24} style={{ color: '#0284C7' }} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total de Consultas</p>
                <p className="stat-value">{stats.totalAppointments}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' }}>
                <Clock size={24} style={{ color: '#D97706' }} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Pendentes</p>
                <p className="stat-value">{stats.pendingAppointments}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)' }}>
                <CheckCircle size={24} style={{ color: '#9333EA' }} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Concluídas</p>
                <p className="stat-value">{stats.completedAppointments}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)' }}>
                <FileText size={24} style={{ color: '#16A34A' }} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Exames</p>
                <p className="stat-value">{stats.totalExams}</p>
              </div>
            </div>
          </div>

          <div className="overview-content-grid">
            {/* Próximas Consultas */}
            <div className="activity-section card-style">
              <h3 className="section-title">Próximos Agendamentos</h3>
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <Heart size={32} />
                  <p>Nenhuma consulta agendada</p>
                </div>
              ) : (
                <div className="appointments-preview">
                  {appointments.slice(0, 3).map(apt => (
                    <div key={apt.id} className="appointment-item">
                      <div className="appointment-date-badge">
                        <Calendar size={14} />
                        <span>{formatDate(apt.scheduledDate)}</span>
                      </div>
                      <div className="appointment-info">
                        <p className="appointment-type">
                          {formatAppointmentType(apt.appointmentType)} - {apt.specialty}
                        </p>
                        <p className="appointment-professional">
                          {apt.professional || 'Profissional não informado'}
                        </p>
                      </div>
                      <div className="appointment-status-badge">
                        {getStatusIcon(apt.status)}
                        <span>{getStatusLabel(apt.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dicas de Saúde */}
            <div className="recommendations-section card-style">
              <h3 className="section-title">Dicas de Saúde</h3>
              <div className="tips-list">
                <div className="tip-item">
                  <div className="tip-icon-box"><Droplets size={18} /></div>
                  <div className="tip-info">
                    <p className="tip-title">Hidratação</p>
                    <p className="tip-desc">Beba pelo menos 2 litros de água por dia.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon-box"><Activity size={18} /></div>
                  <div className="tip-info">
                    <p className="tip-title">Exercícios</p>
                    <p className="tip-desc">Pratique 30 minutos de atividade física.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon-box"><Moon size={18} /></div>
                  <div className="tip-info">
                    <p className="tip-title">Sono</p>
                    <p className="tip-desc">Mantenha uma rotina de 7-8h de sono.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <div className="tip-icon-box"><Utensils size={18} /></div>
                  <div className="tip-info">
                    <p className="tip-title">Alimentação</p>
                    <p className="tip-desc">Consuma mais frutas e vegetais frescos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="dashboard-appointments card-style">
          <h3 className="section-title">Histórico de Consultas</h3>
          {appointments.length === 0 ? (
            <div className="empty-state">
              <Calendar size={32} />
              <p>Nenhuma consulta agendada</p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map(apt => (
                <div key={apt.id} className="appointment-card-full">
                  <div className="appointment-card-header">
                    <div className="appointment-card-title">
                      <h4>{formatAppointmentType(apt.appointmentType)}</h4>
                      <span className="specialty-badge">{apt.specialty}</span>
                    </div>
                    <div className="appointment-card-status">
                      {getStatusIcon(apt.status)}
                      <span>{getStatusLabel(apt.status)}</span>
                    </div>
                  </div>

                  <div className="appointment-card-details">
                    <div className="detail-item">
                      <span className="detail-label">Data</span>
                      <span className="detail-value">{formatDate(apt.scheduledDate)}</span>
                    </div>
                    {apt.scheduledTime && (
                      <div className="detail-item">
                        <span className="detail-label">Hora</span>
                        <span className="detail-value">{apt.scheduledTime}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Profissional</span>
                      <span className="detail-value">{apt.professional || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Plano</span>
                      <span className="detail-value">
                        {apt.planType === 'particular' ? 'Particular' : 'Convênio'}
                        {apt.convenio && ` · ${apt.convenio}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="dashboard-exams card-style">
          <h3 className="section-title">Resultados de Exames</h3>
          {examResults.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} />
              <p>Nenhum resultado de exame disponível</p>
            </div>
          ) : (
            <div className="exams-list">
              {examResults.map(exam => (
                <div key={exam.id} className="exam-card-full">
                  <div className="exam-card-header">
                    <h4>{exam.examType}</h4>
                    <span className={`exam-status-badge ${exam.status}`}>
                      {exam.status === 'available' ? 'Disponível' :
                       exam.status === 'pending' ? 'Pendente' :
                       exam.status === 'reviewed' ? 'Revisado' : exam.status}
                    </span>
                  </div>
                  <div className="exam-card-content">
                    <p className="exam-result-text">{exam.result}</p>
                    <div className="exam-footer">
                      <span className="exam-date-text">Realizado em {formatDate(exam.date)}</span>
                      <button className="btn-download-result">Ver Laudo</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
