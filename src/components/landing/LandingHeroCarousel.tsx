'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

type Slide = {
  title: string;
  description: string;
  image: string;
  tag: string;
};

type LandingHeroCarouselProps = {
  slides: Slide[];
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  stats: Array<{ value: string; label: string }>;
};

export function LandingHeroCarousel({
  slides,
  eyebrow,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  stats,
}: LandingHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5600);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const goTo = (index: number) => setActiveIndex(index);
  const goPrevious = () => setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden bg-[#111111] text-white"
      aria-label="STIC overview"
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 78vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(10,10,10,0.84)_20%,rgba(10,10,10,0.48)_55%,rgba(10,10,10,0.78)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,35,0.28),transparent_28%)]" />
          </div>
        ))}
      </div>

      <div className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-between px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-3 py-2 backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/82">{eyebrow}</span>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={goPrevious}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white transition hover:bg-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white transition hover:bg-white/10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-8 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,24rem)] lg:items-end lg:gap-12">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.34em] text-primary">{slides[activeIndex]?.tag}</p>
            <h1 className="mt-4 text-5xl font-semibold uppercase leading-[0.94] tracking-[0.04em] text-white sm:text-6xl xl:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">{description}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#areas"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover"
              >
                {primaryLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 bg-white/6 px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
              >
                {secondaryLabel}
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/10 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/56">Current focus</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">{slides[activeIndex]?.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/72">{slides[activeIndex]?.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[1.35rem] border border-white/10 bg-black/18 px-4 py-4">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => goTo(index)}
                className={`rounded-full border px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  index === activeIndex
                    ? 'border-primary bg-primary text-white'
                    : 'border-white/15 bg-white/6 text-white/72 hover:bg-white/10'
                }`}
              >
                {slide.tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={goPrevious}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white transition hover:bg-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white transition hover:bg-white/10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
