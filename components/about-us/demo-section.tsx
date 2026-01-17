'use client';

import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import ReCAPTCHA from 'react-google-recaptcha';

/* Country dropdown styling */
const phoneStyles = `
  .react-tel-input .country-list .country { color: #000 !important; }
  .react-tel-input .country-list .country .dial-code { color: #000 !important; }
  .react-tel-input .selected-flag .arrow { border-top-color: #000 !important; }

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
  points,
  formDetails,
}: {
  allCourses: any[];
  title: { text?: string; part1?: string; part2?: string } | null;
  points: { title: string; description?: string }[] | null;
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

  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const [showV2, setShowV2] = useState(false);
  const [captchaV2Token, setCaptchaV2Token] = useState<string | null>(null);
  const recaptchaV2Ref = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const handler = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ----------------------------
       SUBMIT HANDLER
  ----------------------------- */
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return alert('Please enter a valid email.');
    }

    const digits = formData.fullPhone.replace(/\D/g, '');
    const cc = formData.countryCode.replace('+', '');
    const local = digits.replace(cc, '');

    if (local.length < 7 || local.length > 12) {
      return alert('Enter a valid phone number (7–12 digits).');
    }

    if (formData.countryCode === '+91' && !/^[6-9][0-9]{9}$/.test(local)) {
      return alert('Enter a valid Indian number starting with 6–9.');
    }

    if (!formData.selectedCourses.length) {
      return alert('Please select at least one course.');
    }

    if (!formData.terms) {
      return alert('Please accept Terms & Conditions.');
    }

    // 🚨 BLOCK submit if v2 shown but not solved
    if (showV2 && !captchaV2Token) {
      alert('Please complete the captcha');
      return;
    }

    let captchaV3Token: string | null = null;

    // Try v3 only if v2 NOT solved
    if (!captchaV2Token) {
      if (!executeRecaptcha) {
        alert('reCAPTCHA not ready');
        return;
      }

      try {
        captchaV3Token = await executeRecaptcha('demo_form_submit');
      } catch {
        captchaV3Token = null;
      }
    }

    try {
      const api = process.env.NEXT_PUBLIC_API_URL;

      const payload: any = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.fullPhone,
        courses: formData.selectedCourses,
        page: 'About Us',
      };

      if (captchaV3Token) payload.captcha_v3 = captchaV3Token;
      if (captchaV2Token) payload.captcha_v2 = captchaV2Token;

      const res = await fetch(`${api}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.NODE_ENV === 'development' && {
            'X-Bypass-Captcha': 'true',
          }),
        },
        body: JSON.stringify(payload),
      });
      

      const json = await res.json();

      if (!res.ok) {
        if (json?.message?.toLowerCase().includes('captcha')) {
          // 🔥 Trigger v2 fallback
          setCaptchaV2Token(null);
          recaptchaV2Ref.current?.reset();
          setShowV2(true);
          return;
        }

        alert(json.message || 'Submission failed');
        return;
      }

      alert(json.message || 'Submitted!');

      /* ✅ RESET CAPTCHA STATES */
      setShowV2(false);
      setCaptchaV2Token(null);
      recaptchaV2Ref.current?.reset();

      alert(json.message || 'Submitted!');

      /* ✅ RESET FORM */
      setFormData({
        fullName: '',
        email: '',
        fullPhone: '',
        countryCode: '+91',
        selectedCourses: [],
        terms: false,
      });
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
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
    <section className="bg-gradient-to-br from-blue-50 to-purple-100 px-6 py-20 relative">
      <style>{phoneStyles}</style>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border-8 border-orange-400 rounded-full opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 border-8 border-orange-400 rounded-full opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-900 rounded-full opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* LEFT CONTENT */}
        <div className="space-y-6">
          {/* Dynamic Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            {title?.text || title?.part1 || 'Get A Live Free Demo'}{' '}
            {title?.part2 && <span className="block">{title.part2}</span>}
          </h2>

          <ul className="space-y-4 text-gray-700">
            {(points || []).map((item, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-blue-600">•</span>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FORM SECTION */}
        <div className="bg-white rounded-2xl p-10 shadow-xl">
          {/* Dynamic Form Title */}
          <h2 className="text-4xl font-bold text-center text-black">
            {formDetails?.form_title || 'Book Your Free Demo'}
          </h2>

          {/* Dynamic Subtitle */}
          <p className="text-gray-600 text-center text-[17px] mt-2 flex items-center justify-center gap-2">
            {formDetails?.form_subtitle || 'Our team will contact you shortly.'}
            <span className="text-yellow-500 shake">🔔</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* NAME */}
            <div className="space-y-2">
              <label htmlFor="about-name" className="text-gray-700 font-medium">
                {formDetails?.full_name_label || 'Full Name'}
              </label>
              <input
                id="about-name"
                name="fullName"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={formDetails?.full_name_placeholder || 'Enter your full name'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label htmlFor="about-email" className="text-gray-700 font-medium">
                {formDetails?.email_label || 'Email Address'}
              </label>
              <input
                id="about-email"
                name="email"
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder={formDetails?.email_placeholder || 'you@example.com'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>

            {/* PHONE */}
            <div className="space-y-2">
              <label htmlFor="about-phone" className="text-gray-700 font-medium">
                {formDetails?.phone_label || 'Phone Number'}
              </label>

              <div className="relative">
                <PhoneInput
                  country="in"
                  value={formData.fullPhone}
                  onChange={(value: string, country: any) =>
                    setFormData({
                      ...formData,
                      fullPhone: value,
                      countryCode: '+' + country.dialCode,
                    })
                  }
                  inputProps={{
                    id: 'about-phone',
                    name: 'phone',
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
                  <span className="absolute left-[82px] inset-y-0 flex items-center text-gray-400 text-sm pointer-events-none">
                    {formDetails?.phone_placeholder || 'Enter your phone number'}
                  </span>
                )}
              </div>
            </div>

            {/* COURSE DROPDOWN */}
            <div className="relative space-y-2" ref={dropdownRef}>
              <label className="text-sm text-gray-700">
                <span className="text-red-500">*</span>{' '}
                {formDetails?.course_label || 'Select Courses'}
              </label>

              <div
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white flex flex-wrap gap-2"
              >
                {formData.selectedCourses.length === 0 ? (
                  <span className="text-gray-500">
                    {formDetails?.course_placeholder || 'Choose courses'}
                  </span>
                ) : (
                  formData.selectedCourses.map((id: number) => {
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
                <div className="absolute left-0 top-full w-full bg-white border rounded-xl shadow-lg max-h-72 overflow-y-auto z-50">
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full border px-3 py-2 rounded-lg outline-none"
                    />
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

                    {!filteredCourses.length && (
                      <div className="text-center text-sm text-gray-500 p-3">
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
                checked={formData.terms}
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

            {showV2 && (
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaV2Ref}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY!}
                  onChange={token => setCaptchaV2Token(token)}
                />
              </div>
            )}

            {/* SUBMIT */}
            <button
              disabled={showV2 && !captchaV2Token}
              className="w-full bg-[#1e5ba8] text-white py-3 rounded disabled:opacity-50"
            >
              {formDetails?.submit_button_text || 'Submit your details'}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
            <span className="text-orange-500">🔒</span>
            {formDetails?.form_footer_text || 'Your information is safe.'}
          </p>
        </div>
      </div>
    </section>
  );
}
