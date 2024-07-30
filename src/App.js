import React, { useState, useEffect, useRef } from 'react';
import Chat from './components/Chat';
import ChatBubbleIcon from './components/ChatBubbleIcon';
import './App.css';
import axios from 'axios';

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [messages, setMessages] = useState(() => {
    const savedMessages = sessionStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [threadId, setThreadId] = useState(() => {
    const savedThread = sessionStorage.getItem('threadId');
    return savedThread ? JSON.parse(savedThread) : '';
  });
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      initChatBot();
      hasInitializedRef.current = true;
    }
    if (messages.length === 0) {
      setMessages([
        {
          content: "Hi, I am the Acoris Sales Assistant! I can recommend a product based on your company's needs, answer questions about our products, or provide solutions to problems with your current Acoris product. How can I help you?",
          isUser: false,
        },
      ]);
    }
  }, []);

  // Initialize chatbot on backend
  const fetchAssistant = async () => {
    try {
      const response = await axios.get('https://acoris-chatbot.onrender.com/api/assistant');
      return response.data;
    } catch (error) {
      console.error('Error fetching assistant:', error);
    }
  };

  const initChatBot = async () => {
    const data = await fetchAssistant();
    console.log("Assistant initiated");
    setAssistantId(data.assistant_id);
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    sessionStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('threadId', JSON.stringify(threadId));
  }, [threadId]);

  return (
    <div className="chat-container">
      {isChatOpen && <Chat handleClose={handleChatToggle} assistantId={assistantId} messages={messages} setMessages={setMessages} threadId={threadId} setThreadId={setThreadId} />}
      <ChatBubbleIcon handleClick={handleChatToggle} />
    </div>
  );
};

export default App;
