import { useEffect, useState } from "react";

type NetworkStatusSubscriber = (isOffline: boolean) => void;

const subscribers = new Set<NetworkStatusSubscriber>();
let isListening = false;

function notifySubscribers(isOffline: boolean) {
  subscribers.forEach((subscriber) => subscriber(isOffline));
}

function handleOnline() {
  notifySubscribers(false);
}

function handleOffline() {
  notifySubscribers(true);
}

export function getInitialOfflineState() {
  if (typeof navigator === "undefined") return false;
  return !navigator.onLine;
}

export function subscribeToNetworkStatus(onChange: NetworkStatusSubscriber) {
  if (typeof window === "undefined") return () => {};

  subscribers.add(onChange);
  if (!isListening) {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    isListening = true;
  }

  return () => {
    subscribers.delete(onChange);
    if (subscribers.size === 0 && isListening) {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      isListening = false;
    }
  };
}

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(getInitialOfflineState());

  useEffect(() => subscribeToNetworkStatus(setIsOffline), []);

  return { isOffline };
}
