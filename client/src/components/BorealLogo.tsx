import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BorealLogoProps {
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "full" | "icon" | "text";
  className?: string;
}

export function BorealLogo({ 
  size = "default", 
  variant = "full", 
  className 
}: BorealLogoProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    default: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    default: "text-2xl",
    lg: "text-3xl", 
    xl: "text-4xl"
  };

  if (variant === "icon") {
    return (
      <Building2 
        className={cn(
          sizeClasses[size], 
          "text-blue-600", 
          className
        )} 
      />
    );
  }

  if (variant === "text") {
    return (
      <span 
        className={cn(
          textSizeClasses[size], 
          "font-bold text-gray-900",
          className
        )}
      >
        Boreal Financial
      </span>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Building2 className={cn(sizeClasses[size], "text-blue-600")} />
      <span className={cn(textSizeClasses[size], "font-bold text-gray-900")}>
        Boreal Financial
      </span>
    </div>
  );
}