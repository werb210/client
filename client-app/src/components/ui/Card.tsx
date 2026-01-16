export function Card({ children, className = "" }: any) {
  return (
    <div
      className={`boreal-card p-5 ${className}`}
    >
      {children}
    </div>
  );
}
