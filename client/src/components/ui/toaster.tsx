import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 md:max-w-[420px]">
      {toasts.map((toast) => {
        if (!toast || !toast.id) return null;
        
        const { id, title, description, variant } = toast;
        
        return (
          <div
            key={id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
              variant === 'destructive' 
                ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-50" 
                : "border-gray-200 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
          >
            <div className="grid gap-1 flex-1">
              {title && (
                <div className="text-sm font-semibold">
                  {String(title)}
                </div>
              )}
              {description && (
                <div className="text-sm opacity-90">
                  {String(description)}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(id)}
              className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
