"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  superAdminApi,
  SUPER_ADMIN_TOKEN_COOKIE,
} from "@/lib/super-admin-api";
import { getAxiosApiErrorMessage } from "@/lib/get-axios-error-message";
import { useSuperAdminAuth } from "@/contexts/super-admin-auth-context";
import type { SuperAdminLoginApiResponse } from "@/types/super-admin";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLocaleControl } from "@/contexts/intl-provider";

type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export default function SuperAdminLoginPage() {
  const t = useTranslations("superAdminLogin");
  const router = useRouter();
  const { locale } = useLocaleControl();
  const { user, loading, refresh } = useSuperAdminAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("errors.emailRequired")).email(t("errors.emailInvalid")),
        password: z.string().min(1, t("errors.passwordRequired")),
        remember: z.boolean(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/super-admin/dashboard");
    }
  }, [loading, user, router]);

  const onSubmit = async (values: FormValues) => {
    const { remember } = values;
    setFormError(null);
    try {
      const { data } = await superAdminApi.post<SuperAdminLoginApiResponse>(
        "/super-admin/login",
        {
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }
      );
      if (!data.success || !data.data?.token) {
        setFormError(data.message || t("signIn"));
        return;
      }
      Cookies.set(SUPER_ADMIN_TOKEN_COOKIE, data.data.token, {
        path: "/",
        sameSite: "lax",
        ...(remember ? { expires: 7 } : {}),
      });
      await refresh(data.data.token);
      router.push("/super-admin/dashboard");
      router.refresh();
    } catch (e) {
      setFormError(getAxiosApiErrorMessage(e));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-loom-page">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-loom-border-2 border-t-loom-blue-600"
          aria-hidden
        />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-loom-page text-loom-text-900">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 md:right-8 md:top-8">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div
          key={locale}
          className="w-full max-w-[400px] rounded-2xl border border-loom-border bg-loom-surface p-8 shadow-loom-xl"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-loom-text-400">
            {t("systemOwner")}
          </p>
          <h1 className="mt-2 text-xl font-semibold text-loom-text-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-loom-text-500">{t("subtitle")}</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {formError && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {formError}
              </div>
            )}
            <div>
              <label
                htmlFor="sa-email"
                className="block text-xs font-medium text-loom-text-500"
              >
                {t("email")}
              </label>
              <input
                id="sa-email"
                type="email"
                autoComplete="username"
                className="mt-1.5 w-full rounded-lg border border-loom-border bg-loom-input px-3 py-2 text-sm text-loom-text-900 outline-none placeholder:text-loom-text-400 focus:border-loom-blue-500 focus:ring-2 focus:ring-loom-blue-500/20"
                placeholder="owner@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="sa-password"
                className="block text-xs font-medium text-loom-text-500"
              >
                {t("password")}
              </label>
              <input
                id="sa-password"
                type="password"
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-lg border border-loom-border bg-loom-input px-3 py-2 text-sm text-loom-text-900 outline-none placeholder:text-loom-text-400 focus:border-loom-blue-500 focus:ring-2 focus:ring-loom-blue-500/20"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-loom-text-500">
              <input
                type="checkbox"
                className="rounded border-loom-border bg-loom-input"
                {...register("remember")}
              />
              {t("remember")}
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-loom-blue-600 py-2.5 text-sm font-semibold text-white shadow-loom-xs transition hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {isSubmitting ? t("signingIn") : t("signIn")}
            </button>
          </form>
        </div>
        <p className="mt-8 text-center text-xs text-loom-text-400">
          <Link
            href="/login"
            className="text-loom-text-500 underline underline-offset-2 hover:text-loom-text-900"
          >
            {t("backToApp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
