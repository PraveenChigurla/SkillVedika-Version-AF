'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactInfo({
  targetLabel,
  title,
  subtitle,
  emailLabel,
  emailId,
  emailLink,
  phoneLabel,
  phoneNumber,
  phoneLink,
  location1Label,
  location1Address,
  location1Link,
  location2Label,
  location2Address,
  location2Link,
}: any) {
  const hasParts = Boolean(
    (title?.part1 && title.part1.trim()) || (title?.part2 && title.part2.trim())
  );
  const titlePart1 = hasParts
    ? (title?.part1 ?? title?.text ?? '')
    : (title?.text ?? 'Get in Touch');
  const titlePart2 = hasParts ? (title?.part2 ?? '') : '';

  return (
    <section className="relative overflow-hidden bg-background py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-5 animate-fade-in-up">
          {/* Target label */}
          <div className="inline-block px-5 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm tracking-wide shadow-sm">
            {targetLabel || 'We’re Here to Help'}
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {titlePart1}{' '}
            </span>
            {titlePart2 ? (
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                {titlePart2}
              </span>
            ) : null}
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle ||
              'Reach out to us — whether you have a question or need guidance, we’d love to connect.'}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {/* Email */}
          <AnimatedCard
            icon={<Mail className="w-6 h-6 text-black" />}
            label={emailLabel || 'EMAIL US'}
            text={
              <a
                href={emailLink || `mailto:${emailId}`}
                className="text-foreground font-semibold text-lg leading-relaxed hover:underline"
              >
                {emailId}
              </a>
            }
            delay={0}
            accent="from-blue-500/30 to-indigo-500/30"
          />

          {/* Phone */}
          <AnimatedCard
            icon={<Phone className="w-6 h-6 text-black" />}
            label={phoneLabel || 'CALL US'}
            text={
              <a
                href={phoneLink || `tel:${phoneNumber}`}
                className="text-foreground font-semibold text-lg leading-relaxed hover:underline"
              >
                {phoneNumber}
              </a>
            }
            delay={0.1}
            accent="from-green-400/30 to-teal-400/30"
          />

          {/* USA Office */}
          <AnimatedCard
            icon={<MapPin className="w-6 h-6 text-black" />}
            label={location1Label || 'USA OFFICE'}
            text={
              <a
                href={location1Link}
                target="_blank"
                className="text-foreground font-semibold text-lg leading-relaxed hover:underline"
              >
                {location1Address}
              </a>
            }
            delay={0.2}
            accent="from-blue-500/30 to-teal-400/30"
          />

          {/* India Office */}
          <AnimatedCard
            icon={<MapPin className="w-6 h-6 text-black" />}
            label={location2Label || 'INDIA OFFICE'}
            text={
              <a
                href={location2Link}
                target="_blank"
                className="text-foreground font-semibold text-lg leading-relaxed hover:underline"
              >
                {location2Address}
              </a>
            }
            delay={0.3}
            accent="from-purple-400/30 to-pink-400/30"
          />
        </div>
      </div>
    </section>
  );
}

/* ==============================
   Reusable Animated Card
============================== */
function AnimatedCard({ icon, label, text, delay, accent }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <div
        className={`relative group rounded-2xl p-[2px] bg-gradient-to-br ${accent} hover:scale-[1.02] transition-transform duration-300`}
      >
        <div className="relative bg-card rounded-2xl p-6 shadow-soft border border-border hover:border-primary/30 transition-all duration-300 min-h-[160px] flex flex-col justify-center">
          <div className="relative flex items-start gap-5">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>

            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
              </h3>
              <p className="text-foreground text-lg font-semibold leading-relaxed break-words">
                {text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
