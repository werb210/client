import React, { useState, useEffect } from 'react';
import { X, Share, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface PWAPromptProps {
  onClose?: () => void;
}

export function PwaPrompt({ onClose }: PWAPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(checkIOS);

    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone;
    setIsInStandaloneMode(isStandalone);

    // Don't show if already installed
    if (isStandalone) {
      return;
    }

    // Track visits for iOS Safari
    if (checkIOS) {
      const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0') + 1;
      localStorage.setItem('pwa-visit-count', visitCount.toString());
      
      // Show prompt after 2 visits, but not more than once per session
      const hasShownThisSession = sessionStorage.getItem('pwa-prompt-shown') === 'true';
      
      if (visitCount >= 2 && !hasShownThisSession) {
        // Delay to ensure page is loaded
        setTimeout(() => {
          setIsVisible(true);
          sessionStorage.setItem('pwa-prompt-shown', 'true');
        }, 3000);
      }
    } else {
      // For other browsers, listen for beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setIsVisible(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    onClose?.();
  };

  const handleInstall = () => {
    if (!isIOS) {
      // For Chrome/Edge browsers
      const deferredPrompt = (window as any).deferredPrompt;
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
          (window as any).deferredPrompt = null;
          handleClose();
        });
      }
    }
    // For iOS, the instructions are shown automatically
  };

  if (!isVisible || isInStandaloneMode) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl animate-slide-up">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Install App</h3>
                <p className="text-sm text-gray-600">Get the full experience</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isIOS ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                Install Boreal Financial for faster access and a better experience:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <Share className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">Step 1:</span>
                </div>
                <p className="text-sm text-gray-700 ml-11">
                  Tap the <strong>Share</strong> button at the bottom of your screen
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                  <span className="font-medium">Step 2:</span>
                </div>
                <p className="text-sm text-gray-700 ml-11">
                  Select <strong>"Add to Home Screen"</strong> from the menu
                </p>
              </div>
              <Button onClick={handleClose} className="w-full bg-teal-600 hover:bg-teal-700">
                Got it!
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                Install Boreal Financial to your home screen for quick access and offline capabilities.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} className="flex-1 bg-teal-600 hover:bg-teal-700">
                  Install App
                </Button>
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  Not Now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// CSS for slide-up animation (add to global CSS)
const styles = `
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;
// injected: local-first products fetch
import { getProducts, loadSelectedCategories } from "../api/products";
/* injected load on mount (pseudo):
useEffect(() => { (async () => {
  const cats = loadSelectedCategories();
  const products = await getProducts({ useCacheFirst: true });
  // apply category filter if present
  const selected = cats && cats.length ? products.filter(p => cats.includes((p.category||"").toLowerCase())) : products;
  setState({ products: selected });
})(); }, []);
*/
