import api from "@/api/client";

const DB_NAME = "bf-upload-queue";
const STORE_NAME = "uploads";
const MAX_QUEUE_SIZE = 20;

export type QueuedUpload = {
  id?: number;
  url: string;
  formData: FormData;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function requestAsPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueUpload(data: QueuedUpload) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const queue = await requestAsPromise(store.getAll());

  if (queue.length >= MAX_QUEUE_SIZE) {
    const oldest = queue[0];
    if (oldest?.id !== undefined) {
      store.delete(oldest.id);
    }
  }

  store.add(data);
  await txDone(tx);
}

export async function processQueue() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const all = await requestAsPromise(store.getAll());

  for (const item of all) {
    try {
      const response = await api.post(item.url, item.formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status >= 200 && response.status < 300) {
        store.delete(item.id);
      }
    } catch {
      // Keep item in the queue for retry.
    }
  }

  await txDone(tx);
}
