'use client';

import { useState, useRef, useEffect } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Checkbox } from '@/components/ui/checkbox';

/* Phone input styles */
const phoneStyles = `
  .react-tel-input .country-list .country { color: #000 !important; }
  .react-tel-input .country-list .country .dial-code { color: #000 !important; }
  .react-tel-input .selected-flag .arrow { border-top-color: #000 !important; }

  .react-tel-input .form-control::placeholder { color: #9ca3af !important; opacity: 1 !important; }
  .react-tel-input .form-control { color: #000 !important; background-color: transparent; }

  @keyframes shake {
    0% { transform: rotate(0deg); }
    15% { transform: rotate(-12deg); }
    30% { transform: rotate(10deg); }
    45% { transform: rotate(-8deg); }
    60% { transform: rotate(6deg); }
    75% { transform: rotate(-4deg); }
    100% { transform: rotate(0deg); }
  }

  .shake { animation: shake 0.9s ease-in-out infinite; display: inline-block; }
`;

export default function DemoSection({
  allCourses = [],
  title,
  subtitle,
  points,
  formDetails, // <-- NEW DYNAMIC FORM DATA
}: {
  allCourses: any[];
  title: { text?: string; part1?: string; part2?: string } | null;
  subtitle: string | null;
  points: { title: string; description?: string }[] | null;
  formDetails: any; // <-- NEW
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

  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ----------------------------
       SUBMIT HANDLER
  ----------------------------- */
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return alert('Enter a valid email.');

    const digits = formData.fullPhone.replace(/\D/g, '');
    const cc = formData.countryCode.replace('+', '');
    const local = digits.replace(cc, '');

    if (local.length < 7 || local.length > 12) return alert('Enter a valid phone number.');

    if (formData.countryCode === '+91' && !/^[6-9][0-9]{9}$/.test(local))
      return alert('Enter a valid Indian number.');

    if (!formData.selectedCourses.length) return alert('Select at least one course.');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiUrl}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.fullPhone,
          courses: formData.selectedCourses,
          page: 'Blog Page',
        }),
      });

      const json = await res.json();
      alert(json.message || 'Submitted successfully!');

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
      alert('Submission failed.');
    }
  }

  /* ----------------------------
       FILTER COURSES
  ----------------------------- */
  // Ensure allCourses is always an array
  const coursesArray = Array.isArray(allCourses) ? allCourses : [];

  const filteredCourses = coursesArray
    .filter((c: any) => c && !formData.selectedCourses.includes(c.id))
    .filter((c: any) => c?.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  /* ----------------------------
       UI
  ----------------------------- */
  return (
    <section className="py-20 px-6 bg-blue-100 relative overflow-hidden">
      <style>{phoneStyles}</style>

      {/* Decorations */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full border-4 border-[#f4a460] opacity-20" />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full border-4 border-[#f4a460] opacity-20" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {title?.text || title?.part1 || 'Get A Live Free Demo'}{' '}
            {title?.part2 && <span className="block">{title.part2}</span>}
          </h2>

          <p className="text-gray-700 mb-6">
            {subtitle || 'Learn how SkillVedika creates better learning experiences.'}
          </p>

          <ul className="space-y-3 text-gray-700">
            {(points || []).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#1e5ba8]">✓</span>
                {item.title}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT FORM */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {/* Dynamic Title */}
          <h3 className="text-3xl font-bold text-center">
            {formDetails?.form_title || 'Book Your Free Demo'}
          </h3>

          {/* Dynamic Subtitle */}
          <p className="text-gray-600 text-center text-[17px] mt-2 flex items-center justify-center gap-2">
            {formDetails?.form_subtitle || 'Our team will contact you shortly.'}
            <span className="text-yellow-500 shake">🔔</span>
          </p>

          <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
            {/* FULL NAME */}
            <div>
              <label htmlFor="blog-name" className="block text-sm text-gray-700 mb-1">
                {formDetails?.full_name_label || 'Full Name'}
              </label>
              <input
                id="blog-name"
                name="fullName"
                required
                value={formData.fullName}
                placeholder={formDetails?.full_name_placeholder || 'Enter your full name'}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label htmlFor="blog-email" className="block text-sm text-gray-700 mb-1">
                {formDetails?.email_label || 'Email'}
              </label>
              <input
                id="blog-email"
                name="email"
                required
                type="email"
                value={formData.email}
                placeholder={formDetails?.email_placeholder || 'you@example.com'}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* PHONE */}
            <div>
              <label htmlFor="blog-phone" className="block text-sm text-gray-700 mb-1">
                {formDetails?.phone_label || 'Phone Number'}
              </label>

              <div className="relative">
                <PhoneInput
                  country="in"
                  value={formData.fullPhone}
                  onChange={(val: any, country: any) =>
                    setFormData({
                      ...formData,
                      fullPhone: '+' + val,
                      countryCode: '+' + (country?.dialCode || ''),
                    })
                  }
                  inputProps={{
                    id: 'blog-phone',
                    name: 'phone',
                    required: true,
                  }}
                  inputStyle={{ width: '100%', height: '48px', fontSize: '16px', color: 'black' }}
                  containerStyle={{ width: '100%' }}
                />

                {!formData.fullPhone && (
                  <span className="absolute left-[82px] inset-y-0 flex items-center text-gray-400 text-sm">
                    {formDetails?.phone_placeholder || 'Enter phone number'}
                  </span>
                )}
              </div>
            </div>

            {/* COURSE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm text-gray-700 mb-1">
                <span className="text-red-500">*</span>{' '}
                {formDetails?.course_label || 'Select Courses'}
              </label>

              <div
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex flex-wrap gap-2"
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
                          setFormData({
                            ...formData,
                            selectedCourses: formData.selectedCourses.filter(c => c !== id),
                          });
                        }}
                      >
                        {course?.title}
                        <span className="font-bold cursor-pointer">×</span>
                      </span>
                    );
                  })
                )}
              </div>

              {open && (
                <div className="absolute left-0 top-[105%] w-full bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto z-50">
                  <div className="p-2 sticky top-0 bg-white border-b">
                    <input
                      type="text"
                      className="w-full px-2 py-2 border rounded"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="p-2">
                    {filteredCourses.map(c => (
                      <div
                        key={c.id}
                        className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer"
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
                      <div className="p-3 text-center text-gray-500 text-sm">
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
                <a href={formDetails?.terms_link || '#'} className="text-blue-600" target="_blank">
                  {formDetails?.terms_label || 'Terms & Conditions'}
                </a>
                .
              </label>
            </div>

            {/* SUBMIT */}
            <button className="w-full bg-[#1e5ba8] text-white py-3 rounded">
              {formDetails?.submit_button_text || 'Submit your details'}
            </button>
          </form>

          {/* FOOTER TEXT */}
          <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
            <span className="text-orange-500">🔒</span>
            {formDetails?.form_footer_text || 'Your information is secure.'}
          </p>
        </div>
      </div>
    </section>
  );
}
