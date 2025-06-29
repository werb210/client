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
        // Ensure props are valid and safe for Toast component
        const validProps = {
          variant: props.variant || 'default',
          ...(props.duration && { duration: props.duration }),
          ...(props.open !== undefined && { open: props.open }),
          ...(props.onOpenChange && { onOpenChange: props.onOpenChange }),
        };
        
        return (
          <Toast key={id} {...validProps}>
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
