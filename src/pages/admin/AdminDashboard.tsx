import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Activity, Search, Stethoscope, 
  Wallet, Download, ArrowRight, Zap, Bell, Settings, Plus,
  TrendingUp, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'wouter';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Loading from '../../components/common/Loading';
import { getApiUrl } from '../../constants/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import '../../styles/admin.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

type AdminTab = 'overview' | 'finance' | 'management';

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [revenueChartData, setRevenueChartData] = useState<any>(null);
  const [distributionChartData, setDistributionChartData] = useState<any>(null);
  const [expenseChartData, setExpenseChartData] = useState<any>(null);

  useEffect(() => {
    if (!isAdmin) { setLocation('/login'); return; }
    fetchDashboardData();
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(getApiUrl('ADMIN_DASHBOARD'));
      const data = await response.json();
      if (response.ok) {
        setDashboardData(data);
        
        // Processar dados de receita para o gráfico
        if (data.revenueData) {
          setRevenueChartData({
            labels: data.revenueData.map((d: any) => d.month),
            datasets: [{ 
              label: 'Receita (R$ mil)', 
              data: data.revenueData.map((d: any) => d.value), 
              backgroundColor: '#4361EE', 
              borderRadius: 8, 
              barThickness: 30 
            }]
          });
        }
        
        // Processar distribuição por especialidade
        if (data.specialtyDistribution) {
          setDistributionChartData({
            labels: data.specialtyDistribution.map((s: any) => s.name),
            datasets: [{ 
              data: data.specialtyDistribution.map((s: any) => s.value), 
              backgroundColor: ['#4361EE', '#9191E9', '#C2AFF0', '#457EAC', '#2D5D7B'], 
              borderWidth: 0 
            }]
          });
        }

        // Processar distribuição de despesas
        if (data.financials?.expenseDetails) {
          setExpenseChartData({
            labels: data.financials.expenseDetails.map((e: any) => e.category),
            datasets: [{
              data: data.financials.expenseDetails.map((e: any) => e.value),
              backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'],
              borderWidth: 0
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para formatar data e hora com segurança
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return { date: '--/--/--', time: '--:--' };
    
    try {
      // O SQLite retorna 'YYYY-MM-DD HH:MM:SS'. 
      // Substituir o espaço por 'T' para garantir compatibilidade ISO em todos os navegadores
      const date = new Date(dateStr.replace(' ', 'T'));
      
      if (isNaN(date.getTime())) {
        return { date: 'Data Inválida', time: '--:--' };
      }

      return {
        date: date.toLocaleDateString('pt-BR'),
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e) {
      return { date: 'Erro Data', time: '--:--' };
    }
  };

  if (isLoading) return <Loading isVisible={true} message="Carregando centro de comando..." />;

  const stats = dashboardData?.stats || { totalPatients: 0, totalAppointments: 0, pendingAppointments: 0, totalExams: 0 };
  const financials = dashboardData?.financials || { revenue: 0, expenses: 0, profit: 0 };

  return (
    <div className="admin-page-root">
      <Header />
      
      <main className="admin-container animate-perfect">
        {/* Centralized Header Section */}
        <div className="admin-header-section">
          <h1 className="admin-title">
            Sistema de<br/><span className="text-gradient">Gestão Vitali</span>
          </h1>
          <p className="admin-description">
            Interface unificada para controle de performance clínica, análise de dados reais e experiência do paciente.
          </p>
          
          <div className="admin-nav-pill-container">
            {(['overview', 'finance', 'management'] as AdminTab[]).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`admin-nav-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'overview' ? 'Visão Geral' : tab === 'finance' ? 'Financeiro' : 'Gestão'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="admin-stat-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-2xl"><Users className="text-blue-600" size={24} /></div>
                  <span className="text-green-500 font-bold text-xs flex items-center gap-1"><TrendingUp size={12} /> +12%</span>
                </div>
                <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Pacientes Ativos</h3>
                <p className="text-3xl font-black mt-1">{stats.totalPatients}</p>
              </div>

              <div className="admin-stat-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 rounded-2xl"><Calendar className="text-purple-600" size={24} /></div>
                  <span className="text-green-500 font-bold text-xs flex items-center gap-1"><TrendingUp size={12} /> +5%</span>
                </div>
                <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Consultas Totais</h3>
                <p className="text-3xl font-black mt-1">{stats.totalAppointments}</p>
              </div>

              <div className="admin-stat-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-orange-50 rounded-2xl"><Zap className="text-orange-600" size={24} /></div>
                  <span className="text-orange-500 font-bold text-xs flex items-center gap-1">Pendente</span>
                </div>
                <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Ações Pendentes</h3>
                <p className="text-3xl font-black mt-1">{stats.pendingAppointments}</p>
              </div>

              <div className="admin-stat-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-cyan-50 rounded-2xl"><Stethoscope className="text-cyan-600" size={24} /></div>
                  <span className="text-blue-500 font-bold text-xs flex items-center gap-1">Em Dia</span>
                </div>
                <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Exames Realizados</h3>
                <p className="text-3xl font-black mt-1">{stats.totalExams}</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
              <div className="lg:col-span-2 admin-main-card">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black tracking-tight">Performance de Receita</h3>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    Valor em R$ mil
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  {revenueChartData && (
                    <Bar 
                      data={revenueChartData}
                      options={{ 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } }, 
                        scales: { 
                          y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }, 
                          x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } 
                        } 
                      }} 
                    />
                  )}
                </div>
              </div>

              <div className="admin-main-card bg-[#1d1d1f] text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight mb-10">Especialidades</h3>
                  <div className="h-[250px] relative">
                    {distributionChartData && (
                      <Pie 
                        data={distributionChartData}
                        options={{ 
                          maintainAspectRatio: false, 
                          plugins: { 
                            legend: { 
                              position: 'bottom', 
                              labels: { color: '#fff', font: { weight: 'bold', size: 11 }, padding: 20, usePointStyle: true } 
                            } 
                          } 
                        }} 
                      />
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setLocation('/admin/appointments')}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all mt-8"
                >
                  Ver Agendamentos
                </button>
              </div>
            </div>

            {/* Activities Table */}
            <div className="admin-main-card mt-12 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black tracking-tight">Fluxo de Atividades</h3>
                <button 
                  onClick={() => setLocation('/admin/appointments')} 
                  className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-blue-600 hover:gap-4 transition-all"
                >
                  Ver Histórico Completo <ArrowRight size={16}/>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Paciente</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Especialidade</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Data / Hora</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(dashboardData?.recentAppointments || []).map((app: any) => {
                      const { date, time } = formatDateTime(app.isoDate || app.createdAt);
                      return (
                        <tr key={app.id} className="group hover:bg-gray-50/50 transition-all">
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                                {app.patientName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-sm text-gray-900">{app.patientName}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{app.patientEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5">
                            <span className="text-xs font-bold text-gray-600">{app.specialty}</span>
                          </td>
                          <td className="py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-gray-900">{date}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{time}</span>
                            </div>
                          </td>
                          <td className="py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              app.status === 'confirmed' ? 'bg-green-50 text-green-600' : 
                              app.status === 'finished' ? 'bg-purple-50 text-purple-600' :
                              app.status === 'in_service' ? 'bg-blue-50 text-blue-600' :
                              app.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                              app.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                              app.status === 'faltou' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {app.status === 'confirmed' ? 'Confirmado' :
                               app.status === 'finished' ? 'Finalizado' :
                               app.status === 'in_service' ? 'Em Atendimento' :
                               app.status === 'pending' ? 'Pendente' :
                               app.status === 'cancelled' ? 'Cancelado' :
                               app.status === 'faltou' ? 'Faltou' : app.status}
                            </span>
                          </td>
                          <td className="py-5 text-right">
                            <button 
                              onClick={() => setLocation('/admin/appointments')}
                              className="p-2 text-gray-300 hover:text-blue-600 transition-all"
                            >
                              <ArrowRight size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-8 animate-in mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="admin-main-card bg-green-50/50 border-green-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-green-800 uppercase tracking-widest">Receita do Mês</h3>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><Wallet size={20} className="text-green-600" /></div>
                </div>
                <p className="text-4xl font-black text-green-600">R$ {financials.revenue.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-green-700 mt-4 font-bold">Baseado em consultas realizadas</p>
              </div>

              <div className="admin-main-card bg-red-50/50 border-red-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-red-800 uppercase tracking-widest">Despesas do Mês</h3>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><Zap size={20} className="text-red-600" /></div>
                </div>
                <p className="text-4xl font-black text-red-600">R$ {financials.expenses.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-red-700 mt-4 font-bold">Custos operacionais estimados</p>
              </div>

              <div className="admin-main-card bg-blue-50/50 border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-blue-800 uppercase tracking-widest">Saldo Líquido</h3>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"><Activity size={20} className="text-blue-600" /></div>
                </div>
                <p className="text-4xl font-black text-blue-600">R$ {financials.profit.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-blue-700 mt-4 font-bold">Resultado real do período</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="admin-main-card">
                <h3 className="text-xl font-black tracking-tight mb-8">Análise de Fluxo de Receita</h3>
                <div className="h-[300px] w-full">
                  {revenueChartData && (
                    <Bar 
                      data={revenueChartData}
                      options={{ 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } }, 
                        scales: { 
                          y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }, 
                          x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } 
                        } 
                      }} 
                    />
                  )}
                </div>
              </div>

              <div className="admin-main-card">
                <h3 className="text-xl font-black tracking-tight mb-8">Distribuição de Despesas</h3>
                <div className="h-[300px] relative">
                  {expenseChartData ? (
                    <Pie 
                      data={expenseChartData}
                      options={{ 
                        maintainAspectRatio: false, 
                        plugins: { 
                          legend: { 
                            position: 'right', 
                            labels: { font: { weight: 'bold', size: 11 }, usePointStyle: true } 
                          } 
                        } 
                      }} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase tracking-widest text-xs">
                      Nenhuma despesa registrada este mês
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-main-card overflow-hidden">
              <h3 className="text-xl font-black tracking-tight mb-8">Detalhamento de Custos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Categoria</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Valor Total</th>
                      <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">% do Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(dashboardData?.financials?.expenseDetails || []).map((exp: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-all">
                        <td className="py-4">
                          <span className="font-black text-sm text-gray-900">{exp.category}</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="font-bold text-sm text-red-600">R$ {exp.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-xs font-bold text-gray-400">
                            {((exp.value / financials.expenses) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in mt-12">
            <div onClick={() => setLocation('/admin/patients')} className="admin-module-card cursor-pointer">
              <Users size={40} className="text-blue-600 mb-6" />
              <h4 className="text-xl font-black mb-2">Pacientes</h4>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Gerenciar cadastros</p>
            </div>
            <div onClick={() => setLocation('/admin/appointments')} className="admin-module-card cursor-pointer">
              <Calendar size={40} className="text-blue-600 mb-6" />
              <h4 className="text-xl font-black mb-2">Agendamentos</h4>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Controle de horários</p>
            </div>
            <div onClick={() => setLocation('/admin/settings')} className="admin-module-card cursor-pointer">
              <Settings size={40} className="text-blue-600 mb-6" />
              <h4 className="text-xl font-black mb-2">Configurações</h4>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Parâmetros do sistema</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
