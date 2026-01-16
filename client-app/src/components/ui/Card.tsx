export function Card({ children, className = "" }: any) {
  return (
    <div
      className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 ${className}`}
    >
      {children}
    </div>
  );
}
