import type { Metadata } from "next";
import "./globals.css";
import { AosProvider } from "../components/AosProvider";
import { AppShell } from "../components/AppShell";
import { I18nProvider } from "../lib/i18n";
import { ToastProvider } from "../components/ToastProvider";
import { getCurrentUserFromCookies } from "../server/lib/current-user";

export const metadata: Metadata = {
  title: "STIC",
  description: "Automotive workshop progress tracking for mechanics and owners.",
  icons: {
    icon: [{ url: "/icon-logo.png", type: "image/png" }],
    shortcut: ["/icon-logo.png"],
    apple: [{ url: "/icon-logo.png", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUserFromCookies();

  return (
    <html lang="en" className="h-full antialiased" data-theme="light" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <I18nProvider>
          <ToastProvider>
            <AosProvider />
            <AppShell currentUser={currentUser}>{children}</AppShell>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
