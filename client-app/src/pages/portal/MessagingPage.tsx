// src/pages/portal/MessagingPage.tsx

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useClientSession } from "@/state/useClientSession";
import { portalGet, portalPost } from "@/api/portal";
import {
  PortalMessage,
  PortalMessagesResponse,
  PortalMessageChannel,
} from "@/types/portalMessaging";
import { ChatBubble } from "@/components/portal/ChatBubble";
import { ChatInput } from "@/components/portal/ChatInput";
import {
  ChatBubbleBottomCenterIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom";

type Tab = "human" | "ai";

export default function MessagingPage() {
  const { token, applicationId } = useClientSession();
  const [tab, setTab] = useState<Tab>("human");
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { tab?: Tab } | undefined;

    if (state?.tab) {
      setTab(state.tab);
    }
  }, [location.state]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-messages", applicationId],
    queryFn: () =>
      portalGet<PortalMessagesResponse>(`messages/${applicationId}`, token!),
    enabled: !!token && !!applicationId,
    refetchInterval: 30000,
  });

  const messages = data?.messages ?? [];

  const filteredMessages = useMemo(
    () => messages.filter((m) => m.channel === tab),
    [messages, tab]
  );

  const sendMutation = useMutation({
    mutationFn: (input: { text: string; channel: PortalMessageChannel }) =>
      portalPost<PortalMessage>(
        `messages/${applicationId}`,
        {
          text: input.text,
          channel: input.channel,
        },
        token!
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["portal-messages", applicationId],
      });
    },
  });

  function handleSend(text: string) {
    sendMutation.mutate({ text, channel: tab });
  }

  const isSending = sendMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Messages & Support
        </h1>
        <p className="text-sm text-slate-500">
          Ask questions, send documents, or chat with our team. You can also
          talk with Boreal AI for instant answers.
        </p>
      </header>

      {/* Tabs */}
      <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setTab("human")}
          className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full transition ${
            tab === "human"
              ? "bg-white shadow-sm text-slate-900"
              : "text-slate-500"
          }`}
        >
          <UserGroupIcon className="w-4 h-4" />
          Talk to a human
        </button>
        <button
          type="button"
          onClick={() => setTab("ai")}
          className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full transition ${
            tab === "ai"
              ? "bg-white shadow-sm text-slate-900"
              : "text-slate-500"
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          Ask Boreal AI
        </button>
      </div>

      {/* Panel */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[480px]">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChatBubbleBottomCenterIcon className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {tab === "human" ? "Boreal Support" : "Boreal AI Assistant"}
              </span>
              <span className="text-xs text-slate-500">
                Typically responds within a few minutes
              </span>
            </div>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
          {isLoading && <div className="text-sm text-slate-400">Loading…</div>}
          {isError && (
            <div className="text-sm text-red-500">
              Could not load messages. Please try again later.
            </div>
          )}
          {!isLoading && !isError && filteredMessages.length === 0 && (
            <div className="text-sm text-slate-400">
              No messages yet. Start the conversation below.
            </div>
          )}
          {filteredMessages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-3 bg-white">
          <ChatInput
            placeholder={
              tab === "human"
                ? "Type your message to our team…"
                : "Ask Boreal AI a question about your application…"
            }
            onSend={handleSend}
            disabled={isSending || !token || !applicationId}
          />
        </div>
      </section>

      {/* Info note */}
      <p className="text-xs text-slate-400">
        Messages here are linked to your current application. Our team can see
        your answers and documents so you never have to repeat yourself.
      </p>
    </div>
  );
}
