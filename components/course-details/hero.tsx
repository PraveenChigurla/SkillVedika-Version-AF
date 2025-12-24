'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
// Import CSS statically - required for Next.js 16/Turbopack
import 'react-phone-input-2/lib/style.css';

// Lazy load PhoneInput to reduce initial bundle size
const PhoneInput = dynamic(() => import('react-phone-input-2'), {
  ssr: false,
  loading: () => <div className="h-12 w-full bg-gray-100 rounded-md animate-pulse" />,
});

// 🔥 FIX country names / dial codes to BLACK and font loading
const phoneStyles = `
  .react-tel-input {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  }
  .react-tel-input .country-list .country {
    color: #000 !important;
  }
  .react-tel-input .country-list .country .dial-code {
    color: #000 !important;
  }
  .react-tel-input .selected-flag .arrow {
    border-top-color: #000 !important;
  }
`;

export default function Hero({
  course,
  allCourses,
  formDetails: initialFormDetails,
}: {
  course: any;
  allCourses: any[];
  formDetails?: any;
}) {
  // ⭐ Your API format:
  // course = { id, title, image, description, ... }
  // course.details = { subtitle, trainers, agenda, etc. }
  const details = course?.details || {};

  // Parse skills which may be stored as an array or a JSON string in `details.skill`.
  let skills: string[] = [];
  try {
    const raw = details?.skill;
    if (Array.isArray(raw)) {
      skills = raw;
    } else if (typeof raw === 'string' && raw.trim()) {
      // if backend saved JSON string, parse it
      const parsed = JSON.parse(raw);
      skills = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    skills = [];
  }

  const [formDetails, setFormDetails] = useState<any>(initialFormDetails || null);

  const [formData, setFormData] = useState({
    name: '',
    selectedCourses: [course?.id],
    email: '',
    fullPhone: '',
    countryCode: '+91',
    terms: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch form-details client-side if not passed in - defer with requestIdleCallback
  useEffect(() => {
    if (initialFormDetails) {
      setFormDetails(initialFormDetails);
      return;
    }

    const loadFormDetails = () => {
      async function load() {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
          if (!apiUrl) return;

          const res = await fetch(`${apiUrl}/form-details`, {
            cache: 'force-cache',
            next: { revalidate: 3600 },
          });

          if (!res.ok) return;
          const rawPayload = await res.json();

          // Handle both wrapped (success + data) and direct array/object responses
          let payload = rawPayload;
          if (rawPayload?.success && rawPayload?.data) {
            payload = rawPayload.data;
          }

          const fd = Array.isArray(payload) ? payload[payload.length - 1] : payload;
          setFormDetails(fd);
        } catch (err) {
          // Silently fail - form will work with defaults
          console.warn('Failed to load form details:', err);
        }
      }
      load().catch(() => {
        // Handle unhandled promise rejection
      });
    };

    // Defer form details fetch until after page is interactive
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadFormDetails, { timeout: 2000 });
    } else {
      setTimeout(loadFormDetails, 1000);
    }
  }, [initialFormDetails]);

  useEffect(() => {
    function handleClickOutside(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ----------------------------------------------------------
  // ⭐ FORM SUBMIT HANDLER
  // ----------------------------------------------------------
  async function handleSubmit(e: any) {
    e.preventDefault();

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // PHONE VALIDATION
    const digitsOnly = formData.fullPhone.replace(/\D/g, '');
    const cc = formData.countryCode.replace('+', '');
    const local = digitsOnly.replace(cc, '');

    if (local.length < 7 || local.length > 12) {
      alert('Enter a valid phone number (7–12 digits).');
      return;
    }

    if (formData.countryCode === '+91' && !/^[6-9][0-9]{9}$/.test(local)) {
      alert('Enter a valid 10-digit Indian number starting with 6–9.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      const res = await fetch(`${apiUrl}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.fullPhone,
          courses: formData.selectedCourses,
          page: course.title,
        }),
      });

      if (!res.ok) {
        alert('Submission failed.');
        return;
      }

      alert('Your details have been submitted!');

      // Reset form
      setFormData({
        name: '',
        selectedCourses: [course?.id],
        email: '',
        fullPhone: '',
        countryCode: '+91',
        terms: false,
      });
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    }
  }

  // ----------------------------------------------------------
  // 🌟 TRAINERS FROM DETAILS (with fallback)
  // ----------------------------------------------------------
  const trainers =
    details?.trainers?.length > 0
      ? details.trainers
      : [
          { name: 'Dr. Rajesh Khandelwal', role: 'Trainer & Head' },
          { name: 'Margaret Croswell', role: 'Industry Expert' },
          { name: 'Aarav Sharma', role: 'Program Lead' },
          { name: 'Lia Mahmudet', role: 'Certification Mentor' },
        ];

  const displayTrainers = trainers.slice(0, 4);

  // ----------------------------------------------------------
  // ⭐ FULL HERO COMPONENT (UI PRESERVED 100%)
  // ----------------------------------------------------------
  return (
    <>
      <style>{phoneStyles}</style>

      <section className="bg-gradient-to-b from-[#1A3F66] to-[#1A3F66] text-white px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE */}
          <div>
            <div className="inline-block bg-white rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-black">
                ⭐ Trusted by 1000+ Professionals
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">{course.title}</h1>

            {/* ⭐ Dynamic subtitle */}
            {details.subtitle && (
              <p className="text-lg text-blue-200 font-medium mb-2 text-justify">
                {details.subtitle}
              </p>
            )}

            <p className="text-lg text-blue-100 mb-8 leading-relaxed text-justify">
              {course.description}
            </p>

            {/* Skills (show after subtitle). Ex: Skills: A, B */}
            {skills.length > 0 && (
              <p className="text-sm text-blue-100 mb-2 text-justify">
                <span className="font-medium text-blue-100 mr-1">Skills:</span>
                {skills.join(', ')}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              {displayTrainers.map((t: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <div className="w-10 h-10 bg-white/30 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-blue-200">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-white rounded-lg p-8 shadow-xl text-black">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {formDetails?.form_title || 'Book A Free Demo'}
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* NAME */}
              <div>
                <label
                  htmlFor="course-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {formDetails?.full_name_label || 'Full Name'}
                </label>
                <input
                  id="course-name"
                  name="name"
                  autoComplete="name"
                  required
                  placeholder={formDetails?.full_name_placeholder || 'Enter your full name'}
                  type="text"
                  value={formData.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* COURSE DROPDOWN */}
              <div ref={dropdownRef} className="relative">
                <label
                  htmlFor="course-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {formDetails?.course_label || 'Courses'}
                </label>

                <div
                  id="course-select"
                  role="combobox"
                  aria-expanded={open}
                  aria-haspopup="listbox"
                  onClick={() => setOpen(!open)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex justify-between items-center"
                >
                  <div className="flex flex-wrap gap-2 max-w-[85%]">
                    {formData.selectedCourses.map((id, index) => {
                      const c = allCourses.find((x: any) => x.id === id);
                      return (
                        <span
                          key={`course-${id}-${index}`}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1"
                        >
                          {c?.title}
                          <span
                            className="cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              setFormData({
                                ...formData,
                                selectedCourses: formData.selectedCourses.filter(x => x !== id),
                              });
                            }}
                          >
                            ×
                          </span>
                        </span>
                      );
                    })}
                  </div>

                  <span>{open ? '▲' : '▼'}</span>
                </div>

                {open && (
                  <div className="absolute z-50 bg-white text-black border rounded-lg shadow-lg top-[105%] w-full max-h-60 overflow-y-auto">
                    <div className="p-2 border-b">
                      <label htmlFor="course-search" className="sr-only">
                        Search courses
                      </label>
                      <input
                        id="course-search"
                        name="courseSearch"
                        type="search"
                        autoComplete="off"
                        placeholder={formDetails?.course_placeholder || 'Search courses...'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    {allCourses
                      .filter((c: any) => !formData.selectedCourses.includes(c.id))
                      .filter((c: any) => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((c: any) => (
                        <div
                          key={c.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              selectedCourses: [...formData.selectedCourses, c.id],
                            })
                          }
                        >
                          {c.title}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="course-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {formDetails?.email_label || 'Email'}
                </label>
                <input
                  id="course-email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder={formDetails?.email_placeholder || 'you@example.com'}
                  type="email"
                  value={formData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* PHONE */}
              <div>
                <Label htmlFor="course-phone">{formDetails?.phone_label || 'Phone Number'}</Label>
                <div className="relative mt-1">
                  <PhoneInput
                    country="in"
                    value={formData.fullPhone}
                    onChange={(value: any, country: any) =>
                      setFormData({
                        ...formData,
                        fullPhone: '+' + value,
                        countryCode: '+' + ((country as any)?.dialCode || ''),
                      })
                    }
                    inputProps={{
                      id: 'course-phone',
                      name: 'phone',
                      autoComplete: 'tel',
                      required: true,
                    }}
                    inputStyle={{ width: '100%', height: '45px', fontSize: '16px', color: 'black' }}
                    buttonStyle={{ border: '1px solid #d1d5db' }}
                    containerStyle={{ width: '100%' }}
                  />

                  {!formData.fullPhone && (
                    <span className="absolute left-[82px] top-0 bottom-0 flex items-center text-gray-400 pointer-events-none">
                      {formDetails?.phone_placeholder || 'Enter phone number'}
                    </span>
                  )}
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="w-full bg-[#1e5ba8] hover:bg-blue-900 text-white font-semibold py-3 rounded-lg"
              >
                {formDetails?.submit_button_text || 'Submit your details'}
              </button>
            </form>
          </div>
        </div>

        {/* LIMITED SEATS BOX */}
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center mt-12">
          <div className="flex justify-center items-center gap-2 mb-1">
            <div className="relative flex justify-center items-center">
              <span className="absolute w-4 h-4 bg-red-600 rounded-full animate-ping opacity-75"></span>
              <span className="relative w-3 h-3 bg-red-600 rounded-full"></span>
            </div>
            <p className="text-red-600">Limited Seats Available</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Next Batch Starts Soon</h2>
          <p className="text-gray-600">Secure your seat today!</p>
        </div>
      </section>
    </>
  );
}
