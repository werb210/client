export function Select(props: any) {
  return (
    <select
      {...props}
      className={`boreal-input w-full px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-borealLightBlue ${props.className || ""}`}
    />
  );
}
