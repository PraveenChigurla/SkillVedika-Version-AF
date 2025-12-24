'use client';

import { Button } from '@/components/ui/button';
import CircleImage from '@/components/CircleImage';
import { useState, useEffect } from 'react';
import { EnrollModal } from '../EmptyLoginForm';

export default function HeroSection({
  title,
  description,
  buttonText,
  buttonLink,
  image,
}: Readonly<{
  title: { part1?: string; part2?: string; text?: string } | null;
  description: string;
  buttonText: string;
  buttonLink?: string;
  image: string;
}>) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          console.error('NEXT_PUBLIC_API_URL not set');
          return;
        }

        const res = await fetch(`${apiUrl}/courses`);
        if (!res.ok) {
          console.error('Failed to fetch courses');
          return;
        }

        const response = await res.json();
        // Handle different API response formats: {success: true, data: [...]} or direct array
        let coursesData: any[] = [];
        if (Array.isArray(response)) {
          coursesData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (response?.courses && Array.isArray(response.courses)) {
          coursesData = response.courses;
        }

        const courseList = coursesData
          .map((course: any) => ({
            id: course.id || course.course_id || 0,
            title: course.title || course.course_name || '',
          }))
          .filter((c: any) => c.id && c.title); // Filter out invalid courses

        setCourses(courseList);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    }

    fetchCourses();
  }, []);

  const hasParts = Boolean(
    (title?.part1?.trim()) || (title?.part2?.trim())
  );

  const mainTitle = hasParts
    ? (title?.part1 ?? title?.text ?? '')
    : (title?.text ?? 'Connect & Join Together'); // fallback to full phrase when no parts

  const secondTitle = hasParts ? (title?.part2 ?? '') : '';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-blue-50 py-20 px-4 sm:px-6 lg:py-32 lg:px-8">
      {/* Floating Ring */}
      <div
        className="absolute bottom-10 left-10 w-22 h-32 border-[8px] border-primary/20 rounded-full animate-float opacity-50"
        style={{ animationDelay: '1.5s' }}
      ></div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* ===================== LEFT CONTENT ===================== */}
        <div className="space-y-8 animate-fade-in-up">
          <div className="space-y-6">
            {/* Dynamic Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
                {mainTitle}
              </span>

              {secondTitle ? (
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-[#1A3F66] to-teal-500">
                  {secondTitle}
                </span>
              ) : null}
            </h1>

            {/* Dynamic Description */}
            <p
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl"
              dangerouslySetInnerHTML={{ __html: description || '' }}
            />
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <a
              href="/"
              className="text-primary hover:underline cursor-pointer font-medium transition-colors"
            >
              Home
            </a>
            <span className="text-muted-foreground">›</span>
            <span className="text-foreground font-medium">Contact Us</span>
          </div>

          {/* CTA Button */}
          {buttonLink ? (
            <a href={buttonLink}>
              <Button
                size="lg"
                className="bg-blue-900 hover:opacity-90 text-lg text-white font-semibold px-4 py-3 h-auto shadow-medium transition-all hover:shadow-strong hover:scale-105"
              >
                {buttonText || "Let's Connect Together"}
              </Button>
            </a>
          ) : (
            <Button
              onClick={() => setShowEnrollModal(true)}
              size="lg"
              className="bg-blue-900 hover:opacity-90 text-lg text-white font-semibold px-4 py-3 h-auto shadow-medium transition-all hover:shadow-strong hover:scale-105"
            >
              {buttonText || "Let's Connect Together"}
            </Button>
          )}

          {showEnrollModal && (
            <EnrollModal
              courses={courses}
              page="Contact Us"
              onClose={() => setShowEnrollModal(false)}
            />
          )}
        </div>

        {/* ===================== RIGHT IMAGE ===================== */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            {/* Glow Behind Image */}
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-20 animate-pulse"></div>

            <CircleImage
              src={image || '/contact-us/Frame 295.png'}
              alt="Contact illustration"
              size={384}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
