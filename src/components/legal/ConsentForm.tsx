import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { getApiUrl } from '../../constants/api';
import '../../styles/consent.css';

interface ConsentFormProps {
  userId: number;
  onConsentAccepted?: () => void;
}

interface ConsentTerm {
  id: string;
  title: string;
  content: string;
  version: string;
}

const CONSENT_TERMS: Record<string, ConsentTerm> = {
  privacy_policy: {
    id: 'privacy_policy',
    title: 'Política de Privacidade',
    version: '1.0',
    content: `A Clínica Neurovita está comprometida em proteger sua privacidade. Seus dados pessoais e informações de saúde serão tratados com sigilo e segurança, em conformidade com a Lei Geral de Proteção de Dados (LGPD).\n\nColetamos informações como: nome, CPF, contato, histórico médico e registros de consultas para fornecer atendimento de qualidade.\n\nSeus dados serão utilizados exclusivamente para fins médicos, administrativos e legais. Não compartilharemos suas informações com terceiros sem consentimento explícito, exceto quando exigido por lei.\n\nVocê tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados a qualquer momento.`
  },
  consent_form: {
    id: 'consent_form',
    title: 'Termo de Consentimento Livre e Esclarecido',
    version: '1.0',
    content: `Eu, abaixo assinado, declaro que:\n\n1. Fui informado(a) sobre a natureza do atendimento que será prestado pela Clínica Neurovita.\n\n2. Compreendi os riscos e benefícios dos procedimentos e tratamentos propostos.\n\n3. Tive a oportunidade de fazer perguntas e esclarecer dúvidas com o profissional de saúde.\n\n4. Consinto voluntariamente em receber o atendimento médico proposto.\n\n5. Autorizo o registro de informações sobre meu estado de saúde no prontuário eletrônico.\n\n6. Compreendo que posso revogar este consentimento a qualquer momento.`
  },
  data_processing: {
    id: 'data_processing',
    title: 'Autorização de Processamento de Dados',
    version: '1.0',
    content: `Eu autorizo a Clínica Neurovita a processar meus dados pessoais e informações de saúde para:\n\n1. Fornecer atendimento médico e odontológico.\n2. Manter registros de saúde e histórico clínico.\n3. Comunicação sobre agendamentos e resultados de exames.\n4. Fins administrativos e de faturamento.\n5. Cumprimento de obrigações legais e regulatórias.\n\nOs dados serão armazenados com segurança e acessados apenas por profissionais autorizados. Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento.`
  }
};

const ConsentForm: React.FC<ConsentFormProps> = ({ userId, onConsentAccepted }) => {
  const [acceptedTerms, setAcceptedTerms] = useState<Record<string, boolean>>({
    privacy_policy: false,
    consent_form: false,
    data_processing: false
  });
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadedTerms, setLoadedTerms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkExistingConsents();
  }, [userId]);

  const checkExistingConsents = async () => {
    try {
      const response = await fetch(`${getApiUrl('CONSENT_TERMS')}?userId=${userId}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data.terms)) {
        const termsMap: Record<string, boolean> = {};
        data.terms.forEach((term: any) => {
          if (term.accepted) {
            termsMap[term.termType] = true;
          }
        });
        setLoadedTerms(termsMap);
        setAcceptedTerms(prev => ({ ...prev, ...termsMap }));
      }
    } catch (err) {
      console.error('Erro ao verificar consentimentos:', err);
    }
  };

  const handleTermChange = (termId: string) => {
    if (loadedTerms[termId]) return; // Impedir desmarcar o que já foi aceito (LGPD compliance)
    setAcceptedTerms(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  const toggleExpand = (termId: string) => {
    setExpandedTerms(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  const handleSubmit = async () => {
    const newAcceptances = Object.entries(acceptedTerms).filter(([type, val]) => val && !loadedTerms[type]);
    
    if (newAcceptances.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      for (const [termType] of newAcceptances) {
        const response = await fetch(getApiUrl('CONSENT_TERMS'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            termType,
            termVersion: '1.0',
            accepted: true
          })
        });

        if (!response.ok) throw new Error(`Erro: ${termType}`);
      }

      setSuccess(true);
      setLoadedTerms(acceptedTerms);
      if (onConsentAccepted) onConsentAccepted();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Erro ao salvar consentimentos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAccepted = Object.values(acceptedTerms).every(v => v);
  const hasNewChanges = Object.entries(acceptedTerms).some(([type, val]) => val && !loadedTerms[type]);

  return (
    <div className="consent-form">
      <div className="consent-header">
        <div className="consent-header-icon">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="consent-header-title">Meus Consentimentos</h2>
          <p className="consent-header-subtitle">Privacidade e Proteção de Dados (LGPD)</p>
        </div>
      </div>

      {error && (
        <div className="consent-alert consent-alert-error">
          <AlertCircle size={22} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="consent-alert consent-alert-success">
          <CheckCircle size={22} />
          <span>Termos atualizados com sucesso!</span>
        </div>
      )}

      <div className="consent-terms-list">
        {Object.entries(CONSENT_TERMS).map(([termId, term]) => (
          <div
            key={termId}
            className={`consent-term-card ${acceptedTerms[termId] ? 'accepted' : ''}`}
          >
            <div className="consent-term-header">
              <div
                className="consent-term-checkbox-wrapper"
                onClick={() => handleTermChange(termId)}
              >
                <div className="consent-term-checkbox">
                  {acceptedTerms[termId] && <CheckCircle size={16} />}
                </div>
                <div className="consent-term-info">
                  <h3>{term.title}</h3>
                  <p>VERSÃO {term.version}</p>
                </div>
              </div>
              <button
                onClick={() => toggleExpand(termId)}
                className="consent-term-toggle"
              >
                {expandedTerms[termId] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {expandedTerms[termId] && (
              <div className="consent-term-content">
                <div className="consent-term-text-wrapper">
                  <p className="consent-term-text">{term.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !hasNewChanges}
        className="consent-submit-btn"
      >
        {isSubmitting ? (
          <>
            <Loader size={20} className="animate-spin" />
            Salvando Consentimentos...
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            {loadedTerms.privacy_policy ? 'Consentimentos Atualizados' : 'Aceitar Todos os Termos'}
          </>
        )}
      </button>

      <p className="consent-footer-text">
        Sua segurança é nossa prioridade. Todos os dados são criptografados.
      </p>
    </div>
  );
};

export default ConsentForm;
