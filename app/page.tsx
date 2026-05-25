'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { SplineScene } from '@/components/ui/spline';

/* ─── Animation helpers ─────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.1, ease: 'easeOut' } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.14 } },
};

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-[#100c08]/92 backdrop-blur-xl border-b border-white/[0.045]'
          : 'bg-transparent'
      }`}
      style={scrolled ? { boxShadow: '0 1px 40px rgba(0,0,0,0.5)' } : {}}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-display text-[1.15rem] font-light text-[#f5f0eb] tracking-[0.22em] uppercase flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-300">
          <span className="text-[#95122c] text-[0.7rem]">✦</span>
          MASPERA
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { href: '#services',    label: 'Services' },
            { href: '#experience',  label: 'Experience' },
            { href: '#atmosphere',  label: 'Studio' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-[0.6rem] tracking-[0.28em] uppercase text-[#a09080]/70 hover:text-[#f5f0eb] transition-colors duration-300 relative group"
            >
              {label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#95122c] group-hover:w-full transition-all duration-400" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/book"
          className="btn btn-outline btn-sm"
        >
          Book Now
        </Link>
      </div>
    </motion.nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */

/* Ease that feels like a luxury brand reveal */
const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function HeroLine({ delay, className = '' }: { delay: number; className?: string }) {
  return (
    <motion.div
      className={`h-px bg-white/[0.10] origin-left ${className}`}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 1.4, delay, ease: EASE_EXPO }}
    />
  );
}

function HeroWord({
  children,
  delay,
  className = '',
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        className={className}
        initial={{ y: '108%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.15, delay, ease: EASE_EXPO }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const y       = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden bg-[#100c08] grain"
    >
      {/* ── Atmosphere ───────────────────────────────── */}
      {/* Primary burgundy — deep bottom-left sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 110% 70% at 10% 105%, rgba(149,18,44,0.30) 0%, transparent 60%)',
        }}
      />
      {/* Secondary — right-side mid-height hint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 55% at 95% 55%, rgba(149,18,44,0.09) 0%, transparent 65%)',
        }}
      />
      {/* Top crown glow */}
      <div
        className="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(149,18,44,0.06) 0%, transparent 75%)',
        }}
      />
      {/* Fine horizontal scanlines texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.022) 80px)',
          opacity: 1,
        }}
      />
      {/* Vignette corners */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(10,8,6,0.65) 100%)',
        }}
      />

      {/* ── Corner ornament ──────────────────────────── */}
      <motion.div
        className="absolute top-28 right-8 lg:right-14 z-20 hidden md:flex flex-col items-end gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.6 }}
      >
        <span
          className="font-display italic text-[#f5f0eb]/08 select-none"
          style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', lineHeight: 1 }}
        >
          01
        </span>
        <span
          className="label-overline opacity-20"
          style={{ writingMode: 'horizontal-tb', letterSpacing: '0.3em' }}
        >
          Collection
        </span>
      </motion.div>

      {/* ── Vertical side text ───────────────────────── */}
      <motion.div
        className="absolute left-5 bottom-32 z-20 hidden xl:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        <span className="label-overline opacity-15 tracking-[0.5em]">
          Premium Grooming Studio
        </span>
      </motion.div>

      {/* ── Scrolling content wrapper ─────────────────── */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col justify-between flex-1 px-8 lg:px-14 xl:px-20 pt-32 pb-28 max-w-[1400px] mx-auto w-full"
      >
        {/* Pre-header */}
        <motion.div
          className="flex items-center justify-between mb-10 md:mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.25 }}
        >
          <span className="label-overline opacity-35">Est. 2024</span>
          <span className="label-overline opacity-25 hidden sm:block">
            Precision · Ritual · Craft
          </span>
        </motion.div>

        {/* ── Top rule ── */}
        <HeroLine delay={0.35} className="mb-10 md:mb-14" />

        {/* ── Headline ── */}
        <div className="mb-0">
          {/* PRECISION */}
          <HeroWord delay={0.55}>
            <h1
              className="font-display font-light text-[#f5f0eb] leading-[0.88] tracking-[-0.025em]"
              style={{ fontSize: 'clamp(4.5rem, 13.5vw, 12rem)' }}
            >
              PRECISION
            </h1>
          </HeroWord>

          {/* Cuts. — offset right for editorial depth */}
          <HeroWord delay={0.72}>
            <div
              className="font-display italic text-[#95122c] leading-[0.85] pl-4 md:pl-10 lg:pl-16"
              style={{ fontSize: 'clamp(3.8rem, 11.5vw, 10.2rem)' }}
            >
              Cuts.
            </div>
          </HeroWord>
        </div>

        {/* ── Mid rule ── */}
        <HeroLine delay={1.1} className="mt-10 md:mt-14 mb-8 md:mb-10" />

        {/* ── Lower content ── */}
        <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-0 justify-between">
          {/* Left — descriptor */}
          <motion.div
            className="max-w-xs lg:max-w-sm"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p
              className="label-overline mb-3"
              style={{ color: 'rgba(149,18,44,0.65)' }}
            >
              Cinematic Confidence
            </p>
            <p className="text-[#a09080]/65 text-sm leading-relaxed">
              A premium grooming experience built around
              <br className="hidden sm:block" /> detail, ritual, and presence.
            </p>
          </motion.div>

          {/* Right — metadata grid (desktop only) */}
          <motion.div
            className="hidden lg:grid grid-cols-2 gap-x-10 gap-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.35 }}
          >
            {[
              ['Studio',    'Tel Aviv'],
              ['Est.',      '2024'],
              ['Approach',  'Master Craft'],
              ['Service',   'By Appointment'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-2">
                <span className="label-overline opacity-20">{k}</span>
                <span className="label-overline opacity-35 text-[#a09080]">{v}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── CTAs ── */}
        <motion.div
          className="mt-10 md:mt-12 flex flex-col sm:flex-row items-start gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.45, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link href="/book" className="btn btn-primary">
            Reserve Your Appointment
          </Link>
          <a href="#services" className="btn btn-ghost">
            Explore Services
          </a>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1.2 }}
      >
        <motion.div
          className="w-px h-14 bg-gradient-to-b from-transparent via-[#95122c]/55 to-transparent"
          animate={{ scaleY: [0.6, 1.1, 0.6], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="label-overline opacity-20">Scroll</span>
      </motion.div>
    </section>
  );
}

/* ─── Marquee ─────────────────────────────────────────────────── */

function Marquee() {
  const items = ['PRECISION', 'CRAFT', 'RITUAL', 'EXCELLENCE', 'GROOMING', 'DETAIL', 'PRESENCE', 'MASTERY'];

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-[#0e0a07] py-4">
      <motion.div
        animate={{ x: [0, -50 * items.length * 2] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="flex gap-0 whitespace-nowrap"
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="text-[#f5f0eb]/15 text-xs tracking-[0.4em] uppercase px-8 font-light">
              {item}
            </span>
            <span className="text-[#95122c]/40 text-[8px]">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Container Scroll Section ───────────────────────────────── */

function ScrollStorySection() {
  return (
    <section className="bg-[#100c08] grain">
      <ContainerScroll
        titleComponent={
          <div>
            <AnimatedSection>
              <p className="text-[#95122c] tracking-[0.35em] text-[10px] uppercase mb-4">The Craft</p>
              <h2 className="font-display font-light text-[#f5f0eb] leading-tight mb-4"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
                The Art of the Cut
              </h2>
              <p className="text-[#a09080] text-sm max-w-lg mx-auto leading-relaxed">
                Every session is a ritual. A ceremony of precision where technique meets artistry,
                transforming the ordinary into the extraordinary.
              </p>
            </AnimatedSection>
          </div>
        }
      >
        {/* The "screen" content — luxury barbershop imagery */}
        <div className="relative w-full" style={{ height: 'clamp(320px, 50vw, 580px)' }}>
          {/* Gradient overlay for cinematic feel */}
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(16,12,8,0.3) 0%, transparent 30%, transparent 70%, rgba(16,12,8,0.5) 100%)' }}
          />
          {/* Center glow */}
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(149,18,44,0.08) 0%, transparent 70%)' }}
          />

          {/* Luxury barber interior */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1400&q=85&auto=format&fit=crop"
            alt="Luxury barbershop interior"
            className="w-full h-full object-cover object-center"
          />

          {/* Floating label */}
          <div className="absolute bottom-6 left-6 z-20">
            <p className="text-[#f5f0eb]/60 text-[10px] tracking-[0.3em] uppercase">Studio · Craftsmanship · Ritual</p>
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}

/* ─── Spline 3D Section ──────────────────────────────────────── */

function SplineSection() {
  return (
    <section id="experience" className="relative bg-[#0e0a07] py-24 px-4 grain overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 60% 50%, rgba(149,18,44,0.12) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="border border-white/8 rounded-2xl overflow-hidden bg-[#100c08]/60 backdrop-blur-sm"
          style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <div className="grid md:grid-cols-2 min-h-[520px]">
            {/* Left — content */}
            <div className="flex flex-col justify-center px-10 py-14 border-b md:border-b-0 md:border-r border-white/8">
              <AnimatedSection>
                <p className="text-[#95122c] tracking-[0.35em] text-[10px] uppercase mb-6">
                  Interactive Experience
                </p>
                <h2 className="font-display font-light text-[#f5f0eb] leading-tight mb-6"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
                  Crafted<br />
                  <span className="italic text-[#95122c]">by Hand.</span>
                </h2>
                <p className="text-[#a09080] text-sm leading-relaxed mb-8 max-w-xs">
                  Every cut is a conversation between the craftsman and the canvas.
                  Precision tools. Practiced hands. Uncompromising standards.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Master Barbers', value: '8+ Years Avg.' },
                    { label: 'Premium Tools', value: 'Hand-Selected' },
                    { label: 'Satisfaction', value: '100% Ritual' },
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-[#a09080] text-xs tracking-wider uppercase">{stat.label}</span>
                      <span className="text-[#f5f0eb] text-xs tracking-wider">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-10">
                  <Link
                    href="/book"
                    className="inline-block px-8 py-3.5 bg-[#95122c] text-white text-xs tracking-widest uppercase hover:bg-[#be1a3f] transition-colors duration-300"
                  >
                    Book Your Session
                  </Link>
                </div>
              </AnimatedSection>
            </div>

            {/* Right — Spline 3D */}
            <div className="relative flex items-center justify-center" style={{ minHeight: 400 }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(149,18,44,0.08) 0%, transparent 70%)' }}
              />
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Services Section ───────────────────────────────────────── */

/* serviceId matches the DB seed order: 1=תספורת, 2=עיצוב זקן, 3=תספורת+זקן */
const services = [
  {
    serviceId: 1,
    name: 'The Signature Cut',
    tagline: 'Precision defined.',
    description: 'A masterfully tailored haircut, shaped to your face and lifestyle. Includes consultation, wash, cut, and finish.',
    duration: '45 min',
    price: 'From ₪90',
    icon: '✦',
  },
  {
    serviceId: 2,
    name: 'The Beard Ritual',
    tagline: 'Sculpted to perfection.',
    description: 'Hot towel, precision sculpt, shaping and conditioning. A ceremony for the discerning gentleman.',
    duration: '30 min',
    price: 'From ₪65',
    icon: '◆',
  },
  {
    serviceId: 3,
    name: 'Full Grooming Ritual',
    tagline: 'The complete experience.',
    description: 'Signature cut, beard sculpt, scalp massage, and styling. Reserved for those who refuse to compromise.',
    duration: '90 min',
    price: 'From ₪180',
    icon: '◈',
  },
];

function ServicesSection() {
  return (
    <section id="services" className="relative bg-[#100c08] py-32 px-4 grain overflow-hidden">
      {/* Top / bottom dividers */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#95122c]/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#95122c]/15 to-transparent" />

      {/* Section ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(149,18,44,0.07) 0%, transparent 65%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-20">
          <p className="label-overline mb-5">Our Services</p>
          <h2 className="font-display font-light text-[#f5f0eb] leading-[0.95]"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 4.8rem)' }}>
            Choose Your<br />
            <span className="italic text-[#95122c]">Ritual</span>
          </h2>
        </AnimatedSection>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-px bg-white/[0.045] border border-white/[0.07] rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
          {services.map((svc, i) => (
            <AnimatedSection key={svc.name} delay={i * 0.1}>
              <div className="group relative bg-[#100c08] p-8 md:p-9 h-full flex flex-col transition-colors duration-500 hover:bg-[#1a0d10] cursor-default">
                {/* Hover bottom-up glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600 pointer-events-none rounded-none"
                  style={{ background: 'radial-gradient(ellipse 100% 70% at 50% 110%, rgba(149,18,44,0.13) 0%, transparent 65%)' }} />
                {/* Top accent line — animates in on hover */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#95122c]/0 to-transparent group-hover:via-[#95122c]/55 transition-all duration-500" />

                {/* Icon */}
                <div className="text-[#95122c]/35 text-[1.6rem] mb-7 group-hover:text-[#95122c]/75 transition-colors duration-400 select-none">
                  {svc.icon}
                </div>

                {/* Labels */}
                <p className="label-overline mb-2.5" style={{ color: 'rgba(149,18,44,0.7)' }}>{svc.tagline}</p>
                <h3 className="font-display font-light text-[#f5f0eb] text-[1.55rem] mb-4 leading-tight tracking-tight">
                  {svc.name}
                </h3>
                <p className="text-[#a09080] text-sm leading-relaxed mb-9 flex-1">
                  {svc.description}
                </p>

                {/* Footer row */}
                <div className="border-t border-white/[0.07] pt-5 flex items-center justify-between">
                  <div>
                    <p className="text-[#f5f0eb] text-sm font-medium tracking-wide">{svc.price}</p>
                    <p className="text-[#a09080]/60 text-xs mt-0.5 tracking-wide">{svc.duration}</p>
                  </div>
                  <Link href={`/book?serviceId=${svc.serviceId}`} className="btn btn-outline btn-sm">
                    Book
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Atmosphere Section ─────────────────────────────────────── */

const atmosphereWords = ['Ritual.', 'Precision.', 'Presence.', 'Confidence.'];

function AtmosphereSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="atmosphere" className="relative bg-[#0e0a07] py-32 px-4 overflow-hidden grain">
      {/* Large burgundy glow center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(149,18,44,0.1) 0%, transparent 70%)' }}
      />

      {/* Large background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span
          className="font-display font-light text-white/[0.015] leading-none tracking-tighter"
          style={{ fontSize: 'clamp(8rem, 30vw, 28rem)' }}
        >
          CRAFT
        </span>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Image strip */}
        <AnimatedSection className="mb-20 overflow-hidden rounded-xl border border-white/8">
          <div className="grid grid-cols-3 h-48 md:h-72">
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80&auto=format&fit=crop"
                alt="Barber tools"
                className="w-full h-full object-cover object-center grayscale opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0e0a07]/80 to-transparent" />
            </div>
            <div className="relative overflow-hidden border-x border-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80&auto=format&fit=crop"
                alt="Barber at work"
                className="w-full h-full object-cover object-center grayscale opacity-70"
              />
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at center, rgba(149,18,44,0.15) 0%, transparent 70%)' }}
              />
            </div>
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80&auto=format&fit=crop"
                alt="Premium salon atmosphere"
                className="w-full h-full object-cover object-center grayscale opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#0e0a07]/80 to-transparent" />
            </div>
          </div>
        </AnimatedSection>

        {/* Floating keyword lines */}
        <div ref={ref} className="text-center">
          {atmosphereWords.map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1.1, delay: i * 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span
                className="font-display font-light text-[#f5f0eb]/80 block leading-tight"
                style={{ fontSize: 'clamp(2.5rem, 9vw, 7rem)' }}
              >
                {word}
              </span>
            </motion.div>
          ))}
        </div>

        <AnimatedSection className="text-center mt-12" delay={0.4}>
          <p className="text-[#a09080] text-sm tracking-wider max-w-sm mx-auto leading-relaxed">
            We believe grooming is more than appearance — it's a statement of how you carry yourself through the world.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="relative bg-[#100c08] py-36 px-4 grain overflow-hidden">
      {/* Strong center glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 100%, rgba(149,18,44,0.28) 0%, transparent 65%)' }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#95122c]/40 to-transparent" />

      {/* Decorative lines */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-[#95122c]/20 to-transparent" />
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-[#95122c]/20 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <AnimatedSection>
          <p className="text-[#95122c] tracking-[0.4em] text-[10px] uppercase mb-6">
            Reserve Your Seat
          </p>
          <h2 className="font-display font-light text-[#f5f0eb] leading-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}>
            Your Next<br />
            <span className="italic text-[#95122c]">Appointment</span><br />
            Awaits.
          </h2>
          <p className="text-[#a09080] text-sm leading-relaxed max-w-sm mx-auto mb-12">
            Reserve your place in a tradition of excellence. A few minutes to book.
            A lifetime of confidence.
          </p>

          <Link
            href="/book"
            className="btn btn-primary inline-flex items-center gap-4 px-14 py-5"
            style={{ fontSize: '0.65rem', letterSpacing: '0.28em' }}
          >
            <span>Book Your Experience</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-base leading-none opacity-70"
            >
              →
            </motion.span>
          </Link>

          <div className="mt-8 flex items-center justify-center gap-8 text-[#a09080]/40 text-[10px] tracking-widest uppercase">
            <span>Premium Studio</span>
            <span className="text-[#95122c]/30">✦</span>
            <span>Master Craft</span>
            <span className="text-[#95122c]/30">✦</span>
            <span>Pure Ritual</span>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="relative bg-[#0a0806] overflow-hidden">
      {/* Top divider */}
      <div className="divider-burgundy opacity-50" />

      {/* Ambient foot-glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(149,18,44,0.06) 0%, transparent 70%)' }} />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-14">
        {/* Main footer row */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          {/* Brand */}
          <div>
            <a href="#" className="font-display text-[1.05rem] font-light text-[#f5f0eb]/55 tracking-[0.22em] uppercase flex items-center gap-2.5 hover:text-[#f5f0eb]/80 transition-colors duration-300">
              <span className="text-[#95122c]/60 text-[0.6rem]">✦</span>
              MASPERA
            </a>
            <p className="text-[#a09080]/35 text-[0.58rem] tracking-[0.3em] uppercase mt-2">
              Premium Grooming Studio
            </p>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-8">
            {['#services', '#experience', '#atmosphere'].map((href, i) => (
              <a key={href} href={href}
                className="text-[0.58rem] tracking-[0.25em] uppercase text-[#a09080]/35 hover:text-[#a09080]/70 transition-colors duration-300">
                {['Services', 'Experience', 'Studio'][i]}
              </a>
            ))}
          </div>

          {/* Book CTA */}
          <Link href="/book" className="btn btn-outline btn-sm opacity-70 hover:opacity-100">
            Reserve
          </Link>
        </div>

        {/* Bottom micro row */}
        <div className="mt-10 pt-6 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-[#a09080]/25 text-[0.55rem] tracking-[0.25em] uppercase">© 2024 All rights reserved</p>
          <a href="/admin" className="text-[#a09080]/15 hover:text-[#a09080]/35 text-[0.55rem] tracking-[0.2em] uppercase transition-colors duration-300">
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div dir="ltr" className="bg-[#100c08]">
      <Navbar />
      <Hero />
      <Marquee />
      <ScrollStorySection />
      <SplineSection />
      <ServicesSection />
      <AtmosphereSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
