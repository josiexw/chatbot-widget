// src/components/ChatBubbleIcon.js
import React from 'react';
import { IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const ChatBubbleIcon = ({ handleClick }) => {
  return (
    <IconButton
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '40px',
        backgroundColor: '#114694',
        color: 'white',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <ChatIcon />
    </IconButton>
  );
};

export default ChatBubbleIcon;
