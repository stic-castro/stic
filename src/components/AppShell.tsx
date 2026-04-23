'use client';

import * as React from 'react';
import type { SessionUser } from '../server/lib/auth';
import { AppSidebar } from './AppSidebar';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

type AppShellProps = {
  children: React.ReactNode;
  currentUser: SessionUser | null;
};

export function AppShell({ children, currentUser }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[22rem] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_56%)]" />
      <SiteHeader currentUser={currentUser} onOpenSidebar={() => setMobileSidebarOpen(true)} />

      <div className="flex w-full flex-1">
        <AppSidebar
          currentUser={currentUser}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1">{children}</main>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
