import { useState, useEffect, useRef } from 'react';
import { RiRobot2Line } from 'react-icons/ri';
import { FiMaximize2, FiMinimize2, FiSend, FiX } from 'react-icons/fi';
import { sendMessageToChatbot } from '@/app/services/ChatbotService';
import { marked } from 'marked';
import '../../styles/floatingChat.css';

type Message = {
  type: 'bot' | 'user';
  text: string;
  time: string;
};

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      const mensajeInicial: Message = {
        type: 'bot',
        text: 'Hola! En que puedo ayudarte hoy?',
        time: getCurrentTime(),
      };
      setMessages([mensajeInicial]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaiting]);

  useEffect(() => {
    if (isOpen && !isWaiting) {
      inputRef.current?.focus();
    }
  }, [isOpen, isWaiting, messages.length]);

  const toggleChat = () => {
    setIsOpen(prev => {
      if (prev) {
        setIsExpanded(false);
      }

      return !prev;
    });
  };

  const handleSend = async () => {
    if (input.trim() === '' || isWaiting) return;

    const userInput = input.trim();
    const userMessage: Message = {
      type: 'user',
      text: userInput,
      time: getCurrentTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsWaiting(true);

    try {
      const botResponses = await sendMessageToChatbot('usuario1', userInput);

      if (botResponses.length === 0) {
        setMessages(prev => [
          ...prev,
          {
            type: 'bot',
            text: 'No recibi una respuesta del asistente. Intenta de nuevo.',
            time: getCurrentTime(),
          },
        ]);
        return;
      }

      const botMessages: Message[] = botResponses.map(res => ({
        type: 'bot',
        text: res.text,
        time: getCurrentTime(),
      }));

      setMessages(prev => [...prev, ...botMessages]);
    } catch (error) {
      console.error('Error comunicandose con el bot:', error);
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: 'Hubo un problema al contactar al bot. Intenta de nuevo.',
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsWaiting(false);
    }
  };

  const renderMarkdown = (text: string) => marked.parse(text) as string;

  return (
    <div className="chat-container">
      <button
        className="floating-cart"
        onClick={toggleChat}
        style={{ backgroundColor: isOpen ? '#f0eeed' : '#d40813', color: isOpen ? '#d40813' : 'white' }}
        aria-label={isOpen ? 'Ocultar chat' : 'Abrir chat'}
        title={isOpen ? 'Ocultar chat' : 'Abrir chat'}
      >
        {isOpen ? <FiMinimize2 size={22} /> : <RiRobot2Line size={24} />}
      </button>

      {isOpen && (
        <div className={`chat-box ${isExpanded ? 'expanded' : ''}`}>
          <div className="chat-header">
            <div className="chat-brand">
              <RiRobot2Line size={20} />
              <span className="chat-title">STIC</span>
            </div>
            <div className="chat-actions">
              <button
                className="chat-action"
                onClick={() => setIsExpanded(prev => !prev)}
                aria-label={isExpanded ? 'Reducir chat' : 'Expandir chat'}
                title={isExpanded ? 'Reducir chat' : 'Expandir chat'}
              >
                {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
              <button
                className="chat-action close-chat"
                onClick={toggleChat}
                aria-label="Cerrar chat"
                title="Cerrar chat"
              >
                <FiX />
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.type === 'bot' && <div className="avatar"><RiRobot2Line /></div>}
                <div className={`bubble ${msg.type === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
                  {msg.type === 'bot' ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                  ) : (
                    msg.text
                  )}
                </div>
                <span className="time">{msg.time}</span>
              </div>
            ))}
            {isWaiting && (
              <div className="message bot typing-message" aria-live="polite" aria-label="STIC esta escribiendo">
                <div className="avatar"><RiRobot2Line /></div>
                <div className="bubble bot-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe tu mensaje aqui..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={isWaiting || input.trim() === ''}
              aria-label="Enviar mensaje"
              title="Enviar"
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
