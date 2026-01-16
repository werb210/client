export function Input(props: any) {
  return (
    <input
      {...props}
      className={`border border-slate-200 bg-white p-3.5 rounded-xl w-full text-[15px] focus:outline-none focus:ring-2 focus:ring-borealLightBlue ${props.className || ""}`}
    />
  );
}
