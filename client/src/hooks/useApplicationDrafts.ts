import { useState, useEffect, useCallback, useRef } from 'react';
import { draftManager, type ApplicationDraft } from '@/lib/applicationDrafts';
import { useToast } from '@/hooks/use-toast';

interface UseApplicationDraftsOptions {
  autoSaveInterval?: number;
  enableAutoSave?: boolean;
}

export function useApplicationDrafts(options: UseApplicationDraftsOptions = {}) {
  const {
    autoSaveInterval = 30000, // 30 seconds
    enableAutoSave = true
  } = options;

  const [drafts, setDrafts] = useState<ApplicationDraft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<ApplicationDraft | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formDataRef = useRef<any>({});
  const currentStepRef = useRef<number>(1);

  // Load all drafts
  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const allDrafts = await draftManager.getAllDrafts();
      setDrafts(allDrafts);
    } catch (error) {
      console.error('Failed to load drafts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load drafts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create new draft
  const createDraft = useCallback(async (name?: string) => {
    try {
      const draftId = await draftManager.createDraft(name);
      const draft = await draftManager.getDraft(draftId);
      
      if (draft) {
        setCurrentDraft(draft);
        
        if (enableAutoSave) {
          draftManager.startAutoSave(
            draftId,
            () => formDataRef.current,
            () => currentStepRef.current
          );
        }
      }
      
      await loadDrafts();
      return draftId;
    } catch (error) {
      console.error('Failed to create draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to create draft',
        variant: 'destructive'
      });
      return null;
    }
  }, [enableAutoSave, loadDrafts, toast]);

  // Load specific draft
  const loadDraft = useCallback(async (draftId: string) => {
    try {
      const draft = await draftManager.getDraft(draftId);
      if (draft) {
        setCurrentDraft(draft);
        formDataRef.current = draft.formData;
        currentStepRef.current = draft.step;
        
        if (enableAutoSave) {
          draftManager.startAutoSave(
            draftId,
            () => formDataRef.current,
            () => currentStepRef.current
          );
        }
        
        return draft;
      }
      return null;
    } catch (error) {
      console.error('Failed to load draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to load draft',
        variant: 'destructive'
      });
      return null;
    }
  }, [enableAutoSave, toast]);

  // Save current draft manually
  const saveDraft = useCallback(async (formData?: any, step?: number) => {
    if (!currentDraft) return false;
    
    setIsAutoSaving(true);
    try {
      const dataToSave = formData || formDataRef.current;
      const stepToSave = step || currentStepRef.current;
      
      await draftManager.updateDraft(currentDraft.id, dataToSave, stepToSave);
      
      // Update local state
      const updatedDraft = await draftManager.getDraft(currentDraft.id);
      if (updatedDraft) {
        setCurrentDraft(updatedDraft);
      }
      
      await loadDrafts();
      return true;
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsAutoSaving(false);
    }
  }, [currentDraft, loadDrafts, toast]);

  // Delete draft
  const deleteDraft = useCallback(async (draftId: string) => {
    try {
      await draftManager.deleteDraft(draftId);
      
      if (currentDraft?.id === draftId) {
        setCurrentDraft(null);
        draftManager.stopAutoSave();
      }
      
      await loadDrafts();
      return true;
    } catch (error) {
      console.error('Failed to delete draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete draft',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentDraft, loadDrafts, toast]);

  // Update form data reference for auto-save
  const updateFormData = useCallback((formData: any) => {
    formDataRef.current = formData;
  }, []);

  // Update current step reference
  const updateCurrentStep = useCallback((step: number) => {
    currentStepRef.current = step;
  }, []);

  // Check for crash recovery
  const checkCrashRecovery = useCallback(async () => {
    try {
      const recoveryDrafts = await draftManager.recoverFromCrash();
      return recoveryDrafts;
    } catch (error) {
      console.error('Failed to check crash recovery:', error);
      return [];
    }
  }, []);

  // Stop auto-save (useful for cleanup)
  const stopAutoSave = useCallback(() => {
    draftManager.stopAutoSave();
  }, []);

  // Start auto-save manually
  const startAutoSave = useCallback(() => {
    if (currentDraft && enableAutoSave) {
      draftManager.startAutoSave(
        currentDraft.id,
        () => formDataRef.current,
        () => currentStepRef.current
      );
    }
  }, [currentDraft, enableAutoSave]);

  // Duplicate draft
  const duplicateDraft = useCallback(async (draftId: string, newName?: string) => {
    try {
      const newDraftId = await draftManager.duplicateDraft(draftId, newName);
      await loadDrafts();
      return newDraftId;
    } catch (error) {
      console.error('Failed to duplicate draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate draft',
        variant: 'destructive'
      });
      return null;
    }
  }, [loadDrafts, toast]);

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  // Cleanup auto-save on unmount
  useEffect(() => {
    return () => {
      draftManager.stopAutoSave();
    };
  }, []);

  return {
    // State
    drafts,
    currentDraft,
    isAutoSaving,
    loading,
    
    // Actions
    createDraft,
    loadDraft,
    saveDraft,
    deleteDraft,
    duplicateDraft,
    updateFormData,
    updateCurrentStep,
    loadDrafts,
    checkCrashRecovery,
    
    // Auto-save control
    startAutoSave,
    stopAutoSave,
    
    // Utilities
    getCurrentDraftId: () => currentDraft?.id || null,
    getFormData: () => formDataRef.current,
    getCurrentStep: () => currentStepRef.current
  };
}