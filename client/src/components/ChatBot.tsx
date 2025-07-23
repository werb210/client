import React, { useState, useRef, useEffect } from 'react';
// Removed unnecessary UI component imports for cleaner custom implementation
// Using simple text icons for reliability
const HelpIcon = () => <span className="text-blue-600">💬</span>;
const CloseIcon = () => <span>✕</span>;
const SendIcon = () => <span>→</span>;
const UserIcon = () => <span className="text-white">👤</span>;
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
  currentStep?: number;
  applicationData?: any;
}

interface TrainingExample {
  user: string;
  bot: string;
  metadata: {
    category: string;
    country: string;
    context: string;
  };
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: string;
}

function FeedbackModal({ isOpen, onClose, conversation }: FeedbackModalProps) {
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captureScreenshot = async (): Promise<Blob | null> => {
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Scroll to top for full page capture
      window.scrollTo(0, 0);
      
      const canvas = await html2canvas(document.body, { 
        scrollY: -window.scrollY,
        useCORS: true,
        allowTaint: true,
        scale: 0.5 // Reduce size for faster processing
      });
      
      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.8);
      });
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    }
  };

  const submitReport = async () => {
    if (!reportText.trim()) return;
    
    setIsSubmitting(true);
    try {
      // 🔧 Task 4: Implement issue reporting with screenshot
      const userContact = JSON.parse(sessionStorage.getItem('chatbotContact') || '{}');
      const screenshot = await captureScreenshot();
      let screenshotBase64 = '';
      
      // Convert screenshot to base64 if available
      if (screenshot) {
        screenshotBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(screenshot);
        });
      }
      
      console.log('🐛 [CLIENT] Submitting issue report with screenshot');
      
      const reportResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/report-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userContact.name || 'Anonymous',
          email: userContact.email || '',
          message: reportText.trim(),
          page: window.location.pathname,
          screenshot: screenshotBase64,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (reportResponse.ok) {
        const result = await reportResponse.json();
        console.log('✅ [CLIENT] Issue report submitted successfully:', result);
        alert('Issue report submitted successfully! Our team will review it.');
      } else {
        console.error('❌ [CLIENT] Issue report failed:', reportResponse.status);
        alert('Failed to submit issue report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Report an Issue
            <Button variant="ghost" size="icon" onClick={onClose}>
              <CloseIcon />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Describe the issue:</label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Please describe what went wrong or what you were expecting..."
              className="w-full h-24 mt-1 p-2 border rounded-md resize-none"
              disabled={isSubmitting}
            />
          </div>
          <div className="text-xs text-gray-500">
            Your conversation history and a screenshot will be included to help us understand the context.
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={submitReport} 
              disabled={!reportText.trim() || isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Capturing & Sending...' : 'Send Report with Screenshot'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ChatBot({ isOpen, onToggle, currentStep, applicationData }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [sentiment, setSentiment] = useState<string>('neutral');
  const [proactiveShown, setProactiveShown] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const [trainingData, setTrainingData] = useState<TrainingExample[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const proactiveTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        const atBottom = chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight - 20;
        if (atBottom || messages.length <= 2) { // Always scroll for first few messages
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting with contact collection
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      
      // Make chat instance available globally for chat-client.js
      (window as any).chatBotInstance = {
        addMessage: (role: string, content: string) => {
          const message: Message = {
            id: Date.now().toString(),
            role: role === 'assistant' ? 'assistant' : 'user',
            content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, message]);
        }
      };
      
      // Start welcome flow with contact collection after a brief delay
      setTimeout(() => {
        if ((window as any).startChat) {
          (window as any).startChat();
        }
      }, 800); // Allow time for chat-client.js to load
    }
  }, [isOpen, messages.length, hasGreeted]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 🤖 TRAINING DATA PRELOADING: Load chatbot training data on initialization
  useEffect(() => {
    const loadTrainingData = async () => {
      try {
        console.log('🤖 [CHATBOT] Loading training data...');
        const response = await fetch('/api/training-data');
        
        if (response.ok) {
          const data = await response.json();
          setTrainingData(data.examples || []);
          console.log(`🤖 [CHATBOT] Loaded ${data.totalExamples} training examples across ${data.categories?.length || 0} categories`);
          console.log('🤖 [CHATBOT] Available categories:', data.categories);
        } else {
          console.log('🤖 [CHATBOT] No pre-generated training data found');
          // Optionally trigger training data generation
          const generateResponse = await fetch('/api/generate-training', { method: 'POST' });
          if (generateResponse.ok) {
            const generatedData = await generateResponse.json();
            setTrainingData(generatedData.data?.examples || []);
            console.log('🤖 [CHATBOT] Generated and loaded new training data');
          }
        }
      } catch (error) {
        console.warn('🤖 [CHATBOT] Training data loading failed:', error);
        // Continue without training data - chatbot will still work
      }
    };

    if (isOpen && trainingData.length === 0) {
      loadTrainingData();
    }
  }, [isOpen, trainingData.length]);

  // Mobile fullscreen detection and keyboard-aware resizing
  useEffect(() => {
    const checkMobileFullscreen = () => {
      const isMobile = window.matchMedia('(max-width: 600px)').matches;
      const shouldBeFullscreen = isOpen && isMobile;
      setIsMobileFullscreen(shouldBeFullscreen);

      // Toggle body scroll prevention on mobile
      if (shouldBeFullscreen) {
        document.body.classList.add('chatbot-fullscreen');
        console.log('📱 Mobile fullscreen chatbot activated');
      } else {
        document.body.classList.remove('chatbot-fullscreen');
      }
    };

    // Keyboard-aware viewport adjustment for mobile
    const adjustForKeyboard = () => {
      const vh = Math.max(window.visualViewport?.height || 0, window.innerHeight);
      document.documentElement.style.setProperty('--device-height', `${vh}px`);
    };

    // VirtualKeyboard API support (Chrome on Android)
    const setupVirtualKeyboard = () => {
      if ("virtualKeyboard" in navigator) {
        (navigator as any).virtualKeyboard.overlaysContent = true;
        (navigator as any).virtualKeyboard.addEventListener("geometrychange", (e: any) => {
          const kbHeight = e.target.boundingRect.height;
          document.documentElement.style.setProperty('--keyboard-height', `${kbHeight}px`);
        });
      }
    };

    // Check on mount and when chat opens
    if (isOpen) {
      checkMobileFullscreen();
      adjustForKeyboard();
      setupVirtualKeyboard();
    } else {
      // Always remove body class when chat closes
      document.body.classList.remove('chatbot-fullscreen');
      setIsMobileFullscreen(false);
    }

    // Listen for resize events and viewport changes
    const handleResize = () => {
      if (isOpen) {
        checkMobileFullscreen();
        adjustForKeyboard();
      }
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', adjustForKeyboard);

    // Initial setup
    adjustForKeyboard();
    setupVirtualKeyboard();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', adjustForKeyboard);
      // Cleanup body class on unmount
      document.body.classList.remove('chatbot-fullscreen');
    };
  }, [isOpen]);

  // Socket.IO integration for real-time messaging
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && (window as any).io) {
      console.log('Initializing Socket.IO connection for real-time chat');
      
      // Use global socket if available, or create new one
      const socketInstance = (window as any).globalSocket || (window as any).io();
      setSocket(socketInstance);

      // Join the session with proper error handling
      try {
        if (socketInstance && !socketInstance.connected) {
          socketInstance.emit('join-session', sessionId);
          console.log('Emitted join-session for sessionId:', sessionId);
        }
      } catch (error) {
        console.error('Failed to join session:', error);
      }

      // Connection status with enhanced logging
      socketInstance.on('connect', () => {
        console.log('Socket.IO connected, client ID:', socketInstance.id);
        setIsConnected(true);
        // Re-join session on reconnect
        socketInstance.emit('join-session', sessionId);
        console.log('Re-joined session after reconnect:', sessionId);
      });

      socketInstance.on('disconnect', (reason: any) => {
        console.log('Socket.IO disconnected, reason:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error: any) => {
        console.error('Socket.IO connection error:', error);
        setIsConnected(false);
      });

      // Listen for real-time messages
      socketInstance.on('new-message', (msg: any) => {
        console.log('Received real-time message:', msg);
        const message: Message = {
          id: Date.now().toString(),
          role: msg.role || 'assistant',
          content: msg.message || msg.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
      });

      // Staff handoff notifications
      socketInstance.on('staff-assigned', (data: any) => {
        console.log('Staff assigned:', data);
        addBotMessage(`Great! A human specialist (${data.staffName}) has joined the chat to assist you.`);
      });

      return () => {
        console.log('Cleaning up Socket.IO connection');
        if (socketInstance && socketInstance.connected) {
          socketInstance.disconnect();
        }
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isOpen, sessionId]);

  // Enhanced proactive messaging setup
  useEffect(() => {
    if (isOpen && !proactiveShown) {
      // DISABLED: Proactive message timeout to prevent promise rejections
      // proactiveTimeoutRef.current = setTimeout(() => {
      //   if (!proactiveShown) {
      //     const contextualMessage = getContextualProactiveMessage();
      //     addBotMessage(contextualMessage);
      //     setProactiveShown(true);
      //   }
      // }, 15000);
    }

    // Enhanced exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && isOpen && !proactiveShown) {
        const exitMessage = getExitIntentMessage();
        addBotMessage(exitMessage);
        setProactiveShown(true);
      }
    };

    if (isOpen) {
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (proactiveTimeoutRef.current) {
        clearTimeout(proactiveTimeoutRef.current);
      }
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isOpen, proactiveShown]);

  const getLenderProducts = () => {
    try {
      const cached = localStorage.getItem('lender-products-cache');
      if (cached) {
        const data = JSON.parse(cached);
        return data.products || [];
      }
      return [];
    } catch {
      return [];
    }
  };

  // Advanced features implementation
  const glossary: Record<string, string> = {
    DSCR: 'Debt Service Coverage Ratio: A measure of a company\'s ability to use its operating income to repay all its debt obligations.',
    'WORKING CAPITAL': 'Working Capital: The capital of a business used in its day-to-day trading operations, calculated as current assets minus current liabilities.',
    'EQUIPMENT FINANCING': 'Equipment Financing: A loan secured by the equipment being purchased, typically used for business machinery and vehicles.',
    'LINE OF CREDIT': 'Line of Credit: A flexible borrowing option that allows you to access funds up to a pre-approved limit when needed.',
    'INVOICE FACTORING': 'Invoice Factoring: Selling your accounts receivable to a third party at a discount to get immediate cash flow.',
    'TERM LOAN': 'Term Loan: A traditional loan with fixed monthly payments over a set period, typically for larger business investments.'
  };

  const analyzeMessage = async (text: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sessionId })
      });
      const analysis = await response.json();
      setSentiment(analysis.sentiment || 'neutral');
      
      // Show handoff UI if needed
      if (analysis.requires_handoff) {
        addBotMessage('I understand this is important to you. Let me connect you with a human specialist who can provide more detailed assistance. Please use the "Report it" button below to describe your specific needs.');
      }
      
      return analysis;
    } catch (error) {
      console.error('Analysis failed:', error);
      return { sentiment: 'neutral', intent: 'general' };
    }
  };

  const translateMessage = async (text: string, fromLang: string, toLang: string) => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fromLang, toLang, sessionId })
      });
      const result = await response.json();
      return result.translatedText || text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const applicationId = applicationData?.applicationId || localStorage.getItem('applicationId');
      const response = await fetch(`/api/status/${applicationId || ''}`);
      const status = await response.json();
      
      const statusMessage = `Your application status: ${status.status}. ${status.message}`;
      if (status.missing && status.missing.length > 0) {
        addBotMessage(`${statusMessage}\n\nMissing documents: ${status.missing.join(', ')}`);
      } else {
        addBotMessage(statusMessage);
      }
      
      return status;
    } catch (error) {
      console.error('Status check failed:', error);
      addBotMessage('Unable to retrieve your application status. Please contact support at info@boreal.financial');
    }
  };

  const checkGlossary = (text: string) => {
    const upperText = text.toUpperCase();
    for (const [term, definition] of Object.entries(glossary)) {
      if (upperText.includes(term) || upperText.includes(`WHAT IS ${term}`) || upperText.includes(`DEFINE ${term}`)) {
        addBotMessage(`📚 **${term}**: ${definition}`);
        return true;
      }
    }
    return false;
  };

  const addBotMessage = (content: string) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    
    // Check if chat is awaiting user input for contact collection
    if ((window as any).processUserInput && (window as any).processUserInput(messageText)) {
      // Add user message and let contact flow handle it
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      return; // Exit early, contact flow will continue
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Send via Socket.IO for real-time messaging
    if (socket && isConnected) {
      console.log('📤 Sending message via Socket.IO:', messageText);
      socket.emit('user-message', { 
        sessionId, 
        message: messageText,
        context: {
          currentStep,
          applicationData,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Clear proactive timeout since user is engaging
    if (proactiveTimeoutRef.current) {
      clearTimeout(proactiveTimeoutRef.current);
    }

    // Check for glossary terms
    if (checkGlossary(messageText)) {
      setIsLoading(false);
      return;
    }

    // Check for status inquiry
    if (messageText.toLowerCase().includes('status') || messageText.toLowerCase().includes('application')) {
      await checkApplicationStatus();
      setIsLoading(false);
      return;
    }

    // Analyze sentiment and intent
    const analysis = await analyzeMessage(messageText);

    // Handle non-English languages
    let processedMessage = messageText;
    if (currentLanguage !== 'en') {
      processedMessage = await translateMessage(messageText, currentLanguage, 'en');
    }

    try {
      // If Socket.IO is connected, send via Socket.IO and wait for real-time response
      if (socket && isConnected) {
        console.log('Sending message via Socket.IO...');
        socket.emit('user-message', { 
          sessionId, 
          message: processedMessage,
          context: {
            currentStep,
            applicationData,
            sentiment: analysis.sentiment,
            intent: analysis.intent
          }
        });
        console.log('Message sent via Socket.IO, waiting for real-time response...');
        setIsLoading(false);
        return;
      }

      // Fallback to HTTP API when Socket.IO is not available
      console.log('📡 Using HTTP fallback for chat API');
      
      // Fetch lender products from cache or API
      const { fetchLenderProducts } = await import('../api/lenderProducts');
      const products = await fetchLenderProducts();
      console.log(`🤖 [CHATBOT] Fetched ${products.length} lender products for AI context`);
      
      const contextData = {
        currentStep,
        applicationData,
        products: products // Full product database access - no artificial limits
      };
      
      if (products.length > 0) {
        console.log('🤖 [CHATBOT] Sample products for AI:', products.slice(0, 3).map(p => p.name || p.product || 'Unknown Product'));
        console.log(`🤖 [CHATBOT] FULL DATABASE ACCESS: AI now has access to all ${products.length} lender products via enhanced RAG system`);
      } else {
        console.warn('🤖 [CHATBOT] WARNING: No lender products available for AI context');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: processedMessage,
          sessionId,
          context: {
            ...contextData,
            sentiment: analysis.sentiment,
            intent: analysis.intent
          },
          messages: messages.slice(-5), // Last 5 messages for context
          trainingData: trainingData.slice(0, 50) // Include training examples for enhanced context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'I apologize, but I encountered an issue. Please try asking your question again.',
        timestamp: new Date()
      };

      // Translate response back if needed
      let finalResponse = data.reply || 'I apologize, but I encountered an issue. Please try asking your question again.';
      if (currentLanguage !== 'en') {
        finalResponse = await translateMessage(finalResponse, 'en', currentLanguage);
      }

      assistantMessage.content = finalResponse;
      setMessages(prev => [...prev, assistantMessage]);

      // Enhanced handoff logic with proactive triggers
      if (data.handoff || shouldTriggerHandoff(userMessage.content, analysis.sentiment)) {
        addBotMessage('I understand this is important to you. Let me connect you with a human specialist who can provide personalized assistance. Please use the "Talk to Human" button below or click "Report it" to describe your specific needs.');
        // Add "Talk to Human" button option
        setTimeout(() => {
          addBotMessage('You can also click here for immediate human assistance: [Request Human Agent]');
        }, 1000);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationText = () => {
    return messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  };

  // Enhanced contextual messaging
  const getContextualProactiveMessage = () => {
    if (currentStep === 1) {
      return "I see you're starting your financing application! I can help explain our loan products and guide you through each step.";
    } else if (currentStep === 2) {
      return "Need help choosing the right financing product? I can recommend options based on your business type and needs.";
    } else if (currentStep && currentStep >= 5) {
      return "Working on document upload? I can explain what documents are needed and help with any questions about the process.";
    }
    return "Hi there! I'm here to help with any questions about our financing options or application process.";
  };

  const getExitIntentMessage = () => {
    if (currentStep && currentStep > 1) {
      return "Before you go - I can help save your progress or answer any questions about completing your application!";
    }
    return "Wait! I can quickly explain our financing options and help you find the perfect loan for your business needs.";
  };

  // Enhanced handoff logic with context
  const shouldTriggerHandoff = (userMessage: string, sentiment: string) => {
    const frustratedPhrases = ['frustrated', 'angry', 'terrible', 'awful', 'hate', 'horrible', 'useless'];
    const complexPhrases = ['speak to someone', 'human agent', 'representative', 'manager', 'complicated'];
    
    const hasFrustratedWords = frustratedPhrases.some(phrase => 
      userMessage.toLowerCase().includes(phrase)
    );
    const hasComplexRequest = complexPhrases.some(phrase => 
      userMessage.toLowerCase().includes(phrase)
    );
    
    return (sentiment === 'negative' || sentiment === 'frustrated') || 
           hasFrustratedWords || hasComplexRequest;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Request human chat function
  const requestHumanChat = async () => {
    console.log('Requesting human chat for session:', sessionId);
    
    addBotMessage('Connecting you to a human agent. Please hold while we find someone to assist you...');
    
    try {
      // Use global requestHuman function (Socket.IO only - no REST fallback)
      if ((window as any).requestHuman) {
        (window as any).requestHuman();
        console.log('Client requested human chat via Socket.IO');
        addBotMessage('Request sent successfully. A human agent will join the chat shortly.');
      } else {
        throw new Error('Socket.IO connection not available');
      }
      
    } catch (error) {
      console.error('Failed to request human assistance:', error);
      addBotMessage('Sorry, we had trouble connecting you to a human agent. Please try refreshing the page or call us directly at 1-888-811-1887.');
    }
  };

  if (!isOpen) {
    return (
      <button
        id="chatLauncher"
        onClick={onToggle}
        className="fixed bottom-5 right-5 text-white rounded-full px-5 py-3 flex items-center gap-2 shadow-lg cursor-pointer z-[1000] transition-colors duration-200"
        style={{
          background: '#007A3D',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#005D2E'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#007A3D'}
      >
        <HelpIcon />
        <span>Chat with FinBot</span>
      </button>
    );
  }

  return (
    <div className={cn(
      "chat-widget bg-white flex flex-col shadow-xl z-50",
      isMobileFullscreen 
        ? "fullscreen-mobile fixed inset-0 w-full h-full max-h-none rounded-none" 
        : "fixed bottom-0 right-5 w-80 max-h-[750px] rounded-t-lg"
    )}>
      {/* Professional Chat Header */}
      <div 
        className={cn(
          "chat-header flex items-center justify-between px-4 py-3 text-white",
          isMobileFullscreen ? "rounded-none" : "rounded-t-lg"
        )}
        style={{ background: '#007A3D' }}
      >
        <div className="flex items-center gap-2">
          <HelpIcon />
          <span className="font-medium">FinBot</span>
          {isConnected && (
            <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">Live</span>
          )}
          {!isConnected && socket && (
            <span className="text-xs bg-yellow-500 px-2 py-0.5 rounded-full">Connecting...</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:text-gray-200 transition-colors text-lg font-bold"
        >
          ✖
        </button>
      </div>
      {/* Chat Body */}
      <div className={cn(
        "chat-body flex-1 overflow-y-auto p-3 flex flex-col",
        isMobileFullscreen && "min-h-0" // Ensure proper flex behavior on mobile
      )}>
        <div className="chat-messages flex-1 space-y-3 overflow-y-auto" data-chat-messages>
            {messages.map((message, index) => (
              <div
                key={`${message.id}-${index}` || `msg-${index}-${message.timestamp.getTime()}`}
                className={cn(
                  "flex gap-2 text-sm",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <HelpIcon />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2",
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <UserIcon />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <HelpIcon />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input-container flex gap-2 p-3 border-t border-gray-200">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about financing..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ background: '#007A3D' }}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = '#005D2E')}
          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = '#007A3D')}
        >
          <SendIcon />
        </button>
      </div>
      
      {/* Enhanced Chat Footer with Multiple Options */}
      <div 
        className="chat-footer text-white py-3 px-4 text-sm"
        style={{
          background: '#005D2E',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <div className="flex justify-between items-center">
          <span>Need help?</span>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                addBotMessage('Connecting you to a human agent. Please hold while we find someone to assist you...');
                
                try {
                  // Request human assistance via both Socket.IO and HTTP
                  if (socket && isConnected) {
                    console.log('📞 Requesting human assistance via Socket.IO');
                    // Use the correct event name and simple data structure
                    socket.emit('user-request-human', { 
                      sessionId,
                      userName: sessionStorage.getItem('userName') || applicationData?.firstName || 'Customer'
                    });
                    console.log('Client emitted user-request-human via footer button');
                  }

                  // Also make HTTP request as fallback
                  await fetch('/api/chat/request-staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      sessionId,
                      userName: applicationData?.firstName || 'Customer',
                      context: { currentStep, applicationData }
                    })
                  });
                  
                  console.log('✅ Human assistance request sent successfully');
                } catch (error) {
                  console.error('❌ Failed to request human assistance:', error);
                  addBotMessage('Sorry, we had trouble connecting you to a human agent. Please try the Report Issue button or call us directly at 1-888-811-1887.');
                }
              }}
              className="px-3 py-1.5 rounded border-none cursor-pointer transition-colors duration-200 text-white text-xs"
              style={{
                background: 'rgba(255,255,255,0.15)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              Talk to Human
            </button>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="px-3 py-1.5 rounded border-none cursor-pointer transition-colors duration-200 text-white text-xs"
              style={{
                background: 'rgba(255,255,255,0.15)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              Report Issue
            </button>
          </div>
        </div>
      </div>
      
      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        conversation={getConversationText()}
      />
    </div>
  );
}