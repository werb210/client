// Initialize socket once script loaded
let socket;
let sessionId = Math.random().toString(36).substr(2, 9);

// Initialize socket when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  socket = io(); // now defined properly
  
  // Join the session on load
  socket.emit('join-session', sessionId);
  
  // Listen for staff and AI replies
  socket.on('new-message', msg => {
    appendMessage(msg.role, msg.message);
  });
});

// When user requests human
async function requestHuman() {
  try {
    console.log('Requesting human assistance via Socket.IO...');
    await fetch('/api/chat/request-staff', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ sessionId })
    });
    
    // Also emit via socket for real-time notification
    if (socket) {
      socket.emit('request-human', { sessionId });
    }
    
    console.log('Human assistance request sent');
  } catch (error) {
    console.error('Failed to request human assistance:', error);
  }
}

// Send user messages
function sendMessage(text) {
  if (socket) {
    socket.emit('user-message', { sessionId, message: text });
    appendMessage('user', text);
  } else {
    console.error('Socket not initialized');
  }
}

// Make functions available globally
window.requestHuman = requestHuman;
window.sendMessage = sendMessage;

// Helper function to append messages (placeholder)
function appendMessage(role, message) {
  console.log(`[${role}] ${message}`);
  // This would be implemented based on your chat UI
}