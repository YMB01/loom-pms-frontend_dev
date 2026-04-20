import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin · Loom PMS",
  description: "System owner console",
};

export default function SuperAdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
