import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function (toast) {
        if (!toast || !toast.id) return null;
        
        const { id, title, description, action, variant } = toast;
        
        return (
          <Toast key={id} variant={variant || 'default'}>
            <div className="grid gap-1">
              {title && <ToastTitle>{String(title)}</ToastTitle>}
              {description && (
                <ToastDescription>{String(description)}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
