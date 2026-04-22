'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export type LandingSlide = {
  title: string;
  description: string;
  stat: string;
  image: string;
};

type LandingShowcaseCarouselProps = {
  eyebrow: string;
  title: string;
  description: string;
  slides: LandingSlide[];
  previousLabel: string;
  nextLabel: string;
  keySignalLabel: string;
};

export function LandingShowcaseCarousel({
  eyebrow,
  title,
  description,
  slides,
  previousLabel,
  nextLabel,
  keySignalLabel,
}: LandingShowcaseCarouselProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-secondary/8 bg-secondary text-white shadow-[0_28px_80px_rgba(0,0,0,0.18)]">
      <div className="grid lg:grid-cols-[1.45fr_0.55fr]">
        <div className="relative min-h-[25rem] sm:min-h-[32rem]">
          <Image
            src={activeSlide.image}
            alt={activeSlide.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.68),rgba(0,0,0,0.26),rgba(0,0,0,0.12))]" />

          <div className="relative flex min-h-[25rem] flex-col justify-between px-6 py-7 sm:min-h-[32rem] sm:px-8 sm:py-8">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/72">{eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.02]">
                {title}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/76 sm:text-base">
                {description}
              </p>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex rounded-full border border-white/18 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/86">
                0{activeIndex + 1}
              </div>
              <h3 className="mt-5 text-2xl font-semibold sm:text-3xl">{activeSlide.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/76 sm:text-base">
                {activeSlide.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(32,32,32,1))] px-6 py-6 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">{keySignalLabel}</p>
            <p className="mt-4 text-2xl font-semibold leading-tight text-white">{activeSlide.stat}</p>
          </div>

          <div className="mt-10">
            <div className="flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === activeIndex ? "w-12 bg-primary" : "w-6 bg-white/18 hover:bg-white/32"
                  )}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/5 text-white transition hover:bg-white/12"
                aria-label={previousLabel}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/5 text-white transition hover:bg-white/12"
                aria-label={nextLabel}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
