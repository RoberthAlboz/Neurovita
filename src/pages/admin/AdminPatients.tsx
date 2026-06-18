import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Trash2, Phone, 
  Filter, Shield, ArrowLeft, MoreHorizontal, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'wouter';
import { getApiUrl } from '../../constants/api';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Modal, { ModalType } from '../../components/common/Modal';
import '../../styles/admin.css';

const AdminPatients: React.FC = () => {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; message: string; }>({
    isOpen: false, type: 'info', title: '', message: '',
  });

  useEffect(() => {
    if (!isAdmin) { setLocation('/login'); return; }
    fetchPatients();
  }, [isAdmin]);

  const fetchPatients = async () => {
    try {
      const response = await fetch(getApiUrl('ADMIN_PATIENTS'));
      const data = await response.json();
      if (response.ok) setPatients(Array.isArray(data) ? data : data.patients || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.cpf && p.cpf.includes(searchTerm))
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
              Base de<br/><span className="text-gradient">Pacientes</span>
            </h1>
            <p className="admin-description">
              Repositório central de usuários. Gerencie acessos, visualize prontuários e mantenha a integridade dos dados clínicos.
            </p>
          </div>
          
          <div className="admin-search-input min-w-[450px] mb-12">
            <Search size={28} strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, documento ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xl font-bold"
            />
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex items-center justify-between px-12 py-8 bg-gray-50 rounded-3xl mb-12">
            <span className="px-8 py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-[0.2em]">
              {filteredPatients.length} Registros Encontrados
            </span>
            <div className="flex gap-6">
              <button onClick={() => alert('Filtro: Abrir painel de filtros avançados')} className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer"><Filter size={20}/> Filtrar</button>
              <button onClick={() => {
                const csv = filteredPatients.map(p => `${p.fullName},${p.cpf},${p.email},${p.phone}`).join('\n');
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent('Nome,CPF,Email,Telefone\n' + csv));
                element.setAttribute('download', 'pacientes.csv');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }} className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer"><Download size={20}/> Exportar</button>
            </div>
          </div>

          <div className="admin-main-card !p-0 overflow-hidden">
            <div className="admin-table-header">
              <span>Identificação Clínica</span>
              <span>Documento</span>
              <span>Contato Direto</span>
              <span>Data Cadastro</span>
              <span className="text-right">Ações</span>
            </div>

            <div className="divide-y divide-gray-50">
              {filteredPatients.length > 0 ? filteredPatients.map((patient, i) => (
                <div key={patient.id} className="admin-table-row group">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[28px] bg-gray-50 flex items-center justify-center font-black text-3xl group-hover:bg-black group-hover:text-white transition-all flex-shrink-0">
                      {patient.fullName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-2xl tracking-tight mb-2">{patient.fullName}</div>
                      <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">{patient.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <span className="px-5 py-2 bg-gray-50 rounded-xl text-sm font-black tracking-tight border border-gray-100 whitespace-nowrap">
                      {patient.cpf || '---'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 font-bold text-lg text-gray-600 flex-shrink-0">
                    <Phone size={20} className="text-blue-500 flex-shrink-0" /> <span className="whitespace-nowrap">{patient.phone || 'Não informado'}</span>
                  </div>
                  
                  <div className="font-bold text-gray-400 text-lg flex-shrink-0 whitespace-nowrap">
                    {new Date(patient.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <button className="p-4 hover:bg-gray-100 rounded-2xl transition-all"><MoreHorizontal size={24} /></button>
                    <button className="p-4 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={24} /></button>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-40 text-center">
                  <Search size={64} className="text-gray-100 mb-8" />
                  <h3 className="text-3xl font-black mb-4 uppercase tracking-widest">Nenhum Registro</h3>
                  <p className="text-gray-400 text-xl font-medium">Refine os parâmetros de busca para localizar o paciente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Modal 
        isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};

export default AdminPatients;
