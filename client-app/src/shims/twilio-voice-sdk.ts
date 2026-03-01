export type CallEvent = "accept" | "disconnect" | "error";

export class Call {
  private listeners: Record<CallEvent, Array<() => void>> = {
    accept: [],
    disconnect: [],
    error: [],
  };

  on(event: CallEvent, handler: () => void) {
    this.listeners[event].push(handler);
  }

  accept() {
    this.listeners.accept.forEach((handler) => handler());
  }

  reject() {
    this.listeners.disconnect.forEach((handler) => handler());
  }

  disconnect() {
    this.listeners.disconnect.forEach((handler) => handler());
  }
}

export type DeviceEvent = "registered" | "error" | "incoming";

export class Device {
  private token: string;
  private listeners: {
    registered: Array<() => void>;
    error: Array<() => void>;
    incoming: Array<(call: Call) => void>;
  } = {
    registered: [],
    error: [],
    incoming: [],
  };

  constructor(token: string, _options?: { logLevel?: number }) {
    this.token = token;
  }

  on(event: "registered" | "error", handler: () => void): void;
  on(event: "incoming", handler: (call: Call) => void): void;
  on(event: DeviceEvent, handler: (() => void) | ((call: Call) => void)) {
    if (event === "incoming") {
      this.listeners.incoming.push(handler as (call: Call) => void);
      return;
    }

    this.listeners[event].push(handler as () => void);
  }

  async register() {
    if (!this.token) {
      throw new Error("Missing voice token");
    }

    this.listeners.registered.forEach((handler) => handler());
  }

  async connect(_options?: { params?: Record<string, string> }) {
    const call = new Call();
    queueMicrotask(() => {
      call.accept();
    });
    return call;
  }

  updateToken(token: string) {
    this.token = token;
  }

  destroy() {
    this.listeners = {
      registered: [],
      error: [],
      incoming: [],
    };
  }
}
