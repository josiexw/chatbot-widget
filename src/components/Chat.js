import React, { useState, useEffect, useRef } from 'react';
import { TextField, Container, Grid, AppBar, Toolbar, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import Message from './Message';
import { MessageDto } from "../models/MessageDto";
import axios from 'axios';

const Chat = ({ handleClose }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [assistant, setAssistant] = useState(null);
  const messagesEndRef = useRef(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    console.log('useEffect');
    if (!hasInitializedRef.current) {
      initChatBot();
      hasInitializedRef.current = true;
    }
    setMessages([
      {
        content: "Hi, I am here to help you with reserving services! I can find services, answer questions (ex. What is the pricing for a 30 min massage? What time slots are available?), and recommend activities at specific locations. Please enter your email:",
        isUser: false,
      },
    ]);
  }, []);

  // Initialize chatbot on backend
  const fetchAssistant = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/assistant');
      return response.data;
    } catch (error) {
      console.error('Error fetching assistant:', error);
    }
  };

  // Send a message and receive the chatbot's response
  const fetchMessage = async (input) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/message', { input });
      return response.data;
    } catch (error) {
      console.error('Error fetching message response:', error)
    }
  };

  const initChatBot = async () => {
    console.log("Running initChatBot");
    const data = await fetchAssistant();
    console.log("Assistant ID:", data.assistant_id)
    setAssistant(data.assistant_id);
    console.log("Assistant initialized:", assistant)
  };

  const createNewMessage = (content, isUser) => {
    return new MessageDto(isUser, content);
  };

  const handleSendMessage = async () => {
    if (!assistant) {
      console.warn('Assistant is not initialized yet.');
      return;
    }
    messages.push(createNewMessage(input, true));
    setMessages([...messages]);
    setInput("");

    setIsWaiting(true);
    const data = await fetchMessage(input);
    console.log("Chatbot response:", data.response)
    setIsWaiting(false);

    if (data.response) {
      setMessages([...messages, createNewMessage(data.response, false)]);
    } else {
      console.error('No response from the assistant.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Container style={{ 
      position: 'fixed', 
      bottom: '80px',
      right: '20px', 
      width: '350px',
      height: '500px',
      display: 'flex',
      flexDirection: 'column', 
      border: '1px solid #ddd',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', 
      backgroundColor: 'white',
      padding: 0,
      margin: 0
    }}>
      <AppBar position="static" sx={{ backgroundColor: '#114694', width: '100%' }}>
        <Toolbar>
          <h3 style={{ flexGrow: 1, marginTop: '12px' }}>Acoris Sales Assistant</h3>
          <IconButton edge="end" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Grid direction="column" style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </Grid>
      <Grid direction="column" style={{flexGrow: 1}}>
        {isWaiting && (
            <div style={{ position: 'absolute', bottom: '100px', left: '20px' }}>
              <CircularProgress size={18} />
            </div>
          )}
      </Grid>
      <Grid container item spacing={2} style={{ padding: '16px' }}>
        <Grid item xs={10}>
          <TextField
            label="Type your message"
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </Grid>
        <Grid item xs={2}>
          <IconButton onClick={handleSendMessage} style={{ color: '#114694', marginTop: '8px' }}>
            <SendIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
