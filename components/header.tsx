'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface MenuItem {
  text: string;
  slug: string;
  new_tab?: boolean;
}

interface HeaderSettings {
  logo?: string;
  menu_items?: MenuItem[];
}

// Performance: Memoize header component to prevent unnecessary re-renders
function Header() {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const pathname = usePathname();

  // Performance: useCallback to memoize fetch function
  const fetchHeaderSettings = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (!apiUrl) {
        console.warn('NEXT_PUBLIC_API_URL not set');
        return;
      }
      // Performance: Use cache for better performance - header settings don't change often
      const res = await fetch(`${apiUrl}/header-settings`, {
        cache: 'force-cache',
        next: { revalidate: 3600 }, // Revalidate every hour
      });
      const data = await res.json();
      setHeaderSettings(data);
    } catch (err) {
      console.error('Failed to fetch header settings:', err);
    }
  }, []);

  useEffect(() => {
    // Performance: Defer header settings fetch if possible - not critical for initial render
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchHeaderSettings, { timeout: 1000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(fetchHeaderSettings, 100);
    }
  }, [fetchHeaderSettings]);

  // Performance: Memoize active check function
  const isActive = useCallback((slug: string): boolean => {
    if (slug === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(slug);
  }, [pathname]);

  // Fallback menu items
  const defaultMenuItems: MenuItem[] = [
    { text: 'Home', slug: '/', new_tab: false },
    { text: 'Courses', slug: '/courses', new_tab: false },
    { text: 'Corporate Training', slug: '/corporate-training', new_tab: false },
    { text: 'On Job Support', slug: '/on-job-support', new_tab: false },
    { text: 'About Us', slug: '/about-us', new_tab: false },
    { text: 'Blog', slug: '/blog', new_tab: false },
    { text: 'Contact Us', slug: '/contact-us', new_tab: false },
  ];

  const menuItems = headerSettings?.menu_items || defaultMenuItems;
  const logo = headerSettings?.logo || '/home/skill-vedika-logo.png';

  return (
    <header 
      className="bg-white border-b border-[#E0E8F0] sticky top-0 z-50"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex items-center justify-between py-4">
          {/* Accessibility: Logo link with proper aria-label */}
          <Link 
            href="/" 
            className="flex items-center"
            aria-label="SkillVedika Home"
          >
            {/* Performance: Priority image for LCP - logo is above the fold */}
            <Image
              src={logo}
              alt="SkillVedika Logo"
              width={140}
              height={35}
              priority
              className="object-contain image-auto-aspect"
              style={{ width: 'auto', height: 'auto' }}
              sizes="(max-width: 768px) 120px, 140px"
            />
          </Link>
          
          {/* Accessibility: Semantic navigation with proper ARIA */}
          <nav 
            className="hidden md:flex items-center space-x-8"
            role="navigation"
            aria-label="Main menu"
          >
            {menuItems.map((item, idx) => {
              const active = isActive(item.slug);
              return (
                <Link
                  key={`${item.slug}-${idx}`}
                  href={item.slug}
                  target={item.new_tab ? '_blank' : undefined}
                  rel={item.new_tab ? 'noopener noreferrer' : undefined}
                  prefetch={true} // Performance: Enable prefetching for faster navigation
                  className={`text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${
                    active ? 'text-[#2563EB] font-semibold' : 'text-gray-600 hover:text-[#2563EB]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.text}
                </Link>
              );
            })}
          </nav>
          
          {/* Accessibility: Mobile menu button (if needed) */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Toggle mobile menu"
            aria-expanded="false"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

// Performance: Export memoized component
export default memo(Header);
