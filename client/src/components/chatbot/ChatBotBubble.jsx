import React, { useState, useEffect, useRef } from 'react';
import { FaRegCommentDots, FaPaperPlane, FaTimes, FaSpinner } from 'react-icons/fa';
import { sendChatMessage } from '../../services/aiService';
import './BubbleChat.css';

function ChatBotBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [greetingSent, setGreetingSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const toggleChat = () => {
    if (!isOpen && !greetingSent) {
      setChatHistory([
        { sender: 'AI', message: 'Hi there! 👋 I\'m your AiMediCare virtual assistant. How can I help with your healthcare needs today?' },
      ]);
      setGreetingSent(true);
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    const message = userMessage;
    setUserMessage('');
    setError(null);
    
    // Add user's message to chat immediately
    setChatHistory((prev) => [
      ...prev,
      { sender: 'You', message: message },
    ]);
    
    // Show loading indicator
    setIsLoading(true);
    
    try {
      // Get AI response
      const response = await sendChatMessage(message, chatHistory);
      
      // Add AI response to chat
      setChatHistory((prev) => [
        ...prev,
        { sender: 'AI', message: response },
      ]);
    } catch (err) {
      setError('Sorry, I encountered an error. Please try again later.');
      console.error('Chatbot error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div>
      <div className="chat-bubble" onClick={toggleChat} title="Ask AiMediCare Assistant">
        <FaRegCommentDots className="chat-icon" />
      </div>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <img 
                src="/favicon.ico" 
                alt="AiMediCare" 
                className="chat-logo"
                onError={(e) => e.target.style.display = 'none'}
              />
              AiMediCare Assistant
            </div>
            <button className="close-button" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>
          <div className="chat-body">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`chat-message ${chat.sender === 'You' ? 'user-message' : 'ai-message'}`}
              >
                <div className={`message-bubble ${chat.sender === 'You' ? 'user-bubble' : 'ai-bubble'}`}>
                  {chat.message}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message ai-message">
                <div className="message-bubble ai-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="chat-message ai-message">
                <div className="message-bubble ai-bubble error-bubble">
                  {error}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-footer">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              ref={inputRef}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage} 
              disabled={isLoading || !userMessage.trim()}
              className={`send-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? <FaSpinner className="icon-spin" /> : <FaPaperPlane />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBotBubble;
