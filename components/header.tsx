'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Performance: useCallback to memoize fetch function
  const fetchHeaderSettings = useCallback(async () => {
    try {
      const { getApiUrl } = await import('@/lib/apiConfig');
      const apiUrl = getApiUrl('/header-settings');
      // Performance: Use cache for better performance - header settings don't change often
      const res = await fetch(apiUrl, {
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
              suppressHydrationWarning
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
                  className={`relative text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 group ${
                    active 
                      ? 'text-[#2563EB] font-semibold bg-blue-50' 
                      : 'text-gray-700 hover:text-[#2563EB] hover:bg-blue-50 hover:font-semibold'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className={`relative z-10 transition-all duration-300 ease-in-out ${
                    active 
                      ? 'text-[#2563EB]' 
                      : 'text-gray-700 group-hover:text-[#2563EB] group-hover:font-semibold'
                  }`}>
                    {item.text}
                  </span>
                  {!active && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] transition-all duration-300 group-hover:w-full"></span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2563EB]"></span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Accessibility: Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 text-gray-600 hover:text-[#2563EB] hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded relative z-10 transition-all duration-300 transform hover:scale-110"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
                type="button"
              >
                <svg
                  className="w-6 h-6 pointer-events-none"
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
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav 
                className="flex flex-col space-y-4 mt-8"
                role="navigation"
                aria-label="Mobile menu"
              >
                {menuItems.map((item, idx) => {
                  const active = isActive(item.slug);
                  return (
                    <Link
                      key={`mobile-${item.slug}-${idx}`}
                      href={item.slug}
                      target={item.new_tab ? '_blank' : undefined}
                      rel={item.new_tab ? 'noopener noreferrer' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-base font-medium transition-all duration-300 ease-in-out py-3 px-4 rounded-lg transform hover:scale-[1.02] group ${
                        active 
                          ? 'text-[#2563EB] font-semibold bg-blue-50 shadow-sm' 
                          : 'text-gray-700 hover:text-[#2563EB] hover:bg-blue-50 hover:font-semibold hover:shadow-md'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={`transition-all duration-300 ease-in-out ${
                        active 
                          ? 'text-[#2563EB] font-semibold' 
                          : 'text-gray-700 group-hover:text-[#2563EB] group-hover:font-semibold'
                      }`}>
                        {item.text}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// Export component (removed memo to ensure mobile menu works properly)
export default Header;
