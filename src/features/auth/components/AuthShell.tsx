import Link from 'next/link';
import { ReactNode } from 'react';

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerActionLabel: string;
  footerActionHref: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  footerText,
  footerActionLabel,
  footerActionHref,
  children,
}: AuthShellProps) {
  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <section className="overflow-hidden rounded-[2rem] border border-secondary/8 bg-secondary text-white shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
          <div className="flex h-full flex-col justify-between px-6 py-8 sm:px-8 sm:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
              <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.02]">
                {title}
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/74 sm:text-base">
                {description}
              </p>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/10 sm:grid-cols-2">
              <div className="bg-white/6 px-5 py-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Access</p>
                <p className="mt-3 text-lg font-semibold">Industrial, automotive, and learning roles</p>
              </div>
              <div className="bg-white/6 px-5 py-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Security</p>
                <p className="mt-3 text-lg font-semibold">Email and password authentication</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-secondary/8 bg-white/86 p-6 shadow-sm backdrop-blur dark:bg-secondary/18 sm:p-8">
          {children}
          <div className="mt-8 border-t border-secondary/8 pt-6 text-sm text-secondary/72 dark:text-white/72">
            {footerText}{' '}
            <Link href={footerActionHref} className="font-semibold text-primary transition hover:text-primary-hover">
              {footerActionLabel}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
