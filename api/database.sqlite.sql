-- Script de Inicialização do Banco de Dados Neurovita (Revisado)
-- Execute este script no MySQL Workbench para criar o banco de dados

-- Criar banco de dados



-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT TRUE
);

-- Tabela de Sessões de Login
CREATE TABLE IF NOT EXISTS login_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INT NOT NULL,
  loginMethod VARCHAR(10) NOT NULL,
  loginIdentifier VARCHAR(255) NOT NULL,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  loginAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logoutAt TIMESTAMP NULL,
  isActive BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Agendamentos (anteriormente scheduled_exams)
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INT NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  appointmentType VARCHAR(100) NOT NULL, -- Renomeado de examType
  planType VARCHAR(100), -- Adicionado
  state VARCHAR(100), -- Adicionado
  specialty VARCHAR(100), -- Adicionado
  convenio VARCHAR(255), -- Adicionado
  plan VARCHAR(255), -- Adicionado
  laboratoryName VARCHAR(255) NULL, -- Tornada anulável
  scheduledDate DATETIME NULL, -- Tornada anulável e tipo ajustado para DATETIME
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Resultados de Exames
CREATE TABLE IF NOT EXISTS exam_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INT NOT NULL,
  examType VARCHAR(100) NOT NULL,
  laboratoryName VARCHAR(255) NOT NULL,
  resultDate TIMESTAMP NOT NULL,
  resultFile VARCHAR(500),
  status VARCHAR(20) DEFAULT 'available',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserir dados de exemplo (opcional)
INSERT INTO users (fullName, email, cpf, phone, password) VALUES
('João Silva', 'joao@example.com', '12345678901', '11999999999', '$2a$10$example_hash_1'),
('Maria Santos', 'maria@example.com', '98765432109', '11988888888', '$2a$10$example_hash_2');

-- Criar índices adicionais para melhor performance






CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_login_sessions_userId ON login_sessions(userId);
CREATE INDEX IF NOT EXISTS idx_appointments_userId ON appointments(userId);
CREATE INDEX IF NOT EXISTS idx_exam_results_userId ON exam_results(userId);
