'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CarFront, Factory, GraduationCap } from 'lucide-react';
import { Button } from '../components/Button';
import { LandingSection } from '../components/LandingSection';
import { LandingShowcaseCarousel } from '../components/LandingShowcaseCarousel';
import { useTranslation } from '../lib/i18n';

export default function Home() {
  const { t } = useTranslation();

  const pillars = [
    {
      icon: Factory,
      title: t('pillars.industrialTitle'),
      description: t('pillars.industrialDescription'),
    },
    {
      icon: CarFront,
      title: t('pillars.automotiveTitle'),
      description: t('pillars.automotiveDescription'),
    },
    {
      icon: GraduationCap,
      title: t('pillars.learningTitle'),
      description: t('pillars.learningDescription'),
    },
  ];

  const slides = [
    {
      title: t('slides.oneTitle'),
      description: t('slides.oneDescription'),
      stat: t('slides.oneStat'),
      image: '/landing/industrial-hero.jpg',
    },
    {
      title: t('slides.twoTitle'),
      description: t('slides.twoDescription'),
      stat: t('slides.twoStat'),
      image: '/landing/automotive-hero.jpg',
    },
    {
      title: t('slides.threeTitle'),
      description: t('slides.threeDescription'),
      stat: t('slides.threeStat'),
      image: '/landing/team-hero.jpg',
    },
  ];

  return (
    <div className="pb-12">
      <section className="px-4 pb-10 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              {t('headline.eyebrow')}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-secondary sm:text-5xl lg:text-[4.1rem] lg:leading-[0.98] dark:text-white">
              {t('headline.title')}
            </h1>
            <p className="mt-5 text-base leading-8 text-secondary/70 dark:text-white/70">
              {t('headline.description')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/jobs">
                <Button className="w-full rounded-full px-6 sm:w-auto">
                  {t('headline.primary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/jobs/new">
                <Button variant="outline" className="w-full rounded-full border-secondary/14 bg-white/80 px-6 sm:w-auto">
                  {t('headline.secondary')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-secondary/8 bg-secondary shadow-[0_30px_80px_rgba(0,0,0,0.14)]">
            <div className="relative min-h-[20rem] sm:min-h-[26rem]">
              <Image
                src="/landing/automotive-hero.jpg"
                alt={t('headline.title')}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.48),rgba(0,0,0,0.12))]" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <LandingShowcaseCarousel
            eyebrow={t('showcase.eyebrow')}
            title={t('showcase.title')}
            description={t('showcase.description')}
            slides={slides}
            previousLabel={t('showcase.previous')}
            nextLabel={t('showcase.next')}
            keySignalLabel={t('showcase.keySignal')}
          />
        </div>
      </section>

      <LandingSection
        eyebrow={t('minimal.sectionEyebrow')}
        title={t('minimal.sectionTitle')}
        description={t('minimal.sectionDescription')}
        className="py-14"
      >
        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-secondary/8 bg-secondary/8 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <div
                key={pillar.title}
                className="bg-background px-6 py-8 dark:bg-background"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-secondary dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-secondary/68 dark:text-white/68">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </LandingSection>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[2rem] border border-secondary/8 bg-secondary shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
            <div className="relative min-h-[18rem] sm:min-h-[24rem]">
              <Image
                src="/landing/team-hero.jpg"
                alt={t('minimal.impactTitle')}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.42))]" />
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              {t('minimal.impactEyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-secondary sm:text-4xl dark:text-white">
              {t('minimal.impactTitle')}
            </h2>
            <p className="mt-4 text-base leading-8 text-secondary/70 dark:text-white/70">
              {t('minimal.impactDescription')}
            </p>

            <div className="mt-8 space-y-4">
              {[t('minimal.impactPointOne'), t('minimal.impactPointTwo'), t('minimal.impactPointThree')].map((point) => (
                <div
                  key={point}
                  className="rounded-[1.5rem] border border-secondary/8 bg-white/78 px-5 py-4 text-sm leading-7 text-secondary/72 shadow-sm backdrop-blur dark:bg-secondary/18 dark:text-white/72"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] border border-secondary/8 bg-secondary px-6 py-10 text-white shadow-[0_28px_80px_rgba(0,0,0,0.18)] sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              {t('cta.eyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t('cta.title')}
            </h2>
            <p className="mt-4 text-base leading-8 text-white/74">
              {t('cta.description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/jobs">
              <Button className="w-full rounded-full bg-primary px-6 text-white hover:bg-primary-hover sm:w-auto">
                {t('cta.primary')}
              </Button>
            </Link>
            <Link href="/api-doc">
              <Button variant="outline" className="w-full rounded-full border-white/16 bg-transparent px-6 text-white hover:bg-white/10 sm:w-auto">
                {t('cta.secondary')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
