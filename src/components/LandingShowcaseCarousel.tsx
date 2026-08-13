'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './Button';
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
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export function LandingShowcaseCarousel({
  eyebrow,
  title,
  description,
  slides,
  previousLabel,
  nextLabel,
  keySignalLabel,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: LandingShowcaseCarouselProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const goToNext = React.useEffectEvent(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  });

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      goToNext();
    }, 5200);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <div className="overflow-hidden rounded-[2.25rem] bg-[#111111] text-white shadow-[0_34px_90px_rgba(0,0,0,0.22)]">
      <div className="grid min-h-[40rem] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[23rem] lg:min-h-full">
          <Image
            src={activeSlide.image}
            alt={activeSlide.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(0,0,0,0.82),rgba(0,0,0,0.34),rgba(0,0,0,0.18))]" />

          <div className="relative flex h-full flex-col justify-between px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[4.25rem] lg:leading-[0.98]">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/74 sm:text-base">
                {description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={primaryHref}>
                  <Button className="w-full rounded-full px-6 sm:w-auto">
                    {primaryLabel}
                  </Button>
                </Link>
                <Link href={secondaryHref}>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-white/16 bg-white/6 px-6 text-white hover:bg-white/12 sm:w-auto"
                  >
                    {secondaryLabel}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-10 max-w-xl rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/72">
                  0{activeIndex + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/6 text-white transition hover:bg-white/14"
                    aria-label={previousLabel}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-white/6 text-white transition hover:bg-white/14"
                    aria-label={nextLabel}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">{activeSlide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/74 sm:text-base">{activeSlide.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between bg-[linear-gradient(180deg,#191919,#111111)] px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">{keySignalLabel}</p>
            <p className="mt-4 text-3xl font-semibold leading-tight text-white">{activeSlide.stat}</p>
            <div className="mt-8 h-px w-full bg-white/10" />
          </div>

          <div className="mt-10 space-y-5">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={cn(
                    'w-full rounded-[1.5rem] px-4 py-4 text-left transition',
                    isActive
                      ? 'bg-white text-secondary shadow-[0_18px_50px_rgba(0,0,0,0.18)]'
                      : 'bg-white/4 text-white hover:bg-white/8'
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={cn('text-xs font-semibold uppercase tracking-[0.22em]', isActive ? 'text-primary' : 'text-white/48')}>
                        0{index + 1}
                      </p>
                      <p className={cn('mt-2 text-base font-semibold', isActive ? 'text-secondary' : 'text-white')}>
                        {slide.title}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {slides.map((_, dotIndex) => (
                        <span
                          key={`${slide.title}-${dotIndex}`}
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            dotIndex <= index ? 'w-6' : 'w-2',
                            isActive && dotIndex <= index ? 'bg-primary' : 'bg-white/20'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
