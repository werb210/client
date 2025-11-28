import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { registerToastApi } from "./toastService";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface ToastContextValue {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  showInfo: (msg: string) => void;
  showWarning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: ToastType, msg: string) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, message: msg };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showSuccess = useCallback((m: string) => push("success", m), [push]);
  const showError = useCallback((m: string) => push("error", m), [push]);
  const showInfo = useCallback((m: string) => push("info", m), [push]);
  const showWarning = useCallback((m: string) => push("warning", m), [push]);

  useEffect(() => {
    registerToastApi({ showSuccess, showError, showInfo, showWarning });
    return () => registerToastApi(null);
  }, [showError, showInfo, showSuccess, showWarning]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}

      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const icons: Record<ToastType, JSX.Element> = {
    success: <CheckCircleIcon className="w-6 h-6 text-emerald-600" />,
    error: <ExclamationCircleIcon className="w-6 h-6 text-red-600" />,
    info: <InformationCircleIcon className="w-6 h-6 text-blue-600" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />,
  };

  const bg: Record<ToastType, string> = {
    success: "bg-emerald-50 border-emerald-300",
    error: "bg-red-50 border-red-300",
    info: "bg-blue-50 border-blue-300",
    warning: "bg-yellow-50 border-yellow-300",
  };

  return (
    <Transition
      appear
      show={true}
      enter="transition transform duration-200"
      enterFrom="opacity-0 translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transition transform duration-200"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-2"
    >
      <div className={`border rounded-xl px-4 py-3 shadow-md flex items-center gap-3 w-80 ${bg[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-sm text-slate-800">{toast.message}</p>
      </div>
    </Transition>
  );
}
