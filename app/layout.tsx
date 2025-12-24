import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './cursor-styles.css';
import './compatibility-fixes.css';
import './animations.css';
import './error-handler';
import './font-error-handler';
import Header from '@/components/header';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { getCanonicalUrl } from '@/lib/seo';
import StickyFooter from '@/components/StickyFooter';
import QueryPopup from '@/components/QueryPopup';
import WhatsAppButton from '@/components/WhatsAppButton';

// Lazy load Footer for better performance
const Footer = dynamic(() => import('@/components/footer'), {
  ssr: true, // Keep SSR for SEO
});

// Lazy load CookieConsent - not critical for initial render
// The component itself is a client component, so it will hydrate on the client
// Wrap in try-catch to handle chunk load errors gracefully
const CookieConsentWrapper = dynamic(
  () =>
    import('@/components/CookieConsentWrapper').catch(err => {
      console.warn('Failed to load CookieConsentWrapper:', err);
      // Return a no-op component if loading fails
      return { default: () => null };
    }),
  {
    loading: () => null, // Don't show loading state
  }
);

// Optimize font loading with display swap for better performance
const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-geist',
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Only preload primary font
  variable: '--font-geist-mono',
  fallback: ['monospace'],
  adjustFontFallback: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Charset is automatically added by Next.js in the first 1024 bytes
  title: {
    default: 'SkillVedika - Online Courses & Professional Training',
    template: '%s | SkillVedika',
  },
  description:
    'SkillVedika offers industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.',
  keywords: [
    'online courses',
    'IT training',
    'professional development',
    'corporate training',
    'job support',
    'SkillVedika',
  ],
  authors: [{ name: 'SkillVedika' }],
  creator: 'SkillVedika',
  publisher: 'SkillVedika',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: getCanonicalUrl('/'), // Default canonical for homepage
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'SkillVedika',
    title: 'SkillVedika - Online Courses & Professional Training',
    description: 'Industry-ready online courses, corporate training, and job support programs.',
    images: [
      {
        url: `${siteUrl}/skillvedika-logo.png`,
        width: 1200,
        height: 630,
        alt: 'SkillVedika Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillVedika - Online Courses & Professional Training',
    description: 'Industry-ready online courses, corporate training, and job support programs.',
    images: [`${siteUrl}/skillvedika-logo.png`],
  },
  verification: {
    // Add Google Search Console verification if available
    // google: 'your-google-verification-code',
  },
};

// Viewport must be exported separately in Next.js 13+
// Removed maximumScale as it's not recommended and causes compatibility warnings
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* Character encoding - Next.js adds this automatically, removing duplicate */}
        {/* Preconnect to API for faster requests */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}
          crossOrigin="anonymous"
        />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {/* Note: Next.js automatically optimizes CSS loading, no manual preload needed */}
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <Header />
          <main>{children}</main>
          <Footer />
          <StickyFooter />
          <WhatsAppButton />
          <QueryPopup></QueryPopup>
          <CookieConsentWrapper />
        </ErrorBoundary>
      </body>
    </html>
  );
}
