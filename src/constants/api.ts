/**
 * Configurações de API do Neurovita
 * 
 * Se o seu backend PHP estiver rodando em uma URL diferente, 
 * altere a constante BASE_URL abaixo.
 */

// Em desenvolvimento, o Vite usa o proxy configurado em vite.config.ts.
// Em produção, você pode definir a URL completa do seu servidor PHP.
export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;

export const API_CONFIG = {
  // SE O SEU PROJETO ESTÁ EM UMA PASTA (EX: htdocs/Neurovita), MUDE PARA: 'http://localhost/Neurovita/api'
  // SE ESTÁ NA RAIZ DO SERVIDOR, MANTENHA: 'http://localhost/api'
  BASE_URL: '/api', 
  ENDPOINTS: {
    LOGIN: '/auth/login.php',
    SIGNUP: '/auth/signup.php',
    APPOINTMENT: '/appointment/schedule.php',
    USER_PROFILE: '/user/user.php',
    UPLOAD_PHOTO: '/user/upload_photo.php',
    CONTENT_DATA: '/content/data.php',
    CHAT: '/ai/chat.php',
    TEST: '/test_connection.php',
    EXAM_RESULTS: '/exam/results.php',
    ADMIN_DASHBOARD: '/admin/dashboard.php',
    ADMIN_PATIENTS: '/admin/patients.php',
    ADMIN_APPOINTMENTS: '/admin/appointments.php',
    ADMIN_SETTINGS: '/admin/settings.php',
    ADMIN_MAINTENANCE: '/admin/maintenance.php',
    ADMIN_SESSIONS: '/admin/sessions.php',
    ADMIN_CHANGE_PASSWORD: '/admin/change_password.php',
    MEDICAL_RECORDS: '/medical/records.php',
    CONSENT_TERMS: '/legal/consent.php',
    PATIENT_ATTACHMENTS: '/patient/attachments.php'
  }
};

export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};
