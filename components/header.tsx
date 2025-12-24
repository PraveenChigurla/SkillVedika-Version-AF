'use client';

import { useState, useEffect } from 'react';
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

export default function Header() {
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchHeaderSettings() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (!apiUrl) {
          console.warn('NEXT_PUBLIC_API_URL not set');
          setLoading(false);
          return;
        }
        // Use cache for better performance - header settings don't change often
        const res = await fetch(`${apiUrl}/header-settings`, {
          cache: 'force-cache',
          next: { revalidate: 3600 }, // Revalidate every hour
        });
        const data = await res.json();
        setHeaderSettings(data);
      } catch (err) {
        console.error('Failed to fetch header settings:', err);
      } finally {
        setLoading(false);
      }
    }
    // Defer header settings fetch if possible
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchHeaderSettings, { timeout: 1000 });
    } else {
      fetchHeaderSettings();
    }
  }, []);

  // Function to check if current path matches menu item
  const isActive = (slug: string): boolean => {
    if (slug === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(slug);
  };

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
    <header className="bg-white border-b border-[#E0E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="SkillVedika Logo"
              width={140}
              height={35}
              priority
              className="object-contain"
              className="image-auto-aspect"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, idx) => {
              const active = isActive(item.slug);
              return (
                <Link
                  key={idx}
                  href={item.slug}
                  target={item.new_tab ? '_blank' : undefined}
                  rel={item.new_tab ? 'noopener noreferrer' : undefined}
                  prefetch={true} // Enable prefetching for faster navigation
                  className={`text-sm font-medium transition-colors duration-200 ${
                    active ? 'text-[#2563EB] font-semibold' : 'text-gray-600 hover:text-[#2563EB]'
                  }`}
                >
                  {item.text}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
