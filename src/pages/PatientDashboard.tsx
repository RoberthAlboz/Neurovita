import React from 'react';
import { useLocation } from 'wouter';
import { Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Dashboard from '../components/dashboard/Dashboard';
import { useAuth } from '../contexts/AuthContext';

const PatientDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { userIdentifier } = useAuth();

  const handleNewAppointment = () => {
    setLocation('/appointment');
  };

  if (!userIdentifier) {
    return (
      <div className="app min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>
              Você precisa estar logado para acessar esta página.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 patient-dashboard-main">
        {/* Botão de Novo Agendamento */}
        <div className="patient-dashboard-fab">
          <button
            onClick={handleNewAppointment}
            className="btn-new-appointment"
          >
            <Plus size={20} />
            <span>Novo Agendamento</span>
          </button>
        </div>

        {/* Dashboard Component */}
        <div className="patient-dashboard-body">
          <Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PatientDashboard;
