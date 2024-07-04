// src/ChatbotWidget.js
import React, { useState } from 'react';
import Chat from './components/Chat';
import ChatBubbleIcon from './components/ChatBubbleIcon';

const ChatbotWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div>
      {isChatOpen && <Chat handleClose={handleChatToggle} />}
      <ChatBubbleIcon handleClick={handleChatToggle} />
    </div>
  );
};

export default ChatbotWidget;
