import { useState, useEffect, useCallback } from 'react';

interface UseAutoSaveOptions {
  key: string;
  data: any;
  interval?: number;
  delay?: number;
  maxAge?: number; // in hours
  securitySteps?: number[]; // steps that should never be auto-restored
}

export function useAutoSave({ 
  key, 
  data, 
  interval = 30000, // 30 seconds
  delay = 2000, // 2 seconds
  maxAge = 72, // 72 hours
  securitySteps = [5, 6] // signature and submission steps
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<string>("");

  const saveData = useCallback(() => {
    try {
      setStatus('saving');
      const saveData = {
        ...data,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(saveData));
      setStatus('saved');
      setLastSaveTime(new Date().toLocaleTimeString());
      console.log('💾 Auto-saved form data:', { step: data.currentStep || 0, timestamp: saveData.lastSaved });
    } catch (error) {
      setStatus('error');
      console.error('Auto save failed:', error);
    }
  }, [key, data]);

  const loadData = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const { lastSaved, currentStep, ...formValues } = parsed;
      
      // Check if data is within max age
      const saveTime = new Date(lastSaved);
      const now = new Date();
      const hoursDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < maxAge) {
        // Security check: don't restore to sensitive steps
        if (currentStep !== undefined && securitySteps.includes(currentStep)) {
          console.log('🔒 SECURITY: Blocked auto-save restoration to sensitive step', currentStep);
          // Return data but reset to safe step
          return {
            ...formValues,
            currentStep: Math.max(0, currentStep - 1),
            restoredFromSecureStep: true
          };
        }
        
        return { ...formValues, currentStep, restoredFromAutoSave: true };
      } else {
        localStorage.removeItem(key);
        return null;
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      localStorage.removeItem(key);
      return null;
    }
  }, [key, maxAge, securitySteps]);

  const clearData = useCallback(() => {
    localStorage.removeItem(key);
    setStatus(null);
    setLastSaveTime("");
    console.log('🗑️ Cleared auto-save data');
  }, [key]);

  // Auto save on interval - wrapped for error safety
  useEffect(() => {
    const safeInterval = () => {
      try {
        saveData();
      } catch (error) {
        // Silently ignore autosave errors
      }
    };
    
    const intervalId = setInterval(safeInterval, interval);
    return () => clearInterval(intervalId);
  }, [saveData, interval]);

  // Auto save after delay when data changes - wrapped for error safety
  useEffect(() => {
    const safeTimeout = () => {
      try {
        saveData();
      } catch (error) {
        // Silently ignore autosave errors
      }
    };
    
    const timeoutId = setTimeout(safeTimeout, delay);
    return () => clearTimeout(timeoutId);
  }, [saveData, delay]);

  return {
    status,
    lastSaveTime,
    saveData,
    loadData,
    clearData
  };
}