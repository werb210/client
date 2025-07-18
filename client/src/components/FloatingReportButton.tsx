import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FloatingReportButtonProps {
  className?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captureFullPage = async (): Promise<Blob | null> => {
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      // Scroll to top for full page capture
      window.scrollTo(0, 0);
      
      const canvas = await html2canvas(document.body, { 
        scrollY: -window.scrollY,
        useCORS: true,
        allowTaint: true,
        scale: 0.5
      });
      
      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.8);
      });
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    }
  };

  const getConversationContext = (): string => {
    // Try to get chat conversation if available
    const chatElement = document.querySelector('[data-chat-messages]');
    if (chatElement) {
      return chatElement.textContent || '';
    }
    
    // Fallback: capture current page context
    const currentStep = window.location.pathname;
    const formData = Array.from(document.querySelectorAll('input, select, textarea'))
      .map(el => {
        const input = el as HTMLInputElement;
        if (input.type === 'password') return '';
        return `${input.name || input.id}: ${input.value}`;
      })
      .filter(Boolean)
      .join('\n');
    
    return `Current Page: ${currentStep}\nForm Data:\n${formData}`;
  };

  const submitReport = async () => {
    if (!reportText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const screenshot = await captureFullPage();
      const conversation = getConversationContext();
      
      const formData = new FormData();
      formData.append('text', reportText);
      formData.append('conversation', conversation);
      formData.append('timestamp', new Date().toISOString());
      formData.append('userAgent', navigator.userAgent);
      formData.append('url', window.location.href);
      
      if (screenshot) {
        formData.append('screenshot', screenshot, 'screenshot.png');
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Issue submitted with screenshot!');
        setReportText('');
        onClose();
      } else {
        alert('Failed to submit report. Please try again.');
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
    <div className="fixed inset-0 bg-black/50 z-[1002] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Report an Issue
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
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
            A screenshot and page context will be included automatically.
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
              {isSubmitting ? 'Capturing & Sending...' : 'Submit Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FloatingReportButton({ className = '' }: FloatingReportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        id="reportBtn"
        title="Report an issue"
        onClick={() => setShowModal(true)}
        className={`fixed bottom-24 right-5 bg-red-700 text-white text-3xl border-none rounded-full w-15 h-15 shadow-lg cursor-pointer z-[1001] hover:bg-red-800 transition-colors ${className}`}
        style={{
          width: '60px',
          height: '60px',
          fontSize: '28px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
      >
        🐞
      </button>
      
      <ReportModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}