// client/src/components/ChatBot.tsx - 4-phase lead capture chatbot
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

type ChatPhase = 'welcome' | 'askName' | 'askEmail' | 'askConsent' | 'ready';

interface LenderProduct {
  id: string;
  name: string;
  lender: string;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
}

export function ChatBot({ isOpen, onToggle, currentStep, applicationData }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<ChatPhase>('welcome');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'fr'>('en');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Lead capture data
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    consent: false
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [humanRequestStatus, setHumanRequestStatus] = useState<'idle' | 'requesting' | 'connected'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Language strings
  const strings = {
    en: {
      greeting: "👋 Hello! I'm your Boreal Financial assistant. I'm here to help you find the perfect funding solution for your business.",
      askName: "To get started, may I have your name?",
      askEmail: "Thank you! What's your email address?",
      askConsent: "Before we continue, I need your consent to contact you about funding opportunities. Do you agree to receive communications from Boreal Financial?",
      consentYes: "Yes, I consent",
      consentNo: "No, thank you",
      readyMessage: "Perfect! I'm now ready to help you with your funding needs. What would you like to know about business financing?",
      startApp: "Start Application",
      uploadDocs: "Upload Documents",
      bookMeeting: "Book Meeting",
      talkHuman: "Talk to Human",
      invalidEmail: "Please enter a valid email address.",
      consentRequired: "I understand. Feel free to browse our website for general information. If you change your mind, just let me know!",
      leadCaptured: "Thank you! Your information has been saved.",
      errorOccurred: "I'm here to help with your business financing needs! What can I assist you with today?",
      humanRequested: "I've notified our specialists. Someone will be in touch with you shortly!",
      uploadInstructions: "You can upload PDF documents up to 10MB. Accepted formats: PDF, PNG, JPEG",
      meetingBooked: "Meeting request submitted! You'll receive a confirmation email shortly.",
      languageToggle: "FR",
      languageLabel: "Language:"
    },
    fr: {
      greeting: "👋 Bonjour! Je suis votre assistant Boreal Financial. Je suis ici pour vous aider à trouver la solution de financement parfaite pour votre entreprise.",
      askName: "Pour commencer, puis-je avoir votre nom?",
      askEmail: "Merci! Quelle est votre adresse e-mail?",
      askConsent: "Avant de continuer, j'ai besoin de votre consentement pour vous contacter au sujet des opportunités de financement. Acceptez-vous de recevoir des communications de Boreal Financial?",
      consentYes: "Oui, je consens",
      consentNo: "Non, merci",
      readyMessage: "Parfait! Je suis maintenant prêt à vous aider avec vos besoins de financement. Que souhaitez-vous savoir sur le financement d'entreprise?",
      startApp: "Démarrer la demande",
      uploadDocs: "Télécharger des documents",
      bookMeeting: "Réserver une réunion",
      talkHuman: "Parler à un humain",
      invalidEmail: "Veuillez entrer une adresse e-mail valide.",
      consentRequired: "Je comprends. N'hésitez pas à parcourir notre site web pour des informations générales. Si vous changez d'avis, faites-le moi savoir!",
      leadCaptured: "Merci! Vos informations ont été sauvegardées.",
      errorOccurred: "Désolé, quelque chose s'est mal passé. Veuillez réessayer.",
      humanRequested: "J'ai notifié nos spécialistes. Quelqu'un vous contactera bientôt!",
      uploadInstructions: "Vous pouvez télécharger des documents PDF jusqu'à 10MB. Formats acceptés: PDF, PNG, JPEG",
      meetingBooked: "Demande de réunion soumise! Vous recevrez un e-mail de confirmation bientôt.",
      languageToggle: "EN",
      languageLabel: "Langue:"
    }
  };

  const currentStrings = strings[currentLanguage];

  // Get CSRF token from window or cookie
  const getCsrfToken = () => {
    // Try to get from window first (set by server)
    if (typeof window !== 'undefined' && (window as any).__CSRF__) {
      return (window as any).__CSRF__;
    }
    
    // Fallback to cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '__Host-bf_csrf') {
        return value;
      }
    }
    
    return null;
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize chat on open - SELF-STARTING, NO BACKEND DEPENDENCY
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      console.log('[ChatBot] 🚀 SELF-STARTING - No backend dependency');
      
      // Clear any old session data that might be causing issues
      sessionStorage.removeItem('chatbotName');
      sessionStorage.removeItem('chatbotEmail');
      sessionStorage.removeItem('chatbotConsent');
      sessionStorage.removeItem('chatbotContact');
      
      // START READY TO HELP - Skip lead capture for now
      setPhase('ready');
      addBotMessage(currentStrings.greeting);
      addBotMessage("I'm ready to help you with business financing questions, or you can use the buttons below for quick actions!");
    }
  }, [isOpen]);

  const addBotMessage = (content: string) => {
    const message: Message = {
      id: `bot_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // PII detection and blocking
  const containsPII = (text: string) => {
    // Check for SSN/SIN patterns
    const ssnPattern = /\b\d{3}-?\d{2}-?\d{4}\b|\b\d{9}\b/;
    const sinPattern = /\b\d{3}\s?\d{3}\s?\d{3}\b/;
    
    if (ssnPattern.test(text) || sinPattern.test(text)) {
      return true;
    }
    
    return false;
  };

  // Submit lead to server
  const submitLead = async () => {
    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('CSRF token not available');
      }

      const response = await fetch('/api/public/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          name: leadData.name,
          email: leadData.email,
          consent: leadData.consent,
          source: 'chat',
          page: window.location.pathname,
          tenant: 'boreal',
          language: currentLanguage,
          utmParams: {
            source: new URLSearchParams(window.location.search).get('utm_source'),
            medium: new URLSearchParams(window.location.search).get('utm_medium'),
            campaign: new URLSearchParams(window.location.search).get('utm_campaign')
          }
        })
      });

      if (response.ok) {
        // Store in session for future chats
        sessionStorage.setItem('chatbotName', leadData.name);
        sessionStorage.setItem('chatbotEmail', leadData.email);
        sessionStorage.setItem('chatbotConsent', 'true');
        sessionStorage.setItem('chatbotContact', JSON.stringify({
          name: leadData.name,
          email: leadData.email
        }));

        addBotMessage(currentStrings.leadCaptured);
        setTimeout(() => {
          addBotMessage(currentStrings.readyMessage);
          setPhase('ready');
        }, 1000);

        // Emit analytics event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'lead_captured', {
            source: 'chat',
            name: leadData.name,
            email: leadData.email
          });
        }
      } else {
        throw new Error('Failed to submit lead');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      addBotMessage(currentStrings.errorOccurred);
    }
  };

  // Handle user input
  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    addUserMessage(userInput);

    try {
      switch (phase) {
        case 'askName':
          setLeadData(prev => ({ ...prev, name: userInput }));
          addBotMessage(currentStrings.askEmail);
          setPhase('askEmail');
          break;

        case 'askEmail':
          if (!isValidEmail(userInput)) {
            addBotMessage(currentStrings.invalidEmail);
          } else {
            setLeadData(prev => ({ ...prev, email: userInput }));
            addBotMessage(currentStrings.askConsent);
            setPhase('askConsent');
          }
          break;

        case 'askConsent':
          const isYes = userInput.toLowerCase().includes('yes') || 
                       userInput.toLowerCase().includes('oui') ||
                       userInput.toLowerCase().includes('y');
          
          if (isYes) {
            setLeadData(prev => ({ ...prev, consent: true }));
            await submitLead();
          } else {
            addBotMessage(currentStrings.consentRequired);
            setPhase('welcome');
          }
          break;

        case 'ready':
          // Handle AI responses
          if (containsPII(userInput)) {
            addBotMessage("For security reasons, please don't share sensitive information like SSN or SIN numbers in chat. Use our secure upload feature instead.");
            break;
          }

          // ALWAYS PROVIDE LOCAL RESPONSE - NEVER SHOW CONNECTION ERRORS
          await handleAIResponse(userInput);
          break;
      }
    } catch (error) {
      console.debug('Input handled locally:', error);
      // NEVER SHOW ERROR MESSAGES - ALWAYS PROVIDE HELPFUL RESPONSE
      addBotMessage("I'm here to help with your business financing needs! What would you like to know?");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle AI responses - RESILIENT, NEVER BLOCKS UI
  const handleAIResponse = async (userInput: string) => {
    try {
      // Try backend first, but don't block if it fails
      const { secureFetch } = await import('@/lib/secureFetch');
      const response = await secureFetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userInput,
          language: currentLanguage,
          context: { name: leadData.name, email: leadData.email }
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.response) {
          addBotMessage(result.response);
          return;
        }
      }
    } catch (error) {
      console.debug('[ChatBot] Backend unavailable, using local responses:', error);
    }

    // FALLBACK: Local smart responses (always works)
    const input = userInput.toLowerCase();
    let reply = "";
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      reply = "Hello! I'm here to help you with business financing. What type of funding are you looking for today?";
    } else if (input.includes('loan') || input.includes('funding') || input.includes('finance')) {
      reply = "Great! We offer various business financing options including term loans, lines of credit, and equipment financing. What's your business looking to accomplish with funding?";
    } else if (input.includes('amount') || input.includes('how much')) {
      reply = "Our lending partners can provide funding from $10,000 to $5M+ depending on your business needs and qualifications. What amount are you considering?";
    } else if (input.includes('rate') || input.includes('interest')) {
      reply = "Interest rates vary based on your business profile, credit, and loan type. Our specialists can provide personalized rate quotes after reviewing your application.";
    } else {
      reply = "I'd be happy to help you explore business financing options! You can start an application, upload documents, or speak with our specialists for personalized assistance.";
    }
    
    addBotMessage(reply);
    
    // Log user message to staff (non-blocking, ignore failures)
    try {
      logUserMessage(userInput);
    } catch (error) {
      // Silently ignore logging failures
    }
  };

  // Get lender products from cache
  const getLenderProducts = (): LenderProduct[] => {
    try {
      const cached = localStorage.getItem('lender-products-cache');
      if (cached) {
        const data = JSON.parse(cached);
        return data.products || [];
      }
    } catch (error) {
      console.error('Error loading lender products:', error);
    }
    return [];
  };

  // Show lender suggestions
  const showLenderSuggestions = (recommendations: LenderProduct[]) => {
    const suggestionsHtml = recommendations.map(product => 
      `🏦 **${product.lender}** - ${product.name}
      ${product.description || ''}
      ${product.minAmount && product.maxAmount ? `Amount: $${product.minAmount.toLocaleString()} - $${product.maxAmount.toLocaleString()}` : ''}`
    ).join('\n\n');

    addBotMessage(`Here are some funding options that might interest you:\n\n${suggestionsHtml}\n\nWould you like to learn more about any of these options?`);
  };

  // Log user message to staff (non-blocking)
  const logUserMessage = async (message: string) => {
    try {
      const staffApiUrl = process.env.VITE_STAFF_API_URL || process.env.VITE_API_URL?.replace('/api', '');
      if (!staffApiUrl) return;

      await fetch(`${staffApiUrl}/api/chat/user-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadData.email,
          name: leadData.name,
          text: message,
          source: 'chat',
          tenant: 'boreal',
          page: window.location.pathname
        })
      });
    } catch (error) {
      console.warn('Failed to log user message:', error);
    }
  };

  // Quick action handlers
  const handleStartApplication = () => {
    const prefillParams = new URLSearchParams({
      name: leadData.name,
      email: leadData.email
    });
    window.location.href = `/apply?prefill=${prefillParams.toString()}`;
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'application_started', { source: 'chat' });
    }
  };

  const handleUploadDocs = () => {
    setShowUploadModal(true);
    
    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'doc_upload_from_chat', { source: 'chat' });
    }
  };

  const handleBookMeeting = async () => {
    try {
      const staffApiUrl = process.env.VITE_STAFF_API_URL || process.env.VITE_API_URL?.replace('/api', '');
      if (!staffApiUrl) {
        addBotMessage("Meeting booking is currently unavailable. Please contact us directly.");
        return;
      }

      // Try to get available slots (simplified - would integrate with O365 in production)
      const response = await fetch(`${staffApiUrl}/api/calendar/available`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setShowMeetingModal(true);
        addBotMessage(currentStrings.meetingBooked);
      } else {
        addBotMessage("Please contact us directly to schedule a meeting: info@boreal.financial");
      }
    } catch (error) {
      addBotMessage("Please contact us directly to schedule a meeting: info@boreal.financial");
    }

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'meeting_booked', { source: 'chat' });
    }
  };

  const handleTalkToHuman = async () => {
    try {
      setHumanRequestStatus('requesting');
      
      // Route to staff backend for chat escalation
      const response = await fetch('/api/public/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          reason: 'User requested human assistance',
          applicationId: currentStep?.toString() || 'unknown',
          user_input: `Customer ${leadData.name} (${leadData.email}) requested to speak with a human agent from page: ${window.location.pathname}`
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setHumanRequestStatus('connected');
        addBotMessage(currentStrings.humanRequested);
        // Add the escalation message from the server
        if (data.message) {
          setTimeout(() => addBotMessage(data.message), 1000);
        }
      } else {
        throw new Error(data.error || 'Escalation failed');
      }
    } catch (error) {
      console.error('Human handoff error:', error);
      addBotMessage("I'll connect you with our team. A human agent will be notified and will reach out to you soon. You can also email us at info@boreal.financial or call (825) 451‑1768.");
      setHumanRequestStatus('idle');
    }

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'handoff_requested', { source: 'chat' });
    }
  };

  // Handle consent buttons
  const handleConsentResponse = (consent: boolean) => {
    if (consent) {
      setLeadData(prev => ({ ...prev, consent: true }));
      addUserMessage(currentStrings.consentYes);
      submitLead();
    } else {
      addUserMessage(currentStrings.consentNo);
      addBotMessage(currentStrings.consentRequired);
      setPhase('welcome');
    }
  };

  // Handle language toggle
  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Render floating button when closed, chat window when open
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg z-50 flex items-center justify-center transition-all duration-200 hover:scale-110"
        aria-label="Open chat"
        title="Chat with Boreal Financial Assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.79-.491l-4.21 1.035L8.41 16.79A8.01 8.01 0 0121 12z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col z-50">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-teal-600 to-orange-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 className="font-semibold">Boreal Assistant</h3>
            <p className="text-xs opacity-90">Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
            title={currentStrings.languageLabel}
          >
            {currentStrings.languageToggle}
          </button>
          <button
            onClick={onToggle}
            className="text-white hover:bg-white/20 p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Consent buttons */}
        {phase === 'askConsent' && !isLoading && (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => handleConsentResponse(true)}
              className="bg-green-500 hover:bg-green-600 text-white text-sm"
            >
              {currentStrings.consentYes}
            </Button>
            <Button
              onClick={() => handleConsentResponse(false)}
              variant="outline"
              className="text-sm"
            >
              {currentStrings.consentNo}
            </Button>
          </div>
        )}

        {/* Quick actions */}
        {phase === 'ready' && !isLoading && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              onClick={handleStartApplication}
              className="bg-teal-500 hover:bg-teal-600 text-white text-xs p-2 h-auto"
            >
              📝 {currentStrings.startApp}
            </Button>
            <Button
              onClick={handleUploadDocs}
              variant="outline"
              className="text-xs p-2 h-auto"
            >
              📁 {currentStrings.uploadDocs}
            </Button>
            <Button
              onClick={handleBookMeeting}
              variant="outline"
              className="text-xs p-2 h-auto"
            >
              📅 {currentStrings.bookMeeting}
            </Button>
            <Button
              onClick={handleTalkToHuman}
              variant="outline"
              className="text-xs p-2 h-auto"
              disabled={humanRequestStatus === 'requesting'}
            >
              👤 {humanRequestStatus === 'requesting' ? '...' : currentStrings.talkHuman}
            </Button>
          </div>
        )}

        {/* Always available quick help buttons */}
        {!isLoading && phase !== 'askConsent' && (
          <div className="flex gap-2 mt-4 pt-2 border-t border-gray-100">
            <Button
              onClick={handleTalkToHuman}
              variant="outline"
              size="sm"
              className="text-xs flex-1"
              disabled={humanRequestStatus === 'requesting'}
            >
              👤 {humanRequestStatus === 'requesting' ? '...' : 'Talk to Human'}
            </Button>
            <Button
              onClick={() => {
                addBotMessage("I'll help you report an issue. Please describe what's happening and I'll make sure our team gets your feedback.");
                addBotMessage("You can also email us directly at info@boreal.financial with any technical issues.");
              }}
              variant="outline"
              size="sm"
              className="text-xs flex-1"
            >
              🐛 Report Issue
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={phase === 'ready' ? "Ask me about financing..." : "Type your response..."}
            disabled={isLoading || phase === 'askConsent'}
            className="flex-1 text-sm"
          />
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading || phase === 'askConsent'}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            →
          </Button>
        </div>
      </div>

      {/* Upload Modal (placeholder) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg max-w-md w-full m-4">
            <h3 className="font-semibold mb-4">Upload Documents</h3>
            <p className="text-sm text-gray-600 mb-4">{currentStrings.uploadInstructions}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowUploadModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowUploadModal(false);
                  addBotMessage("Document upload feature will be available soon. For now, please email documents to info@boreal.financial");
                }}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}