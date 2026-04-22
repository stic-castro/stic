import * as React from 'react';
import { cn } from '../lib/utils';

type LandingSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function LandingSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: LandingSectionProps) {
  return (
    <section className={cn("px-4 py-16 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-secondary sm:text-4xl dark:text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-7 text-secondary/72 dark:text-white/72">
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
