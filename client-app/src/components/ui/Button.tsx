export function Button({ children, className = "", ...rest }: any) {
  return (
    <button
      {...rest}
      className={`px-5 py-2.5 rounded-full text-white bg-borealBlue hover:bg-borealDark shadow-sm shadow-slate-200 transition ${className}`}
    >
      {children}
    </button>
  );
}
