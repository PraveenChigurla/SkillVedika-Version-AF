# Migration Guide - Using New Services Layer

This guide helps you migrate existing code to use the new centralized API service layer.

## Benefits of Migration

1. **Type Safety**: Full TypeScript support with proper types
2. **Error Handling**: Consistent error handling across the app
3. **Security**: Centralized security configurations
4. **Maintainability**: Single source of truth for API calls
5. **Testing**: Easier to mock and test

## Migration Steps

### Step 1: Replace Direct API Calls

#### Before (Old Way)

```typescript
// Direct fetch call
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
const courses = await res.json();
```

#### After (New Way)

```typescript
import { coursesService } from '@/services/api.service';

const courses = await coursesService.getAll();
```

### Step 2: Update Error Handling

#### Before

```typescript
try {
  const res = await fetch('/api/courses');
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  const data = await res.json();
} catch (error) {
  console.error(error);
}
```

#### After

```typescript
import { coursesService } from '@/services/api.service';
import { normalizeError, getUserFriendlyMessage, logError } from '@/lib/utils/error-handler';

try {
  const courses = await coursesService.getAll();
} catch (error) {
  const appError = normalizeError(error);
  const userMessage = getUserFriendlyMessage(appError);
  logError(appError, { context: 'component-name' });
  // Show userMessage to user
}
```

### Step 3: Update Form Validation

#### Before

```typescript
const validateEmail = (email: string) => {
  return /^\S+@\S+\.\S+$/.test(email);
};
```

#### After

```typescript
import { validateEmail } from '@/lib/utils/validation';

if (validateEmail(email)) {
  // Valid email
}
```

### Step 4: Update Form Submissions

#### Before

```typescript
const response = await fetch(`${apiUrl}/enroll`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
const result = await response.json();
```

#### After

```typescript
import { formService } from '@/services/api.service';

const result = await formService.submitEnrollment({
  name: formData.fullName,
  email: formData.email,
  phone: formData.fullPhone,
  courses: formData.selectedCourses,
  page: 'homepage',
});
```

## Common Patterns

### Fetching Courses

```typescript
import { coursesService } from '@/services/api.service';

// Get all courses
const courses = await coursesService.getAll();

// Get course by ID
const course = await coursesService.getById(1);

// Get course by slug
const course = await coursesService.getBySlug('web-development');
```

### Fetching Blogs

```typescript
import { blogsService } from '@/services/api.service';

// Get all blogs
const blogs = await blogsService.getAll();

// Get blog by slug
const blog = await blogsService.getBySlug('my-blog-post');
```

### Fetching Footer Settings

```typescript
import { footerService } from '@/services/api.service';

const footerSettings = await footerService.getSettings();
```

### Fetching Form Details

```typescript
import { formService } from '@/services/api.service';

const formDetails = await formService.getFormDetails();
```

## Server Components Example

```typescript
// app/courses/page.tsx
import { coursesService } from '@/services/api.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Courses',
    description: 'Browse our online courses',
  };
}

export default async function CoursesPage() {
  const courses = await coursesService.getAll();

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  );
}
```

## Client Components Example

```typescript
'use client';

import { useState, useEffect } from 'react';
import { coursesService } from '@/services/api.service';
import { normalizeError, getUserFriendlyMessage } from '@/lib/utils/error-handler';
import type { Course } from '@/types/api';

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const data = await coursesService.getAll();
        setCourses(data);
        setError(null);
      } catch (err) {
        const appError = normalizeError(err);
        setError(getUserFriendlyMessage(appError));
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  );
}
```

## Using Configuration

```typescript
import { APP_CONFIG, API_CONFIG, SEO_CONFIG } from '@/lib/config/app.config';

// Use in components
const siteUrl = APP_CONFIG.url;
const defaultTitle = SEO_CONFIG.defaultTitle;
```

## Using SEO Utilities

```typescript
import {
  getCanonicalUrl,
  generateMetaTitle,
  generateMetaDescription,
  generateOgImageUrl,
} from '@/lib/seo';

// In metadata
export const metadata: Metadata = {
  title: generateMetaTitle('Courses'),
  description: generateMetaDescription('Browse our courses'),
  openGraph: {
    images: [generateOgImageUrl('/images/courses.jpg')],
  },
  alternates: {
    canonical: getCanonicalUrl('/courses'),
  },
};
```

## Testing with New Services

```typescript
// Mock the service in tests
jest.mock('@/services/api.service', () => ({
  coursesService: {
    getAll: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Course' }]),
  },
}));
```

## Checklist for Migration

- [ ] Replace all direct `fetch` calls with service methods
- [ ] Update error handling to use `normalizeError`
- [ ] Replace custom validation with utility functions
- [ ] Update form submissions to use `formService`
- [ ] Use configuration constants instead of hardcoded values
- [ ] Update SEO metadata generation
- [ ] Test all migrated components
- [ ] Update tests to mock services

## Need Help?

If you encounter issues during migration:

1. Check the service implementation in `services/api.service.ts`
2. Review error handling utilities in `lib/utils/error-handler.ts`
3. Check type definitions in `types/api.ts`
4. Review examples in this guide
