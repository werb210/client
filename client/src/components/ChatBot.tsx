import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
// Removed unnecessary UI component imports for cleaner custom implementation
// Using simple text icons for reliability
const HelpIcon = () => <span className="text-blue-600">💬</span>;
const CloseIcon = () => <span>✕</span>;
const SendIcon = () => <span>→</span>;
const UserIcon = () => <span className="text-white">👤</span>;
const CheckCircleIcon = () => <span className="text-green-600">✓</span>;
const AlertTriangleIcon = () => <span className="text-red-600">⚠</span>;
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
  const [screenshotBase64, setScreenshotBase64] = useState('');

  // Take screenshot when modal opens
  useEffect(() => {
    if (isOpen && !screenshotBase64) {
      captureScreenshot().then(setScreenshotBase64);
    }
  }, [isOpen]);

  const captureScreenshot = async (): Promise<string> => {
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Scroll to top for full page capture
      window.scrollTo(0, 0);
      
      const canvas = await html2canvas(document.body, { 
        scrollY: -window.scrollY,
        useCORS: true,
        allowTaint: true,
        scale: 0.8,
        height: window.innerHeight,
        width: window.innerWidth
      });
      
      // Convert to base64 immediately
      return canvas.toDataURL('image/png', 0.8);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return '';
    }
  };

  const submitReport = async () => {
    if (!reportText.trim()) return;
    
    setIsSubmitting(true);
    try {
      console.log('🐛 [CLIENT] Submitting issue report with screenshot');
      
      const userContact = JSON.parse(sessionStorage.getItem('chatbotContact') || '{}');
      
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
          screenshot: screenshotBase64, // Use the pre-captured screenshot
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (reportResponse.ok) {
        const result = await reportResponse.json();
        console.log('✅ [CLIENT] Issue report submitted successfully:', result);
        
        alert('✅ Your issue report has been submitted');
        onClose();
        setReportText(''); // Clear the text for next time
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

  // Force center with document body append
  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed !important' as any,
        top: '0px !important' as any,
        left: '0px !important' as any,
        width: '100vw !important' as any,
        height: '100vh !important' as any,
        backgroundColor: 'rgba(0, 0, 0, 0.8) !important' as any,
        zIndex: '2147483647 !important' as any,
        display: 'flex !important' as any,
        alignItems: 'center !important' as any,
        justifyContent: 'center !important' as any,
        margin: '0 !important' as any,
        padding: '0 !important' as any
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '500px !important' as any,
          maxWidth: '90vw !important' as any,
          minHeight: '400px !important' as any,
          maxHeight: '80vh !important' as any,
          backgroundColor: '#ffffff !important' as any,
          borderRadius: '12px !important' as any,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8) !important' as any,
          border: '5px solid #ff0000 !important' as any,
          margin: 'auto !important' as any,
          position: 'relative !important' as any
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b bg-gray-50 rounded-t-lg"
          style={{ borderBottom: '1px solid #e5e7eb' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Report an Issue</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-200 transition-colors"
              style={{ border: 'none', backgroundColor: 'transparent' }}
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the issue:
            </label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Please describe what went wrong or what you were expecting..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={isSubmitting}
              style={{
                fontSize: '14px',
                lineHeight: '1.4'
              }}
            />
          </div>
          
          <div 
            className="text-xs text-gray-600 bg-blue-50 p-3 rounded-md"
            style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe' }}
          >
            💡 Your conversation history and a screenshot will be included to help us understand the context.
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitReport}
              disabled={!reportText.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Capturing & Sending...' : 'Send Report with Screenshot'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
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
  const [humanRequestStatus, setHumanRequestStatus] = useState<'idle' | 'requesting' | 'connected'>('idle');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isEscalated, setIsEscalated] = useState<boolean>(false);
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

  // Initial greeting with contact collection and session storage
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      
      // Initialize user data from session storage or applicationData
      const storedEmail = sessionStorage.getItem('userEmail') || applicationData?.contactEmail || '';
      const storedName = sessionStorage.getItem('userName') || applicationData?.contactName || '';
      
      setUserEmail(storedEmail);
      setUserName(storedName);
      
      // Store session data
      if (storedEmail) sessionStorage.setItem('userEmail', storedEmail);
      if (storedName) sessionStorage.setItem('userName', storedName);
      sessionStorage.setItem('sessionId', sessionId);
      
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
        },
        setUserData: (email: string, name: string) => {
          setUserEmail(email);
          setUserName(name);
          sessionStorage.setItem('userEmail', email);
          sessionStorage.setItem('userName', name);
        }
      };
      
      // Start welcome flow with contact collection after a brief delay
      setTimeout(() => {
        if ((window as any).startChat) {
          (window as any).startChat();
        }
      }, 800); // Allow time for chat-client.js to load
    }
  }, [isOpen, messages.length, hasGreeted, applicationData]);

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
    if (isOpen && !socket) {
      console.log('Initializing Socket.IO connection for real-time chat');
      
      // Import socket function properly
      import('@/lib/socket').then(({ getSocket }) => {
        const socketInstance = getSocket();
        setSocket(socketInstance);
        
        // Join the session
        socketInstance.emit('join-session', sessionId);
        console.log('Joined session:', sessionId);

        // Set up event listeners
        const handleConnect = () => {
          console.log('✅ [Chat] Socket connected');
          setIsConnected(true);
          socketInstance.emit('join-session', sessionId);
        };

        const handleDisconnect = (reason: any) => {
          console.log(`🔌 [Chat] Socket disconnected: ${reason}`);
          setIsConnected(false);
        };

        const handleConnectError = () => {
          setIsConnected(false);
        };

        // Add event listeners
        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);
        socketInstance.on('connect_error', handleConnectError);

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

        // Cleanup function
        return () => {
          socketInstance.off('connect', handleConnect);
          socketInstance.off('disconnect', handleDisconnect);
          socketInstance.off('connect_error', handleConnectError);
          socketInstance.off('new-message');
          socketInstance.off('staff-assigned');
        };
      }).catch(error => {
        console.error('Failed to load socket:', error);
      });
    }
  }, [isOpen, socket, sessionId]);

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
    if (!inputValue.trim() || isLoading || isEscalated) return;

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

  // Enhanced human escalation with proper escalate_to_human event per test specification
  const requestHuman = async () => {
    try {
      console.log('🚨 [ESCALATION] Chat escalated to human by user request');
      
      // Set escalated state to block further AI responses
      setIsEscalated(true);
      setHumanRequestStatus('requesting');
      
      // Get user contact info from session storage
      const userContact = JSON.parse(sessionStorage.getItem('chatbotContact') || '{}');
      
      // Prepare escalation payload as per test specification
      const escalationData = {
        clientId: sessionId,
        name: userContact.name || userName || 'Anonymous User',
        email: userContact.email || userEmail || 'anonymous@example.com',
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        context: `User requested human assistance during ${currentStep ? `Step ${currentStep}` : 'application process'}`
      };
      
      console.log('📋 [ESCALATION] Sending escalation payload:', escalationData);
      
      // Emit escalate_to_human event via Socket.IO for immediate staff notification
      if (socket && isConnected) {
        socket.emit('escalate_to_human', escalationData);
        console.log('📡 [ESCALATION] escalate_to_human event emitted via Socket.IO');
        
        // Wait for escalation confirmation
        socket.on('escalation_confirmed', (data: any) => {
          console.log('✅ [ESCALATION] Escalation confirmed by server:', data);
          setHumanRequestStatus('connected');
          
          // Show user that AI is now blocked and they're connected to human
          addBotMessage("✅ You're now connected to a human agent. AI responses are blocked - only our staff will reply from now on.");
          
          // Show success alert for escalation
          alert('✅ Your request has been sent to a human support agent');
        });
        
      } else {
        console.warn('⚠️ [ESCALATION] Socket.IO not available, using HTTP fallback');
        
        // HTTP fallback for escalation
        const response = await fetch('/api/public/chat/escalate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(escalationData),
        });

        if (response.ok) {
          console.log('✅ [ESCALATION] HTTP escalation request successful');
          setHumanRequestStatus('connected');
          addBotMessage("✅ You're now connected to a human agent. AI responses are blocked - only our staff will reply from now on.");
          alert('✅ Your request has been sent to a human support agent');
        } else {
          throw new Error('HTTP escalation failed');
        }
      }
      
    } catch (error) {
      console.error('❌ [ESCALATION] Failed to escalate to human:', error);
      setIsEscalated(false);  // Reset escalation state on error
      setHumanRequestStatus('idle');
      addBotMessage("I'm having trouble connecting you to a human right now. Please try again in a moment, or you can contact our support team directly.");
    }
  };

  // Report issue functionality  
  const reportIssue = async () => {
    try {
      console.log('🐛 [CLIENT] Opening issue report dialog...');
      setShowFeedbackModal(true);
    } catch (error) {
      console.error('❌ [CLIENT] Failed to open issue report:', error);
    }
  };

  if (!isOpen) {
    return (
      <button
        id="chatLauncher"
        onClick={onToggle}
        className="chat-button text-white rounded-full px-5 py-3 flex items-center gap-2 shadow-lg cursor-pointer z-[1000] transition-colors duration-200"
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
        : "fixed bottom-0 right-5 w-80 h-[85vh] max-h-[850px] rounded-t-lg"
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
          placeholder={isEscalated ? "Chat escalated to human agent..." : "Ask me anything about financing..."}
          disabled={isLoading || isEscalated}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim() || isLoading || isEscalated}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ background: isEscalated ? '#9CA3AF' : '#007A3D' }}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = '#005D2E')}
          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = isEscalated ? '#9CA3AF' : '#007A3D')}
        >
          <SendIcon />
        </button>
      </div>
      
      {/* Enhanced Chat Footer with Multiple Options */}
      <div 
        className="chat-footer text-white py-2 px-4 text-sm flex-shrink-0"
        style={{
          background: '#005D2E',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          minHeight: '50px'
        }}
      >
        <div className="flex justify-between items-center h-full">
          <span className="text-xs">Need help?</span>
          <div className="flex gap-1.5">
            <button
              onClick={async () => {
                // IMMEDIATELY block further chatbot responses
                setIsEscalated(true);
                setHumanRequestStatus('requesting');
                
                // Add connection message and stop AI responses
                addBotMessage('🤝 Connecting you to a human agent... Your chat session has been escalated to our support team. Please wait while we connect you.');
                
                try {
                  // Get user contact info
                  const storedEmail = sessionStorage.getItem('userEmail') || userEmail || 'anonymous';
                  const storedName = sessionStorage.getItem('userName') || userName || 'Anonymous User';
                  const clientId = sessionId;
                  
                  console.log('🚨 [ESCALATION] Session escalated - blocking AI responses');
                  console.log('📞 [ESCALATION] Requesting human assistance via Socket.IO');
                  
                  // Use the correct event name as specified
                  if (socket && isConnected) {
                    socket.emit('escalate_to_human', {
                      clientId,
                      name: storedName,
                      email: storedEmail,
                      timestamp: new Date().toISOString(),
                      sessionId,
                      context: { currentStep, applicationData }
                    });
                    console.log('✅ [ESCALATION] Escalation event emitted via Socket.IO');
                  }

                  // HTTP fallback
                  await fetch('/api/chat/request-staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      sessionId,
                      userName: storedName,
                      userEmail: storedEmail,
                      context: { currentStep, applicationData, escalated: true }
                    })
                  });
                  
                  setHumanRequestStatus('connected');
                  console.log('✅ [ESCALATION] Human assistance request sent - AI responses blocked');
                } catch (error) {
                  console.error('❌ [ESCALATION] Failed to escalate to human:', error);
                  setIsEscalated(false); // Re-enable AI if escalation fails
                  setHumanRequestStatus('idle');
                  addBotMessage('Sorry, we had trouble connecting you to a human agent. Please try again or call us directly at 1-888-811-1887.');
                }
              }}
              className="px-2 py-1 rounded border-none cursor-pointer transition-colors duration-200 text-white text-xs"
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
              className="px-2 py-1 rounded border-none cursor-pointer transition-colors duration-200 text-white text-xs"
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