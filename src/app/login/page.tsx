"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import { api, AUTH_TOKEN_COOKIE } from "@/lib/api";
import { getAxiosApiErrorMessage } from "@/lib/get-axios-error-message";
import { useAuth } from "@/hooks/useAuth";
import type { LoginApiResponse } from "@/types/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLocaleControl } from "@/contexts/intl-provider";
import "./login.css";

/** Must match `LoomPmsDemoSeeder` demo admin (run `php artisan migrate:fresh --seed`). */
const DEMO_USER_EMAIL = "admin@admin.com";
const DEMO_PASSWORD = "admin";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

function LoginScreen() {
  const t = useTranslations("login");
  const router = useRouter();
  const { refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginSchema = useMemo(
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
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const submitLogin = async (values: LoginForm) => {
    const { remember } = values;
    setFormError(null);
    try {
      const { data } = await api.post<LoginApiResponse>("/auth/login", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      if (!data.success || !data.data?.token) {
        setFormError(data.message || t("signInFailed"));
        return;
      }
      const { token } = data.data;
      Cookies.set(AUTH_TOKEN_COOKIE, token, {
        path: "/",
        sameSite: "lax",
        ...(remember ? { expires: 7 } : {}),
      });
      await refresh(token);
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setFormError(getAxiosApiErrorMessage(e));
    }
  };

  return (
    <div className="login-root login-screen relative">
      <div className="absolute right-4 top-4 z-[60] flex items-center gap-2 md:right-6 md:top-6">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <div className="login-left">
        <div className="ll-logo">
          <div className="ll-logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div className="ll-logo-name">Loom PMS</div>
            <div className="ll-logo-by">{t("brandTagline")}</div>
          </div>
        </div>

        <div className="ll-body">
          <div className="ll-headline">
            {t("headline1")}
            <br />
            <span>{t("headline2")}</span>
          </div>
          <div className="ll-sub">{t("sub")}</div>
          <div className="ll-features">
            <div className="ll-feat">
              <div className="ll-feat-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="ll-feat-text">{t("feat1")}</div>
            </div>
            <div className="ll-feat">
              <div className="ll-feat-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div className="ll-feat-text">{t("feat2")}</div>
            </div>
            <div className="ll-feat">
              <div className="ll-feat-icon">
                <svg viewBox="0 0 24 24">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div className="ll-feat-text">{t("feat3")}</div>
            </div>
            <div className="ll-feat">
              <div className="ll-feat-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div className="ll-feat-text">{t("feat4")}</div>
            </div>
          </div>
        </div>

        <div className="ll-footer">{t("footer")}</div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="lc-header">
            <div className="lc-title">{t("welcomeBack")}</div>
            <div className="lc-sub">{t("signInSubtitle")}</div>
          </div>

          {process.env.NODE_ENV === "development" ? (
            <div className="lc-hint">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="lc-hint-stack">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1d4ed8]">
                  {t("demoLogin")}
                </span>
                <span className="lc-hint-line">
                  <strong className="lc-hint-label">{t("userEmail")}</strong>
                  <code>{DEMO_USER_EMAIL}</code>
                </span>
                <span className="lc-hint-line">
                  <strong className="lc-hint-label">{t("passwordLabel")}</strong>
                  <code>{DEMO_PASSWORD}</code>
                </span>
                <span className="mt-1 text-[11px] leading-snug text-slate-600">
                  {t("seedHint")}{" "}
                  <code className="rounded bg-loom-surface/80 px-1 py-0.5 text-[10px] text-slate-700">
                    php artisan migrate:fresh --seed
                  </code>{" "}
                  {t("inApi")} <code className="text-[10px]">loom-pms-api</code>.
                </span>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(submitLogin)}>
            {formError && (
              <div className="lc-error" role="alert">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <div className="login-form-group">
              <label className="login-form-label" htmlFor="email">
                {t("email")}
              </label>
              <div className="input-wrap">
                <svg className="i-icon" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="login-form-input"
                  placeholder={t("placeholderEmail")}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="login-form-group">
              <label
                className="login-form-label login-form-label-row"
                htmlFor="password"
              >
                <span>{t("password")}</span>
                <button type="button" className="lc-forgot" tabIndex={-1}>
                  {t("forgot")}
                </button>
              </label>
              <div className="input-wrap">
                <svg className="i-icon" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="login-form-input has-eye"
                  placeholder={t("placeholderPassword")}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="eye-btn"
                  tabIndex={-1}
                  title={t("showPassword")}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="lc-remember">
              <label className="lc-check">
                <Controller
                  name="remember"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
                {t("remember")}
              </label>
            </div>

            <button
              type="submit"
              className={`login-btn ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              <div className="spinner" aria-hidden />
              <span className="btn-label">{t("signIn")}</span>
            </button>
          </form>

          {process.env.NODE_ENV === "development" ? (
            <>
              <div className="lc-divider">{t("or")}</div>

              <div className="text-center">
                <button
                  type="button"
                  className="lc-demo-btn"
                  onClick={() => {
                    setFormError(null);
                    void submitLogin({
                      email: DEMO_USER_EMAIL,
                      password: DEMO_PASSWORD,
                      remember: true,
                    });
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  {t("quickDemo")}
                </button>
              </div>
            </>
          ) : null}

          <div className="lc-footer-text">
            {t("needAccess")}{" "}
            <button type="button">{t("contactAdmin")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginRedirecting() {
  const t = useTranslations("login");
  return (
    <div className="login-root flex min-h-screen items-center justify-center bg-loom-page">
      <p className="text-sm font-medium text-loom-text-500">{t("redirecting")}</p>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { locale } = useLocaleControl();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="login-root flex min-h-screen items-center justify-center bg-loom-page">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (user) {
    return <LoginRedirecting />;
  }

  return <LoginScreen key={locale} />;
}
