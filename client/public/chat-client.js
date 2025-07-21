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
    window.requestHuman = async function() {
      try {
        await fetch('/api/chat/request-staff', {
          method: 'POST', 
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ sessionId, userName })
        });
        console.log('Client requested human chat');
      } catch (error) {
        console.error('Human request failed:', error);
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
      // This could integrate with your React chat component
      // For now, just log the message
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