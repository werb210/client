import { useState } from "react";

export default function CapitalReadinessPopup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="underline text-sm">
        Check Capital Readiness
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="font-bold mb-4">Capital Readiness</h2>
            <p>This gives a quick estimate before applying.</p>
            <button onClick={() => setOpen(false)} className="mt-4 underline">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
