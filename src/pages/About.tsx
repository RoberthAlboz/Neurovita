import React, { useEffect, useState } from 'react';
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Target, Eye, Shield, Award, Users, Activity, Heart, ArrowRight, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const About: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const { isAuthenticated } = useAuth();

  const handleAppointmentClick = () => {
    if (isAuthenticated) {
      setLocation("/appointment");
    } else {
      setLocation("/login?redirect=/appointment");
    }
  };

  const teamMembers = [
    {
      name: "Dr. Ricardo Vitali",
      role: "Neurologia Geral",
      bio: "Especialista em diagnósticos complexos e doenças neurodegenerativas.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&h=400&auto=format&fit=crop",
      icon: <User size={32} />
    },
    {
      name: "Dra. Helena Bianchi",
      role: "Neurocirurgia",
      bio: "Referência em cirurgias minimamente invasivas de alta precisão.",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&h=400&auto=format&fit=crop",
      icon: <User size={32} />
    },
    {
      name: "Dr. Lucas Martins",
      role: "Neuropediatria",
      bio: "Dedicado ao desenvolvimento neurológico infantil e transtornos motores.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&h=400&auto=format&fit=crop",
      icon: <User size={32} />
    },
    {
      name: "Dra. Sofia Navarro",
      role: "Reabilitação",
      bio: "Especialista em neuroplasticidade e recuperação funcional autonôma.",
      image: "https://images.unsplash.com/photo-1638202993928-7267ffc8da71?q=80&w=400&h=400&auto=format&fit=crop",
      icon: <User size={32} />
    }
  ];

  return (
    <div className={`app min-h-screen flex flex-col overflow-x-hidden ${isDark ? 'bg-[#121212] text-[#f5f5f7]' : 'bg-[#fbfbfd] text-[#1d1d1f]'} font-sans`}>
      <Header />
      
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .apple-gradient {
          background: ${isDark ? 'linear-gradient(180deg, #1d1d1f 0%, #000000 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)'};
        }
        .section-container {
          max-width: 980px;
          margin: 0 auto;
          padding: 100px 20px;
        }
        .hero-title {
          font-size: 72px;
          font-weight: 700;
          letter-spacing: -0.015em;
          line-height: 1.1;
        }
        .sub-title {
          font-size: 22px;
          color: #86868b;
          font-weight: 500;
          max-width: 600px;
          margin: 0 auto;
        }
        .vitali-card {
          border-radius: 24px;
          overflow: hidden;
          background: ${isDark ? '#1e1e30' : '#fff'};
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          max-width: 700px;
          margin: 0 auto;
        }
        .team-card {
          background: ${isDark ? '#1e1e30' : '#fff'};
          border-radius: 22px;
          padding: 40px;
          transition: all 0.3s ease;
          border: 1px solid ${isDark ? '#2a2a42' : '#f2f2f2'};
          text-align: center;
        }
        .team-card:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          transform: translateY(-5px);
        }
        .team-card-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto 16px;
          border: 3px solid ${isDark ? '#2a2a42' : '#f5f5f7'};
        }
        .pill {
          background: ${isDark ? '#2a2a42' : '#f5f5f7'};
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cta-section {
          background: linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 100%);
          color: #fff;
          border-radius: 32px;
          margin: 60px auto;
          padding: 100px 40px;
          text-align: center;
          max-width: 900px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .cta-title {
          font-size: 48px;
          font-weight: 700;
          letter-spacing: -0.015em;
          line-height: 1.2;
          margin-bottom: 24px;
        }
        .cta-subtitle {
          font-size: 18px;
          color: #a1a1a6;
          margin-bottom: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-button {
          background: #fff;
          color: #1d1d1f;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(255,255,255,0.1);
        }
        .cta-button:hover {
          background: #f5f5f7;
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(255,255,255,0.15);
        }
      `}</style>

      <main className="flex-1">
        <section className="apple-gradient pt-32 pb-16">
          <div className="section-container text-center">
            <span className="pill mb-8 inline-block reveal">Nossa História</span>
            <h1 className="hero-title mb-8 reveal">Ciência e Empatia. <br /> <span className="text-gray-400">Em perfeito equilíbrio.</span></h1>
            <p className="sub-title reveal" style={{ transitionDelay: '0.2s' }}>
              A Neurovita nasceu de um propósito profundo: transformar a jornada de uma família em esperança para milhares de outras.
            </p>
          </div>
        </section>

        <section className={`pb-24 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f7]'}`}>
          <div className="container mx-auto px-5 reveal">
            <div className="vitali-card">
              <img 
                src="/assets/images/familia-vitali.png" 
                alt="Família Vitali" 
                className="w-full h-auto object-cover"
              />
              <div className={`p-10 text-center ${isDark ? 'bg-[#1e1e30] border-gray-800' : 'bg-white border-gray-50'} border-t`}>
                <p className={`text-xl font-semibold italic ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'} leading-relaxed`}>
                  "A Família Vitali: um legado de coragem que cruzou o oceano para transformar a neurologia no Brasil."
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
          <div className="section-container">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div className="reveal">
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-[#f5f5f7]' : ''}`}>O Legado Vitali</h2>
                <p className={`text-lg ${isDark ? 'text-[#a1a1a6]' : 'text-[#86868b]'} leading-relaxed mb-6`}>
                  Com raízes na Itália e Espanha, a Família Vitali enfrentou por gerações a <strong>Ataxia Cerebelar Hereditária</strong>. Em busca de respostas, imigraram para o Brasil, trazendo a determinação de transformar obstáculos em cura.
                </p>
              </div>
              <div className="reveal" style={{ transitionDelay: '0.2s' }}>
                <p className={`text-lg ${isDark ? 'text-[#a1a1a6]' : 'text-[#86868b]'} leading-relaxed mb-6`}>
                  Fundaram a Neurovita para oferecer o que mais sentiram falta: diagnósticos precisos e acolhimento humano. Hoje, somos referência em doenças raras, mantendo vivo o espírito resiliente dos fundadores.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f7]'}`}>
          <div className="section-container">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Missão", text: "Excelência em cuidados neurológicos através de atendimento humanizado e tecnologia." },
                { title: "Visão", text: "Ser a principal referência em neurologia no país, transformando vidas com esperança." },
                { title: "Valores", text: "Empatia, Ética, Inovação e o compromisso inabalável com a vida e a família." }
              ].map((item, idx) => (
                <div key={idx} className="reveal team-card" style={{ transitionDelay: `${idx * 0.1}s` }}>
                  <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-[#f5f5f7]' : ''}`}>{item.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-[#a1a1a6]' : 'text-[#86868b]'} leading-relaxed`}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
          <div className="section-container">
            <div className="text-center mb-16 reveal">
              <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-[#f5f5f7]' : ''}`}>Nossa Equipe</h2>
              <p className={`text-lg ${isDark ? 'text-[#a1a1a6]' : 'text-[#86868b]'}`}>Especialistas unidos pelo propósito de cuidar de você.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="reveal team-card" style={{ transitionDelay: `${idx * 0.1}s` }}>
                  <img src={member.image} alt={member.name} className="team-card-image" />
                  <h4 className={`text-lg font-bold mb-1 ${isDark ? 'text-[#f5f5f7]' : ''}`}>{member.name}</h4>
                  <p className="text-indigo-400 font-semibold text-[10px] uppercase mb-4 tracking-wider">{member.role}</p>
                  <p className={`text-xs ${isDark ? 'text-[#a1a1a6]' : 'text-[#86868b]'} leading-relaxed`}>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="reveal" style={{ padding: '40px 20px' }}>
          <div className="cta-section">
            <h2 className="cta-title">Pronto para cuidar da sua saúde?</h2>
            <p className="cta-subtitle">
              Agende sua consulta com nossos especialistas e descubra um novo padrão em cuidados neurológicos.
            </p>
            <button 
              onClick={handleAppointmentClick}
              className="cta-button"
            >
              Agendar agora <ArrowRight size={20} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
