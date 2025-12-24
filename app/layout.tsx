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
import ClientComponents from '@/components/ClientComponents';

// Performance: Lazy load non-critical components below the fold
// Footer is below the fold, so lazy load it to reduce initial bundle
const Footer = dynamic(() => import('@/components/footer'), {
  ssr: true, // Keep SSR for SEO
  loading: () => <footer aria-label="Loading footer" className="min-h-[200px]" />,
});

// Performance: Optimize font loading with display swap for better LCP
// Preload only primary font, defer secondary font
const geist = Geist({
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text during font load
  preload: true, // Preload primary font
  variable: '--font-geist',
  fallback: ['system-ui', 'arial'], // Immediate fallback
  adjustFontFallback: true, // Reduces layout shift
});

// Performance: Don't preload secondary font - load on demand
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
  verification: {
    // Add Google Search Console verification if available
    // google: 'your-google-verification-code',
  },
};

// Viewport configuration for better mobile performance
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* Performance: Preconnect to API for faster requests */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}
          crossOrigin="anonymous"
        />
        {/* Performance: DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://wa.me" />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          {/* Performance: Load analytics with afterInteractive strategy - non-blocking */}
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          
          {/* Accessibility: Semantic header */}
          <Header />
          
          {/* Accessibility: Semantic main content */}
          <main id="main-content" role="main">
            {children}
          </main>
          
          {/* Performance: Footer loaded lazily - below the fold */}
          <Footer />
          
          {/* Performance: Client-only components wrapped in client component */}
          <ClientComponents />
        </ErrorBoundary>
      </body>
    </html>
  );
}
