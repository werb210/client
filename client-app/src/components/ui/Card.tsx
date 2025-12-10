export function Card({ children, className = "" }: any) {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}
