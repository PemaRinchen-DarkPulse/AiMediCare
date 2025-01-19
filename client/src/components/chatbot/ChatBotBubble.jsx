import React, { useState, useEffect, useRef } from 'react';
import { FaRegCommentDots } from 'react-icons/fa';
import './BubbleChat.css';

function ChatBotBubble() {
  const [isOpen, setIsOpen] = useState(false); // State to toggle chat window
  const [userMessage, setUserMessage] = useState(''); // User's input
  const [chatHistory, setChatHistory] = useState([]); // Store chat messages
  const [greetingSent, setGreetingSent] = useState(false); // Track if greeting is sent
  const chatEndRef = useRef(null); // Reference to scroll to the end of the chat

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]); // Trigger when chat history changes

  // Toggle chat window
  const toggleChat = () => {
    if (!isOpen && !greetingSent) {
      // Add default greeting message when opening the chat for the first time
      setChatHistory((prev) => [
        ...prev,
        { sender: 'AI', message: 'Hi, How can I help you?' },
      ]);
      setGreetingSent(true); // Mark greeting as sent
    }
    setIsOpen(!isOpen);
  };

  // Handle message submission
  const handleSendMessage = () => {
    if (userMessage.trim()) {
      // Add user's message and simulated AI response to chat history
      setChatHistory((prev) => [
        ...prev,
        { sender: 'You', message: userMessage },
        { sender: 'AI', message: "Hi! How can I aHe." },
      ]);
      setUserMessage(''); // Clear input
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage(); // Send message on Enter
    }
  };

  return (
    <div>
      {/* Chat bubble */}
      <div className="chat-bubble" onClick={toggleChat}>
        <FaRegCommentDots className="chat-icon" />
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">Ask Me Anything!</div>
          <div className="chat-body">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`chat-message ${chat.sender === 'You' ? 'user-message' : 'ai-message'}`}
              >
                <strong>{chat.sender}:</strong> {chat.message}
              </div>
            ))}
            {/* Scroll target */}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-footer">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBotBubble;
