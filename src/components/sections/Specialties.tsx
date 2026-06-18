import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Brain, Activity, Heart, Zap, LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../constants/api';

interface Specialty {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  iconColor: string;
  image: string;
}

const iconMap: Record<string, LucideIcon> = {
  'Brain': Brain,
  'Activity': Activity,
  'Heart': Heart,
  'Zap': Zap
};

const Specialties: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch(`${getApiUrl('CONTENT_DATA')}?type=specialties`);
        const data = await response.json();
        if (data.specialties) {
          setSpecialties(data.specialties);
        }
      } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpecialties();
  }, []);

  const handleScheduleClick = (specialtyId: string) => {
    if (isAuthenticated) {
      setLocation(`/appointment?specialty=${specialtyId}`);
    } else {
      setLocation(`/login?redirect=/appointment&specialty=${specialtyId}`);
    }
  };

  if (isLoading) return null;

  return (
    <section className="specialties" id="especialidades">
      <div className="container">
        <div className="section-header">
          <h2>Nossas Especialidades</h2>
          <p>Oferecemos atendimento especializado em diferentes áreas da neurologia</p>
        </div>

        <div className="specialties-grid">
          {specialties.map((specialty) => {
            const Icon = iconMap[specialty.icon] || Brain;
            return (
              <div key={specialty.id} className="specialty-card">
                <div className="specialty-image">
                  <img
                    src={specialty.image}
                    alt={specialty.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>

                <div className="specialty-body">
                  <div className="specialty-icon" style={{ color: specialty.iconColor }}>
                    <Icon size={48} />
                  </div>
                  {!isAdmin && <p className="specialty-label">Agende sua {specialty.subtitle?.toLowerCase()}</p>}
                  <h3 className="specialty-title">{specialty.title}</h3>
                  <p className="specialty-description">{specialty.description}</p>
                  {!isAdmin && (
                    <button 
                      className="specialty-btn"
                      onClick={() => handleScheduleClick(specialty.id)}
                    >
                      Agendar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Specialties;
