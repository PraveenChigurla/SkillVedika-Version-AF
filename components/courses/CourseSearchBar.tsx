'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    if (!searchTerm.trim()) {
      setShowDropdown(false);
      return;
    }

    // Use startTransition for non-urgent search updates
    const delay = setTimeout(() => {
      startTransition(() => {
        fetchSuggestions();
      });
    }, 200);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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

      const res = await fetch(`${apiBase}/search/suggestions?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch suggestions: ${res.status}`);
      }

      const data = await res.json();

      // Process ranking asynchronously to avoid blocking
      const rankedIndustry = await rankSkills(INDUSTRY_SKILLS, searchTerm);
      const mergedPopular = Array.from(new Set([...(data.popular || []), ...rankedIndustry])).slice(
        0,
        15
      );

      // Use startTransition for non-urgent UI updates
      startTransition(() => {
        setSuggestions({
          popular: mergedPopular,
          categories: data.categories || [],
          courses: data.courses || [],
          blogs: data.blogs || [],
        });
      });

      setShowDropdown(true);
    } catch (err) {
      console.error(err);
      // Fallback to local ranking if API fails
      rankSkills(INDUSTRY_SKILLS, searchTerm).then(ranked => {
        startTransition(() => {
          setSuggestions({
            popular: ranked,
            categories: [],
            courses: [],
            blogs: [],
          });
          setShowDropdown(true);
        });
      });
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    router.push(`/courses?search=${encodeURIComponent(searchTerm)}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full max-w-xl">
      {/* INPUT + BUTTON */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center bg-white rounded-md px-4">
          <input
            type="text"
            placeholder="Search by skill"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full py-3 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <button
          onClick={handleSearch}
          aria-label="Search courses by skill"
          className="bg-[#2C5AA0] text-white px-6 py-3 rounded-md hover:bg-[#1A3F66] transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          <Search size={20} aria-hidden="true" />
        </button>
      </div>

      {/* DROPDOWN */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {/* CLOSE */}
          <div className="flex justify-end p-2 border-b">
            <button
              onClick={() => setShowDropdown(false)}
              aria-label="Close search suggestions"
              className="text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* POPULAR */}
          {suggestions.popular.length > 0 && (
            <>
              <div className="px-4 pb-2 text-xs text-gray-500">Popular Searches</div>
              {suggestions.popular.map((item: string) => (
                <div
                  key={item}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSearchTerm(item);
                    handleSearch();
                  }}
                >
                  {item}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
