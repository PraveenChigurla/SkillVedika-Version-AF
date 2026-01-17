'use client';

import { useState, useRef, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Checkbox } from '@/components/ui/checkbox';

/* Black text for country dropdown list */
const phoneStyles = `
  .react-tel-input .country-list .country {
    color: #000 !important;
  }
  .react-tel-input .country-list .country .dial-code {
    color: #000 !important;
  }
  .react-tel-input .selected-flag .arrow {
    border-top-color: #000 !important;
  }
  /* Ensure the input placeholder is visible */
  .react-tel-input .form-control::placeholder {
    color: #9ca3af !important; /* tailwind gray-400 */
    opacity: 1 !important;
  }
  .react-tel-input .form-control:-ms-input-placeholder {
    color: #9ca3af !important;
    opacity: 1 !important;
  }
  .react-tel-input .form-control::-ms-input-placeholder {
    color: #9ca3af !important;
    opacity: 1 !important;
  }
  /* Make sure the input text color is dark so placeholder contrasts */
  .react-tel-input .form-control {
    color: #000 !important;
    background-color: transparent;
  }

  /* gentle shake animation for the bell */
  @keyframes shake {
    0% { transform: rotate(0deg); }
    15% { transform: rotate(-12deg); }
    30% { transform: rotate(10deg); }
    45% { transform: rotate(-8deg); }
    60% { transform: rotate(6deg); }
    75% { transform: rotate(-4deg); }
    100% { transform: rotate(0deg); }
  }

  .shake { display: inline-block; transform-origin: center; animation: shake 0.9s ease-in-out infinite; }
`;

export default function DemoSection({
  allCourses = [],
  formDetails,
}: {
  allCourses: any[];
  formDetails: any;
}) {
  /* ----------------------------
       FORM STATES
  ----------------------------- */
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    fullPhone: '',
    countryCode: '+91',
    selectedCourses: [] as number[],
    terms: true,
  });

  /* SEARCH STATE props in Courses Dropdown*/
  const [searchTerm, setSearchTerm] = useState('');

  /* -----------------------------  
        DROPDOWN LOGIC  
  ------------------------------ */
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    function handleClickOutside(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* -----------------------------  
        SUBMIT HANDLER  
  ------------------------------ */
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
        alert('Enter a valid Indian number starting with 6–9.');
        return;
      }
    }

    // Course selection check
    if (formData.selectedCourses.length === 0) {
      alert('Please select at least one course.');
      return;
    }

    /* Submit data */
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (!apiUrl) {
        alert('NEXT_PUBLIC_API_URL not set');
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
          page: 'Blog Details',
        }),
      });

      if (!res.ok) {
        alert('Failed to submit form.');
        return;
      }

      const json = await res.json();
      alert(json.message || 'Demo Booked Successfully!');

      setFormData({
        fullName: '',
        email: '',
        fullPhone: '',
        countryCode: '+91',
        selectedCourses: [],
        terms: true,
      });
    } catch (err) {
      console.error(err);
      alert('Error submitting form.');
    }
  }

  return (
    <section className="py-20 px-6 bg-blue-100 relative overflow-hidden">
      <style>{phoneStyles}</style>

      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full border-4 border-[#f4a460] opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full border-4 border-[#f4a460] opacity-20"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* -----------------------------
              LEFT CONTENT
          ------------------------------ */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Get A Live Free Demo</h2>
            <p className="text-gray-700 mb-6">
              Learn how SkillVedika creates better learning experiences
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-2">
                <span className="text-[#1e5ba8]">✓</span>
                <span>Learn about better learning maps</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1e5ba8]">✓</span>
                <span>Payment plans & scholarship support</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1e5ba8]">✓</span>
                <span>Access webinars & self-paced videos</span>
              </li>
            </ul>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            {/* TITLE */}
            <h3 className="text-4xl font-bold text-center text-black">
              {formDetails?.form_title || 'Book Your Free Demo'}
            </h3>
            {/* Sub heading */}
            <p className="text-gray-600 text-center text-[17px] mt-2 flex items-center justify-center gap-2">
              {formDetails?.form_subtitle || 'Our team will contact you shortly.'}
              <span className="text-yellow-500 inline-block shake">🔔</span>
            </p>

            <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
              {/* FULL NAME */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  {formDetails?.full_name_label || 'Full Name'}
                </label>
                <input
                  required
                  placeholder={formDetails?.full_name_placeholder || 'Enter your full name'}
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1e5ba8]"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  {formDetails?.email_label || 'Email'}
                </label>
                <input
                  required
                  placeholder={formDetails?.email_placeholder || 'abc@example.com'}
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1e5ba8]"
                />
              </div>

              {/* PHONE INPUT */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  {formDetails?.phone_label || 'Phone'}
                </label>

                <div className="relative">
                  <PhoneInput
                    placeholder={formDetails?.phone_placeholder || 'Enter phone number'}
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
                      placeholder: formDetails?.phone_placeholder || 'Enter phone number',
                      name: 'phone',
                      'aria-describedby': 'phone-hint',
                      required: true,
                      'aria-label': 'Phone number',
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '45px',
                      fontSize: '16px',
                      color: 'black',
                    }}
                    buttonStyle={{
                      border: '1px solid #d1d5db',
                    }}
                    containerStyle={{
                      width: '100%',
                    }}
                  />
                  {/* Overlay placeholder (visible when value is empty) */}
                  {!formData.fullPhone && (
                    <span className="absolute left-[82px] inset-y-0 flex items-center text-gray-400 pointer-events-none select-none text-sm leading-5">
                      {formDetails?.phone_placeholder || 'Enter phone number'}
                    </span>
                  )}
                </div>
              </div>

              {/* COURSE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm text-gray-700 mb-2">
                  <span className="text-red-500">*</span>
                  {formDetails?.course_label || 'Select Courses'}
                </label>

                {/* SELECTED CHIPS */}
                <div
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white flex flex-wrap gap-2"
                  onClick={() => setOpen(!open)}
                >
                  {formData.selectedCourses.length === 0 ? (
                    <span className="text-gray-500">
                      {formDetails?.course_placeholder || 'Choose courses'}
                    </span>
                  ) : (
                    formData.selectedCourses.map(id => {
                      const course = allCourses.find(c => c.id === id);
                      return (
                        <span
                          key={id}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-2"
                          onClick={e => {
                            e.stopPropagation();
                            const updated = formData.selectedCourses.filter(c => c !== id);
                            setFormData({ ...formData, selectedCourses: updated });
                          }}
                        >
                          {course?.title}
                          <span className="font-bold">×</span>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* DROPDOWN */}
                {open && (
                  <div className="absolute left-0 top-[105%] w-full bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto z-50">
                    {/* SEARCH BAR */}
                    <div className="p-2 sticky top-0 bg-white border-b">
                      <div className="flex items-center border rounded-lg px-2">
                        <input
                          type="text"
                          placeholder="Search courses..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full py-2 px-2 outline-none"
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

                    {/* FILTERED COURSES */}
                    <div className="p-2">
                      {allCourses
                        // remove selected ones
                        .filter(c => !formData.selectedCourses.includes(c.id))

                        // SEARCH LOGIC
                        .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))

                        // PRIORITY SORTING
                        .sort((a, b) => {
                          const s = searchTerm.toLowerCase();

                          const aStarts = a.title.toLowerCase().startsWith(s);
                          const bStarts = b.title.toLowerCase().startsWith(s);

                          if (aStarts && !bStarts) return -1;
                          if (!aStarts && bStarts) return 1;

                          return 0;
                        })
                        .map(c => (
                          <div
                            key={c.id}
                            className="px-3 py-2 rounded hover:bg-gray-100"
                            onClick={() => {
                              const updated = [...formData.selectedCourses, c.id];
                              setFormData({ ...formData, selectedCourses: updated });
                            }}
                          >
                            {c.title}
                          </div>
                        ))}

                      {/* If no matches */}
                      {allCourses.filter(
                        c =>
                          !formData.selectedCourses.includes(c.id) &&
                          c.title.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
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
                  checked={Boolean(formData.terms)}
                  onCheckedChange={v => setFormData({ ...formData, terms: Boolean(v) })}
                />
                <label className="text-sm text-gray-600">
                  {formDetails?.terms_prefix || 'I agree with the'}{' '}
                  <a
                    className="text-blue-600 hover:underline"
                    href={formDetails?.terms_link || '/terms-and-conditions'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formDetails?.terms_label || 'Terms & Conditions'}
                  </a>
                  .
                </label>
              </div>

              <button type="submit" className="w-full bg-[#1e5ba8] text-white py-3 rounded">
                {formDetails?.submit_button_text || 'Submit your details'}
              </button>
            </form>

            {/* FOOTER */}
            <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
              <span className="text-orange-500">🔒</span>
              {formDetails?.form_footer_text || 'Your information is secure.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
