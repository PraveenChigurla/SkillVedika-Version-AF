'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// Defer heavy ranking logic until after initial render

export default function CourseSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any>({
    popular: [],
    categories: [],
    courses: [],
    blogs: [],
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isFromUrlRef = useRef(false); // Use ref to persist across renders

  // Read search query from URL on mount
  useEffect(() => {
    const urlSearch = searchParams?.get('search') || '';
    if (urlSearch) {
      isFromUrlRef.current = true; // Mark that search term is coming from URL
      setSearchTerm(urlSearch);
      setShowDropdown(false); // Explicitly close dropdown
      // Reset the flag after component has fully mounted
      setTimeout(() => {
        isFromUrlRef.current = false;
        setIsInitialMount(false);
      }, 500); // Longer delay to ensure all effects have run
    } else {
      isFromUrlRef.current = false;
      setIsInitialMount(false);
    }
  }, [searchParams]);

  // 🎯 SAME industry skills + ranking logic
  const INDUSTRY_SKILLS = [
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
    'Node.js',
    'Express.js',
    'React',
    'Next.js',
    'Angular',
    'Vue.js',
    'Svelte',
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Android Development',
    'iOS Development',
    'UI/UX Design',
    'Figma',
    'SQL',
    'MySQL',
    'MongoDB',
    'PostgreSQL',
    'Data Science',
    'Machine Learning',
    'Deep Learning',
    'NLP',
    'TensorFlow',
    'PyTorch',
    'Cybersecurity',
    'Ethical Hacking',
    'Testing',
    'Selenium',
    'Cypress',
    'Digital Marketing',
    'SEO',
  ];

  // BASIC Levenshtein
  const levenshtein = (a: string, b: string) => {
    const dp: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      dp[i] = new Array(b.length + 1).fill(0);
    }
    
    for (let i = 0; i <= a.length; i++) {
      dp[i]![0] = i;
    }
    for (let j = 0; j <= b.length; j++) {
      dp[0]![j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i]![j] = Math.min(
          dp[i - 1]![j]! + 1,
          dp[i]![j - 1]! + 1,
          dp[i - 1]![j - 1]! + cost
        );
      }
    }
    return dp[a.length]![b.length]!;
  };

  // Optimized rankSkills with chunked processing to reduce TBT
  const rankSkills = (skills: string[], query: string): Promise<string[]> => {
    return new Promise(resolve => {
      const q = query.trim().toLowerCase();
      if (!q) {
        resolve(skills.slice(0, 15));
        return;
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
          // All chunks processed, sort and return
          scored.sort((a, b) => b.score - a.score);
          resolve(scored.slice(0, 15).map(x => x.skill));
          return;
        }

        const chunk = chunks[chunkIndex];
        if (chunk) {
        chunk.forEach(skill => {
          const s = skill.toLowerCase();
          let score = 0;

          if (s.startsWith(q)) score += 100;
          if (s.includes(q)) score += 60;

          const dist = levenshtein(q, s);
          score += Math.max(0, 40 - dist);

          scored.push({ skill, score });
        });
        }

        chunkIndex++;
        // Schedule next chunk processing
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(processChunk, { timeout: 50 });
        } else {
          setTimeout(processChunk, 0);
        }
      };

      processChunk();
    });
  };

  // DEBOUNCE LOGIC - defer heavy operations
  useEffect(() => {
    // Don't auto-fetch or show dropdown on initial mount (when coming from URL)
    if (isInitialMount || isFromUrlRef.current) {
      return;
    }

    if (!searchTerm.trim()) {
      // Don't auto-open dropdown when search term is cleared
      setShowDropdown(false);
      return;
    }

    // If there's a search term (and user is actively typing), debounce the fetch
    let delay: NodeJS.Timeout;
    delay = setTimeout(() => {
      startTransition(() => {
        fetchSuggestions();
      });
    }, 200);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, isInitialMount]);

  // CLOSE DROPDOWN
  useEffect(() => {
    const handler = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // GET SUGGESTIONS - optimized with fetch and chunked processing
  const fetchSuggestions = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const query = searchTerm.trim() || '';

      const res = await fetch(`${apiBase}/search/suggestions?q=${encodeURIComponent(query)}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch suggestions: ${res.status}`);
      }

      const data = await res.json();

      // Process ranking asynchronously to avoid blocking
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
        // Only show dropdown if user is actively typing (not from URL or initial mount)
        if (!isInitialMount && !isFromUrlRef.current && searchTerm.trim()) {
          setShowDropdown(true);
        }
      });
    } catch (err) {
      console.error(err);
      // Fallback to local ranking if API fails
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
        // Only show dropdown if user is actively typing (not from URL or initial mount)
        if (!isInitialMount && !isFromUrlRef.current && searchTerm.trim()) {
          setShowDropdown(true);
        }
      });
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    router.push(`/courses?search=${encodeURIComponent(searchTerm)}`);
    setShowDropdown(false);
  };

  const handleSuggestionClick = (item: string) => {
    setSearchTerm(item);
    handleSearch();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* INPUT + BUTTON */}
      <div className="flex gap-2 flex-row w-full items-center overflow-visible">
        <div className="flex-1 flex items-center bg-white rounded-md px-2 sm:px-3 md:px-4 border border-gray-200 min-w-0 overflow-visible relative">
          <input
            type="text" 
            placeholder="Search by skill"
            value={searchTerm}
            onChange={e => {
              // Mark that this is user input, not from URL
              isFromUrlRef.current = false;
              setIsInitialMount(false);
              setSearchTerm(e.target.value);
              // Show dropdown when user starts typing
              if (e.target.value.trim()) {
                // Will be handled by the useEffect
              } else {
                setShowDropdown(false);
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSearch();
              } else if (e.key === 'Escape') {
                setShowDropdown(false);
              }
            }}
            onFocus={() => {
              // Only show dropdown if:
              // 1. User has typed something (not from URL)
              // 2. Suggestions exist
              // 3. This is not the initial mount with URL search
              if (!isFromUrlRef.current && !isInitialMount && searchTerm.trim() && suggestions.popular?.length > 0) {
                setShowDropdown(true);
              }
              // Don't auto-open dropdown on focus when search term comes from URL
            }}
            className="w-full py-2.5 sm:py-3 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm sm:text-base min-w-0"
            aria-autocomplete="list"
            aria-controls="course-search-suggestions"
            aria-haspopup="listbox"
          />
        </div>

        <button
          onClick={handleSearch}
          aria-label="Search courses by skill"
          className="bg-[#2C5AA0] text-white px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-md hover:bg-[#1A3F66] transition-colors flex items-center justify-center w-[44px] sm:w-auto min-w-[44px] h-[44px] flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Search size={20} aria-hidden="true" className="flex-shrink-0 w-5 h-5" />
        </button>
      </div>

      {/* DROPDOWN */}
      {showDropdown && (suggestions.popular?.length > 0 || searchTerm.trim()) && (
        <div
          ref={dropdownRef}
          id="course-search-suggestions"
          className="absolute top-full mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-xl z-[100] max-h-60 overflow-y-auto scrollbar-hidden"
          role="listbox"
          aria-label="Search suggestions"
        >
          {/* Header with close button */}
          <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
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

          {/* POPULAR SUGGESTIONS */}
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
  );
}
