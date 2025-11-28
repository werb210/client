import React from "react";
import {
  XMarkIcon,
  UserGroupIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
}

export function SupportPanel({ onClose }: Props) {
  const navigate = useNavigate();

  function gotoHuman() {
    navigate("/portal/messages", { state: { tab: "human" } });
    onClose();
  }

  function gotoAI() {
    navigate("/portal/messages", { state: { tab: "ai" } });
    onClose();
  }

  function gotoIssue() {
    navigate("/portal/report-issue");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl shadow-xl p-6 space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Support</h2>
          <button className="p-2 rounded-full hover:bg-slate-100" onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={gotoHuman}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-900">Talk to a human</span>
              <span className="text-xs text-slate-500">Chat with Boreal Support</span>
            </div>
          </button>

          <button
            onClick={gotoAI}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            <SparklesIcon className="w-6 h-6 text-emerald-600" />
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-900">Ask Boreal AI</span>
              <span className="text-xs text-slate-500">Instant answers from your data</span>
            </div>
          </button>

          <button
            onClick={gotoIssue}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-900">Report an issue</span>
              <span className="text-xs text-slate-500">Submit a technical problem</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
