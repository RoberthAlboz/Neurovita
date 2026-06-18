# Sugestões de Texto para o Documento ABNT - Neurovita

Abaixo estão blocos de texto estruturados para substituir ou complementar as seções atuais do seu trabalho acadêmico, refletindo fielmente o estado atual do projeto.

---

## 1. Resumo (Substituir na Página 2)

**RESUMO**

O presente trabalho apresenta o desenvolvimento do **Neurovita**, um ecossistema digital integrado para gestão de clínicas neurológicas. O projeto evoluiu de um sistema de agendamento para uma solução completa de Gestão Clínica e Administrativa, desenvolvida no contexto do Curso Técnico em Desenvolvimento de Sistemas. A aplicação utiliza uma arquitetura moderna baseada em **React 19** com **TypeScript** e **Vite** no frontend, garantindo uma interface altamente responsiva e tipagem estática para maior segurança do código. O backend foi estruturado em **PHP**, servindo uma API que gerencia a persistência de dados em um banco **SQLite 3**.

O sistema contempla módulos de:
- **Gestão de Agendamentos**: Controle de status e especialidades em tempo real.
- **Prontuário Eletrônico (EHR)**: Registro detalhado de anamneses e evoluções clínicas.
- **Módulo Financeiro**: Controle real de fluxo de caixa, despesas categorizadas e métricas de receita.
- **Conformidade LGPD**: Gestão de termos de consentimento e proteção de dados.
- **Suporte por IA**: Assistente virtual integrada para triagem e insights administrativos.

Conclui-se que o Neurovita demonstra como a integração de tecnologias web modernas pode humanizar o atendimento neurológico e otimizar a eficiência operacional de clínicas especializadas.

**Palavras-chave**: Gestão Clínica. Neurologia. React. TypeScript. Inteligência Artificial. LGPD.

---

## 2. Tecnologias Utilizadas (Complementar Capítulo 3)

### 3.1 Stack Tecnológica Atualizada
A arquitetura do Neurovita foi reformulada para adotar padrões de mercado de alta performance:

- **Frontend (React + Vite)**: A escolha do React 19 permitiu a criação de componentes modulares e reutilizáveis, enquanto o Vite proporcionou um ambiente de desenvolvimento ágil com *Hot Module Replacement* (HMR).
- **TypeScript**: Implementado para fornecer segurança de tipos, reduzindo erros em tempo de execução e facilitando a manutenção do código em larga escala.
- **Backend (PHP API)**: O backend atua como uma camada de serviços (API), processando requisições do frontend e gerenciando a lógica de negócios, autenticação e segurança.
- **SQLite**: Utilizado como motor de banco de dados relacional, oferecendo portabilidade total do sistema sem a necessidade de infraestruturas complexas de servidores de banco de dados externos.

---

## 3. Desenvolvimento do Sistema (Complementar Capítulo 4)

### 4.1 Módulo de Inteligência Artificial
O sistema integra a assistente virtual **Vitória**, baseada em Modelos de Linguagem de Grande Escala (LLMs). Este módulo foi projetado para atuar em duas frentes:
1. **Atendimento ao Paciente**: Auxílio em dúvidas frequentes e orientações sobre especialidades.
2. **Suporte Administrativo**: Quando acessada por gestores, a IA analisa o contexto da clínica para sugerir melhorias operacionais e financeiras.

### 4.2 Gestão Financeira e Fluxo de Caixa
Diferente de sistemas de agendamento simplificados, o Neurovita implementa um controle financeiro robusto. A tabela `financial_records` permite o registro de despesas fixas (aluguel, salários) e variáveis (insumos, impostos), permitindo que o gestor visualize o lucro líquido real do período através de dashboards dinâmicos alimentados pela API.

---

## 4. Modelagem de Dados (Atualizar Seção 5.6.2)

A estrutura do banco de dados foi expandida para suportar a nova complexidade do sistema. As principais entidades e seus relacionamentos incluem:

| Tabela | Função Principal | Relacionamento |
|---|---|---|
| `users` | Armazena pacientes e administradores | Base para todas as outras tabelas |
| `appointments` | Gerencia o ciclo de vida das consultas | Vinculada a `users` e `professionals` |
| `medical_records` | Prontuários eletrônicos detalhados | Relacionamento 1:1 com `appointments` |
| `financial_records` | Registros de despesas e receitas | Independente, usada para cálculos de dashboard |
| `consent_terms` | Registros de aceitação da LGPD | Vinculada a `users` |
| `patient_attachments` | Upload de exames e documentos | Vinculada a `users` e opcionalmente a `appointments` |

---

## 5. Considerações Finais (Atualizar Capítulo 6)

O projeto Neurovita atingiu seus objetivos ao entregar uma ferramenta que vai além da técnica, focando na **experiência do usuário** e na **integridade dos dados**. A transição para uma stack moderna (React/TypeScript) e a inclusão de módulos administrativos e de IA posicionam o software como uma solução competitiva e alinhada com as tendências de Saúde 4.0.
