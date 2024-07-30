import React, { useState, useEffect, useRef } from 'react';
import { TextField, Container, Grid, AppBar, Toolbar, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import Message from './Message';
import { MessageDto } from "../models/MessageDto";
import axios from 'axios';

const Chat = ({ handleClose, assistantId, messages, setMessages, threadId, setThreadId }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [input, setInput] = useState("");
  const [shouldSendMessage, setShouldSendMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Send a message and receive the chatbot's response
  const fetchMessage = async (input) => {
    try {
      const response = await axios.post('https://acoris-chatbot.onrender.com/api/message', { input, threadId });
      setThreadId(response.data.threadId);
      return response.data;
    } catch (error) {
      console.error('Error fetching message response:', error);
    }
  };

  const createNewMessage = (content, isUser, isSuggested=false) => {
    return new MessageDto(isUser, isSuggested, content);
  };

  const handleSendMessage = async () => {
    if (!assistantId) {
      console.warn('Assistant is not initialized yet.');
      return;
    }
    const newMessages = [...messages, createNewMessage(input, true)];
    setMessages(newMessages);
    setInput("");

    setIsWaiting(true);
    const data = await fetchMessage(input);
    setIsWaiting(false);
  
    const responseHandlers = {
      'identifier_buttons': () => {
        setMessages([...newMessages,
          createNewMessage('Acoris offers the following human identifiers. Which one would you like to learn more about?', false),
          createNewMessage('ID Card and Card Reader', false, true),
          createNewMessage('Keychains (NFC tags)', false, true),
          createNewMessage('Cell Phones with NFC Integrated chip', false, true),
          createNewMessage('Pin Pad', false, true)
        ]);
      },
      'barrier_buttons': () => {
        setMessages([...newMessages, createNewMessage('Acoris offers the following access control barriers. Which one would you like to learn more about?', false),
          createNewMessage('Electromagnetic door lock', false, true),
          createNewMessage('Physical door lock', false, true),
          createNewMessage('Turnstiles', false, true)
        ]);
      },
      'software_buttons': () => {
        setMessages([...newMessages, createNewMessage('Acoris offers the following softwares. Which one would you like to learn more about?', false),
          createNewMessage('Gateway accounting', false, true),
          createNewMessage('Employee work time management', false, true),
          createNewMessage('Inventory control', false, true)
        ]);
      }
    };

    // Handle buttons
    if (data.response) {
      const handlerKey = Object.keys(responseHandlers).find(key => data.response.includes(key));
      if (handlerKey) {
        responseHandlers[handlerKey]();
      } else {
        setMessages([...newMessages, createNewMessage(data.response, false)]);
      }
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
    if (shouldSendMessage) {
      handleSendMessage();
      setShouldSendMessage(false);
    }
  }, [input]);

  const handleSuggestedMessageClick = (content) => {
    setInput(content);
    setShouldSendMessage(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Container style={{ 
      position: 'fixed', 
      bottom: '150px',
      right: '50px', 
      width: '350px',
      height: '500px',
      display: 'flex',
      flexDirection: 'column', 
      border: 'none',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', 
      backgroundColor: 'white',
      padding: 0,
      margin: 0
    }}>
      <AppBar position="static" sx={{ backgroundColor: '#114694', width: '100%' }}>
        <Toolbar>
          <h3 style={{ flexGrow: 1, marginTop: '12px', color: 'white' }}>Acoris Sales Assistant</h3>
          <IconButton edge="end" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Grid direction="column" style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map((message, index) => (
          <Message key={index} message={message} onMessageClick={handleSuggestedMessageClick} />
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
