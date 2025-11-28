import type { PropsWithChildren, ReactNode } from "react";

interface PageContainerProps extends PropsWithChildren {
  title?: string;
  description?: ReactNode;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-lg">
        {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
        {description && <p className="text-base text-gray-600 mb-4">{description}</p>}
        {children}
      </div>
    </div>
  );
}
