import { useEffect, useState } from "react";
import { useResumeApplication } from "../hooks/useResumeApplication";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function ResumePage() {
  const { resume } = useResumeApplication();
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    resume().then(setInfo);
  }, []);

  if (!info) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <h1 className="text-xl font-semibold text-borealBlue">
              No saved applications found
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Start a new application to begin.
            </p>
            <Button
              className="mt-4 w-full md:w-auto"
              onClick={() => (window.location.href = "/apply/step-1")}
            >
              Start new application
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Resume
          </div>
          <h1 className="text-2xl font-semibold text-borealBlue mt-2">
            Continue your application
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            We saved your progress. Continue where you left off.
          </p>
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <Button
              className="w-full md:w-auto"
              onClick={() => (window.location.href = "/apply/step-1")}
            >
              Continue application
            </Button>
            <Button
              className="w-full md:w-auto bg-white text-borealBlue border border-borealLightBlue"
              onClick={() => (window.location.href = "/portal")}
            >
              View client portal
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
