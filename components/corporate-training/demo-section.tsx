'use client';

import { useState, useRef, useEffect, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { Checkbox } from '@/components/ui/checkbox';
// Import CSS statically - required for Next.js 16/Turbopack
import 'react-phone-input-2/lib/style.css';

// Lazy load heavy components to reduce initial bundle size
const PhoneInput = dynamic(() => import('react-phone-input-2').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />,
});

/* Make country list text black + local animations */
const phoneStyles = `
  .react-tel-input .country-list .country { color: #000 !important; }
  .react-tel-input .country-list .country .dial-code { color: #000 !important; }
  .react-tel-input .selected-flag .arrow { border-top-color: #000 !important; }

  /* Animation moved to external CSS file for better performance */
`;

export default function DemoSection({
  title,
  points,
  allCourses,
  formDetails,
}: {
  title: { main?: string; title?: string };
  points: string[];
  allCourses: any[];
  formDetails?: any;
}) {
  /* ----------------------------
       FORM STATE
  ----------------------------- */
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    fullPhone: '',
    countryCode: '+91',
    selectedCourses: [] as number[],
    terms: true,
  });

  const [searchTerm, setSearchTerm] = useState('');

  /* ----------------------------
       COURSE DROPDOWN
  ----------------------------- */
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    function closeOnClickOutside(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', closeOnClickOutside);
    return () => document.removeEventListener('mousedown', closeOnClickOutside);
  }, []);

  /* ----------------------------
       SUBMIT FORM
  ----------------------------- */
  async function handleSubmit(e: any) {
    e.preventDefault();

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert('Please enter a valid email.');
      return;
    }

    // Phone validation
    const digits = formData.fullPhone.replace(/\D/g, '');
    const cc = formData.countryCode.replace('+', '');
    const local = digits.replace(cc, '');

    if (local.length < 7 || local.length > 12) {
      alert('Enter a valid phone number (7–12 digits).');
      return;
    }

    // India strict rule
    if (formData.countryCode === '+91') {
      if (!/^[6-9][0-9]{9}$/.test(local)) {
        alert('Enter a valid Indian number starting with 6,7,8,9');
        return;
      }
    }

    if (formData.selectedCourses.length === 0) {
      alert('Please select at least one course.');
      return;
    }

    if (!formData.terms) {
      alert('Please accept Terms & Conditions.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        alert('Missing NEXT_PUBLIC_API_URL');
        return;
      }

      const res = await fetch(`${apiUrl}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.fullPhone,
          courses: formData.selectedCourses,
          page: 'Corporate Training',
        }),
      });

      if (!res.ok) {
        // Try to read error response
        let errorMessage = 'Failed to submit form';
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.errors) {
            // Handle validation errors
            const errors = Object.values(errorData.errors).flat();
            errorMessage = errors.join(', ') || errorMessage;
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `Failed to submit form (${res.status}: ${res.statusText})`;
        }
        console.error('Form submission error:', {
          status: res.status,
          statusText: res.statusText,
          url: `${apiUrl}/enroll`,
        });
        alert(errorMessage);
        return;
      }

      const json = await res.json();
      alert(json.message || (json.success ? 'Submitted successfully!' : 'Submitted!'));

      // Reset
      setFormData({
        fullName: '',
        email: '',
        fullPhone: '',
        countryCode: '+91',
        selectedCourses: [],
        terms: false,
      });
    } catch (err) {
      alert('Something went wrong');
      console.error(err);
    }
  }

  /* ------------------ FILTER COURSES ------------------ */
  // Ensure allCourses is always an array
  const coursesArray = Array.isArray(allCourses) ? allCourses : [];

  const filteredCourses = coursesArray
    .filter((c: any) => c && !formData.selectedCourses.includes(c.id))
    .filter((c: any) => c?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a: any, b: any) => {
      const s = searchTerm.toLowerCase();
      const aStarts = a?.title?.toLowerCase().startsWith(s);
      const bStarts = b?.title?.toLowerCase().startsWith(s);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

  /* ----------------------------
       UI
  ----------------------------- */
  return (
    <section className="bg-gradient-to-br from-blue-50 to-purple-100 py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <style>{phoneStyles}</style>

      {/* Decorative Elements - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block absolute top-10 left-10 w-32 h-32 border-8 border-orange-400 rounded-full opacity-40"></div>
      <div className="hidden lg:block absolute bottom-20 left-20 w-40 h-40 border-8 border-orange-400 rounded-full opacity-30"></div>
      <div className="hidden lg:block absolute bottom-10 right-10 w-48 h-48 bg-blue-900 rounded-full opacity-20"></div>

      <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:flex-row lg:gap-12 items-start relative z-10">
        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {title?.main || title?.title || 'Get A Live Free Demo'}
          </h2>

          <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
            {(points || []).map((point, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-blue-600 flex-shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full lg:w-1/2 bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl">
          {/* TITLE */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-black mb-2 sm:mb-4">
            {formDetails?.form_title || 'Book Your Free Demo'}
          </h2>

          {/* Sub heading */}
          <p className="text-sm sm:text-base text-gray-600 text-center mt-2 flex items-center justify-center gap-2">
            {formDetails?.form_subtitle || 'Our team will contact you shortly.'}
            <span className="text-yellow-500 inline-block shake">🔔</span>
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* NAME */}
            <div className="space-y-2">
              <label htmlFor="corporate-name" className="text-sm sm:text-base text-gray-700 font-medium">
                {formDetails?.full_name_label || 'Full Name'}
              </label>
              <input
                id="corporate-name"
                name="fullName"
                autoComplete="name"
                required
                placeholder={formDetails?.full_name_placeholder || 'Enter your full name'}
                value={formData.fullName}
                onChange={e =>
                  startTransition(() => setFormData({ ...formData, fullName: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base min-h-[44px]"
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label htmlFor="corporate-email" className="text-sm sm:text-base text-gray-700 font-medium">
                {formDetails?.email_label || 'Email Address'}
              </label>
              <input
                id="corporate-email"
                name="email"
                autoComplete="email"
                required
                placeholder={formDetails?.email_placeholder || 'you@example.com'}
                type="email"
                value={formData.email}
                onChange={e =>
                  startTransition(() => setFormData({ ...formData, email: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base min-h-[44px]"
              />
            </div>

            {/* PHONE */}
            <div className="space-y-2">
              <label htmlFor="corporate-phone" className="text-sm sm:text-base text-gray-700 font-medium">
                {formDetails?.phone_label || 'Phone Number'}
              </label>

              <div className="relative">
                <PhoneInput
                  country={'in'}
                  value={formData.fullPhone}
                  onChange={(value: any, country: any) =>
                    setFormData({
                      ...formData,
                      fullPhone: '+' + value,
                      countryCode: '+' + ((country as any)?.dialCode || ''),
                    })
                  }
                  inputProps={{
                    id: 'corporate-phone',
                    name: 'phone',
                    autoComplete: 'tel',
                    required: true,
                  }}
                  inputStyle={{
                    width: '100%',
                    height: '48px',
                    fontSize: '16px',
                  }}
                  buttonStyle={{ border: '1px solid #d1d5db' }}
                  containerStyle={{ width: '100%' }}
                />

                {!formData.fullPhone && (
                  <span className="absolute left-[82px] inset-y-0 flex items-center text-gray-400 pointer-events-none text-sm">
                    {formDetails?.phone_placeholder || 'Enter phone number'}
                  </span>
                )}
              </div>
            </div>

            {/* COURSE DROPDOWN */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-sm text-gray-700">
                <span className="text-red-500">*</span>{' '}
                {formDetails?.course_label || 'Select Courses'}
              </label>

              <div
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white flex flex-wrap gap-2"
                onClick={() => setOpen(!open)}
              >
                {formData.selectedCourses.length === 0 ? (
                  <span className="text-gray-500">
                    {formDetails?.course_placeholder || 'Choose courses'}
                  </span>
                ) : (
                  formData.selectedCourses.map(id => {
                    const course = allCourses.find((c: any) => c.id === id);
                    return (
                      <span
                        key={id}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-2"
                        onClick={e => {
                          e.stopPropagation();
                          setFormData({
                            ...formData,
                            selectedCourses: formData.selectedCourses.filter(c => c !== id),
                          });
                        }}
                      >
                        {course?.title}
                        <span className="font-bold">×</span>
                      </span>
                    );
                  })
                )}
              </div>

              {open && (
                <div className="absolute left-0 top-[105%] w-full bg-white border rounded-xl shadow-lg max-h-72 overflow-y-auto z-50">
                  <div className="p-2 sticky top-0 bg-white border-b">
                    <div className="flex items-center border rounded-lg px-2">
                      <label htmlFor="corporate-course-search" className="sr-only">
                        Search courses
                      </label>
                      <input
                        id="corporate-course-search"
                        name="courseSearch"
                        type="search"
                        autoComplete="off"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={e => startTransition(() => setSearchTerm(e.target.value))}
                        className="w-full py-2 outline-none"
                      />
                      {searchTerm && (
                        <span
                          className="text-gray-500 font-bold text-lg px-2"
                          onClick={() => setSearchTerm('')}
                        >
                          ×
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2">
                    {filteredCourses.map((c: any) => (
                      <div
                        key={c.id}
                        className="px-3 py-2 rounded hover:bg-gray-100"
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

                    {filteredCourses.length === 0 && (
                      <div className="text-gray-500 text-sm p-3 text-center">
                        No matching courses
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TERMS */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="corporate-terms"
                checked={Boolean(formData.terms)}
                onCheckedChange={v =>
                  startTransition(() => setFormData({ ...formData, terms: Boolean(v) }))
                }
                aria-label="Accept Terms and Conditions"
              />
              <label htmlFor="corporate-terms" className="text-sm text-gray-600 cursor-pointer">
                {formDetails?.terms_prefix || 'I agree with the'}{' '}
                <a
                  className="text-blue-600 hover:underline"
                  href={formDetails?.terms_link || '#'}
                  target="_blank"
                >
                  {formDetails?.terms_label || 'Terms & Conditions'}
                </a>
                .
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit"
              className="w-full bg-[#1e5ba8] text-white py-3 rounded-xl font-semibold hover:opacity-90 active:opacity-80 transition-opacity min-h-[44px] flex items-center justify-center text-sm sm:text-base"
            >
              {formDetails?.submit_button_text || 'Submit Your Details'}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
            <span className="text-orange-500">🔒</span>
            {formDetails?.form_footer_text || 'Your information is secure.'}
          </p>
        </div>
      </div>
    </section>
  );
}
