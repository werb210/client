// Socket.IO Client Initialization Script
// This ensures Socket.IO is available before any React components try to use it

let socket;
let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
let userName = 'Anonymous User';

// Wait for DOM to be ready and Socket.IO to be available
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready, checking Socket.IO availability...');
  
  if (typeof io !== 'undefined') {
    console.log('Socket.IO available, initializing connection...');
    
    // Initialize socket connection
    socket = io();
    
    // Connection event handlers
    socket.on('connect', () => {
      console.log('Client connected', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    // Join a session on connection
    socket.emit('join-session', sessionId);
    console.log('Client emitted join-session', sessionId);

    // Listen for new messages
    socket.on('new-message', msg => {
      console.log('Client received new-message', msg);
      if (window.appendMessage) {
        window.appendMessage(msg.role, msg.message);
      }
    });

    // Staff assignment notifications
    socket.on('staff-assigned', (data) => {
      console.log('Staff assigned via Socket.IO:', data);
      if (window.appendMessage) {
        window.appendMessage('system', `Human agent ${data.staffName} has joined the chat`);
      }
    });

    // Human chat request function
    window.requestHuman = function() {
      const userName = sessionStorage.getItem('userName') || 'Customer';
      if (socket && socket.connected) {
        socket.emit('user-request-human', { sessionId, userName });
        console.log('Client emitted requestHuman');
        console.log('Client emitted user-request-human:', { sessionId, userName });
      } else {
        console.log('Socket not connected, cannot request human');
      }
    };

    // Send message function
    window.sendMessage = function(text) {
      if (socket && socket.connected) {
        socket.emit('user-message', { sessionId, message: text });
        console.log('Client sent user-message');
      }
    };

    // Message appending function for integration
    window.appendMessage = function(role, message) {
      console.log('Appending message:', role, message);
      // This integrates with the React chat component
      if (window.chatBotInstance && window.chatBotInstance.addMessage) {
        window.chatBotInstance.addMessage(role, message);
      }
    };

    // Bot message helper
    window.appendBot = function(message) {
      window.appendMessage('assistant', message);
    };

    // User input state management
    window.chatState = {
      awaitingUserInput: false,
      awaitingInputType: null,
      awaitingInputCallback: null,
      userContactInfo: {
        name: sessionStorage.getItem('userName') || null,
        email: sessionStorage.getItem('userEmail') || null
      }
    };

    // Wait for user input function
    window.waitForUser = function() {
      return new Promise((resolve) => {
        window.chatState.awaitingUserInput = true;
        window.chatState.awaitingInputCallback = resolve;
      });
    };

    // Process user input for contact collection
    window.processUserInput = function(message) {
      if (window.chatState.awaitingUserInput && window.chatState.awaitingInputCallback) {
        window.chatState.awaitingUserInput = false;
        const callback = window.chatState.awaitingInputCallback;
        window.chatState.awaitingInputCallback = null;
        callback(message);
        return true;
      }
      return false;
    };

    // Welcome flow with contact collection
    window.startChat = async function() {
      const savedName = sessionStorage.getItem('userName');
      const savedEmail = sessionStorage.getItem('userEmail');
      
      if (savedName && savedEmail) {
        window.appendBot(`Welcome back, ${savedName}! How can I help you today?`);
        return;
      }
      
      try {
        window.appendBot("Hi, I'm FinBot! I help with business financing questions. Can I get your name to get started?");
        
        const name = await window.waitForUser();
        window.appendBot(`Thanks, ${name}! And what's your email address?`);
        
        const email = await window.waitForUser();
        
        // Store contact info
        sessionStorage.setItem('userName', name);
        sessionStorage.setItem('userEmail', email);
        window.chatState.userContactInfo = { name, email };
        
        // Log contact to server
        await fetch('/api/chat/log-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, name, email })
        }).catch(err => console.log('Contact logging failed:', err));
        
        window.appendBot(`Perfect, ${name}! I'm here to help with business financing, loan products, and application questions. What would you like to know?`);
        
      } catch (error) {
        console.error('Welcome flow error:', error);
        window.appendBot("Welcome! How can I help with your business financing needs today?");
      }
    };

    // Make socket available globally for React components
    window.globalSocket = socket;
    window.globalSessionId = sessionId;
    
  } else {
    console.error('Socket.IO not available - server may not be serving socket.io.js correctly');
    console.log('Available globals:', Object.keys(window).filter(key => key.includes('io') || key.includes('socket')));
  }
});

// Export for potential ES6 usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { socket, sessionId };
}