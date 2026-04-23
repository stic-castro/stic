'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

export function AosProvider() {
  const pathname = usePathname();

  React.useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-aos]'));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.setAttribute('data-aos-visible', 'true');
            observer.unobserve(target);
          }
        }
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
