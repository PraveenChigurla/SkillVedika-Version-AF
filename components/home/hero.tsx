'use client';

import Image from 'next/image';
import { Search, CheckCircle2, X } from 'lucide-react';
import { useState, useEffect, useRef, startTransition, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import parse from 'html-react-parser';

interface HeroProps {
  hero?: any;
}

// Performance: Move constants outside component to prevent recreation
const INDUSTRY_SKILLS = [
  // CLOUD & DEVOPS
  'AWS',
  'Amazon Web Services',
  'Azure',
  'Google Cloud',
  'GCP',
  'Cloud Computing',
  'Cloud Architecture',
  'Cloud Security',
  'DevOps',
  'GitOps',
  'Docker',
  'Kubernetes',
  'Helm',
  'Terraform',
  'Ansible',
  'CI/CD',
  'Jenkins',
  'Linux Administration',

  // PROGRAMMING LANGUAGES
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C#',
  'C++',
  'Go',
  'Ruby',
  'Rust',
  'PHP',
  'PHP Laravel',
  'Node.js',
  'Express.js',

  // WEB DEVELOPMENT
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Bootstrap',
  'React',
  'Next.js',
  'Angular',
  'Vue.js',
  'Svelte',
  'Astro',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'REST API',
  'GraphQL',
  'Vite',
  'Webpack',

  // MOBILE DEVELOPMENT
  'Android Development',
  'Kotlin',
  'Java for Android',
  'iOS Development',
  'Swift',
  'Flutter',
  'React Native',

  // UI/UX
  'UI/UX Design',
  'Figma',
  'Adobe XD',
  'Sketch',
  'Wireframing',
  'Prototyping',
  'Design Thinking',

  // DATABASES
  'SQL',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'NoSQL',
  'Redis',
  'Oracle Database',
  'MariaDB',
  'Database Design',

  // DATA ENGINEERING
  'Data Engineering',
  'Data Pipelines',
  'ETL',
  'Snowflake',
  'Databricks',
  'Apache Spark',
  'Hadoop',
  'Airflow',
  'Kafka',
  'Redshift',
  'BigQuery',

  // DATA SCIENCE / ML
  'Data Science',
  'Machine Learning',
  'Deep Learning',
  'NLP',
  'Computer Vision',
  'TensorFlow',
  'PyTorch',
  'ML Ops',
  'Data Visualization',

  // BI & ANALYTICS
  'Power BI',
  'Tableau',
  'Business Intelligence',
  'Excel Analytics',

  // CYBERSECURITY
  'Cybersecurity',
  'Ethical Hacking',
  'Penetration Testing',
  'Network Security',
  'SOC Analyst',
  'Information Security',

  // SAP
  'SAP FICO',
  'SAP MM',
  'SAP SD',
  'SAP ABAP',
  'SAP HANA',
  'SAP SuccessFactors',
  'SAP Analytics Cloud',

  // SALESFORCE
  'Salesforce',
  'Salesforce Admin',
  'Salesforce Developer',
  'Apex',
  'Lightning',
  'Sales Cloud',
  'Service Cloud',

  // TESTING
  'QA Testing',
  'Automation Testing',
  'Selenium',
  'Cypress',
  'Playwright',
  'Jest',
  'Unit Testing',
  'Integration Testing',

  // DIGITAL MARKETING
  'Digital Marketing',
  'SEO',
  'Google Ads',
  'Meta Ads',
  'Social Media Marketing',
  'Content Marketing',
  'Email Marketing',

  // BUSINESS
  'Project Management',
  'Product Management',
  'Business Analysis',
  'Agile',
  'Scrum',
  'Leadership',

  // HR & SOFT SKILLS
  'Human Resources',
  'Communication Skills',
  'Team Management',
  'Critical Thinking',
  'Public Speaking',
  'Talent Acquisition',

  // EDUCATION
  'Instructional Design',
  'Teaching Skills',
  'Trainer Skills',
  'Coaching',
];

// Performance: Memoize alias mapping
const SKILL_ALIASES: Record<string, string> = {
  ml: 'Machine Learning',
  ai: 'Artificial Intelligence',
  dl: 'Deep Learning',
  ds: 'Data Science',
  cv: 'Computer Vision',
  gcp: 'Google Cloud',
  reactjs: 'React',
  nextjs: 'Next.js',
  node: 'Node.js',
  laravel: 'PHP Laravel',
};

// Performance: Memoize Levenshtein function
const levenshtein = (a: string, b: string): number => {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const dp: number[][] = [];
  for (let i = 0; i <= al; i++) {
    dp[i] = new Array(bl + 1).fill(0);
  }

  for (let i = 0; i <= al; i++) {
    dp[i]![0] = i;
  }
  for (let j = 0; j <= bl; j++) {
    dp[0]![j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      );
    }
  }

  return dp[al]![bl]!;
};

// Performance: Memoize skill ranking algorithm - optimized to break up work and reduce TBT
const rankSkills = (skills: string[], query: string): Promise<string[]> => {
  return new Promise(resolve => {
    let q = query.trim().toLowerCase();
    if (!q) {
      resolve(skills.slice(0, 15));
      return;
    }

    if (SKILL_ALIASES[q]) {
      const alias = SKILL_ALIASES[q];
      if (alias) q = alias.toLowerCase();
    }

    // Break up scoring into chunks to avoid blocking main thread
    const chunkSize = 15;
    const chunks: string[][] = [];
    for (let i = 0; i < skills.length; i += chunkSize) {
      chunks.push(skills.slice(i, i + chunkSize));
    }

    const scored: { skill: string; score: number }[] = [];
    let chunkIndex = 0;

    const processChunk = () => {
      if (chunkIndex >= chunks.length) {
        scored.sort((a, b) => b.score - a.score);
        resolve(scored.slice(0, 15).map(x => x.skill));
        return;
      }

      const chunk = chunks[chunkIndex];
      if (chunk) {
        chunk.forEach(skill => {
          const s = skill.toLowerCase();
          let score = 0;

          if (s.includes('aws') || s.includes('sap') || s.includes('data') || s.includes('cloud'))
            score += 25;
          else score += 10;

          if (s.startsWith(q)) score += 100;
          if (s.includes(q)) score += 60;

          const dist = levenshtein(q, s);
          score += Math.max(0, 40 - dist);

          score += Math.max(0, 20 - s.length);

          scored.push({ skill, score });
        });
      }

      chunkIndex++;

      // Use requestIdleCallback or setTimeout to yield to browser
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(processChunk, { timeout: 50 });
      } else {
        setTimeout(processChunk, 0);
      }
    };

    processChunk();
  });
};

// Performance: Memoize Hero component to prevent unnecessary re-renders
function Hero({ hero }: Readonly<HeroProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{
    popular: string[];
    categories: unknown[];
    courses: unknown[];
    blogs: unknown[];
  }>({
    popular: [],
    categories: [],
    courses: [],
    blogs: [],
  });
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Performance: useCallback for search handler
  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) return;
    router.push(`/courses?search=${encodeURIComponent(searchTerm)}`);
    setShowDropdown(false);
  }, [searchTerm, router]);

  // Performance: useCallback for keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  }, [handleSearch]);

  // Performance: useCallback for fetch suggestions
  const fetchSuggestions = useCallback(async () => {
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://127.0.0.1:8000/api';

      // If no search term, use empty string to get popular searches
      const query = searchTerm.trim() || '';
      const url = `${apiBase.replace(/\/$/, '')}/search/suggestions?q=${encodeURIComponent(query)}`;

      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch suggestions: ${res.status}`);
      }

      const data = await res.json();

      // Defer heavy computation to avoid blocking main thread
      const processSuggestions = async () => {
        let mergedPopular: string[] = [];
        
        if (query) {
          // If there's a search term, rank and merge
        const rankedIndustry = await rankSkills(INDUSTRY_SKILLS, searchTerm);
        const backendPopular = Array.isArray(data.popular) ? data.popular : [];
          mergedPopular = Array.from(new Set([...backendPopular, ...rankedIndustry])).slice(0, 15);
        } else {
          // If no search term, show top popular from backend or default industry skills
          const backendPopular = Array.isArray(data.popular) ? data.popular : [];
          const defaultPopular = INDUSTRY_SKILLS.slice(0, 15);
          mergedPopular = Array.from(new Set([...backendPopular, ...defaultPopular])).slice(0, 15);
        }

        // Use startTransition for non-urgent UI updates
        startTransition(() => {
          setSuggestions({
            popular: mergedPopular,
            categories: data.categories || [],
            courses: data.courses || [],
            blogs: data.blogs || [],
          });
          // Only show dropdown if there's a search term or popular suggestions
          if (searchTerm.trim() || mergedPopular.length > 0) {
          setShowDropdown(true);
          }
        });
      };

      // Break up work using requestIdleCallback or setTimeout
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => processSuggestions(), { timeout: 100 });
      } else {
        setTimeout(() => processSuggestions(), 0);
      }
    } catch (error) {
      console.error(error);
      // Defer fallback computation too
      const processFallback = async () => {
        let fallbackPopular: string[] = [];
        
        if (searchTerm.trim()) {
          fallbackPopular = await rankSkills(INDUSTRY_SKILLS, searchTerm);
        } else {
          // Show default popular skills
          fallbackPopular = INDUSTRY_SKILLS.slice(0, 15);
        }
        
        startTransition(() => {
          setSuggestions({
            popular: fallbackPopular,
            categories: [],
            courses: [],
            blogs: [],
          });
          // Only show dropdown if there's a search term or popular suggestions
          if (searchTerm.trim() || fallbackPopular.length > 0) {
          setShowDropdown(true);
          }
        });
      };

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => processFallback(), { timeout: 100 });
      } else {
        setTimeout(() => processFallback(), 0);
      }
    }
  }, [searchTerm]);

  // Debounce search input - optimized with requestIdleCallback
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Don't auto-fetch or show dropdown when search term is empty
      setShowDropdown(false);
      return;
    }

    // If there's a search term, debounce the fetch
    let timeoutId: NodeJS.Timeout;
    const scheduleFetch = () => {
      timeoutId = setTimeout(() => {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(() => fetchSuggestions(), { timeout: 300 });
        } else {
          fetchSuggestions();
        }
      }, 300);
    };

    scheduleFetch();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchTerm, fetchSuggestions]);

  // Click outside handler
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Performance: Memoize hero content arrays
  const heroContent = useMemo(() => hero?.hero_content || [], [hero?.hero_content]);
  const heroPopular = useMemo(() => hero?.hero_popular || [], [hero?.hero_popular]);
  const heroImage = useMemo(() => hero?.hero_image || '/home/Frame 162.png', [hero?.hero_image]);

  // Performance: Memoize suggestion click handler
  const handleSuggestionClick = useCallback((item: string) => {
    setSearchTerm(item);
    handleSearch();
  }, [handleSearch]);

  return (
    <section 
      className="bg-gradient-to-br from-[#E8F0F7] to-[#F0F4F9] py-8 sm:py-12 md:py-16 lg:py-24 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* LEFT SECTION */}
          <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
            {/* ⭐ HERO HEADING FROM CMS */}
            <div className="space-y-3 sm:space-y-4 w-full" id="hero-heading">
              {hero?.hero_heading ? (
                <div className="[&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:md:text-4xl [&_h1]:lg:text-5xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:leading-tight [&_h1]:break-words [&_h1]:overflow-wrap-anywhere [&_h1]:w-full [&_h1]:hyphens-auto">
                  {parse(hero.hero_heading)}
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight break-words overflow-wrap-anywhere w-full">
                  Learn Skills That Matter
                </h1>
              )}
            </div>

            {/* ⭐ BULLET FEATURES FROM CMS ARRAY */}
            <ul className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-700 list-none">
              {heroContent.map((item: string) => (
                <li key={item} className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 size={14} className="sm:w-4 sm:h-4 text-[#2C5AA0] flex-shrink-0" aria-hidden="true" />
                  <span className="leading-tight">{item}</span>
                </li>
              ))}
            </ul>

            {/* SEARCH BAR */}
            <div className="pt-3 sm:pt-4 relative w-full z-50">
              {/* Accessibility: Proper form with labels */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                role="search"
                aria-label="Search courses"
                className="w-full"
              >
                <div className="flex gap-2 flex-row w-full items-center">
                  <label htmlFor="hero-search" className="sr-only">
                    Search by skill 
                  </label>
                  <div className="flex-1 flex items-center bg-white rounded-md px-2 sm:px-3 md:px-4 border border-gray-200 min-w-0 relative">
                    <input
                      id="hero-search"
                      type="text"
                      placeholder="Search by skill"
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        // Show dropdown when user starts typing
                        if (e.target.value.trim()) {
                          // Will be handled by the useEffect
                        } else {
                          setShowDropdown(false);
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        // Only show dropdown if user has typed something and suggestions exist
                        if (searchTerm.trim() && suggestions.popular?.length > 0) {
                          setShowDropdown(true);
                        }
                        // Don't auto-open dropdown on focus - let user type first
                      }}
                      className="w-full py-2.5 sm:py-3 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm sm:text-base min-w-0"
                      aria-autocomplete="list"
                      aria-controls="search-suggestions"
                      aria-describedby="search-description"
                      aria-haspopup="listbox"
                    />
                    <span id="search-description" className="sr-only">
                      Search for courses by entering a skill name
                    </span>
                  </div>

                  <button
                    type="submit"
                    aria-label="Search courses by skill"
                    className="bg-[#2C5AA0] text-white px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#1A3F66] transition-colors flex items-center justify-center w-[44px] sm:w-auto min-w-[44px] h-[44px] flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Search size={20} aria-hidden="true" className="flex-shrink-0 w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* DROPDOWN - Positioned relative to parent div */}
              {showDropdown && (suggestions.popular?.length > 0 || searchTerm.trim()) && (
                <div
                  ref={dropdownRef}
                  id="search-suggestions"
                  className="absolute top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto left-0"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {/* Header with close button */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2 z-10">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {searchTerm.trim() ? 'Suggestions' : 'Popular Searches'}
                    </div>
                    <button
                      onClick={() => setShowDropdown(false)}
                      aria-label="Close search suggestions"
                      className="text-gray-400 hover:text-gray-600 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>

                  {/* Popular Suggestions */}
                  {suggestions.popular?.length > 0 && (
                    <div className="py-1">
                        {suggestions.popular.map((item: string) => (
                            <button
                          key={item}
                              onClick={() => handleSuggestionClick(item)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#2C5AA0] transition-colors focus:outline-none focus:bg-blue-50 focus:text-[#2C5AA0] focus:ring-2 focus:ring-inset focus:ring-blue-500"
                          role="option"
                          aria-selected="false"
                          tabIndex={0}
                        >
                          <div className="flex items-center gap-2">
                            <Search size={14} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                            <span>{item}</span>
                          </div>
                            </button>
                        ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {(!suggestions.popular || suggestions.popular.length === 0) && searchTerm.trim() && (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No suggestions found for "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ⭐ MARQUEE FROM CMS */}
            <div className="pt-3 sm:pt-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 mr-2 sm:mr-3 whitespace-nowrap">Popular:</span>

                <div className="relative w-full overflow-hidden h-6" aria-label="Popular skills">
                  <div className="marquee-track">
                    {heroPopular.concat(heroPopular).map((tag: string, idx: number) => (
                      <button
                        key={`${tag}-${idx}`}
                        className="marquee-tag inline-flex items-center px-3 py-1 bg-white border border-[#E0E8F0] text-xs text-gray-600 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="button"
                        onClick={() => handleSuggestionClick(tag)}
                        aria-label={`Popular skill: ${tag}`}
                        aria-hidden={idx >= heroPopular.length}
                        tabIndex={idx >= heroPopular.length ? -1 : 0}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <style>{`
                .marquee-track {
                  display: inline-flex;
                  align-items: center;
                  gap: 2px;
                  padding-bottom: 2px;
                  white-space: nowrap;
                  animation: marquee 18s linear infinite;
                }
              `}</style>
            </div>
          </div>

          {/* ⭐ RIGHT IMAGE FROM CMS - Visible on all devices */}
          {/* Performance: Priority image for LCP - hero image is above the fold */}
          <div className="flex justify-center items-center relative order-1 md:order-2 mb-6 sm:mb-8 md:mb-0 w-full">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[450px] h-[240px] sm:h-[280px] md:h-[360px] lg:h-[450px] flex items-center justify-center z-10">
              <Image
                src={heroImage}
                alt="SkillVedika - Professional IT Training and Courses"
                width={450}
                height={450}
                className="object-contain drop-shadow-lg w-full h-full"
                priority
                quality={85}
                sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 380px, 450px"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Performance: Export memoized component
export default memo(Hero);
