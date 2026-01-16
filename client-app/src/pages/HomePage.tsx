import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OfflineStore } from "../state/offline";
import { ClientAppAPI } from "../api/clientApp";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function HomePage() {
  const [status, setStatus] = useState<any>(null);
  const cached = OfflineStore.load();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cached?.applicationToken) return;
    ClientAppAPI.status(cached.applicationToken)
      .then((res) => setStatus(res.data))
      .catch(() => setStatus(null));
  }, [cached?.applicationToken]);

  const hasToken = Boolean(cached?.applicationToken);

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-borealBlue">
            Welcome to Boreal Financial
          </h1>
          <p className="mt-2 text-slate-600">
            Start a new application or resume one using your SMS magic link.
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Login
              </div>
              <h2 className="text-xl font-semibold text-borealBlue mt-1">
                SMS Magic Link
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                If you already started an application, use the secure link we
                sent to your phone to resume. Otherwise, you can start a new
                application now.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <Button
                className="w-full md:w-auto"
                onClick={() => navigate("/apply/step-1")}
              >
                Start new application
              </Button>
              {hasToken && (
                <Button
                  className="w-full md:w-auto bg-white text-borealBlue border border-borealLightBlue"
                  onClick={() => (window.location.href = "/resume")}
                >
                  Resume application
                </Button>
              )}
            </div>
          </div>
        </Card>

        {hasToken && (
          <Card className="bg-borealLightBlue/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-borealBlue/70">
                  Existing application
                </div>
                <div className="text-lg font-semibold text-borealBlue">
                  {status?.status || "In progress"}
                </div>
              </div>
              <Button
                className="w-full md:w-auto"
                onClick={() =>
                  (window.location.href = `/status?token=${cached?.applicationToken}`)
                }
              >
                Go to client portal
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
