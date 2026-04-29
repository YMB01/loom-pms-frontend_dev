"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useBranding } from "@/contexts/branding-context";
import type { ApiEnvelope } from "@/types/api";
import type {
  BrandingResponse,
  CompanySettingsPayload,
  SettingsShowResponse,
  SmsSettingsResponse,
  SubscriptionInfoResponse,
  TeamMember,
} from "@/types/settings";
import { QueryError } from "@/components/dashboard/ListPageUi";

type TabId =
  | "profile"
  | "password"
  | "team"
  | "sms"
  | "branding"
  | "subscription";

export function SettingsPage() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const tq = useTranslations("query");
  const queryClient = useQueryClient();
  const { refresh: refreshBranding } = useBranding();
  const [tab, setTab] = useState<TabId>("profile");

  const showQ = useQuery({
    queryKey: ["settings", "show"],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<SettingsShowResponse>>("/settings");
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data;
    },
  });

  const smsQ = useQuery({
    queryKey: ["settings", "sms"],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<SmsSettingsResponse>>("/settings/sms");
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data;
    },
  });

  const teamQ = useQuery({
    queryKey: ["settings", "team"],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<{ team: TeamMember[] }>>("/settings/team");
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data.team;
    },
  });

  const subQ = useQuery({
    queryKey: ["settings", "subscription"],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<SubscriptionInfoResponse>>(
        "/settings/subscription",
      );
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data;
    },
  });

  const brandingQ = useQuery({
    queryKey: ["settings", "branding"],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<BrandingResponse>>("/settings/branding");
      if (!data.success || !data.data) throw new Error(data.message || "Failed");
      return data.data;
    },
  });

  const [profile, setProfile] = useState<CompanySettingsPayload>({});
  useEffect(() => {
    if (showQ.data?.company) {
      const c = showQ.data.company;
      setProfile({
        name: c.name,
        email: c.email,
        phone: c.phone ?? "",
        address: c.address ?? "",
        currency: c.currency,
        logo: c.logo,
      });
    }
  }, [showQ.data]);

  const [pwd, setPwd] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [sms, setSms] = useState({ sms_provider: "", sms_api_key: "", sms_sender_id: "" });
  useEffect(() => {
    if (smsQ.data) {
      setSms({
        sms_provider: smsQ.data.sms_provider ?? "",
        sms_api_key: "",
        sms_sender_id: smsQ.data.sms_sender_id ?? "",
      });
    }
  }, [smsQ.data]);

  const [brand, setBrand] = useState({
    brand_name: "",
    primary_color: "#2563eb",
    logo: "",
  });
  useEffect(() => {
    if (brandingQ.data) {
      setBrand({
        brand_name: brandingQ.data.brand_name ?? "",
        primary_color: brandingQ.data.primary_color || "#2563eb",
        logo: brandingQ.data.logo ?? "",
      });
    }
  }, [brandingQ.data]);

  const [invite, setInvite] = useState({ name: "", email: "", role: "property_manager" });

  const updateCompany = useMutation({
    mutationFn: async (body: CompanySettingsPayload) => {
      const { data } = await api.put<ApiEnvelope<unknown>>("/settings", body);
      if (!data.success) throw new Error(data.message || "Failed");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
      void refreshBranding();
    },
  });

  const updatePwd = useMutation({
    mutationFn: async () => {
      const { data } = await api.put<ApiEnvelope<unknown>>("/settings/password", pwd);
      if (!data.success) throw new Error(data.message || "Failed");
    },
    onSuccess: () => {
      setPwd({ current_password: "", password: "", password_confirmation: "" });
    },
  });

  const inviteM = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiEnvelope<{ temporary_password?: string }>>(
        "/settings/team",
        invite,
      );
      if (!data.success) throw new Error(data.message || "Failed");
      return data.data;
    },
    onSuccess: (d) => {
      const tp = d && typeof d === "object" && "temporary_password" in d ? String((d as { temporary_password?: string }).temporary_password ?? "") : "";
      if (tp) window.alert(t("tempPassword", { password: tp }));
      setInvite({ name: "", email: "", role: "property_manager" });
      void queryClient.invalidateQueries({ queryKey: ["settings", "team"] });
    },
  });

  const removeM = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete<ApiEnvelope<unknown>>(`/settings/team/${id}`);
      if (!data.success) throw new Error(data.message || "Failed");
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["settings", "team"] }),
  });

  const updateSmsM = useMutation({
    mutationFn: async () => {
      const { data } = await api.put<ApiEnvelope<unknown>>("/settings/sms", {
        sms_provider: sms.sms_provider || null,
        sms_api_key: sms.sms_api_key || undefined,
        sms_sender_id: sms.sms_sender_id || null,
      });
      if (!data.success) throw new Error(data.message || "Failed");
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["settings", "sms"] }),
  });

  const updateBrandM = useMutation({
    mutationFn: async () => {
      const { data } = await api.put<ApiEnvelope<unknown>>("/settings/branding", {
        brand_name: brand.brand_name || null,
        primary_color: brand.primary_color,
        logo: brand.logo || null,
      });
      if (!data.success) throw new Error(data.message || "Failed");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["settings"] });
      void refreshBranding();
    },
  });

  const upgradeM = useMutation({
    mutationFn: async (plan_slug: "basic" | "pro") => {
      const { data } = await api.post<ApiEnvelope<{ url?: string }>>(
        "/settings/subscription/upgrade",
        { plan_slug },
      );
      if (!data.success || !data.data?.url) throw new Error(data.message || "Failed");
      return data.data.url;
    },
    onSuccess: (url) => {
      if (url) window.location.href = url;
    },
  });

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "branding");
      const { data } = await api.post<ApiEnvelope<{ url: string }>>("/upload", fd);
      if (!data.success || !data.data?.url) throw new Error(data.message || "Upload failed");
      return data.data.url;
    },
    onSuccess: (url) => {
      setBrand((b) => ({ ...b, logo: url }));
    },
  });

  const tabs: { id: TabId; label: string }[] = useMemo(
    () => [
      { id: "profile", label: t("tabProfile") },
      { id: "password", label: t("tabPassword") },
      { id: "team", label: t("tabTeam") },
      { id: "sms", label: t("tabSms") },
      { id: "branding", label: t("tabBranding") },
      { id: "subscription", label: t("tabSubscription") },
    ],
    [t],
  );

  if (showQ.isError) {
    return (
      <QueryError
        message={showQ.error instanceof Error ? showQ.error.message : tq("loadFailed")}
        onRetry={() => void showQ.refetch()}
      />
    );
  }

  return (
    <div className="animate-loom-page-in mx-auto max-w-4xl">
      <h1 className="text-xl font-bold text-loom-text-900 dark:text-loom-text-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-loom-text-500">{t("subtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-loom-border pb-2">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
              tab === x.id
                ? "bg-[var(--brand-primary,#2563eb)] text-white"
                : "text-loom-text-600 hover:bg-loom-hover dark:text-loom-text-300"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-loom-border bg-loom-surface p-5 shadow-loom-sm dark:border-loom-border">
        {tab === "profile" && (
          <div className="space-y-4">
            {showQ.isLoading ? (
              <p className="text-sm text-loom-text-400">{tc("loading")}</p>
            ) : (
              <>
                <div className="rounded-lg border border-loom-border bg-loom-bg-2 px-3 py-2.5 text-sm dark:bg-loom-hover">
                  <p className="font-semibold text-loom-text-900 dark:text-loom-text-50">
                    {t("accountInfo")}
                  </p>
                  <p className="mt-1 text-loom-text-600 dark:text-loom-text-300">
                    {showQ.data?.user?.name ?? tc("dash")} - {showQ.data?.user?.email ?? tc("dash")}
                  </p>
                </div>
                <label className="block text-[13px] font-medium">{t("companyName")}</label>
                <input
                  className="w-full rounded-lg border border-loom-border bg-loom-surface px-3 py-2 text-sm dark:border-loom-border"
                  value={profile.name ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
                <label className="block text-[13px] font-medium">{t("email")}</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
                  value={profile.email ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                />
                <label className="block text-[13px] font-medium">{t("phone")}</label>
                <input
                  className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
                  value={profile.phone ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
                <label className="block text-[13px] font-medium">{t("address")}</label>
                <textarea
                  className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
                  rows={2}
                  value={profile.address ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                />
                <label className="block text-[13px] font-medium">{t("currency")}</label>
                <input
                  className="w-32 rounded-lg border border-loom-border px-3 py-2 text-sm uppercase"
                  maxLength={3}
                  value={profile.currency ?? "ETB"}
                  onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                />
                <button
                  type="button"
                  disabled={updateCompany.isPending}
                  onClick={() => updateCompany.mutate(profile)}
                  className="rounded-lg bg-[var(--brand-primary,#2563eb)] px-4 py-2 text-sm font-semibold text-white"
                >
                  {t("save")}
                </button>
              </>
            )}
          </div>
        )}

        {tab === "password" && (
          <div className="max-w-md space-y-3">
            <label className="block text-[13px] font-medium">{t("currentPassword")}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              value={pwd.current_password}
              onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))}
            />
            <label className="block text-[13px] font-medium">{t("newPassword")}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              value={pwd.password}
              onChange={(e) => setPwd((p) => ({ ...p, password: e.target.value }))}
            />
            <label className="block text-[13px] font-medium">{t("confirmPassword")}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              value={pwd.password_confirmation}
              onChange={(e) => setPwd((p) => ({ ...p, password_confirmation: e.target.value }))}
            />
            <button
              type="button"
              disabled={updatePwd.isPending}
              onClick={() => updatePwd.mutate()}
              className="rounded-lg bg-[var(--brand-primary,#2563eb)] px-4 py-2 text-sm font-semibold text-white"
            >
              {t("updatePassword")}
            </button>
          </div>
        )}

        {tab === "team" && (
          <div className="space-y-4">
            {teamQ.isLoading ? (
              <p className="text-sm">{tc("loading")}</p>
            ) : (
              <ul className="divide-y divide-loom-border rounded-lg border border-loom-border">
                {teamQ.data?.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span>
                      {m.name} — {m.email} ({m.role})
                    </span>
                    <button
                      type="button"
                      className="text-red-600 text-xs font-semibold"
                      onClick={() => {
                        if (confirm(t("confirmRemove"))) removeM.mutate(m.id);
                      }}
                    >
                      {t("remove")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                placeholder={t("memberName")}
                className="rounded-lg border border-loom-border px-3 py-2 text-sm"
                value={invite.name}
                onChange={(e) => setInvite((i) => ({ ...i, name: e.target.value }))}
              />
              <input
                placeholder={t("memberEmail")}
                className="rounded-lg border border-loom-border px-3 py-2 text-sm"
                value={invite.email}
                onChange={(e) => setInvite((i) => ({ ...i, email: e.target.value }))}
              />
              <select
                className="rounded-lg border border-loom-border px-3 py-2 text-sm"
                value={invite.role}
                onChange={(e) => setInvite((i) => ({ ...i, role: e.target.value }))}
              >
                <option value="property_manager">{t("roleManager")}</option>
                <option value="company_admin">{t("roleAdmin")}</option>
              </select>
              <button
                type="button"
                disabled={inviteM.isPending}
                onClick={() => inviteM.mutate()}
                className="rounded-lg border border-loom-border bg-loom-surface-2 px-3 py-2 text-sm font-semibold"
              >
                {t("invite")}
              </button>
            </div>
          </div>
        )}

        {tab === "sms" && (
          <div className="max-w-lg space-y-3">
            <p className="text-xs text-loom-text-500">{t("smsHint")}</p>
            {smsQ.data?.sms_api_key_set ? (
              <p className="text-sm text-emerald-600">{t("smsKeySet")}</p>
            ) : null}
            <label className="block text-[13px] font-medium">{t("smsProvider")}</label>
            <select
              className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              value={sms.sms_provider}
              onChange={(e) => setSms((s) => ({ ...s, sms_provider: e.target.value }))}
            >
              <option value="">{tc("optional")}</option>
              <option value="africastalking">Africa&apos;s Talking</option>
              <option value="twilio">Twilio</option>
            </select>
            <label className="block text-[13px] font-medium">{t("smsApiKey")}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              placeholder="••••••••"
              value={sms.sms_api_key}
              onChange={(e) => setSms((s) => ({ ...s, sms_api_key: e.target.value }))}
            />
            <label className="block text-[13px] font-medium">{t("smsSenderId")}</label>
            <input
              className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              value={sms.sms_sender_id}
              onChange={(e) => setSms((s) => ({ ...s, sms_sender_id: e.target.value }))}
            />
            <button
              type="button"
              disabled={updateSmsM.isPending}
              onClick={() => updateSmsM.mutate()}
              className="rounded-lg bg-[var(--brand-primary,#2563eb)] px-4 py-2 text-sm font-semibold text-white"
            >
              {t("saveSms")}
            </button>
          </div>
        )}

        {tab === "branding" && (
          <div className="max-w-lg space-y-4">
            <label className="block text-[13px] font-medium">{t("brandName")}</label>
            <input
              className="w-full rounded-lg border border-loom-border px-3 py-2 text-sm"
              value={brand.brand_name}
              onChange={(e) => setBrand((b) => ({ ...b, brand_name: e.target.value }))}
              placeholder={t("brandNamePlaceholder")}
            />
            <label className="block text-[13px] font-medium">{t("primaryColor")}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-14 cursor-pointer rounded border border-loom-border"
                value={brand.primary_color.length === 7 ? brand.primary_color : "#2563eb"}
                onChange={(e) => setBrand((b) => ({ ...b, primary_color: e.target.value }))}
              />
              <input
                className="flex-1 rounded-lg border border-loom-border px-3 py-2 font-mono text-sm"
                value={brand.primary_color}
                onChange={(e) => setBrand((b) => ({ ...b, primary_color: e.target.value }))}
              />
            </div>
            <label className="block text-[13px] font-medium">{t("logo")}</label>
            {brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt="" className="h-16 w-auto rounded border border-loom-border" />
            ) : null}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadLogo.mutate(f);
              }}
            />
            <button
              type="button"
              disabled={updateBrandM.isPending || uploadLogo.isPending}
              onClick={() => updateBrandM.mutate()}
              className="rounded-lg bg-[var(--brand-primary,#2563eb)] px-4 py-2 text-sm font-semibold text-white"
            >
              {t("saveBranding")}
            </button>
          </div>
        )}

        {tab === "subscription" && (
          <div className="space-y-3">
            {subQ.isLoading ? (
              <p>{tc("loading")}</p>
            ) : (
              <>
                <pre className="overflow-x-auto rounded-lg bg-loom-bg-2 p-3 text-xs dark:bg-loom-hover">
                  {JSON.stringify(subQ.data?.subscription, null, 2)}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-[var(--brand-primary,#2563eb)] px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => upgradeM.mutate("basic")}
                    disabled={upgradeM.isPending}
                  >
                    {t("upgradeBasic")}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => upgradeM.mutate("pro")}
                    disabled={upgradeM.isPending}
                  >
                    {t("upgradePro")}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
