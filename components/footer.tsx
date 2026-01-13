'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Send, MessageCircle, Instagram, Twitter, Youtube, Facebook, CheckCircle2 } from 'lucide-react';
import { getApiUrl } from '@/lib/apiConfig';
import { logger } from '@/lib/logger';
import { EMAIL_VALIDATION, DEFER_TIMEOUTS } from '@/lib/constants';
import type { FooterSettings } from '@/types/api';

// Performance: Regular function for social icons (not a component, so no memo needed)
function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'whatsapp':
      return <MessageCircle size={22} aria-hidden="true" />;
    case 'instagram':
      return <Instagram size={22} aria-hidden="true" />;
    case 'twitter':
      return <Twitter size={22} aria-hidden="true" />;
    case 'youtube':
      return <Youtube size={22} aria-hidden="true" />;
    case 'facebook':
      return <Facebook size={22} aria-hidden="true" />;
    default:
      return null;
  }
}

// Performance: Memoize footer component to prevent unnecessary re-renders
function Footer() {
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Performance: useCallback to memoize fetch function
  const fetchFooterSettings = useCallback(async () => {
    try {
      const apiUrl = getApiUrl('/footer-settings');
      // Use no-cache to ensure we get fresh data from admin updates
      const res = await fetch(apiUrl, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch footer settings: ${res.status}`);
      }
      
      const response = await res.json();
      // Handle API response structure: { success: true, data: {...} } or direct {...}
      const data = response?.data || response;
      setFooterSettings(data as FooterSettings);
    } catch (err) {
      logger.error('Failed to fetch footer settings:', err);
    }
  }, []);

  // Performance: Defer footer settings fetch - not critical for initial render
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchFooterSettings, { timeout: DEFER_TIMEOUTS.FOOTER_SETTINGS });
    } else {
      setTimeout(fetchFooterSettings, DEFER_TIMEOUTS.DEFAULT);
    }
  }, [fetchFooterSettings]);

  // Performance: Memoize settings object to prevent recalculation
  // Use API data when available, fallback to defaults only if API data is missing
  const settings: FooterSettings = useMemo(() => {
    // If we have footer settings from API, use them directly (they may have empty strings/null, which is fine)
    if (footerSettings) {
      return {
        get_in_touch: footerSettings.get_in_touch ?? 'Get in touch with us:',
        email_placeholder: footerSettings.email_placeholder ?? 'Enter your email',
        logo: footerSettings.logo ?? '/home/Frame 236.png',
        about: footerSettings.about ?? 'SkillVedika is a professional training institute offering high-quality, expert-led courses designed to help learners grow and succeed in their careers.',
        explore: footerSettings.explore ?? 'Explore',
        explore_links: footerSettings.explore_links && footerSettings.explore_links.length > 0 
          ? footerSettings.explore_links 
          : [
              { text: 'All courses', slug: '/courses' },
              { text: 'About', slug: '/about-us' },
              { text: 'Contact', slug: '/contact-us' },
              { text: 'Blog', slug: '/blog' },
            ],
        support: footerSettings.support ?? 'Support',
        support_links: footerSettings.support_links && footerSettings.support_links.length > 0
          ? footerSettings.support_links
          : [
              { text: 'Job support', slug: '/on-job-support' },
              { text: 'Become an instructor', slug: '/become-instructor' },
              { text: 'Tutorials', slug: '/tutorials' },
              { text: 'Trending courses', slug: '/courses/trending' },
              { text: 'Interview questions', slug: '/interview-questions' },
            ],
        contact: footerSettings.contact ?? 'Contact',
        contact_details: footerSettings.contact_details || {
          phone: '+91 8790900881',
          email: 'support@skillvedika.com',
          locations: [
            '501, Manjeera Majestic Commercial, KPHB, Hyderabad, India.',
            '25730 Lennox Hale Dr Aldie VA 20105, USA.',
          ],
        },
        follow_us: footerSettings.follow_us ?? 'Follow us on social media:',
        social_media_icons: footerSettings.social_media_icons && footerSettings.social_media_icons.length > 0
          ? footerSettings.social_media_icons
          : ['whatsapp', 'instagram', 'twitter', 'youtube', 'facebook'],
        social_links: footerSettings.social_links || {
          whatsapp: '#',
          instagram: '#',
          twitter: '#',
          youtube: '#',
          facebook: '#',
        },
        copyright: footerSettings.copyright ?? 'SkillVedika © 2025 - All Rights Reserved',
      };
    }
    
    // Fallback defaults when API data is not yet loaded
    return {
      get_in_touch: 'Get in touch with us:',
      email_placeholder: 'Enter your email',
      logo: '/home/Frame 236.png',
      about: 'SkillVedika is a professional training institute offering high-quality, expert-led courses designed to help learners grow and succeed in their careers.',
      explore: 'Explore',
      explore_links: [
        { text: 'All courses', slug: '/courses' },
        { text: 'About', slug: '/about-us' },
        { text: 'Contact', slug: '/contact-us' },
        { text: 'Blog', slug: '/blog' },
      ],
      support: 'Support',
      support_links: [
        { text: 'Job support', slug: '/on-job-support' },
        { text: 'Become an instructor', slug: '/become-instructor' },
        { text: 'Tutorials', slug: '/tutorials' },
        { text: 'Trending courses', slug: '/courses/trending' },
        { text: 'Interview questions', slug: '/interview-questions' },
      ],
      contact: 'Contact',
      contact_details: {
        phone: '+91 8790900881',
        email: 'support@skillvedika.com',
        locations: [
          '501, Manjeera Majestic Commercial, KPHB, Hyderabad, India.',
          '25730 Lennox Hale Dr Aldie VA 20105, USA.',
        ],
      },
      follow_us: 'Follow us on social media:',
      social_media_icons: ['whatsapp', 'instagram', 'twitter', 'youtube', 'facebook'],
      social_links: {
        whatsapp: '#',
        instagram: '#',
        twitter: '#',
        youtube: '#',
        facebook: '#',
      },
      copyright: 'SkillVedika © 2025 - All Rights Reserved',
    };
  }, [footerSettings]);

  // Performance: useCallback for form submission
  // Accessibility: Proper form handling with error announcements
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    const apiUrl = getApiUrl('/enroll');
    
    // Validate email format and length
    if (
      !email ||
      !EMAIL_VALIDATION.REGEX.test(email) ||
      email.length > EMAIL_VALIDATION.MAX_LENGTH
    ) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: 'From Footer',
        email: email,
        phone: '+91 9999999999',
        page: 'footer',
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Request failed: ${res.status}`);
      }

      const json = await res.json();
      if (json?.success) {
        setSuccessMessage('Thank you! You will be contacted soon.');
        setEmail('');
      } else {
        setErrorMessage(json?.message || 'Failed to save email');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setErrorMessage(errorMessage || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [email]);

  return (
    <footer 
      className="bg-[#1A3F66] text-white"
      role="contentinfo"
      aria-label="Site footer"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-6 py-12" suppressHydrationWarning>
        {/* Newsletter Section */}
        <section 
          className="flex flex-col md:flex-row items-center justify-between border-b border-white/20 pb-10 mb-10"
          aria-labelledby="newsletter-heading"
          suppressHydrationWarning
        >
          <h3 id="newsletter-heading" className="text-2xl font-semibold mb-6 md:mb-0">
            {settings.get_in_touch}
          </h3>

          {/* Email Input */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto" suppressHydrationWarning>
            {/* Accessibility: Live region for form feedback */}
            {(successMessage || errorMessage) && (
              <div
                className={`px-4 py-2 flex items-center gap-2 text-sm whitespace-normal break-words ${
                  successMessage ? 'text-green-300' : 'text-red-300'
                }`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                suppressHydrationWarning
              >
                {successMessage ? (
                  <>
                    <CheckCircle2 size={18} className="text-green-300 flex-shrink-0" aria-hidden="true" />
                    <span>{successMessage}</span>
                  </>
                ) : (
                  <span>{errorMessage}</span>
                )}
              </div>
            )}

            {/* Accessibility: Proper form with labels and error handling */}
            <form
              className="flex w-full md:w-[500px] bg-white rounded-full overflow-hidden items-center"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Newsletter subscription"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={settings.email_placeholder}
                className="flex-1 px-5 py-3 text-gray-800 focus:outline-none rounded-l-full"
                aria-required="true"
                aria-invalid={errorMessage ? 'true' : 'false'}
                aria-describedby={errorMessage ? 'footer-email-error' : undefined}
              />
              {errorMessage && (
                <span id="footer-email-error" className="sr-only">
                  {errorMessage}
                </span>
              )}
              <button
                type="submit"
                disabled={submitting}
                aria-label="Subscribe to newsletter"
                className="bg-[#1A3F66]  px-4 py-3.5 flex items-center justify-center hover:bg-[#2C5AA0] transition-colors disabled:opacity-60 min-w-[44px] min-h-[44px] focus:outline-none cursor-pointer"
              >
                <Send size={22} className="text-white" aria-hidden="true" />
                {submitting && <span className="sr-only">Submitting...</span>}
              </button>
            </form>
          </div>
        </section>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-20 text-blue-100" suppressHydrationWarning>
          {/* SkillVedika Info */}
          <section aria-labelledby="company-info-heading" className="md:col-span-1">
            <h2 id="company-info-heading" className="sr-only">Company Information</h2>
            {/* Performance: Lazy load footer logo - below the fold */}
            <Image
              src={settings.logo || '/home/Frame 236.png'}
              alt="SkillVedika Logo"
              width={180}
              height={60}
              className="mb-5 cursor-pointer"
              style={{ width: 'auto', height: 'auto' }}
              loading="lazy"
              sizes="(max-width: 768px) 160px, 180px"
            />
            <p className="text-sm leading-relaxed mb-6 text-blue-100">{settings.about}</p>
            <p className="text-sm mb-3 text-blue-100">{settings.follow_us}</p>

            {/* Social Icons */}
            <nav aria-label="Social media links">
              <ul className="flex space-x-4 text-white list-none">
                {settings.social_media_icons?.map(platform => (
                  <li key={platform}>
                    <Link
                      href={settings.social_links?.[platform] || '#'}
                      aria-label={`Follow us on ${platform}`}
                      className="hover:text-[#4A90E2] transition-colors focus:outline-none cursor-pointer"
                    >
                      {getSocialIcon(platform)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          {/* Explore */}
          <nav aria-labelledby="explore-heading" className="md:pl-4 lg:pl-6">
            <h3 id="explore-heading" className="font-semibold text-base mb-4 text-white">
              {settings.explore}
            </h3>
            <ul className="space-y-2 text-sm list-none">
              {settings.explore_links?.map((link, idx) => (
                <li key={`${link.slug}-${idx}`}>
                  <Link
                    href={link.slug}
                    target={link.new_tab ? '_blank' : undefined}
                    rel={link.new_tab ? 'noopener noreferrer' : undefined}
                    className="hover:text-white focus:outline-none cursor-pointer"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-labelledby="support-heading" className="md:pl-4 lg:pl-6">
            <h3 id="support-heading" className="font-semibold text-base mb-4 text-white">
              {settings.support}
            </h3>
            <ul className="space-y-2 text-sm list-none">
              {settings.support_links?.map((link, idx) => (
                <li key={`${link.slug}-${idx}`}>
                  <Link
                    href={link.slug}
                    target={link.new_tab ? '_blank' : undefined}
                    rel={link.new_tab ? 'noopener noreferrer' : undefined}
                    className="hover:text-white focus:outline-none cursor-pointer"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <section aria-labelledby="contact-heading" className="md:pl-4 lg:pl-6">
            <h3 id="contact-heading" className="font-semibold text-base mb-4 text-white">
              {settings.contact}
            </h3>
            <address className="space-y-3 text-sm not-italic">
              {settings.contact_details?.phone && (
                <div suppressHydrationWarning>
                  <span className="font-medium text-white">Mobile:</span>{' '}
                  <a 
                    href={`tel:${settings.contact_details.phone.replaceAll(/\s+/g, '')}`}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {settings.contact_details.phone}
                  </a>
                </div>
              )}
              {settings.contact_details?.email && (
                <div suppressHydrationWarning>
                  <span className="font-medium text-white">Email:</span>{' '}
                  <a 
                    href={`mailto:${settings.contact_details.email}`}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {settings.contact_details.email}
                  </a>
                </div>
              )}
              {settings.contact_details?.locations?.map((location, idx) => {
                // Parse location - supports both old string format and new JSON format with URL
                let locationText = location;
                let locationUrl: string | undefined;
                
                try {
                  const parsed = JSON.parse(location);
                  if (typeof parsed === 'object' && parsed.text) {
                    locationText = parsed.text;
                    locationUrl = parsed.url;
                  }
                } catch {
                  // Not JSON, use as plain text
                }
                
                return (
                  <div key={`location-${location}-${idx}`} suppressHydrationWarning>
                    <span className="font-medium text-white">Location:</span>{' '}
                    {locationUrl ? (
                      <a
                        href={locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline focus:outline-none cursor-pointer"
                      >
                        {locationText}
                      </a>
                    ) : (
                      <span>{locationText}</span>
                    )}
                  </div>
                );
              })}
            </address>
          </section>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-10" role="separator" aria-hidden="true" suppressHydrationWarning></div>

        {/* Copyright */}
        <div className="text-center text-sm text-blue-200 pt-6" suppressHydrationWarning>
          <p>{settings.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

// Performance: Export memoized component
export default memo(Footer);
