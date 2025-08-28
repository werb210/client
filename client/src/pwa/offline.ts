import { localApi } from '@/lib/http';

export async function enqueueForRetry(payload: any) {
  await localApi.post('/_pwa/queue', payload); // intercepted by SW, never leaves device
}

export async function triggerSync() {
  await localApi.post('/_pwa/sync'); // tells SW to drain queue now
}