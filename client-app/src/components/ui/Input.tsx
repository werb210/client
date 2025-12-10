export function Input(props: any) {
  return (
    <input
      {...props}
      className={`border border-gray-300 p-3 rounded-md w-full text-[15px] ${props.className || ""}`}
    />
  );
}
