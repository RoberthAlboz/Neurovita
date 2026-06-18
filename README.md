# Neurovita - Sistema de Gestão Clínica Neurológica

O **Neurovita** é uma plataforma robusta e moderna desenvolvida para otimizar a gestão de clínicas neurológicas. O sistema integra desde o agendamento inteligente de consultas até o controle rigoroso de prontuários eletrônicos, resultados de exames e gestão financeira, sempre com foco na experiência do paciente e na eficiência administrativa.

---

## 📸 Visão Geral da Aplicação

A interface foi projetada para ser intuitiva e responsiva, oferecendo uma experiência fluida tanto para pacientes quanto para administradores.

- **Interface Moderna**: Desenvolvida com React 19 e Tailwind CSS para um visual limpo e profissional.
- **Painel Administrativo**: Controle total de agendamentos, pacientes e saúde financeira da clínica.
- **Área do Paciente**: Agendamento online, histórico de consultas e acesso a resultados de exames.
- **Inteligência Artificial**: Assistente virtual "Vitória" para suporte e triagem inicial (opcional).

---

## 🛠️ Requisitos do Sistema

Para rodar o projeto localmente, você precisará de:

| Componente | Versão Mínima | Descrição |
|---|---|---|
| **Node.js** | v18.0.0+ | Ambiente de execução para o frontend React. |
| **PHP** | v8.0.0+ | Backend da aplicação (API). |
| **SQLite** | v3.0+ | Banco de dados (driver `pdo_sqlite` deve estar ativo no PHP). |
| **Gerenciador** | npm ou pnpm | Para instalação de dependências. |

---

## 🚀 Como Rodar o Site

Siga os passos abaixo para configurar e iniciar o ambiente de desenvolvimento:

### 1. Instalação de Dependências
No diretório raiz do projeto, instale os pacotes necessários para o frontend:
```bash
npm install
# ou
pnpm install
```

### 2. Configuração do Banco de Dados
O sistema utiliza SQLite por praticidade. Para criar as tabelas iniciais e popular com dados de exemplo:
```bash
php api/setup_db.php
```

### 3. Iniciando os Servidores
O projeto conta com um script de inicialização rápida que sobe o backend (PHP) e o frontend (Vite) simultaneamente:
```bash
chmod +x start_project.sh
./start_project.sh
```

Caso prefira iniciar manualmente:
- **Backend**: `php -S localhost:8000 -t api`
- **Frontend**: `npm run dev`

---

## 🧠 Ativando a Inteligência Artificial (Opcional)

A assistente virtual **Vitória** utiliza APIs externas (Groq ou Gemini). Por segurança, as chaves vêm desativadas por padrão. Para ativar:

1. Abra o arquivo `api/ai/chat.php`.
2. Localize as variáveis `$geminiKey` ou `$groqKey` (linhas 20-21).
3. Descomente a linha da chave desejada e insira seu token de API.
4. Certifique-se de que a variável `$provider` (linha 16) condiz com a chave escolhida.

---

## 📊 Estrutura do Banco de Dados

O banco de dados foi modelado para garantir integridade e escalabilidade. Abaixo, os principais relacionamentos:

- **Users**: Gerencia pacientes e administradores.
- **Appointments**: Vincula usuários a profissionais e especialidades.
- **Medical Records**: Prontuários detalhados ligados a cada consulta.
- **Financial Records**: Controle real de despesas e receitas da clínica.
- **Patient Attachments**: Arquivos e exames externos enviados pelos pacientes.

---

## 📂 Organização do Projeto

```text
.
├── api/                # Backend em PHP (Endpoints e Banco SQLite)
│   ├── admin/          # Gestão administrativa e financeira
│   ├── ai/             # Integração com modelos de linguagem
│   ├── auth/           # Login e cadastro de usuários
│   └── uploads/        # Armazenamento de arquivos e exames
├── docs/               # Documentação técnica e acadêmica
├── public/             # Arquivos estáticos e modelos 3D
├── src/                # Código-fonte do Frontend (React + TypeScript)
│   ├── components/     # Componentes de UI, Layout e Seções
│   ├── pages/          # Páginas da aplicação (Home, Login, Dashboards)
│   └── styles/         # Estilização CSS global e modular
└── vite.config.ts      # Configurações do ambiente Vite e Proxy
```

---

## 📝 Nota Acadêmica
Este projeto foi desenvolvido como parte do curso técnico em Desenvolvimento de Sistemas na **Escola SENAI A. Jacob Lafer**, visando aplicar conceitos modernos de desenvolvimento web e gestão de saúde.
