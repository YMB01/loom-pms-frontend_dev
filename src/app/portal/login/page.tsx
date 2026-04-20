"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { portalRequestOtp, portalVerifyOtp, usePortalAuth } from "@/contexts/portal-auth-context";

export default function PortalLoginPage() {
  const t = useTranslations("portal");
  const { setToken } = usePortalAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  async function sendOtp() {
    setErr(null);
    setLoading(true);
    setDebugCode(null);
    try {
      const res = await portalRequestOtp(phone);
      if (!res.success) {
        setErr(res.message || t("otpFailed"));
        return;
      }
      if (res.data?.debug_code) setDebugCode(res.data.debug_code);
      setStep("code");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("otpFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setErr(null);
    setLoading(true);
    try {
      const res = await portalVerifyOtp(phone, code);
      if (!res.success || !res.data?.token) {
        setErr(res.message || t("verifyFailed"));
        return;
      }
      setToken(res.data.token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("verifyFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6fa] px-4 pb-8 pt-12 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-xl font-bold text-slate-900 dark:text-white">{t("loginTitle")}</h1>
        <p className="mt-2 text-center text-sm text-slate-500">{t("loginSubtitle")}</p>

        {step === "phone" ? (
          <div className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t("phone")}</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+2519..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            <button
              type="button"
              disabled={loading || phone.length < 8}
              onClick={() => void sendOtp()}
              className="w-full rounded-xl bg-[var(--brand-primary,#2563eb)] py-3 text-sm font-semibold text-white"
            >
              {loading ? "…" : t("sendCode")}
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {debugCode ? (
              <p className="rounded-lg bg-amber-50 p-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                Dev: {debugCode}
              </p>
            ) : null}
            <label className="block text-sm font-medium">{t("otpCode")}</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] dark:border-slate-700 dark:bg-slate-900"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            <button
              type="button"
              disabled={loading || code.length !== 6}
              onClick={() => void verify()}
              className="w-full rounded-xl bg-[var(--brand-primary,#2563eb)] py-3 text-sm font-semibold text-white"
            >
              {loading ? "…" : t("verify")}
            </button>
            <button
              type="button"
              className="w-full text-sm text-slate-500 underline"
              onClick={() => {
                setStep("phone");
                setCode("");
              }}
            >
              {t("changePhone")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
