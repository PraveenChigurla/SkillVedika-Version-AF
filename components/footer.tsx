'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Send, MessageCircle, Instagram, Twitter, Youtube, Facebook } from 'lucide-react';
import { getApiUrl } from '@/lib/apiConfig';
import { logger } from '@/lib/logger';
import { EMAIL_VALIDATION, DEFER_TIMEOUTS, CACHE_REVALIDATION } from '@/lib/constants';
import type { FooterSettings } from '@/types/api';

export default function Footer() {
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [firstCourseId, setFirstCourseId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchFooterSettings() {
      try {
        const apiUrl = getApiUrl('/footer-settings');
        // Use cache for better performance - footer settings don't change often
        const res = await fetch(apiUrl, {
          cache: 'force-cache',
          next: { revalidate: CACHE_REVALIDATION.FOOTER },
        });
        const data = await res.json();
        setFooterSettings(data as FooterSettings);
      } catch (err) {
        logger.error('Failed to fetch footer settings:', err);
      }
    }
    // Defer footer settings fetch - not critical for initial render
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchFooterSettings, { timeout: DEFER_TIMEOUTS.FOOTER_SETTINGS });
    } else {
      setTimeout(fetchFooterSettings, DEFER_TIMEOUTS.DEFAULT);
    }
  }, []);

  // Fetch first course id to attach as default course (if available) - defer this
  useEffect(() => {
    async function fetchFirstCourse() {
      try {
        const apiUrl = getApiUrl('/courses');
        const res = await fetch(apiUrl, {
          cache: 'force-cache',
          next: { revalidate: CACHE_REVALIDATION.COURSES },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // data likely array of courses; pick first one's id if available
          const first = data[0];
          if (first && (first.id || first.ID)) {
            setFirstCourseId(first.id ?? first.ID);
          }
        }
      } catch (err) {
        // ignore silently; courses optional
      }
    }
    // Defer this fetch - not critical
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchFirstCourse, { timeout: DEFER_TIMEOUTS.FIRST_COURSE });
    } else {
      setTimeout(fetchFirstCourse, DEFER_TIMEOUTS.DEFAULT);
    }
  }, []);

  // Default values
  const settings: FooterSettings = {
    get_in_touch: footerSettings?.get_in_touch || 'Get in touch with us:',
    email_placeholder: footerSettings?.email_placeholder || 'Enter your email',
    logo: footerSettings?.logo || '/home/Frame 236.png',
    about:
      footerSettings?.about ||
      'SkillVedika is a professional training institute offering high-quality, expert-led courses designed to help learners grow and succeed in their careers.',
    explore: footerSettings?.explore || 'Explore',
    explore_links: footerSettings?.explore_links || [
      { text: 'All courses', slug: '/courses' },
      { text: 'About', slug: '/about-us' },
      { text: 'Contact', slug: '/contact-us' },
      { text: 'Blog', slug: '/blog' },
    ],
    support: footerSettings?.support || 'Support',
    support_links: footerSettings?.support_links || [
      { text: 'Job support', slug: '/on-job-support' },
      { text: 'Become an instructor', slug: '/become-instructor' },
      { text: 'Tutorials', slug: '/tutorials' },
      { text: 'Trending courses', slug: '/courses/trending' },
      { text: 'Interview questions', slug: '/interview-questions' },
    ],
    contact: footerSettings?.contact || 'Contact',
    contact_details: footerSettings?.contact_details || {
      phone: '+91 8790900881',
      email: 'support@skillvedika.com',
      locations: [
        '501, Manjeera Majestic Commercial, KPHB, Hyderabad, India.',
        '25730 Lennox Hale Dr Aldie VA 20105, USA.',
      ],
    },
    follow_us: footerSettings?.follow_us || 'Follow us on social media:',
    social_media_icons: footerSettings?.social_media_icons || [
      'whatsapp',
      'instagram',
      'twitter',
      'youtube',
      'facebook',
    ],
    social_links: footerSettings?.social_links || {
      whatsapp: '#',
      instagram: '#',
      twitter: '#',
      youtube: '#',
      facebook: '#',
    },
    copyright: footerSettings?.copyright || 'SkillVedika © 2025 - All Rights Reserved',
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp':
        return <MessageCircle size={22} />;
      case 'instagram':
        return <Instagram size={22} />;
      case 'twitter':
        return <Twitter size={22} />;
      case 'youtube':
        return <Youtube size={22} />;
      case 'facebook':
        return <Facebook size={22} />;
      default:
        return null;
    }
  };

  return (
    <footer className="bg-[#1A3F66] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Newsletter Section */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/20 pb-10 mb-10">
          <h3 className="text-2xl font-semibold mb-6 md:mb-0">{settings.get_in_touch}</h3>

          {/* Email Input */}
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div
              className={`min-w-[160px] max-w-[220px] px-4 py-2 flex items-center text-sm truncate ${
                successMessage ? 'text-green-300' : errorMessage ? 'text-red-300' : 'text-gray-500'
              }`}
              aria-live="polite"
            >
              {successMessage || errorMessage || ' '}
            </div>

            <form
              className="flex w-full md:w-[500px] bg-white rounded-full overflow-hidden items-left"
              onSubmit={async e => {
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
                  // Build payload: always include email provided by user.
                  // Include defaults requested by user; enrollment controller stores extra fields in `meta`.
                  const payload: any = {
                    // required/basic fields for enrollment
                    name: 'From Footer',
                    email: email,
                    phone: '+91 9999999999',
                  };

                  // if we have a first course id, include it (controller casts courses to array)
                  // if (firstCourseId) payload.courses = [firstCourseId]

                  // put page information in extra so it ends up in meta
                  payload.page = 'footer';

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
              }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={settings.email_placeholder}
                className="flex-1 px-5 py-3 text-gray-800 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                aria-label="Subscribe to newsletter"
                className="bg-[#4A90E2] px-5 flex items-center justify-center hover:bg-[#2C5AA0] transition-colors disabled:opacity-60 min-w-[44px] min-h-[44px]"
              >
                <Send size={22} className="text-white" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-blue-100">
          {/* SkillVedika Info */}
          <div>
            <Image
              src={settings.logo || '/home/Frame 236.png'}
              alt="SkillVedika Logo"
              width={180}
              height={60}
              className="mb-5"
            />
            <p className="text-sm leading-relaxed mb-6 text-blue-100">{settings.about}</p>
            <p className="text-sm mb-3 text-blue-100">{settings.follow_us}</p>

            {/* Social Icons */}
            <div className="flex space-x-4 text-white">
              {settings.social_media_icons?.map(platform => (
                <Link
                  key={platform}
                  href={settings.social_links?.[platform] || '#'}
                  aria-label={`Follow us on ${platform}`}
                  className="hover:text-[#4A90E2] transition-colors"
                >
                  {getSocialIcon(platform)}
                </Link>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="md:ml-10">
            <h3 className="font-semibold text-base mb-4 text-white">{settings.explore}</h3>
            <ul className="space-y-2 text-sm">
              {settings.explore_links?.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.slug}
                    target={link.new_tab ? '_blank' : undefined}
                    rel={link.new_tab ? 'noopener noreferrer' : undefined}
                    className="hover:text-white"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">{settings.support}</h3>
            <ul className="space-y-2 text-sm">
              {settings.support_links?.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.slug}
                    target={link.new_tab ? '_blank' : undefined}
                    rel={link.new_tab ? 'noopener noreferrer' : undefined}
                    className="hover:text-white"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-base mb-4 text-white">{settings.contact}</h3>
            <ul className="space-y-3 text-sm">
              {settings.contact_details?.phone && (
                <li>
                  <span className="font-medium text-white">Mobile:</span>{' '}
                  {settings.contact_details.phone}
                </li>
              )}
              {settings.contact_details?.email && (
                <li>
                  <span className="font-medium text-white">Email:</span>{' '}
                  {settings.contact_details.email}
                </li>
              )}
              {settings.contact_details?.locations?.map((location, idx) => (
                <li key={idx}>
                  <span className="font-medium text-white">Location:</span> {location}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-10"></div>

        {/* Copyright */}
        <div className="text-center text-sm text-blue-200 pt-6">
          <p>{settings.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
