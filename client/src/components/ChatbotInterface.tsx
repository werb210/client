import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChatbot } from '@/hooks/useChatbot';
import { MessageCircle, Send, AlertTriangle, User, Bot, Loader2 } from 'lucide-react';

interface ChatbotInterfaceProps {
  applicationId?: string;
  userId?: string;
  context?: any;
  className?: string;
  minimized?: boolean;
  onToggle?: () => void;
}

export function ChatbotInterface({
  applicationId,
  userId,
  context,
  className = '',
  minimized = false,
  onToggle
}: ChatbotInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    isTyping,
    isSending,
    escalated,
    sendMessage,
    escalateToHuman,
    updateContext,
    messagesEndRef,
    error
  } = useChatbot({ applicationId, userId, context });

  // Update context when props change
  useEffect(() => {
    if (context) {
      updateContext(context);
    }
  }, [context, updateContext]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isSending || isTyping) return;
    
    sendMessage(inputMessage.trim());
    setInputMessage('');
    
    // Focus input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (minimized) {
    return (
      <Button
        onClick={onToggle}
        className={`fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 ${className}`}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className={`w-full max-w-md h-[500px] flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-teal-600" />
            Boreal Assistant
            {escalated && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Escalated
              </Badge>
            )}
          </CardTitle>
          {onToggle && (
            <Button variant="ghost" size="sm" onClick={onToggle}>
              ×
            </Button>
          )}
        </div>
        {context?.currentStep && (
          <p className="text-sm text-muted-foreground">
            Step {context.currentStep} • Application Support
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              Chat service temporarily unavailable. Please try again later.
            </p>
          </div>
        )}

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Starting chat session...
                </span>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role !== 'user' && (
                    <div className="flex-shrink-0">
                      {message.role === 'assistant' ? (
                        <Bot className="w-6 h-6 text-teal-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-teal-600 text-white'
                        : message.role === 'system'
                        ? 'bg-orange-50 text-orange-800 border border-orange-200'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-teal-100'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-teal-600" />
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="mt-4 space-y-3">
          {!escalated && messages.length > 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => escalateToHuman('User requested human assistance')}
              className="w-full text-xs"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Talk to Human Agent
            </Button>
          )}

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={escalated ? "Agent will respond soon..." : "Ask me anything..."}
              disabled={isSending || isTyping || isLoading || !!error}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending || isTyping || isLoading || !!error}
              size="sm"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}