import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// Function to render the App component into the element with ID 'chatbot-container'
const renderApp = () => {
  const container = document.getElementById('chatbot-container');
  ReactDOM.render(<App />, container);
};

renderApp();
