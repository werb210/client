export function Button({ children, className = "", ...rest }: any) {
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-md text-white bg-borealBlue hover:bg-borealDark transition ${className}`}
    >
      {children}
    </button>
  );
}
