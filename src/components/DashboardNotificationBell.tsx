"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { api } from "@/lib/api";
import type {
  InboxMessage,
  InboxMessagesApiResponse,
  InboxUnreadCountApiResponse,
} from "@/types/inbox";

function typeMeta(type: InboxMessage["type"]) {
  switch (type) {
    case "announcement":
      return {
        emoji: "📢",
        label: "Announcement",
        dot: "bg-blue-500",
        border: "border-l-blue-500",
      };
    case "warning":
      return {
        emoji: "⚠️",
        label: "Warning",
        dot: "bg-amber-400",
        border: "border-l-amber-400",
      };
    case "maintenance":
      return {
        emoji: "🔧",
        label: "Maintenance",
        dot: "bg-orange-500",
        border: "border-l-orange-500",
      };
    case "urgent":
      return {
        emoji: "🚨",
        label: "Urgent",
        dot: "bg-red-500",
        border: "border-l-red-500",
      };
    default:
      return {
        emoji: "•",
        label: "Notice",
        dot: "bg-slate-400",
        border: "border-l-slate-400",
      };
  }
}

function formatSentAt(iso: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 24) {
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function DashboardNotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["inbox", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get<InboxUnreadCountApiResponse>(
        "/inbox/messages/unread-count"
      );
      if (!data.success || data.data?.unread_count === undefined) {
        return 0;
      }
      return data.data.unread_count;
    },
    refetchInterval: open ? false : 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["inbox", "messages"],
    queryFn: async () => {
      const { data } = await api.get<InboxMessagesApiResponse>(
        "/inbox/messages"
      );
      if (!data.success || !data.data?.messages) {
        return [];
      }
      return data.data.messages;
    },
    enabled: open,
    refetchOnWindowFocus: true,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/inbox/messages/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.post("/inbox/messages/read-all");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        title="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border border-loom-border bg-loom-surface text-loom-text-500 shadow-loom-xs transition-colors hover:bg-loom-hover md:h-[34px] md:min-h-0 md:w-[34px] md:min-w-0"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute right-[4px] top-[4px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-[1.5px] border-white bg-loom-red-500 px-[5px] text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <div
        className={`absolute right-0 top-[calc(100%+8px)] z-[500] w-[340px] overflow-hidden rounded-[14px] border border-loom-border bg-loom-surface shadow-loom-xl ${
          open ? "block" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between border-b border-loom-border px-4 py-3.5">
          <span className="text-[13.5px] font-bold text-loom-text-900">
            Notifications
          </span>
          <button
            type="button"
            disabled={markAllRead.isPending || unreadCount === 0}
            onClick={() => markAllRead.mutate()}
            className="cursor-pointer text-[12px] font-semibold text-loom-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-[min(420px,70vh)] overflow-y-auto">
          {open && isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-loom-text-400">
              Loading…
            </div>
          ) : messages.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-loom-text-400">
              No system messages yet.
            </div>
          ) : (
            messages.map((msg) => {
              const meta = typeMeta(msg.type);
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => {
                    if (!msg.is_read) {
                      markRead.mutate(msg.id);
                    }
                  }}
                  className={`flex w-full gap-3 border-b border-loom-border px-4 py-[13px] text-left transition-colors last:border-b-0 hover:bg-loom-hover ${meta.border} border-l-[3px]`}
                >
                  <div className="mt-[3px] shrink-0 text-base" aria-hidden>
                    {meta.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-loom-text-400">
                        {meta.label}
                      </span>
                      {!msg.is_read ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-loom-blue-500" />
                      ) : null}
                    </div>
                    <div className="text-[12.5px] font-semibold leading-[1.4] text-loom-text-900">
                      {msg.title}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap text-[12px] leading-[1.45] text-loom-text-600">
                      {msg.body}
                    </div>
                    <div className="mt-1.5 text-[11px] text-loom-text-400">
                      {formatSentAt(msg.sent_at)}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
