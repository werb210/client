import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useClientSession } from "@/state/useClientSession";
import { portalGet } from "@/api/portal";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

const STATUS_ORDER = [
  "submitted",
  "under_review",
  "needs_documents",
  "sent_to_lender",
  "approved",
  "declined",
];

function StatusIcon(status: string) {
  switch (status) {
    case "submitted":
      return <ClockIcon className="w-6 h-6 text-blue-600" />;
    case "under_review":
      return <ClockIcon className="w-6 h-6 text-yellow-600" />;
    case "needs_documents":
      return <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />;
    case "sent_to_lender":
      return <ClockIcon className="w-6 h-6 text-purple-600" />;
    case "approved":
      return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
    case "declined":
      return <ExclamationTriangleIcon className="w-6 h-6 text-red-700" />;
    default:
      return <ClockIcon className="w-6 h-6 text-gray-400" />;
  }
}

const STATUS_LABELS: Record<string, string> = {
  submitted: "Application Submitted",
  under_review: "Under Review by Boreal",
  needs_documents: "Additional Documents Required",
  sent_to_lender: "Sent to Lender",
  approved: "Approved",
  declined: "Declined",
};

interface StatusResponse {
  status: string;
}

export default function StatusPage() {
  const { token, applicationId } = useClientSession();

  const { data, isLoading } = useQuery<StatusResponse>({
    queryKey: ["portal-status", applicationId],
    queryFn: () => portalGet(`status/${applicationId}`, token!),
    enabled: !!token && !!applicationId,
    refetchInterval: 30000,
  });

  if (isLoading || !data) return <div>Loading…</div>;

  const currentStatus = data.status;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Application Status
      </h1>

      <div className="space-y-6">
        {STATUS_ORDER.map((status) => {
          const complete =
            STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(currentStatus);

          return (
            <div key={status} className="flex items-start gap-4">
              <div>
                {complete ? (
                  StatusIcon(status)
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300" />
                )}
              </div>

              <div>
                <div
                  className={
                    complete
                      ? "font-medium text-gray-900"
                      : "font-medium text-gray-400"
                  }
                >
                  {STATUS_LABELS[status]}
                </div>

                {status === currentStatus && (
                  <div className="text-sm text-blue-600">Current stage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
