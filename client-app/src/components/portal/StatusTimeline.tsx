import type { FC } from "react";

type StatusHistoryItem = {
  status: string;
  timestamp: string | number | Date;
};

type StatusTimelineProps = {
  history: StatusHistoryItem[];
};

export const StatusTimeline: FC<StatusTimelineProps> = ({ history }) => {
  return (
    <div className="border rounded p-4 bg-white shadow-sm mb-4">
      <h3 className="font-semibold mb-3">Application Status</h3>

      <ul className="space-y-3">
        {history.map((item, index) => (
          <li key={index} className="flex items-start space-x-2">
            <div className="w-3 h-3 mt-1 rounded-full bg-blue-600" />

            <div>
              <p className="font-medium">{item.status}</p>
              <p className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
