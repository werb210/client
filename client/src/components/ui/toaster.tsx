import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex max-h-screen w-full flex-col gap-2 md:max-w-[420px]">
      {toasts.filter(Boolean).map((toast) => {
        if (!toast?.id) return null;
        
        const isDestructive = toast.variant === 'destructive';
        const baseClasses = "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all";
        const variantClasses = isDestructive 
          ? "border-red-500 bg-red-50 text-red-900" 
          : "border-gray-200 bg-white text-gray-900";
        
        return (
          <div
            key={toast.id}
            className={`${baseClasses} ${variantClasses}`}
          >
            <div className="grid gap-1 flex-1">
              {toast.title && (
                <div className="text-sm font-semibold">
                  {String(toast.title)}
                </div>
              )}
              {toast.description && (
                <div className="text-sm opacity-90">
                  {String(toast.description)}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
