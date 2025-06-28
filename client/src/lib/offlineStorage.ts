interface ApplicationData {
  id?: number;
  currentStep: number;
  formData: Record<string, any>;
  documents: File[];
  lastSaved: number;
}

interface OfflineDocument {
  id: string;
  file: File;
  applicationId: number;
  uploaded: boolean;
}

class OfflineStorage {
  private dbName = 'FinancialAppDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Application data store
        if (!db.objectStoreNames.contains('applications')) {
          const appStore = db.createObjectStore('applications', { keyPath: 'id', autoIncrement: true });
          appStore.createIndex('lastSaved', 'lastSaved', { unique: false });
        }

        // Document store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('applicationId', 'applicationId', { unique: false });
          docStore.createIndex('uploaded', 'uploaded', { unique: false });
        }
      };
    });
  }

  async saveApplication(data: ApplicationData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readwrite');
      const store = transaction.objectStore('applications');
      
      const applicationData = {
        ...data,
        lastSaved: Date.now(),
      };

      const request = store.put(applicationData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getApplication(id?: number): Promise<ApplicationData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readonly');
      const store = transaction.objectStore('applications');
      
      let request: IDBRequest;
      if (id) {
        request = store.get(id);
      } else {
        // Get the most recent application
        const index = store.index('lastSaved');
        request = index.openCursor(null, 'prev');
      }

      request.onsuccess = () => {
        if (id) {
          resolve(request.result || null);
        } else {
          const cursor = request.result;
          resolve(cursor ? cursor.value : null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveDocument(applicationId: number, file: File): Promise<string> {
    if (!this.db) await this.init();

    const documentId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      
      const documentData: OfflineDocument = {
        id: documentId,
        file,
        applicationId,
        uploaded: false,
      };

      const request = store.put(documentData);
      request.onsuccess = () => resolve(documentId);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingDocuments(): Promise<OfflineDocument[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const index = store.index('uploaded');
      
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markDocumentUploaded(documentId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      
      const getRequest = store.get(documentId);
      getRequest.onsuccess = () => {
        const document = getRequest.result;
        if (document) {
          document.uploaded = true;
          const putRequest = store.put(document);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clearApplication(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications', 'documents'], 'readwrite');
      
      // Clear application
      const appStore = transaction.objectStore('applications');
      const appRequest = appStore.delete(id);
      
      // Clear related documents
      const docStore = transaction.objectStore('documents');
      const docIndex = docStore.index('applicationId');
      const docRequest = docIndex.openCursor(IDBKeyRange.only(id));
      
      docRequest.onsuccess = () => {
        const cursor = docRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async syncWithStaffBackend(): Promise<void> {
    await this.init();
    
    // Get pending documents for upload to staff backend
    const pendingDocuments = await this.getPendingDocuments();
    
    for (const doc of pendingDocuments) {
      try {
        // Upload to staff backend using actual file
        const api = await import('./api');
        const result = await api.uploadDocument(doc.file, 'general', doc.applicationId.toString());
        
        // Mark as uploaded in local storage
        await this.markDocumentUploaded(doc.id);
        
        console.log(`Document ${doc.id} synced to staff backend:`, result);
      } catch (error) {
        console.error(`Failed to sync document ${doc.id}:`, error);
        // Keep in queue for retry
      }
    }
  }

  async syncApplicationData(applicationData: any): Promise<void> {
    try {
      const api = await import('./api');
      await api.submitApplication(applicationData);
      console.log('Application data synced to staff backend');
    } catch (error) {
      console.error('Failed to sync application data:', error);
      throw error;
    }
  }
}

export const offlineStorage = new OfflineStorage();
