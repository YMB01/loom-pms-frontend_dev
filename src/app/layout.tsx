import type { Metadata } from "next";
import { DM_Mono, Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { themeInitScript } from "@/lib/theme-init-script";
import { localeInitScript } from "@/lib/locale-init-script";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const notoEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-ethiopic",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Loom PMS",
  description: "AI-powered property management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.className} ${plusJakarta.variable} ${notoEthiopic.variable} ${dmMono.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script id="loom-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <Script id="loom-locale-init" strategy="beforeInteractive">
          {localeInitScript}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
