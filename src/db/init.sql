-- Script de Inicialização do Banco de Dados Neurovita
-- Execute este script no MySQL Workbench para criar o banco de dados

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS neurovita;
USE neurovita;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT TRUE,
  INDEX email_idx (email),
  INDEX cpf_idx (cpf)
);

-- Tabela de Sessões de Login
CREATE TABLE IF NOT EXISTS login_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  loginMethod VARCHAR(10) NOT NULL,
  loginIdentifier VARCHAR(255) NOT NULL,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  loginAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logoutAt TIMESTAMP NULL,
  isActive BOOLEAN DEFAULT TRUE,
  INDEX user_id_idx (userId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Exames Agendados
CREATE TABLE IF NOT EXISTS scheduled_exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  examType VARCHAR(100) NOT NULL,
  laboratoryName VARCHAR(255) NOT NULL,
  scheduledDate TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX user_exam_idx (userId)
);

-- Tabela de Resultados de Exames
CREATE TABLE IF NOT EXISTS exam_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  examType VARCHAR(100) NOT NULL,
  laboratoryName VARCHAR(255) NOT NULL,
  resultDate TIMESTAMP NOT NULL,
  resultFile VARCHAR(500),
  status VARCHAR(20) DEFAULT 'available',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX user_result_idx (userId)
);

-- Inserir dados de exemplo (opcional)
INSERT INTO users (fullName, email, cpf, phone, password) VALUES
('João Silva', 'joao@example.com', '12345678901', '11999999999', '$2a$10$example_hash_1'),
('Maria Santos', 'maria@example.com', '98765432109', '11988888888', '$2a$10$example_hash_2');

-- Criar índices adicionais para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_login_sessions_userId ON login_sessions(userId);
CREATE INDEX idx_scheduled_exams_userId ON scheduled_exams(userId);
CREATE INDEX idx_exam_results_userId ON exam_results(userId);
