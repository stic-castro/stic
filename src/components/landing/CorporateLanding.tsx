'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Barlow_Condensed, Manrope } from 'next/font/google';
import { ArrowRight, BadgeCheck, Factory, Gauge, Handshake, ShieldCheck, Users, Wrench } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { LandingHeroCarousel } from './LandingHeroCarousel';

const headingFont = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const bodyFont = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export function CorporateLanding() {
  const { t } = useTranslation();

  const slides = [
    {
      title: t('landing.hero.slides.industrial.title'),
      description: t('landing.hero.slides.industrial.description'),
      image: '/landing/industrial-hero.jpg',
      tag: t('landing.hero.slides.industrial.tag'),
    },
    {
      title: t('landing.hero.slides.automotive.title'),
      description: t('landing.hero.slides.automotive.description'),
      image: '/landing/automotive-hero.jpg',
      tag: t('landing.hero.slides.automotive.tag'),
    },
    {
      title: t('landing.hero.slides.social.title'),
      description: t('landing.hero.slides.social.description'),
      image: '/landing/team-hero.jpg',
      tag: t('landing.hero.slides.social.tag'),
    },
  ];

  const stats = [
    { value: t('landing.hero.stats.projects.value'), label: t('landing.hero.stats.projects.label') },
    { value: t('landing.hero.stats.response.value'), label: t('landing.hero.stats.response.label') },
    { value: t('landing.hero.stats.coverage.value'), label: t('landing.hero.stats.coverage.label') },
  ];

  const whyChooseCards = [
    {
      icon: ShieldCheck,
      title: t('landing.whyChoose.cards.experience.title'),
      description: t('landing.whyChoose.cards.experience.description'),
    },
    {
      icon: Gauge,
      title: t('landing.whyChoose.cards.quality.title'),
      description: t('landing.whyChoose.cards.quality.description'),
    },
    {
      icon: Handshake,
      title: t('landing.whyChoose.cards.reliability.title'),
      description: t('landing.whyChoose.cards.reliability.description'),
    },
    {
      icon: Users,
      title: t('landing.whyChoose.cards.support.title'),
      description: t('landing.whyChoose.cards.support.description'),
    },
  ];

  const areas = [
    {
      image: '/landing/industrial-hero.jpg',
      title: t('landing.areas.cards.industrial.title'),
      description: t('landing.areas.cards.industrial.description'),
      badge: t('landing.areas.cards.industrial.badge'),
    },
    {
      image: '/landing/automotive-hero.jpg',
      title: t('landing.areas.cards.automotive.title'),
      description: t('landing.areas.cards.automotive.description'),
      badge: t('landing.areas.cards.automotive.badge'),
    },
    {
      image: '/landing/team-hero.jpg',
      title: t('landing.areas.cards.social.title'),
      description: t('landing.areas.cards.social.description'),
      badge: t('landing.areas.cards.social.badge'),
    },
  ];

  const serviceRows = [
    {
      icon: Factory,
      title: t('landing.services.rows.engineering.title'),
      description: t('landing.services.rows.engineering.description'),
    },
    {
      icon: Wrench,
      title: t('landing.services.rows.maintenance.title'),
      description: t('landing.services.rows.maintenance.description'),
    },
    {
      icon: BadgeCheck,
      title: t('landing.services.rows.delivery.title'),
      description: t('landing.services.rows.delivery.description'),
    },
  ];

  const projectHighlights = [
    t('landing.projects.items.one'),
    t('landing.projects.items.two'),
    t('landing.projects.items.three'),
  ];

  return (
    <div className={`${bodyFont.className} bg-[#ece7dd] text-[#161616]`}>
      <div className={headingFont.className}>
        <LandingHeroCarousel
          slides={slides}
          eyebrow={t('landing.hero.eyebrow')}
          title={t('landing.hero.title')}
          description={t('landing.hero.description')}
          primaryLabel={t('landing.hero.primaryCta')}
          secondaryLabel={t('landing.hero.secondaryCta')}
          stats={stats}
        />
      </div>

      <section id="why-choose" className="border-b border-black/8 bg-[#ece7dd] px-5 py-16 sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
            <div data-aos="fade-right">
              <p className={`${headingFont.className} text-sm font-semibold uppercase tracking-[0.34em] text-primary`}>
                {t('landing.whyChoose.eyebrow')}
              </p>
              <h2 className={`${headingFont.className} mt-4 text-5xl font-semibold uppercase leading-none tracking-[0.04em] text-[#1a1a1a] sm:text-6xl`}>
                {t('landing.whyChoose.title')}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[#262626]/72">{t('landing.whyChoose.description')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {whyChooseCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    data-aos="zoom-in"
                    style={{ ['--aos-delay' as string]: `${index * 90}ms` }}
                    className="rounded-[1.8rem] border border-black/8 bg-white/70 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className={`${headingFont.className} mt-6 text-3xl font-semibold uppercase tracking-[0.04em] text-[#1a1a1a]`}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#262626]/70">{card.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="areas" className="bg-[#f6f2eb] px-5 py-16 sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl" data-aos="fade-up">
            <p className={`${headingFont.className} text-sm font-semibold uppercase tracking-[0.34em] text-primary`}>
              {t('landing.areas.eyebrow')}
            </p>
            <h2 className={`${headingFont.className} mt-4 text-5xl font-semibold uppercase leading-none tracking-[0.04em] text-[#1a1a1a] sm:text-6xl`}>
              {t('landing.areas.title')}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#262626]/72">{t('landing.areas.description')}</p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-3">
            {areas.map((area, index) => (
              <article
                key={area.title}
                data-aos="fade-up"
                style={{ ['--aos-delay' as string]: `${index * 100}ms` }}
                className="overflow-hidden rounded-[2rem] border border-black/8 bg-[#171717] text-white shadow-[0_28px_80px_rgba(0,0,0,0.16)]"
              >
                <div className="relative h-72">
                  <Image src={area.image} alt={area.title} fill sizes="(max-width: 1280px) 100vw, 33vw" className="object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.72))]" />
                  <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#171717]">
                    {area.badge}
                  </div>
                </div>
                <div className="px-5 py-6">
                  <h3 className={`${headingFont.className} text-3xl font-semibold uppercase tracking-[0.04em] text-white`}>
                    {area.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">{area.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="strengths" className="border-y border-black/8 bg-[#111111] px-5 py-16 text-white sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <div data-aos="fade-right" className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur sm:p-8">
            <p className={`${headingFont.className} text-sm font-semibold uppercase tracking-[0.34em] text-primary`}>
              {t('landing.strengths.eyebrow')}
            </p>
            <h2 className={`${headingFont.className} mt-4 text-5xl font-semibold uppercase leading-none tracking-[0.04em] text-white sm:text-6xl`}>
              {t('landing.strengths.title')}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/74">{t('landing.strengths.description')}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/18 px-5 py-5">
                <p className={`${headingFont.className} text-4xl font-semibold uppercase text-white`}>{t('landing.strengths.stats.projects.value')}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">{t('landing.strengths.stats.projects.label')}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/18 px-5 py-5">
                <p className={`${headingFont.className} text-4xl font-semibold uppercase text-white`}>{t('landing.strengths.stats.experience.value')}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">{t('landing.strengths.stats.experience.label')}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/18 px-5 py-5">
                <p className={`${headingFont.className} text-4xl font-semibold uppercase text-white`}>{t('landing.strengths.stats.clients.value')}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">{t('landing.strengths.stats.clients.label')}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {serviceRows.map((row, index) => {
              const Icon = row.icon;

              return (
                <article
                  key={row.title}
                  data-aos="fade-up"
                  style={{ ['--aos-delay' as string]: `${index * 90}ms` }}
                  className="rounded-[1.9rem] border border-white/10 bg-white/6 p-6 backdrop-blur"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`${headingFont.className} mt-6 text-3xl font-semibold uppercase tracking-[0.04em] text-white`}>
                    {row.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">{row.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#ece7dd] px-5 py-16 sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] xl:items-start">
            <div data-aos="fade-right">
              <p className={`${headingFont.className} text-sm font-semibold uppercase tracking-[0.34em] text-primary`}>
                {t('landing.services.eyebrow')}
              </p>
              <h2 className={`${headingFont.className} mt-4 text-5xl font-semibold uppercase leading-none tracking-[0.04em] text-[#1a1a1a] sm:text-6xl`}>
                {t('landing.services.title')}
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#262626]/72">{t('landing.services.description')}</p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div data-aos="fade-up" className="rounded-[1.8rem] border border-black/8 bg-white/72 p-6">
                  <p className={`${headingFont.className} text-3xl font-semibold uppercase tracking-[0.04em] text-[#1a1a1a]`}>
                    {t('landing.services.columns.productsTitle')}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#262626]/70">{t('landing.services.columns.productsDescription')}</p>
                </div>
                <div
                  data-aos="fade-up"
                  style={{ ['--aos-delay' as string]: '90ms' }}
                  className="rounded-[1.8rem] border border-black/8 bg-white/72 p-6"
                >
                  <p className={`${headingFont.className} text-3xl font-semibold uppercase tracking-[0.04em] text-[#1a1a1a]`}>
                    {t('landing.services.columns.certificationsTitle')}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#262626]/70">{t('landing.services.columns.certificationsDescription')}</p>
                </div>
              </div>
            </div>

            <div data-aos="fade-left" className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_28px_70px_rgba(0,0,0,0.08)]">
              <div className="border-b border-black/8 px-6 py-5">
                <p className={`${headingFont.className} text-3xl font-semibold uppercase tracking-[0.04em] text-[#1a1a1a]`}>
                  {t('landing.services.panelTitle')}
                </p>
              </div>
              <div className="space-y-4 px-6 py-6">
                {projectHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3 rounded-[1.35rem] bg-[#f5f1e8] px-4 py-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-sm leading-7 text-[#262626]/72">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="bg-[#f6f2eb] px-5 py-16 sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div data-aos="fade-right" className="rounded-[2rem] border border-black/8 bg-[#171717] p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.16)] sm:p-8">
            <p className={`${headingFont.className} text-sm font-semibold uppercase tracking-[0.34em] text-primary`}>
              {t('landing.projects.eyebrow')}
            </p>
            <h2 className={`${headingFont.className} mt-4 text-5xl font-semibold uppercase leading-none tracking-[0.04em] text-white sm:text-6xl`}>
              {t('landing.projects.title')}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/74">{t('landing.projects.description')}</p>
            <div className="mt-8">
              <Link
                href="/jobs"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-primary-hover"
              >
                {t('landing.projects.primaryCta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article data-aos="fade-up" className="rounded-[1.8rem] border border-black/8 bg-white/74 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">{t('landing.projects.cards.delivery.label')}</p>
              <p className={`${headingFont.className} mt-4 text-3xl font-semibold uppercase tracking-[0.04em] text-[#1a1a1a]`}>
                {t('landing.projects.cards.delivery.title')}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#262626]/70">{t('landing.projects.cards.delivery.description')}</p>
            </article>
            <article
              data-aos="fade-up"
              style={{ ['--aos-delay' as string]: '90ms' }}
              className="rounded-[1.8rem] border border-black/8 bg-white/74 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">{t('landing.projects.cards.control.label')}</p>
              <p className={`${headingFont.className} mt-4 text-3xl font-semibold uppercase tracking-[0.04em] text-[#1a1a1a]`}>
                {t('landing.projects.cards.control.title')}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#262626]/70">{t('landing.projects.cards.control.description')}</p>
            </article>
            <article
              data-aos="fade-up"
              style={{ ['--aos-delay' as string]: '180ms' }}
              className="rounded-[1.8rem] border border-black/8 bg-white/74 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">{t('landing.projects.cards.community.label')}</p>
              <p className={`${headingFont.className} mt-4 text-3xl font-semibold uppercase tracking-[0.04em] text-[#1a1a1a]`}>
                {t('landing.projects.cards.community.title')}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#262626]/70">{t('landing.projects.cards.community.description')}</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
