export type CallEvent = "disconnect";

export class Call {
  private listeners: Record<CallEvent, Array<() => void>> = {
    disconnect: [],
  };

  on(event: CallEvent, handler: () => void) {
    this.listeners[event].push(handler);
  }

  disconnect() {
    this.listeners.disconnect.forEach((handler) => handler());
  }
}

export class Device {
  private token: string;

  constructor(token: string, _options?: { logLevel?: number }) {
    this.token = token;
  }

  async register() {
    if (!this.token) {
      throw new Error("Missing voice token");
    }
  }

  async connect(_options?: { params?: Record<string, string> }) {
    return new Call();
  }
}
