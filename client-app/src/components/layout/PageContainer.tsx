import type { PropsWithChildren, ReactNode } from "react";

interface PageContainerProps extends PropsWithChildren {
  title: string;
  description?: ReactNode;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-base text-gray-600">{description}</p>}
      </div>
      {children}
    </main>
  );
}
