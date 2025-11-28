import { useUIStore } from "../state/uiStore";

export default function LoadingOverlay() {
  const loading = useUIStore((state) => state.loading);
  const message = useUIStore((state) => state.loadingMessage);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]">
      <div className="bg-white p-6 rounded-xl shadow-xl text-center w-[300px]">
        <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4" />
        <p className="text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
}
