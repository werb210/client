export function Button({ children, className = "", ...rest }: any) {
  return (
    <button
      {...rest}
      className={`boreal-button boreal-button-primary px-5 shadow-sm shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
