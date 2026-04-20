"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { BrandingProvider } from "@/contexts/branding-context";
import { SuperAdminAuthProvider } from "@/contexts/super-admin-auth-context";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { IntlProvider } from "@/contexts/intl-provider";

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      theme={isDark ? "dark" : "light"}
      toastOptions={{
        classNames: {
          toast:
            "rounded-[14px] border border-loom-border bg-loom-surface font-sans text-loom-text-900 shadow-loom-xl",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <IntlProvider>
          <AuthProvider>
            <BrandingProvider>
            <SuperAdminAuthProvider>
              {children}
              <ThemedToaster />
            </SuperAdminAuthProvider>
            </BrandingProvider>
          </AuthProvider>
        </IntlProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
