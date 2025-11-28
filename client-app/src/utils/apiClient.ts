import axios from "axios";
import { useUIStore } from "@/state/uiStore";

export async function apiRequest<T>(fn: () => Promise<T>, loadingMessage = "Loading...") {
  const show = useUIStore.getState().showLoading;
  const hide = useUIStore.getState().hideLoading;

  try {
    show(loadingMessage);
    return await fn();
  } finally {
    hide();
  }
}
