# Orientações para Atualização do Documento ABNT

Com base na revisão técnica do projeto **Neurovita**, as seguintes alterações são necessárias no seu documento acadêmico para que ele condiga com o estado atual do software:

---

## 1. Título e Escopo
- **Título Sugerido**: De "Sistema de Agendamento Médico" para **"Neurovita: Sistema Integrado de Gestão Clínica e Administrativa para Neurologia"**.
- **Justificativa**: O sistema evoluiu de um simples agendador para uma ferramenta completa que inclui prontuário eletrônico (EHR), gestão financeira real e conformidade com a LGPD.

---

## 2. Tecnologias Utilizadas (Capítulo 3)
Atualize a stack tecnológica para refletir o uso de ferramentas modernas:
- **Frontend**: React 19 com TypeScript e Vite (substituindo o JavaScript puro/legado).
- **Estilização**: Tailwind CSS para design responsivo e moderno.
- **Backend**: PHP 8.2+ estruturado para fornecer uma API RESTful.
- **Banco de Dados**: SQLite 3, escolhido pela portabilidade e eficiência em clínicas de médio porte.
- **Inteligência Artificial**: Integração opcional com modelos de linguagem (LLMs) via API (Groq/Gemini) para triagem e suporte.

---

## 3. Estrutura do Projeto (Capítulo 5)
Reflita os novos módulos implementados:
- **Módulo Administrativo**: Dashboard com métricas de performance, gráficos de receita e distribuição de especialidades.
- **Módulo Financeiro**: Controle de fluxo de caixa com tabelas reais de despesas e receitas.
- **Módulo de Prontuário**: Registro de anamnese, evolução clínica e prescrições.
- **Conformidade LGPD**: Gestão de termos de consentimento e proteção de dados sensíveis.

---

## 4. Banco de Dados (Modelagem)
- Atualize o diagrama de Entidade-Relacionamento (ER) para incluir as novas tabelas:
    - `financial_records`: Para gestão de custos.
    - `medical_records`: Para os prontuários.
    - `consent_terms`: Para conformidade legal.
    - `patient_attachments`: Para exames externos.
- O novo diagrama gerado pode ser encontrado em: `assets/images/database_relationship_new.png`.

---

## 5. Inteligência Artificial
- Adicione uma seção explicando a **Vitória**, a assistente virtual.
- Importante ressaltar que a IA atua como uma camada de interface facilitadora, mas as decisões clínicas e agendamentos finais são validados pelo sistema core e profissionais humanos.

---

## 6. Comentários Finais
- O resumo e o abstract devem ser reescritos enfatizando a **humanização do atendimento através da tecnologia** e a **centralização de dados** como principais benefícios do Neurovita.
