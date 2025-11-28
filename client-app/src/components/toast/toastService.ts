import type { ToastContextValue } from "./ToastProvider";

let toastApi: ToastContextValue | null = null;

export function registerToastApi(api: ToastContextValue | null) {
  toastApi = api;
}

export function toastSuccess(message: string) {
  toastApi?.showSuccess(message);
}

export function toastError(message: string) {
  toastApi?.showError(message);
}

export function toastInfo(message: string) {
  toastApi?.showInfo(message);
}

export function toastWarning(message: string) {
  toastApi?.showWarning(message);
}
