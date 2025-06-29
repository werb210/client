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
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Filter out undefined props to prevent Toast component errors
        const safeProps = Object.fromEntries(
          Object.entries(props).filter(([_, value]) => value !== undefined)
        );
        
        return (
          <Toast key={id} {...safeProps}>
            <div className="grid gap-1">
              {title && typeof title === 'string' && <ToastTitle>{title}</ToastTitle>}
              {description && typeof description === 'string' && (
                <ToastDescription>{description}</ToastDescription>
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
