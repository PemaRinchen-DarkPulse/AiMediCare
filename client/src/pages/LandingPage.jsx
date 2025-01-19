import React from 'react';
import { Link } from 'react-router-dom';
import ChatBotBubble from '../components/chatbot/ChatBotBubble';

const LandingPage = () => {
  return (
    <div className="">
    <Link to="/login">Login</Link> {" "}
    <Link to="/signup">Sign Up</Link>
      <ChatBotBubble />
    </div>
  );
};

export default LandingPage;
