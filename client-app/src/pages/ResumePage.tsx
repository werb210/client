import { useEffect, useState } from "react";
import { useResumeApplication } from "../hooks/useResumeApplication";

export function ResumePage() {
  const { resume } = useResumeApplication();
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    resume().then(setInfo);
  }, []);

  if (!info) return <div>No saved applications found.</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Resume Application</h1>
      <pre className="bg-gray-100 p-3">{JSON.stringify(info, null, 2)}</pre>
      <button
        className="bg-borealBlue text-white p-2"
        onClick={() => (window.location.href = "/apply/step-1")}
      >
        Continue
      </button>
    </div>
  );
}
