'use client';

// EnrollModal.tsx - Standalone Reusable Component
// ================================================

import { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import 'react-phone-input-2/lib/style.css';

// CSS loading is deferred - loaded only when PhoneInput is actually rendered
// This prevents blocking the critical path on homepage

// Lazy load PhoneInput - only loads when modal opens
// This prevents loading the JS bundle on homepage
const PhoneInput = dynamic(() => import('react-phone-input-2'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 rounded-md animate-pulse" />,
});

/* Make country dropdown text black and ensure flags display properly */
/* Also fix ugly cursor/caret lines in all input fields */
const phoneStyles = `
  /* Fix ugly cursor/caret in all inputs */
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="password"],
  input[type="number"],
  input[type="search"],
  textarea {
    caret-color: #0066CC !important;
    outline: none !important;
  }
  
  input[type="text"]:focus,
  input[type="email"]:focus,
  input[type="tel"]:focus,
  input[type="password"]:focus,
  input[type="number"]:focus,
  input[type="search"]:focus,
  textarea:focus {
    outline: none !important;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1) !important;
  }

  .react-tel-input {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    width: 100% !important;
    position: relative !important;
  }
  .react-tel-input .country-list {
    z-index: 999999 !important;
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    width: 100% !important;
    min-width: 300px !important;
    max-height: 300px !important;
    overflow-y: auto !important;
    overflow-x: visible !important;
    background-color: #ffffff !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 0.5rem !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    margin-top: 4px !important;
  }
  .react-tel-input .country-list .country {
    color: #000 !important;
    padding: 10px 12px !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
  .react-tel-input .country-list .country:hover {
    background-color: #f9fafb !important;
  }
  .react-tel-input .country-list .country .flag {
    display: inline-block !important;
    vertical-align: middle !important;
    margin-right: 8px !important;
  }
  .react-tel-input .country-list .country .dial-code {
    color: #000 !important;
    font-weight: 600 !important;
    display: inline-block !important;
    margin-left: 8px !important;
    margin-right: 8px !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  .react-tel-input .country-list .country .country-name {
    color: #000 !important;
    display: inline-block !important;
    overflow: visible !important;
    white-space: nowrap !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
  .react-tel-input .selected-flag .arrow {
    border-top-color: #000 !important;
  }
  .react-tel-input .form-control {
    padding-left: 60px !important;
    color: #111827 !important;
    background-color: #f9fafb !important;
    width: 100% !important;
    caret-color: #0066CC !important;
    outline: none !important;
  }
  .react-tel-input .form-control:focus {
    outline: none !important;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1) !important;
  }
  .react-tel-input .form-control::placeholder {
    color: #9ca3af !important;
    opacity: 1 !important;
  }
`;

// ==================== TYPES ====================
type Course = { id: number; title: string };

interface EnrollModalProps {
  courses?: Course[];
  onClose: () => void;
  page?: string;
  formDetails?: any;
  onSubmit?: (data: {
    fullName: string;
    email: string;
    phone: string;
    selectedCourses: number[];
  }) => Promise<void>;
}

// ==================== HELPER ====================
function safeTitle(course: Course | undefined, id: number) {
  if (!course) return `Course ${id}`;
  return typeof course.title === 'string' ? course.title : String(course.title);
}

// ==================== CHECKBOX COMPONENT ====================
function Checkbox({
  checked,
  onChange,
  id,
}: Readonly<{ checked: boolean; onChange: (v: boolean) => void; id: string }>) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
    />
  );
}

// ==================== MAIN COMPONENT ====================
export function EnrollModal({
  courses = [],
  onClose,
  page = ' ',
  onSubmit,
  formDetails: initialFormDetails,
}: EnrollModalProps) {
  // Ensure courses is always an array - handle all edge cases
  const courseList: Course[] = useMemo(() => {
    if (!courses) return [];
    if (Array.isArray(courses)) return courses;
    // Handle case where API returns {success: true, data: [...]}
    if (courses && typeof courses === 'object') {
      const obj = courses as any;
      if ('data' in obj && Array.isArray(obj.data)) {
        return obj.data;
      }
      // Handle case where it's an object with courses property
      if ('courses' in obj && Array.isArray(obj.courses)) {
        return obj.courses;
      }
    }
    return [];
  }, [courses]);
  const [formDetails, setFormDetails] = useState<any>(initialFormDetails || null);
  const [, setLoadingFormDetails] = useState(!initialFormDetails);

  // Fetch form-details client-side if not passed in
  useEffect(() => {
    if (initialFormDetails) {
      setFormDetails(initialFormDetails);
      setLoadingFormDetails(false);
      return;
    }

    async function load() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (!apiUrl) {
          setLoadingFormDetails(false);
          return;
        }

        const res = await fetch(`${apiUrl}/form-details`, { cache: 'no-store' });
        if (!res.ok) {
          console.warn(`Failed to fetch form-details: ${res.status}`);
          setLoadingFormDetails(false);
          return;
        }

        const rawPayload = await res.json();
        let payload = rawPayload;

        // Handle array or single object response
        if (Array.isArray(rawPayload)) {
          payload = rawPayload[rawPayload.length - 1];
        } else if (rawPayload?.success && rawPayload?.data) {
          payload = Array.isArray(rawPayload.data)
            ? rawPayload.data[rawPayload.data.length - 1]
            : rawPayload.data;
        }

        console.log('Loaded form details:', payload);
        setFormDetails(payload);
      } catch (err) {
        console.warn('Failed to fetch form-details in EnrollModal:', err);
      } finally {
        setLoadingFormDetails(false);
      }
    }

    load();
  }, [initialFormDetails]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    fullPhone: '',
    countryCode: '+91',
    selectedCourses: [] as number[],
    terms: true,
  });

  // Ensure PhoneInput CSS is loaded when component mounts (for portal context)
  useEffect(() => {
    // The CSS is already imported at the top, but ensure it's available in portal
    // This helps when the component is rendered in a portal (QueryPopup/StickyFooter)
    if (typeof document !== 'undefined') {
      const existingStyle = document.querySelector('link[href*="react-phone-input-2"]');
      if (!existingStyle) {
        // CSS should already be loaded via import, but this is a fallback
        console.debug('PhoneInput CSS check');
      }
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Lock background scroll and handle Escape key while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const validateEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

  const validatePhone = () => {
    const digits = (formData.fullPhone || '').replace(/\D/g, '');
    const cc = (formData.countryCode || '').replace('+', '');
    const local = digits.startsWith(cc) ? digits.slice(cc.length) : digits;

    if (local.length < 7 || local.length > 12) {
      alert('Enter a valid phone number (7–12 digits).');
      return false;
    }

    if (formData.countryCode === '+91' && !/^[6-9][0-9]{9}$/.test(local)) {
      alert('Enter a valid Indian number starting with 6–9.');
      return false;
    }
    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitStatus('idle');
    setSubmitMessage('');

    if (!validateEmail(formData.email)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email.');
      return;
    }

    if (!validatePhone()) return;

    // Only require course selection when the modal was given a non-empty course list
    if (courseList.length > 0 && formData.selectedCourses.length === 0) {
      setSubmitStatus('error');
      setSubmitMessage('Select at least one course.');
      return;
    }

    if (!formData.terms) {
      setSubmitStatus('error');
      setSubmitMessage('Please accept Terms & Conditions.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL not set');
      }

      const res = await fetch(`${apiUrl}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.fullPhone,
          courses: formData.selectedCourses,
          page: page,
        }),
      });

      if (!res.ok) {
        throw new Error('Form submission failed');
      }

      const json = await res.json();
      setSubmitStatus('success');
      setSubmitMessage(json.message || 'Demo booked successfully!');

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        fullPhone: '',
        countryCode: '+91',
        selectedCourses: [],
        terms: true,
      });
      setSearchTerm('');

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err instanceof Error ? err.message : 'Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredCourses = useMemo(() => {
    const s = (searchTerm || '').toLowerCase();
    // Exclude already selected and prioritize startsWith matches like get-live-demo
    const candidates = courseList.filter(c => !formData.selectedCourses.includes(c.id));
    const starts: Course[] = [];
    const contains: Course[] = [];
    for (const c of candidates) {
      const t = (c.title || '').toLowerCase();
      if (s && t.startsWith(s)) starts.push(c);
      else if (s && t.includes(s)) contains.push(c);
      else if (!s) starts.push(c);
    }
    return [...starts, ...contains];
  }, [courseList, searchTerm, formData.selectedCourses]);

  const toggleCourse = (id: number) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(id)
        ? prev.selectedCourses.filter(c => c !== id)
        : [...prev.selectedCourses, id],
    }));
    // Close dropdown after selecting a course
    setIsDropdownOpen(false);
  };

  // Render modal into document body to avoid stacking context issues
  return createPortal(
    <>
      <style>{phoneStyles}</style>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-xl z-[100000] bg-white rounded-2xl shadow-2xl p-6 md:p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close enrollment modal"
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-[#0066CC] to-[#00A3E0] mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div> */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {formDetails?.form_title ? (
              <>{formDetails.form_title}</>
            ) : (
              <>
                Book Your <span className="text-[#0066CC]">Free Demo</span>
              </>
            )}
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            {formDetails?.form_subtitle ||
              'Our team will contact you shortly to schedule your session.'}
          </p>
        </div>

        {/* Scrollable Form Container */}
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto pr-2 scrollbar-hidden">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="enroll-name" className="text-sm font-medium text-gray-700">
                {formDetails?.full_name_label || 'Full Name'}
              </label>
              <input
                id="enroll-name"
                name="fullName"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all text-sm"
                placeholder={formDetails?.full_name_placeholder || 'Enter your full name'}
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="enroll-email" className="text-sm font-medium text-gray-700">
                {formDetails?.email_label || 'Email Address'}
              </label>
              <input
                id="enroll-email"
                name="email"
                required
                type="email"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all text-sm"
                placeholder={formDetails?.email_placeholder || 'you@example.com'}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="enroll-phone" className="text-sm font-medium text-gray-700">
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
                    id: 'enroll-phone',
                    name: 'phone',
                    autoComplete: 'tel',
                    required: true,
                  }}
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    fontSize: '14px',
                  }}
                  buttonStyle={{ border: '1px solid #d1d5db' }}
                  containerStyle={{ width: '100%' }}
                />

                {!formData.fullPhone && (
                  <span className="absolute left-[82px] inset-y-0 flex items-center text-gray-400 pointer-events-none text-sm">
                    {formDetails?.phone_placeholder || '  Enter phone number'}
                  </span>
                )}
              </div>
            </div>

            {/* Course Selection */}
            <div className="space-y-2" ref={dropdownRef}>
              <label className="text-sm font-medium text-gray-700">
                {formDetails?.course_label || 'Select Courses'}
              </label>

              <input
                type="text"
                placeholder={formDetails?.course_placeholder || 'Search courses...'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                onClick={() => setIsDropdownOpen(true)}
              />

              {isDropdownOpen && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white text-sm shadow-lg">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map(c => {
                      const isSelected = formData.selectedCourses.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleCourse(c.id)}
                          className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#0066CC]/10 text-[#0066CC]'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span>{c.title}</span>
                          {isSelected && (
                            <span className="text-[#0066CC] font-medium text-sm">✓ Selected</span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2 text-gray-400 text-center">No courses found</div>
                  )}
                </div>
              )}

              {/* Selected Pills */}
              {formData.selectedCourses.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 text-sm">
                  {formData.selectedCourses.map(id => (
                    <span
                      key={id}
                      className="bg-[#0066CC]/10 text-[#0066CC] px-3 py-1 rounded-full font-medium flex items-center gap-2"
                    >
                      {safeTitle(
                        courseList.find(c => c.id === id),
                        id
                      )}
                      <button
                        type="button"
                        className="hover:bg-[#0066CC]/20 rounded-full p-0.5 transition-colors"
                        onClick={() => toggleCourse(id)}
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onChange={v => setFormData({ ...formData, terms: v })}
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                {formDetails?.terms_prefix || 'I agree to the '}
                <a
                  className="text-[#0066CC] hover:underline"
                  href={formDetails?.terms_link_url || '/terms'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formDetails?.terms_link_text || 'Terms & Conditions'}
                </a>
              </label>
            </div>

            {/* Inline Status Message */}
            {submitStatus === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-green-800">{submitMessage}</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-red-800">{submitMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="w-full py-3 bg-gradient-to-r from-[#0066CC] to-[#00A3E0] text-white rounded-lg font-semibold text-base shadow hover:shadow-md active:scale-95 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : submitStatus === 'success' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Submitted Successfully!
                </span>
              ) : (
                formDetails?.submit_button_text || 'Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}

export default EnrollModal;
