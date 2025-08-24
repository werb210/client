import { get, set, del, keys } from 'idb-keyval';

export interface ApplicationDraft {
  id: string;
  name: string;
  lastModified: string;
  autoSaved: boolean;
  step: number;
  completionPercentage: number;
  formData: {
    businessInfo?: any;
    applicantInfo?: any;
    financialProfile?: any;
    documents?: any[];
    selectedLenders?: string[];
    [key: string]: any;
  };
  metadata: {
    userAgent: string;
    sessionId: string;
    ipAddress?: string;
    deviceInfo?: {
      isMobile: boolean;
      platform: string;
    };
  };
}

const DRAFTS_PREFIX = 'app_draft_';
const DRAFT_INDEX_KEY = 'app_drafts_index';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const MAX_DRAFTS = 10; // Maximum number of drafts to keep

class ApplicationDraftManager {
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private currentDraftId: string | null = null;

  async createDraft(name?: string): Promise<string> {
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const draft: ApplicationDraft = {
      id: draftId,
      name: name || `Draft ${new Date().toLocaleDateString()}`,
      lastModified: new Date().toISOString(),
      autoSaved: false,
      step: 1,
      completionPercentage: 0,
      formData: {},
      metadata: {
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
        deviceInfo: {
          isMobile: /Mobi|Android/i.test(navigator.userAgent),
          platform: navigator.platform
        }
      }
    };

    await this.saveDraft(draft);
    this.currentDraftId = draftId;
    
    console.log('✅ Application draft created:', draftId);
    return draftId;
  }

  async saveDraft(draft: ApplicationDraft): Promise<void> {
    draft.lastModified = new Date().toISOString();
    draft.completionPercentage = this.calculateCompletionPercentage(draft.formData);
    
    await set(`${DRAFTS_PREFIX}${draft.id}`, draft);
    await this.updateDraftIndex(draft.id);
    await this.cleanupOldDrafts();
  }

  async getDraft(draftId: string): Promise<ApplicationDraft | null> {
    try {
      const draft = await get(`${DRAFTS_PREFIX}${draftId}`);
      return draft || null;
    } catch (error) {
      console.error('❌ Error getting draft:', error);
      return null;
    }
  }

  async getAllDrafts(): Promise<ApplicationDraft[]> {
    try {
      const draftIndex = await get(DRAFT_INDEX_KEY) || [];
      const drafts = await Promise.all(
        draftIndex.map(async (draftId: string) => {
          return await this.getDraft(draftId);
        })
      );
      
      return drafts
        .filter(Boolean)
        .sort((a, b) => new Date(b!.lastModified).getTime() - new Date(a!.lastModified).getTime()) as ApplicationDraft[];
    } catch (error) {
      console.error('❌ Error getting all drafts:', error);
      return [];
    }
  }

  async deleteDraft(draftId: string): Promise<boolean> {
    try {
      await del(`${DRAFTS_PREFIX}${draftId}`);
      await this.removeFromDraftIndex(draftId);
      
      if (this.currentDraftId === draftId) {
        this.currentDraftId = null;
        this.stopAutoSave();
      }
      
      console.log('✅ Draft deleted:', draftId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting draft:', error);
      return false;
    }
  }

  async updateDraft(draftId: string, formData: any, step?: number): Promise<boolean> {
    try {
      const existing = await this.getDraft(draftId);
      if (!existing) return false;

      const updated: ApplicationDraft = {
        ...existing,
        formData: { ...existing.formData, ...formData },
        step: step || existing.step,
        autoSaved: true,
        lastModified: new Date().toISOString()
      };

      await this.saveDraft(updated);
      return true;
    } catch (error) {
      console.error('❌ Error updating draft:', error);
      return false;
    }
  }

  startAutoSave(draftId: string, getFormDataCallback: () => any, stepCallback?: () => number): void {
    this.currentDraftId = draftId;
    this.stopAutoSave(); // Clear any existing timer
    
    this.autoSaveTimer = setInterval(async () => {
      try {
        const formData = getFormDataCallback();
        const currentStep = stepCallback ? stepCallback() : 1;
        
        await this.updateDraft(draftId, formData, currentStep);
        console.log(`💾 Auto-saved draft ${draftId} at step ${currentStep}`);
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, AUTO_SAVE_INTERVAL);

    console.log(`🔄 Auto-save started for draft ${draftId}`);
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('⏹️ Auto-save stopped');
    }
  }

  async recoverFromCrash(): Promise<ApplicationDraft[]> {
    const drafts = await this.getAllDrafts();
    const recentDrafts = drafts.filter(draft => {
      const lastModified = new Date(draft.lastModified);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastModified > oneDayAgo && draft.autoSaved;
    });

    console.log(`🔧 Found ${recentDrafts.length} recoverable drafts from last 24 hours`);
    return recentDrafts;
  }

  async renameDraft(draftId: string, newName: string): Promise<boolean> {
    try {
      const draft = await this.getDraft(draftId);
      if (!draft) return false;

      const updated = { ...draft, name: newName };
      await this.saveDraft(updated);
      return true;
    } catch (error) {
      console.error('❌ Error renaming draft:', error);
      return false;
    }
  }

  async duplicateDraft(draftId: string, newName?: string): Promise<string | null> {
    try {
      const original = await this.getDraft(draftId);
      if (!original) return null;

      const newDraftId = await this.createDraft(newName || `${original.name} (Copy)`);
      const newDraft = await this.getDraft(newDraftId);
      
      if (newDraft) {
        newDraft.formData = { ...original.formData };
        newDraft.step = original.step;
        await this.saveDraft(newDraft);
      }

      return newDraftId;
    } catch (error) {
      console.error('❌ Error duplicating draft:', error);
      return null;
    }
  }

  private calculateCompletionPercentage(formData: any): number {
    const sections = ['businessInfo', 'applicantInfo', 'financialProfile', 'documents'];
    let completed = 0;
    let total = sections.length;

    sections.forEach(section => {
      if (formData[section] && Object.keys(formData[section]).length > 0) {
        completed++;
      }
    });

    return Math.round((completed / total) * 100);
  }

  private async updateDraftIndex(draftId: string): Promise<void> {
    const index = await get(DRAFT_INDEX_KEY) || [];
    if (!index.includes(draftId)) {
      index.push(draftId);
      await set(DRAFT_INDEX_KEY, index);
    }
  }

  private async removeFromDraftIndex(draftId: string): Promise<void> {
    const index = await get(DRAFT_INDEX_KEY) || [];
    const updatedIndex = index.filter((id: string) => id !== draftId);
    await set(DRAFT_INDEX_KEY, updatedIndex);
  }

  private async cleanupOldDrafts(): Promise<void> {
    const drafts = await this.getAllDrafts();
    
    if (drafts.length > MAX_DRAFTS) {
      const draftsToDelete = drafts.slice(MAX_DRAFTS);
      
      for (const draft of draftsToDelete) {
        await this.deleteDraft(draft.id);
      }
      
      console.log(`🧹 Cleaned up ${draftsToDelete.length} old drafts`);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('application_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('application_session_id', sessionId);
    }
    return sessionId;
  }

  async exportDrafts(): Promise<ApplicationDraft[]> {
    return await this.getAllDrafts();
  }

  async importDrafts(drafts: ApplicationDraft[]): Promise<number> {
    let imported = 0;
    for (const draft of drafts) {
      try {
        // Generate new ID to avoid conflicts
        const newDraft = {
          ...draft,
          id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: draft.name + ' (Imported)',
          lastModified: new Date().toISOString()
        };
        
        await this.saveDraft(newDraft);
        imported++;
      } catch (error) {
        console.error('❌ Failed to import draft:', draft.name, error);
      }
    }
    console.log(`✅ Imported ${imported}/${drafts.length} drafts`);
    return imported;
  }

  getCurrentDraftId(): string | null {
    return this.currentDraftId;
  }

  async clearAllDrafts(): Promise<void> {
    const index = await get(DRAFT_INDEX_KEY) || [];
    await Promise.all(index.map((draftId: string) => 
      del(`${DRAFTS_PREFIX}${draftId}`)
    ));
    await del(DRAFT_INDEX_KEY);
    this.stopAutoSave();
    this.currentDraftId = null;
    console.log('✅ All drafts cleared');
  }
}

export const draftManager = new ApplicationDraftManager();