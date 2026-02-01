export default function ErrorBoundary({ error }: any) {
  console.error(error);
  return <div>Something went wrong. Please refresh.</div>;
}
