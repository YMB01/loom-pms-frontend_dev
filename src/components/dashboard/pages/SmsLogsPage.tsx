"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchPaginated } from "@/lib/fetch-paginated";
import type { SmsLog } from "@/types/resources";
import { translateSmsStatus } from "@/lib/i18n-labels";
import {
  CardField,
  CardRow,
  ListPageToolbar,
  PaginationBar,
  QueryError,
  ResponsiveTable,
  SearchInput,
  TableCard,
  TableSkeleton,
  Td,
  Th,
  smsStatusBadge,
} from "@/components/dashboard/ListPageUi";

type Channel = "sms" | "whatsapp";

export function SmsLogsPage() {
  const ts = useTranslations("sms");
  const tq = useTranslations("query");
  const tc = useTranslations("common");
  const tss = useTranslations("smsStatus");
  const [channel, setChannel] = useState<Channel>("sms");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, channel]);

  const path = channel === "sms" ? "/sms-logs" : "/whatsapp-logs";
  const searchPlaceholder =
    channel === "sms" ? ts("searchExtended") : ts("searchExtendedWa");
  const noMatch = channel === "sms" ? ts("noMatch") : ts("noMatchWa");

  const q = useQuery({
    queryKey: ["messaging-logs", channel, { page, search: debouncedSearch }],
    queryFn: () =>
      fetchPaginated<SmsLog>(path, {
        page,
        per_page: 15,
        search: debouncedSearch || undefined,
      }),
  });

  if (q.isError) {
    return (
      <QueryError
        message={q.error instanceof Error ? q.error.message : tq("loadFailed")}
        onRetry={() => void q.refetch()}
      />
    );
  }

  return (
    <div className="animate-loom-page-in">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setChannel("sms")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            channel === "sms"
              ? "bg-[color:var(--brand-primary,#2563eb)] text-white"
              : "border border-loom-border bg-loom-surface text-loom-text-600 hover:bg-loom-hover"
          }`}
        >
          {ts("tabSms")}
        </button>
        <button
          type="button"
          onClick={() => setChannel("whatsapp")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            channel === "whatsapp"
              ? "bg-[color:var(--brand-primary,#2563eb)] text-white"
              : "border border-loom-border bg-loom-surface text-loom-text-600 hover:bg-loom-hover"
          }`}
        >
          {ts("tabWhatsapp")}
        </button>
      </div>

      <ListPageToolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={searchPlaceholder}
          className="min-w-[280px] flex-1 [&_input]:w-full [&_input]:max-w-none"
        />
      </ListPageToolbar>

      {q.isLoading ? (
        <TableCard>
          <TableSkeleton cols={6} />
        </TableCard>
      ) : (
        <ResponsiveTable
          table={
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>{ts("to")}</Th>
                  <Th>{ts("trigger")}</Th>
                  <Th>{ts("message")}</Th>
                  <Th>{ts("provider")}</Th>
                  <Th>{ts("status")}</Th>
                  <Th>{ts("sentAt")}</Th>
                </tr>
              </thead>
              <tbody>
                {q.data?.items.length === 0 ? (
                  <tr>
                    <Td colSpan={6} className="py-12 text-center text-loom-text-400">
                      {noMatch}
                    </Td>
                  </tr>
                ) : (
                  q.data?.items.map((s) => {
                    const sent = s.created_at
                      ? new Date(s.created_at).toLocaleString()
                      : tc("dash");
                    const preview =
                      s.message.length > 80 ? `${s.message.slice(0, 80)}…` : s.message;
                    return (
                      <tr key={s.id} className="transition-colors hover:bg-loom-hover">
                        <Td className="font-mono text-[12.5px] text-loom-text-900">
                          {s.to_number}
                        </Td>
                        <Td className="text-[12.5px] text-loom-text-700">
                          {s.trigger ?? tc("dash")}
                        </Td>
                        <Td className="max-w-[320px] text-[12.5px] text-loom-text-600">
                          <span title={s.message}>{preview}</span>
                        </Td>
                        <Td className="text-[12.5px]">{s.provider ?? tc("dash")}</Td>
                        <Td>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${smsStatusBadge(s.status)}`}
                          >
                            <span className="h-[5px] w-[5px] rounded-full bg-current" />
                            {translateSmsStatus(s.status, (k) => tss(k))}
                          </span>
                        </Td>
                        <Td className="font-mono text-[11.5px] text-loom-text-500">{sent}</Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          }
          cards={
            <>
              {q.data?.items.length === 0 ? (
                <p className="py-10 text-center text-sm text-loom-text-400">{noMatch}</p>
              ) : (
                q.data?.items.map((s) => {
                  const sent = s.created_at
                    ? new Date(s.created_at).toLocaleString()
                    : tc("dash");
                  return (
                    <CardRow key={s.id}>
                      <CardField label={ts("to")}>
                        <span className="font-mono text-[12.5px] text-loom-text-900">
                          {s.to_number}
                        </span>
                      </CardField>
                      <CardField label={ts("trigger")}>{s.trigger ?? tc("dash")}</CardField>
                      <CardField label={ts("message")}>
                        <span className="text-[12.5px] text-loom-text-600" title={s.message}>
                          {s.message}
                        </span>
                      </CardField>
                      <CardField label={ts("provider")}>{s.provider ?? tc("dash")}</CardField>
                      <CardField label={ts("status")}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${smsStatusBadge(s.status)}`}
                        >
                          <span className="h-[5px] w-[5px] rounded-full bg-current" />
                          {translateSmsStatus(s.status, (k) => tss(k))}
                        </span>
                      </CardField>
                      <CardField label={ts("sentAt")}>
                        <span className="font-mono text-[11.5px] text-loom-text-500">{sent}</span>
                      </CardField>
                    </CardRow>
                  );
                })
              )}
            </>
          }
          footer={
            q.data && q.data.meta.total > 0 ? (
              <PaginationBar meta={q.data.meta} onPage={setPage} disabled={q.isFetching} />
            ) : null
          }
        />
      )}
    </div>
  );
}
