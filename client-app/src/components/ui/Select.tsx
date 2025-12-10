export function Select(props: any) {
  return (
    <select
      {...props}
      className={`border border-gray-300 p-3 rounded-md w-full text-[15px] ${props.className || ""}`}
    />
  );
}
