'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';

// Disable SSR for react-select to prevent hydration errors
const CreatableSelect = dynamic(
  () => import('react-select/creatable'),
  { ssr: false }
);

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  yearsOfExperience: string;
  skills: string[];
  message: string;
  termsAccepted: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const POPULAR_SKILLS = [
  { label: 'Web Development', value: 'Web Development' },
  { label: 'React', value: 'React' },
  { label: 'Node.js', value: 'Node.js' },
  { label: 'Python', value: 'Python' },
  { label: 'Data Science', value: 'Data Science' },
  { label: 'Machine Learning', value: 'Machine Learning' },
  { label: 'AWS', value: 'AWS' },
  { label: 'Cloud Computing', value: 'Cloud Computing' },
  { label: 'DevOps', value: 'DevOps' },
  { label: 'UI/UX Design', value: 'UI/UX Design' },
  { label: 'Digital Marketing', value: 'Digital Marketing' },
];

interface InstructorFormProps {
  formTitle?: string;
}

export default function InstructorForm({ formTitle = "Apply to Become an Instructor" }: InstructorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    yearsOfExperience: '',
    skills: [],
    message: '',
    termsAccepted: false,
  });

  /* ---------------- Validation ---------------- */
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.yearsOfExperience)
      newErrors.yearsOfExperience = 'Please select experience';

    if (formData.skills.length === 0)
      newErrors.skills = 'Please add at least one skill';

    if (!formData.termsAccepted)
      newErrors.termsAccepted = 'Please accept Terms & Privacy Policy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- Handlers ---------------- */
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const copy = { ...errors };
      delete copy[field];
      setErrors(copy);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(`${apiUrl}/instructor-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          yearsOfExperience: formData.yearsOfExperience,
          skills: formData.skills,
          message: formData.message || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.message || errorData?.errors || 'Failed to submit application';
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }

      await response.json(); // ensure response stream is consumed
      setIsSuccess(true);

      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        yearsOfExperience: '',
        skills: [],
        message: '',
        termsAccepted: false,
      });
    } catch (error) {
      console.error('Application submission error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit application. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Success Screen ---------------- */
  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-3xl font-bold mb-2">Application Submitted!</h2>
        <p className="text-gray-600">
          Our team will contact you shortly. Thank you for applying.
        </p>
      </div>
    );
  }

  /* ---------------- Form UI ---------------- */
  return (
    <section id="instructor-form" className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-2">
          {formTitle}
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Fill the form and our team will contact you.
        </p>

        <div className="bg-white rounded-xl border p-8 space-y-7 shadow-sm w-full">

          {/* Name */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Experience & Skills - Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experience */}
            <div className="space-y-2">
              <Label>Years of Experience *</Label>
              <ShadSelect
                value={formData.yearsOfExperience}
                onValueChange={value => handleChange('yearsOfExperience', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0–1 years</SelectItem>
                  <SelectItem value="2-3">2–3 years</SelectItem>
                  <SelectItem value="4-5">4–5 years</SelectItem>
                  <SelectItem value="6+">6+ years</SelectItem>
                </SelectContent>
              </ShadSelect>

              {errors.yearsOfExperience && (
                <p className="text-red-500 text-sm">
                  {errors.yearsOfExperience}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills *</Label>

              <CreatableSelect
                isMulti
                options={POPULAR_SKILLS}
                placeholder="Type or select your skills..."
                className="mt-1"
                classNamePrefix="react-select"
                value={formData.skills.map(skill => ({
                  label: skill,
                  value: skill,
                }))}
                onChange={(selected: any) =>
                  handleChange(
                    'skills',
                    selected ? selected.map((item: any) => item.value) : []
                  )
                }
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                createOptionPosition="first"
              />

              <p className="text-xs text-gray-500 mt-1">
                You can type custom skills and select multiple.
              </p>

              {errors.skills && (
                <p className="text-red-500 text-sm">{errors.skills}</p>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2 w-full">
            <Label>Message (Optional)</Label>

            <Textarea
              rows={5}
              value={formData.message}
              onChange={e => handleChange('message', e.target.value)}
              placeholder="Tell us briefly about your expertise or availability..."
              className="resize-none rounded-lg border border-gray-300 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] w-full box-border overflow-y-auto overflow-wrap-break-word break-words"
              style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />

            <p className="text-xs text-gray-500">
              Optional — helps our team understand your profile better.
            </p>
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={formData.termsAccepted}
                onCheckedChange={checked =>
                  handleChange('termsAccepted', checked === true)
                }
              />
              <p className="text-sm">
                I agree to the{' '}
                <Link
                  href="/terms-and-conditions/instructor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  Privacy Policy
                </Link>
                *
              </p>
            </div>

            {errors.termsAccepted && (
              <p className="text-red-500 text-sm">
                {errors.termsAccepted}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>

        </div>
      </div>
    </section>
  );
}
