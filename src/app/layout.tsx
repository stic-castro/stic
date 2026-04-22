import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "../lib/i18n";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { ToastProvider } from "../components/ToastProvider";
import { getCurrentUserFromCookies } from "../server/lib/current-user";

export const metadata: Metadata = {
  title: "STIC Motors",
  description: "Automotive workshop progress tracking for mechanics and owners.",
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
            <div className="relative flex min-h-screen flex-col overflow-x-clip">
              <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[22rem] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_56%)]" />
              <SiteHeader currentUser={currentUser} />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
