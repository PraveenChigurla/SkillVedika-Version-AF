import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import './error-handler';
import './font-error-handler';

import Header from '@/components/header';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GoogleAnalyticsHead, GoogleAnalyticsTracker } from '@/components/google-analytics';
import { getCanonicalUrl } from '@/lib/seo';
import ClientComponents from '@/components/ClientComponents';

/* --------------------------------
   Lazy-loaded Footer (below the fold)
-------------------------------- */
const Footer = dynamic(() => import('@/components/footer'), {
  loading: () => <footer aria-label="Loading footer" className="min-h-[200px]" />,
});

/* --------------------------------
   Poppins Font (Performance Optimized)
-------------------------------- */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-poppins',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

/* --------------------------------
   SEO Metadata
-------------------------------- */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://skillvedika.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
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
    canonical: getCanonicalUrl('/'),
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
};

/* --------------------------------
   Viewport (Accessibility Friendly)
-------------------------------- */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

/* --------------------------------
   Root Layout
-------------------------------- */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}
          crossOrigin="anonymous"
        />

        <GoogleAnalyticsHead />
      </head>

      <body className="font-poppins antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <GoogleAnalyticsTracker />
          </Suspense>

          <Header />

          <ClientComponents>
            <main id="main-content" role="main" className="pt-20 md:pt-[72px]">
              {children}
            </main>

            <Footer />
          </ClientComponents>
        </ErrorBoundary>
      </body>
    </html>
  );
}
