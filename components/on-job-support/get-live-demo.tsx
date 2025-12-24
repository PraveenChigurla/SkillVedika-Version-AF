'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { CheckCircle2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getTitleParts } from '@/utils/getTitle';

/* Make country dropdown text black */
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
`;

export default function DemoSection({
  allCourses = [],
  target,
  title,
  subtitle,
  points,
  formDetails,
}: {
  allCourses?: any[];
  target: string;
  title: any;
  subtitle: string;
  points: { title: string; description: string }[];
  formDetails?: any;
}) {
  // Ensure allCourses is always an array - handle all edge cases
  const coursesArray = useMemo(() => {
    if (!allCourses) return [];
    if (Array.isArray(allCourses)) return allCourses;
    // Handle case where API returns {success: true, data: [...]}
    if (allCourses && typeof allCourses === 'object') {
      const obj = allCourses as any;
      if ('data' in obj && Array.isArray(obj.data)) {
        return obj.data;
      }
      // Handle case where it's an object with courses property
      if ('courses' in obj && Array.isArray(obj.courses)) {
        return obj.courses;
      }
    }
    return [];
  }, [allCourses]);

  const { part1, part2 } = getTitleParts(title);
  /* -------------------- FORM STATE -------------------- */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fullPhone: '',
    countryCode: '+91',
    selectedCourses: [] as number[],
    terms: true,
  });

  const [searchTerm, setSearchTerm] = useState('');

  /* -------------------- DROPDOWN -------------------- */
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* -------------------- SUBMIT -------------------- */
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert('Please enter a valid email.');
      return;
    }

    // Phone Validation
    const digits = formData.fullPhone.replace(/\D/g, '');
    const cc = formData.countryCode.replace('+', '');
    const local = digits.replace(cc, '');

    if (local.length < 7 || local.length > 12) {
      alert('Enter valid phone number.');
      return;
    }

    if (formData.countryCode === '+91') {
      if (!/^[6-9][0-9]{9}$/.test(local)) {
        alert('Enter valid Indian number.');
        return;
      }
    }

    if (formData.selectedCourses.length === 0) {
      alert('Select at least one course.');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.fullPhone,
          courses: formData.selectedCourses,
          page: 'On-Job Support',
        }),
      });

      if (!res.ok) {
        alert('Form submission failed');
        return;
      }

      alert('Demo booked successfully!');

      setFormData({
        name: '',
        email: '',
        fullPhone: '',
        countryCode: '+91',
        selectedCourses: [],
        terms: true,
      });
    } catch {
      alert('Error submitting form');
    }
  }

  /* ------------------------------------------------------------ */
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-blue-50 to-blue-50 py-28 px-4 sm:px-6 lg:px-8 text-gray-800">
      <style>{phoneStyles}</style>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* LEFT CONTENT */}
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
          <h2 className="text-4xl md:text-4xl lg:text-6xl font-bold leading-tight text-gray-900">
            {part1 || 'Get a Live'}
            <span className="block bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent mt-2">
              {part2 || 'Free Demo'}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 max-w-xl">
            {subtitle || 'Experience firsthand how SkillVedika can enhance your learning journey.'}
          </p>

          {/* Points */}
          <ul className="space-y-6">
            {points?.map((item, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* RIGHT FORM CARD (unchanged UI) */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-blue-500/40 via-purple-400/30 to-transparent">
            <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl p-10 shadow-xl border border-blue-100">
              {/* Header */}
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
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
                <div className="space-y-2">
                  <Label htmlFor="ojs-name">{formDetails?.full_name_label || 'Full Name'}</Label>
                  <Input
                    id="ojs-name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder={formDetails?.full_name_placeholder || 'Enter your full name'}
                    className="h-12 bg-white border border-blue-100"
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="ojs-email">{formDetails?.email_label || 'Email Address'}</Label>
                  <Input
                    id="ojs-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder={formDetails?.email_placeholder || 'you@example.com'}
                    className="h-12 bg-white border border-blue-100"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <Label htmlFor="ojs-phone" className="text-gray-700 font-medium">
                    {formDetails?.phone_label || 'Phone Number'}
                  </Label>

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
                        id: 'ojs-phone',
                        name: 'phone',
                        required: true,
                      }}
                      inputStyle={{
                        width: '100%',
                        height: '48px',
                        fontSize: '16px',
                        color: 'black',
                      }}
                      buttonStyle={{
                        border: '1px solid #d1d5db',
                      }}
                      containerStyle={{
                        width: '100%',
                        marginTop: '8px',
                      }}
                    />

                    {!formData.fullPhone && (
                      <span className="absolute left-[17%] inset-y-0 flex items-center text-gray-400 pointer-events-none select-none text-sm leading-5 transform-translate-x">
                        {formDetails?.phone_placeholder || 'Enter phone number'}
                      </span>
                    )}
                  </div>
                </div>

                {/* COURSE DROPDOWN (dynamic) */}
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="block text-sm text-gray-700 mb-2">
                    <span className="text-red-500">*</span>{' '}
                    {formDetails?.course_label || 'Select Courses'}
                  </label>

                  <div
                    className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl cursor-pointer flex flex-wrap gap-2"
                    onClick={() => setOpen(!open)}
                  >
                    {formData.selectedCourses.length === 0 ? (
                      <span className="text-gray-500">
                        {formDetails?.course_placeholder || 'Choose courses'}
                      </span>
                    ) : (
                      formData.selectedCourses.map(id => {
                        const course = coursesArray.find((c: any) => c.id === id);
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
                    <div className="absolute left-0 top-[105%] w-full bg-white border rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                      <div className="p-2 sticky top-0 bg-white border-b">
                        <input
                          type="text"
                          placeholder="Search courses..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full py-2 px-2 outline-none border rounded-lg"
                        />
                      </div>

                      <div className="p-2">
                        {coursesArray
                          .filter(
                            (c: any) =>
                              !formData.selectedCourses.includes(c.id) &&
                              c.title.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((c: any) => (
                            <div
                              key={c.id}
                              className="px-3 py-2 rounded cursor-pointer hover:bg-gray-100"
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

                        {coursesArray.filter(
                          (c: any) =>
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
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox defaultChecked={Boolean(formDetails?.terms_default ?? true)} />
                  <label className="text-sm text-gray-600">
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

                {/* SUBMIT */}
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold"
                >
                  {formDetails?.submit_button_text || 'Submit Your Details'}
                </Button>
              </form>

              {/* FOOTER */}
              <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-1">
                <span className="text-orange-500">🔒</span>
                {formDetails?.form_footer_text || 'Your information is secure.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
