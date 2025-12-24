'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import PhoneInput from 'react-phone-input-2';
import { motion } from 'framer-motion';
import 'react-phone-input-2/lib/style.css';

/* Country dropdown styles */
const phoneStyles = `
  .react-tel-input .country-list .country { color: #000 !important; }
  .react-tel-input .country-list .country .dial-code { color: #000 !important; }
  .react-tel-input .selected-flag .arrow { border-top-color: #000 !important; }
`;

export default function DemoSection({
  allCourses = [],
  target,
  title,
  subtitle,
  points = [],
  formDetails,
}: {
  allCourses: any[];
  target?: string;
  title?: { text?: string; part1?: string; part2?: string };
  subtitle?: string;
  points?: { title: string; description?: string }[];
  formDetails: any;
}) {
  /* -------------------------------------
     FORM STATE
  --------------------------------------*/
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fullPhone: '',
    countryCode: '+91',
    selectedCourses: [] as number[],
    terms: true,
  });

  const [searchTerm, setSearchTerm] = useState('');

  /* -------------------------------------
     DROPDOWN HANDLING
  --------------------------------------*/
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* -------------------------------------
     SUBMIT HANDLER
  --------------------------------------*/
  async function handleSubmit(e: any) {
    e.preventDefault();

    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert('Please enter a valid email');
      return;
    }

    // Phone validation
    const digits = formData.fullPhone.replace(/\D/g, '');
    const cc = formData.countryCode.replace('+', '');
    const local = digits.replace(cc, '');

    if (local.length < 7 || local.length > 12) {
      alert('Enter a valid phone number (7–12 digits)');
      return;
    }

    // India-specific validation
    if (formData.countryCode === '+91' && !/^[6-9][0-9]{9}$/.test(local)) {
      alert('Enter a valid Indian mobile number starting with 6–9');
      return;
    }

    if (!formData.selectedCourses.length) {
      alert('Please select at least one course');
      return;
    }

    /* Submit API */
    try {
      const api = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${api}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.fullPhone,
          courses: formData.selectedCourses,
          page: 'Contact Us',
        }),
      });

      const json = await res.json();
      alert(json.message || 'Submitted!');

      setFormData({
        name: '',
        email: '',
        fullPhone: '',
        countryCode: '+91',
        selectedCourses: [],
        terms: true,
      });
    } catch (err) {
      console.error(err);
      alert('Error submitting form');
    }
  }

  /* -------------------------------------
     UI RENDER
  --------------------------------------*/
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F7FAFF] via-[#EEF3FB] to-blue-50 py-28 px-4 sm:px-6 lg:px-8">
      <style>{phoneStyles}</style>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT SECTION */}
        <motion.div
          className="space-y-10"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Target Label */}
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm shadow-sm">
            {target || '✨ Limited Spots Available'}
          </div>

          {/* Title */}
          {(() => {
            const hasParts = Boolean(
              (title?.part1 && title.part1.trim()) || (title?.part2 && title.part2.trim())
            );
            const main = hasParts
              ? (title?.part1 ?? title?.text ?? '')
              : (title?.text ?? 'Get a Live');
            const second = hasParts ? (title?.part2 ?? '') : '';

            return (
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                {main}{' '}
                {second ? (
                  <span className="block bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                    {second}
                  </span>
                ) : null}
              </h2>
            );
          })()}

          {/* Subtitle */}
          <p className="text-lg text-gray-600 max-w-xl">
            {subtitle || 'Experience firsthand how SkillVedika can enhance your learning journey.'}
          </p>

          {/* Points List */}
          <ul className="space-y-6">
            {(points.length
              ? points
              : [
                  {
                    title: 'Explore Trending Courses',
                    description: 'Discover in-demand courses designed by experts.',
                  },
                  {
                    title: 'Flexible Learning Plans',
                    description: 'Scholarships, EMI options & custom schedules.',
                  },
                  {
                    title: 'Instant Access',
                    description: 'Unlock webinars & recorded masterclasses.',
                  },
                ]
            ).map((item, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* RIGHT FORM SECTION */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="rounded-3xl p-[2px] bg-gradient-to-br from-blue-300/40 via-teal-200/30">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 shadow-xl border border-blue-100">
              {/* FORM HEADER */}
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                  {formDetails?.form_title || 'Book Your Free Demo'}
                </h3>
                <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
                  {formDetails?.form_subtitle || 'Our team will contact you shortly.'}
                  <motion.span
                    animate={{ rotate: [-20, 20, -20, 20, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Bell className="w-6 h-6 text-yellow-500" />
                  </motion.span>
                </p>
              </div>

              {/* FORM */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* NAME */}
                <div>
                  <Label htmlFor="demo-name">{formDetails?.full_name_label || 'Full Name'}</Label>
                  <Input
                    id="demo-name"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder={formDetails?.full_name_placeholder || 'Enter your full name'}
                    className="h-12 border border-blue-100"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <Label htmlFor="demo-email">{formDetails?.email_label || 'Email Address'}</Label>
                  <Input
                    id="demo-email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder={formDetails?.email_placeholder || 'you@example.com'}
                    className="h-12 border border-blue-100"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <Label htmlFor="demo-phone">{formDetails?.phone_label || 'Phone Number'}</Label>
                  <div className="relative">
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
                      inputProps={{ id: 'demo-phone', name: 'phone' }}
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
                        {formDetails?.phone_placeholder || 'Enter phone number'}
                      </span>
                    )}
                  </div>
                </div>

                {/* COURSE DROPDOWN */}
                <CourseDropdown
                  dropdownRef={dropdownRef}
                  open={open}
                  setOpen={setOpen}
                  allCourses={allCourses}
                  selected={formData.selectedCourses}
                  setSelected={(list: number[]) =>
                    setFormData({ ...formData, selectedCourses: list })
                  }
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  formDetails={formDetails}
                />

                {/* TERMS */}
                <div className="flex items-start gap-3">
                  <Label className="flex items-start gap-3">
                    <Checkbox
                      id="demo-terms"
                      checked={formData.terms}
                      onCheckedChange={v => setFormData({ ...formData, terms: !!v })}
                    />
                    <span className="text-sm text-gray-600">
                      {formDetails?.terms_prefix || 'I agree to the'}{' '}
                      <a
                        className="text-blue-600 hover:underline"
                        href={formDetails?.terms_link || '#'}
                        target="_blank"
                      >
                        {formDetails?.terms_label || 'Terms & Conditions'}
                      </a>
                      .
                    </span>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-xl"
                >
                  {formDetails?.submit_button_text || 'Submit Your Details'}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  🔒 {formDetails?.form_footer_text || 'Your information is secure.'}
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------
   COURSE DROPDOWN COMPONENT
--------------------------------------*/
function CourseDropdown({
  dropdownRef,
  open,
  setOpen,
  allCourses,
  selected,
  setSelected,
  searchTerm,
  setSearchTerm,
  formDetails,
}: any) {
  // Ensure allCourses is always an array
  const coursesArray = Array.isArray(allCourses) ? allCourses : [];

  const filtered = coursesArray
    .filter((c: any) => c && !selected.includes(c.id))
    .filter((c: any) => c?.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <Label>
        <span className="text-red-500">*</span> {formDetails?.course_label || 'Select Courses'}
      </Label>

      {/* Selected Chips */}
      <div
        className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl cursor-pointer flex flex-wrap gap-2"
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 ? (
          <span className="text-gray-500">
            {formDetails?.course_placeholder || 'Choose courses'}
          </span>
        ) : (
          selected.map((id: number) => {
            const course = allCourses.find((c: any) => c.id === id);
            return (
              <span
                key={id}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1"
                onClick={e => {
                  e.stopPropagation();
                  setSelected(selected.filter((x: number) => x !== id));
                }}
              >
                {course?.title}
                <span className="font-bold cursor-pointer">×</span>
              </span>
            );
          })
        )}
      </div>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute left-0 top-[105%] w-full bg-white border rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
          <div className="p-2 sticky top-0 bg-white border-b">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full py-2 px-3 outline-none border rounded-lg"
            />
          </div>

          <div className="p-2">
            {filtered.map((c: any) => (
              <div
                key={c.id}
                className="px-3 py-2 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => setSelected([...selected, c.id])}
              >
                {c.title}
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-gray-500 py-4">No courses found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
