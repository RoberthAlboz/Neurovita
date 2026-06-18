import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus, Sparkles } from 'lucide-react';
import { getApiUrl } from '../../constants/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Olá! Sou a Vitória, sua recepcionista virtual na Neurovita. Como posso ajudar você hoje?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reativo ao login/logout via contexto — sem leitura direta de localStorage
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { isDark } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const adminContext = isAdmin
        ? '\nVocê está em modo administrativo. Você tem acesso a dados de pacientes, agendamentos, finanças e pode fornecer insights e estratégias de gestão clínica.'
        : '';

      const response = await fetch(getApiUrl('CHAT'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg + adminContext,
          history: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text })),
          isAdmin,
        }),
      });

      const data = await response.json();
      const aiResponse = isAdmin ? `[MODO ADMIN] ${data.reply}` : data.reply;
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: 'Desculpe, estou com dificuldades de conexão agora. Pode tentar novamente?' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tokens de cor adaptativos ao tema
  const bg = isDark ? 'rgba(30, 30, 46, 0.97)' : 'rgba(255, 255, 255, 0.97)';
  const msgBg = isDark ? 'linear-gradient(to bottom, #1e1e2e, #252535)' : 'linear-gradient(to bottom, #ffffff, #f8f9ff)';
  const aiBubbleBg = isDark ? '#2a2a3e' : '#fff';
  const aiBubbleColor = isDark ? '#c2aff0' : '#2D5D7B';
  const aiBubbleBorder = isDark ? '#3a3a5c' : '#edf2f7';
  const inputAreaBg = isDark ? '#1e1e2e' : '#fff';
  const inputAreaBorder = isDark ? '#3a3a5c' : '#edf2f7';
  const inputFormBg = isDark ? '#2a2a3e' : '#f1f5f9';
  const inputFormBorder = isDark ? '#3a3a5c' : '#e2e8f0';
  const inputColor = isDark ? '#e0e0f0' : '#2D5D7B';
  const subtextColor = isDark ? '#6b7280' : '#94a3b8';
  const dotColor = isDark ? '#4a4a6a' : '#cbd5e1';

  if (!isOpen) {
    return (
      <div className="aichat-fab-wrapper">
        <button
          onClick={() => setIsOpen(true)}
          className="aichat-fab"
          title="Falar com a Vitória"
          aria-label="Abrir chat com Vitória"
        >
          <MessageCircle size={30} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`aichat-window${isMinimized ? ' aichat-window--minimized' : ''}`}
      style={{ backgroundColor: bg }}
    >
      {/* Header */}
      <div className="aichat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="aichat-avatar">
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h3 className="aichat-name">
              Vitória {isAdmin && <span className="aichat-admin-badge">(Admin)</span>}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className={`aichat-status-dot${isAdmin ? ' aichat-status-dot--admin' : ''}`}></span>
              <p className="aichat-status-text">
                {isAdmin ? 'Assistente Administrativo' : 'Recepcionista Virtual'}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="aichat-ctrl-btn"
            aria-label={isMinimized ? 'Expandir chat' : 'Minimizar chat'}
          >
            <Minus size={18} />
          </button>
          <button onClick={() => setIsOpen(false)} className="aichat-ctrl-btn" aria-label="Fechar chat">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Área de Mensagens */}
          <div className="aichat-messages" style={{ background: msgBg }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'aichatFadeInUp 0.3s ease-out forwards',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow:
                      msg.role === 'user'
                        ? '0 4px 12px rgba(67, 97, 238, 0.2)'
                        : `0 4px 12px rgba(0,0,0,${isDark ? '0.15' : '0.03'})`,
                    background: msg.role === 'user' ? '#4361EE' : aiBubbleBg,
                    color: msg.role === 'user' ? '#fff' : aiBubbleColor,
                    border: msg.role === 'user' ? 'none' : `1px solid ${aiBubbleBorder}`,
                    borderTopRightRadius: msg.role === 'user' ? '4px' : '18px',
                    borderTopLeftRadius: msg.role === 'ai' ? '4px' : '18px',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    background: aiBubbleBg,
                    padding: '12px 16px',
                    borderRadius: '18px',
                    borderTopLeftRadius: '4px',
                    border: `1px solid ${aiBubbleBorder}`,
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <span className="aichat-dot" style={{ background: dotColor }}></span>
                  <span className="aichat-dot" style={{ background: dotColor, animationDelay: '0.2s' }}></span>
                  <span className="aichat-dot" style={{ background: dotColor, animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="aichat-input-area"
            style={{ background: inputAreaBg, borderTop: `1px solid ${inputAreaBorder}` }}
          >
            <form
              onSubmit={handleSendMessage}
              style={{
                display: 'flex',
                gap: '10px',
                background: inputFormBg,
                padding: '6px',
                borderRadius: '16px',
                border: `1px solid ${inputFormBorder}`,
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Como posso ajudar?"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '10px 14px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  color: inputColor,
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="aichat-send-btn"
                aria-label="Enviar mensagem"
              >
                <Send size={18} />
              </button>
            </form>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.65rem', color: subtextColor, textAlign: 'center' }}>
              Vitória utiliza inteligência artificial para te auxiliar.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChat;
