import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Search, Filter, Stethoscope, ArrowLeft, MoreHorizontal, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'wouter';
import { getApiUrl } from '../../constants/api';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Modal, { ModalType } from '../../components/common/Modal';
import MedicalRecord from '../../components/medical/MedicalRecord';
import '../../styles/admin.css';

const AdminAppointments: React.FC = () => {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; message: string; }>({
    isOpen: false, type: 'info', title: '', message: '',
  });
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    if (!isAdmin) { setLocation('/login'); return; }
    fetchAppointments();
  }, [isAdmin]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(getApiUrl('ADMIN_APPOINTMENTS'));
      const data = await response.json();
      if (response.ok) setAppointments(Array.isArray(data) ? data : data.appointments || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMedicalRecord = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowMedicalRecordModal(true);
  };

  const handleCloseMedicalRecordModal = () => {
    setShowMedicalRecordModal(false);
    setSelectedAppointment(null);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(getApiUrl('ADMIN_APPOINTMENTS'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        setModalConfig({
          isOpen: true, type: 'success', title: 'Operação Concluída',
          message: `O status do agendamento foi atualizado com sucesso.`
        });
        fetchAppointments();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const filteredAppointments = appointments.filter(app => 
    (app.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (app.specialty?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="admin-page-root">
      <Header />
      
      <main className="admin-container animate-perfect">
        <div className="admin-header-section">
          <button 
            onClick={() => setLocation('/admin')}
            className="flex items-center gap-4 text-gray-400 hover:text-black transition-all font-black text-sm uppercase tracking-[0.2em] mb-12 group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
            Voltar ao Centro de Comando
          </button>

          <div>
            <h1 className="admin-title">
              Agenda<br/><span className="text-gradient">Clínica</span>
            </h1>
            <p className="admin-description">
              Controle de fluxo operacional. Valide solicitações, organize horários e otimize a ocupação do corpo clínico.
            </p>
          </div>
          
          <div className="admin-search-input min-w-[350px] mb-12">
            <Search size={26} strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Pesquisar na agenda..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="font-bold"
            />
          </div>
          
          <div className="flex gap-6">
            <button onClick={() => alert('Filtro: Abrir painel de filtros avançados')} className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer"><Filter size={20}/> Filtrar</button>
            <button onClick={() => {
              const csv = filteredAppointments.map(a => `${a.patientName},${a.specialty},${a.scheduledDate},${a.scheduledTime},${a.status}`).join('\n');
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent('Paciente,Especialidade,Data,Hora,Status\n' + csv));
              element.setAttribute('download', 'agendamentos.csv');
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }} className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer"><Download size={20}/> Exportar</button>
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex items-center justify-between px-12 py-8 bg-gray-50 rounded-3xl mb-12">
            <span className="px-8 py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-[0.2em]">
              {filteredAppointments.length} Agendamentos Listados
            </span>
          </div>

          <div className="space-y-8">
            {filteredAppointments.length > 0 ? filteredAppointments.map((app, i) => (
              <div key={app.id} className="admin-main-card !p-12 group hover:border-black/10 transition-all">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
                    <div className="flex gap-8">
                      <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center font-black text-4xl shadow-inner group-hover:bg-black group-hover:text-white transition-all">
                        {app.patientName?.[0]}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-black text-3xl tracking-tighter text-gray-900 mb-2">{app.patientName}</h3>
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest">
                            {app.appointmentType || 'Consulta'}
                          </span>
                          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ref: #{app.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-4">
                      <div className="flex items-center gap-4 font-bold text-gray-700">
                        <div className="p-3 bg-gray-50 rounded-2xl"><Stethoscope size={22} className="text-blue-500" /></div>
                        <span className="text-xl tracking-tight">{app.specialty}</span>
                      </div>
                      <div className="flex items-center gap-4 font-bold text-gray-400">
                        <div className="p-3 bg-gray-50 rounded-2xl"><Clock size={22} /></div>
                        <span className="text-lg">{app.scheduledDate ? new Date(app.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR') : '--/--/----'} • {app.scheduledTime || '--:--'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-start lg:items-center">
                      <span className={`pill-status !px-10 !py-5 text-sm uppercase tracking-[0.1em] ${
                        app.status === 'confirmed' ? 'bg-green-50 text-green-700' : 
                        app.status === 'in_service' ? 'bg-blue-50 text-blue-700' :
                        app.status === 'finished' ? 'bg-purple-50 text-purple-700' :
                        app.status === 'pending' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {app.status === 'confirmed' ? 'Confirmada' : 
                         app.status === 'in_service' ? 'Em Atendimento' :
                         app.status === 'finished' ? 'Finalizada' :
                         app.status === 'pending' ? 'Agendada' : 
                         app.status === 'faltou' ? 'Faltou' : 'Cancelada'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-auto">
                    <select 
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className="px-6 py-4 bg-white border-2 border-gray-100 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] focus:border-black transition-all outline-none"
                    >
                      <option value="pending">Agendada (Pendente)</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="in_service">Em Atendimento</option>
                      <option value="finished">Finalizada</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="faltou">Faltou</option>
                    </select>
                    {app.status === 'finished' && (
                      <button
                        onClick={() => handleViewMedicalRecord(app)}
                        className="px-6 py-4 bg-blue-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all"
                      >
                        Prontuário
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="admin-main-card flex flex-col items-center justify-center py-40 text-center">
                <Calendar size={80} className="text-gray-100 mb-10" />
                <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">Agenda Disponível</h3>
                <p className="text-gray-400 text-2xl font-medium">Não há solicitações de agendamento no momento.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <Modal 
        isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
      />
      {showMedicalRecordModal && selectedAppointment && (
        <Modal 
          isOpen={showMedicalRecordModal} 
          onClose={handleCloseMedicalRecordModal} 
          title="Prontuário Eletrônico"
          type="info"
          message=""
        >
          <div className="p-6">
            <MedicalRecord
              appointmentId={selectedAppointment.id}
              userId={selectedAppointment.userId}
              professionalId={selectedAppointment.professionalId}
              onSave={handleCloseMedicalRecordModal}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminAppointments;
