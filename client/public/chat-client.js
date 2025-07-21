// Socket.IO Client Initialization Script
// This ensures Socket.IO is available before any React components try to use it

let socket;
let sessionId = Math.random().toString(36).substr(2, 9);

// Wait for DOM to be ready and Socket.IO to be available
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔌 DOM ready, checking Socket.IO availability...');
  
  if (typeof io !== 'undefined') {
    console.log('✅ Socket.IO available, initializing connection...');
    
    // Initialize socket connection
    socket = io();
    
    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket.IO client connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO client disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });

    // Join a session on connection
    socket.emit('join-session', sessionId);
    console.log('🔗 Emitted join-session for sessionId:', sessionId);

    // Listen for new messages
    socket.on('new-message', (data) => {
      console.log('📨 Received new message via Socket.IO:', data);
    });

    // Staff assignment notifications
    socket.on('staff-assigned', (data) => {
      console.log('👩‍💼 Staff assigned via Socket.IO:', data);
    });

    // Human chat request handler
    window.requestHumanChat = function(currentSessionId) {
      if (socket && socket.connected) {
        console.log('🤝 Requesting human chat via Socket.IO for session:', currentSessionId || sessionId);
        socket.emit('request-human-chat', { sessionId: currentSessionId || sessionId });
        
        // Also send HTTP request as backup
        fetch('/api/chat/request-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSessionId || sessionId })
        })
        .then(response => response.json())
        .then(data => {
          console.log('📤 HTTP human request response:', data);
        })
        .catch(error => {
          console.error('❌ HTTP human request failed:', error);
        });
      } else {
        console.warn('⚠️ Socket.IO not connected, using HTTP fallback only');
        
        // Fallback to HTTP only
        fetch('/api/chat/request-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSessionId || sessionId })
        })
        .then(response => response.json())
        .then(data => {
          console.log('📤 HTTP fallback human request response:', data);
        })
        .catch(error => {
          console.error('❌ HTTP fallback human request failed:', error);
        });
      }
    };

    // Make socket available globally for React components
    window.globalSocket = socket;
    window.globalSessionId = sessionId;
    
  } else {
    console.error('❌ Socket.IO not available - server may not be serving socket.io.js correctly');
    console.log('🔍 Available globals:', Object.keys(window).filter(key => key.includes('io') || key.includes('socket')));
  }
});

// Export for potential ES6 usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { socket, sessionId };
}