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
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Application Status
      </h1>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-5 sm:p-6 space-y-6">
        <div className="text-sm text-gray-600">
          We update your status automatically every 30 seconds so you always
          know where your application stands.
        </div>

        <div className="relative">
          <div className="absolute left-3 top-3 bottom-3 w-px bg-gray-200" aria-hidden />

          <div className="space-y-6">
            {STATUS_ORDER.map((status, index) => {
              const complete =
                STATUS_ORDER.indexOf(status) <=
                STATUS_ORDER.indexOf(currentStatus);
              const isCurrent = status === currentStatus;
              const isLast = index === STATUS_ORDER.length - 1;

              return (
                <div key={status} className="relative flex items-start gap-4 pl-4">
                  <div className="flex flex-col items-center relative">
                    {complete ? (
                      StatusIcon(status)
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300" />
                    )}
                    {!isLast && (
                      <span
                        className="w-px flex-1 bg-gray-200"
                        aria-hidden
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <div
                      className={
                        complete
                          ? "font-medium text-gray-900"
                          : "font-medium text-gray-400"
                      }
                    >
                      {STATUS_LABELS[status]}
                    </div>

                    {isCurrent && (
                      <div className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Current stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
