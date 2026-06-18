import { Brain, Activity, Heart, Shield, Users, Zap } from "lucide-react";

/* ============================================
   CONFIGURATION CONSTANTS
   ============================================ */

export const COOKIE_NAME = "neuroconsulta_session";
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/* ============================================
   APPLICATION DATA
   ============================================ */

export const SPECIALTIES = [
  {
    id: "neuro-geral",
    title: "Neurologia Geral",
    subtitle: "Diagnóstico e Tratamento",
    description: "Abordagem completa de cefaleias, tonturas e distúrbios do sono.",
    icon: Brain,
    iconColor: "#4361EE",
    bgColor: "#EEF2FF",
    image: "/assets/images/neurologia-geral.png",
  },
  {
    id: "neuro-cirurgia",
    title: "Neurocirurgia",
    subtitle: "Procedimentos Avançados",
    description: "Especialistas em cirurgias de coluna, tumores e nervos periféricos.",
    icon: Activity,
    iconColor: "#9191E9",
    bgColor: "#F5F3FF",
    image: "/assets/images/fotoradiografia.png",
  },
  {
    id: "neuro-pediatria",
    title: "Neuropediatria",
    subtitle: "Cuidado Infantil",
    description: "Acompanhamento do desenvolvimento neurológico desde o nascimento.",
    icon: Heart,
    iconColor: "#457EAC",
    bgColor: "#F0F9FF",
    image: "/assets/images/ortopediatri-cocuk-ortopedi-akademisi-iKCuym5Kt5o-unsplash.jpg",
  },
  {
    id: "reabilitacao",
    title: "Reabilitação",
    subtitle: "Recuperação Focada",
    description: "Programas personalizados para recuperação motora e cognitiva.",
    icon: Zap,
    iconColor: "#4361EE",
    bgColor: "#EEF2FF",
    image: "/assets/images/reabilitacao-neurologica.jpg",
  },
];

export const BRAIN_REGIONS = [
  {
    id: 'frontal',
    name: 'Lobo Frontal',
    color: '#4361EE',
    rotation: [0, 0, 0],
    description: 'O "diretor executivo" do cérebro. Responsável pelo planejamento, raciocínio e controle de impulsos.',
  },
  {
    id: 'parietal',
    name: 'Lobo Parietal',
    color: '#9191E9',
    rotation: [0.5, 0, 0],
    description: 'Processa informações sensoriais como tato, temperatura e dor. Essencial para percepção espacial.',
  },
  {
    id: 'temporal',
    name: 'Lobo Temporal',
    color: '#457EAC',
    rotation: [0, Math.PI / 2, 0],
    description: 'Centro do processamento auditivo, memória e compreensão da linguagem.',
  },
  {
    id: 'occipital',
    name: 'Lobo Occipital',
    color: '#4361EE',
    rotation: [0, Math.PI, 0],
    description: 'Dedicado exclusivamente à visão, processando formas, cores e movimentos.',
  },
  {
    id: 'cerebelo',
    name: 'Cerebelo',
    color: '#9191E9',
    rotation: [-0.4, Math.PI, 0],
    description: 'Essencial para coordenação motora fina, equilíbrio e postura corporal.',
  },
  {
    id: 'tronco',
    name: 'Tronco Encefálico',
    color: '#457EAC',
    rotation: [-0.8, 0, 0],
    description: 'Controla funções vitais autônomas, como respiração e batimentos cardíacos.',
  }
];

export const BENEFITS = [
  {
    title: "Especialistas Qualificados",
    description: "Equipe de neurologistas com formação internacional e experiência comprovada.",
    icon: Users,
  },
  {
    title: "Tecnologia Avançada",
    description: "Equipamentos de última geração para diagnósticos precisos e tratamentos eficazes.",
    icon: Shield,
  },
  {
    title: "Atendimento Humanizado",
    description: "Cuidado integral focado no bem-estar e qualidade de vida do paciente.",
    icon: Heart,
  },
];
