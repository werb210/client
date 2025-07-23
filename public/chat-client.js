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
    
    // 🔧 Task 3: Emit "request_human" with user context for live UI
    const userContact = JSON.parse(sessionStorage.getItem('chatbotContact') || '{}');
    const contextData = {
      sessionId,
      name: userContact.name || '',
      email: userContact.email || '',
      currentPage: window.location.pathname,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔗 [CLIENT] Sending human request with context:', contextData);
    
    // Emit request_human event for real-time staff notifications
    if (socket) {
      socket.emit('request_human', contextData);
    }
    
    // HTTP fallback
    await fetch('/api/chat/request-staff', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(contextData)
    });
    
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

// Helper function to append messages - integrated with React chatbot
function appendMessage(role, message) {
  console.log(`[${role}] ${message}`);
  
  // Try to integrate with React chatbot if available
  if (window.ChatBotInstance && window.ChatBotInstance.addMessage) {
    window.ChatBotInstance.addMessage(role, message);
  }
}