import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  escalated: boolean;
  context?: any;
}

interface UseChatbotOptions {
  applicationId?: string;
  userId?: string;
  context?: any;
}

export function useChatbot(options: UseChatbotOptions = {}) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start chat session
  const startChatMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: options.userId,
          applicationId: options.applicationId,
          context: options.context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start chat session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSession({
        sessionId: data.sessionId,
        messages: [{
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }],
        escalated: false,
        context: options.context
      });
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!session) throw new Error('No active chat session');

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          message,
          context: options.context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return response.json();
    },
    onMutate: (message: string) => {
      if (!session) return;

      // Optimistically add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage]
      } : null);

      setIsTyping(true);
    },
    onSuccess: (data) => {
      if (!session) return;

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage],
        escalated: data.escalated || prev.escalated
      } : null);

      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  // Escalate to human
  const escalateMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!session) throw new Error('No active chat session');

      const response = await fetch('/api/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to escalate chat');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (!session) return;

      // Add system message about escalation
      const systemMessage: ChatMessage = {
        role: 'system',
        content: 'This conversation has been escalated to a human agent. You should receive a response shortly.',
        timestamp: new Date()
      };

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, systemMessage],
        escalated: true
      } : null);
    }
  });

  // Get chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['chat-history', session?.sessionId],
    queryFn: async () => {
      if (!session) return null;

      const response = await fetch(`/api/chat/history/${session.sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to get chat history');
      }

      return response.json();
    },
    enabled: !!session?.sessionId
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.messages]);

  // Start session automatically if not started
  useEffect(() => {
    if (!session && !startChatMutation.isPending) {
      startChatMutation.mutate();
    }
  }, [session, startChatMutation]);

  const sendMessage = useCallback((message: string) => {
    if (!session || sendMessageMutation.isPending || isTyping) return;
    sendMessageMutation.mutate(message);
  }, [session, sendMessageMutation, isTyping]);

  const escalateToHuman = useCallback((reason: string) => {
    if (!session || escalateMutation.isPending) return;
    escalateMutation.mutate(reason);
  }, [session, escalateMutation]);

  const updateContext = useCallback((newContext: any) => {
    setSession(prev => prev ? {
      ...prev,
      context: { ...prev.context, ...newContext }
    } : null);
  }, []);

  return {
    session,
    messages: session?.messages || [],
    isLoading: startChatMutation.isPending,
    isTyping,
    isSending: sendMessageMutation.isPending,
    isEscalating: escalateMutation.isPending,
    escalated: session?.escalated || false,
    sendMessage,
    escalateToHuman,
    updateContext,
    messagesEndRef,
    error: startChatMutation.error || sendMessageMutation.error || escalateMutation.error
  };
}