import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, Mic, VolumeX, Loader } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { resumeService } from '../../services/resumeService';

const BlueBotIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M461.1 278.4C461.1 364.5 391.2 434.4 305.1 434.4H157.6L67 483.5C59.6 487.6 50.9 482.3 50.9 473.8V392.5C21.8 360.5 4.9 318.5 4.9 273.6C4.9 166.7 91.5 80.1 198.4 80.1H267.7C374.6 80.1 461.1 166.7 461.1 273.6V278.4Z" fill="#3A4AE8"/>
    <path d="M371.1 289.4C371.1 340.5 329.7 381.9 278.6 381.9H187.3C136.2 381.9 94.8 340.5 94.8 289.4V221.7C94.8 170.6 136.2 129.2 187.3 129.2H278.6C329.7 129.2 371.1 170.6 371.1 221.7V289.4Z" fill="white"/>
    <path d="M174.6 230.6C174.6 205.4 195 185 220.2 185" stroke="#3A4AE8" strokeWidth="28" strokeLinecap="round"/>
    <path d="M291.6 230.6C291.6 205.4 312 185 337.2 185" stroke="#3A4AE8" strokeWidth="28" strokeLinecap="round"/>
    <path d="M228.6 288.4C228.6 303.6 240.9 315.9 256.1 315.9C271.3 315.9 283.6 303.6 283.6 288.4" stroke="#3A4AE8" strokeWidth="28" strokeLinecap="round"/>
    <rect x="424.1" y="185.1" width="28" height="90" rx="14" fill="#3A4AE8"/>
    <rect x="13.9" y="185.1" width="28" height="90" rx="14" fill="#3A4AE8"/>
  </svg>
);

const ResumeChat = () => {
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('resumeChat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const {
    isListening,
    speakResponse,
    stopSpeaking,
    startListening
  } = useSpeechRecognition(setChatInput);

  useEffect(() => {
    localStorage.setItem('resumeChat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChatMessage = async (overrideInput) => {
    const messageToSend = typeof overrideInput === 'string' ? overrideInput : chatInput;
    if (!messageToSend.trim() || chatLoading) return;

    const userMessage = messageToSend.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const data = await resumeService.chat(userMessage);
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      speakResponse(data.response);
    } catch (err) {
      console.error(err);
      const errorMsg = 'Sorry, something went wrong. Please try again.';
      setChatMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      speakResponse(errorMsg);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <div className="card fade-in resume-chat-card">
      {/* Chat Header */}
      <div className="resume-chat-header">
        <MessageCircle size={20} color="var(--primary-color)" />
        <h3 className="resume-chat-header-title">Chat with your Resume</h3>
        <span className="resume-chat-header-subtitle">
          Ask questions about your parsed resume
        </span>
      </div>

      {/* Chat Messages */}
      <div className="resume-chat-messages">
        {chatMessages.length === 0 && (
          <div className="resume-chat-empty">
            <BlueBotIcon size={64} />
            <p>
              Your resume has been indexed. Ask me anything about it!
              <br />
              <span>e.g. "What are my strongest skills?" or "Summarize my experience"</span>
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`resume-chat-msg-row ${msg.role === 'user' ? 'user' : 'bot'}`}
          >
            <div className={`resume-chat-avatar ${msg.role === 'user' ? 'user' : 'bot'}`}>
              {msg.role === 'user' ? <User size={16} color="#fff" /> : <BlueBotIcon size={24} />}
            </div>
            <div className={`resume-chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="resume-chat-msg-row bot">
            <div className="resume-chat-avatar bot">
              <BlueBotIcon size={24} />
            </div>
            <div className="resume-chat-thinking">
              <Loader className="spin" size={14} /> Thinking...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="resume-chat-input-row">
        <input
          type="text"
          className="input-field resume-chat-input"
          placeholder="Ask about your resume..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleChatKeyDown}
          disabled={chatLoading}
        />

        <button
          onClick={stopSpeaking}
          title="Stop reading aloud"
          className="resume-chat-btn-icon"
        >
          <VolumeX size={20} />
        </button>
        <button
          onClick={startListening}
          disabled={isListening || chatLoading}
          title="Speak your query"
          className={`resume-chat-btn-icon ${isListening ? 'active' : ''}`}
        >
          <Mic size={20} />
        </button>
        <button
          onClick={() => sendChatMessage()}
          disabled={chatLoading || !chatInput.trim()}
          className="resume-chat-btn-send"
        >
          <Send size={16} /> Send
        </button>
      </div>
    </div>
  );
};

export default ResumeChat;
