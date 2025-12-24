/**
 * TypeScript interfaces for API responses
 *
 * Centralized type definitions for all API responses
 * to ensure type safety across the application.
 */

/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Course-related types
 */
export interface Course {
  id: number;
  course_id?: number;
  title: string;
  course_name?: string;
  description?: string;
  image?: string;
  status?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  details?: CourseDetails;
}

export interface CourseDetails {
  agenda?: string[];
  why_choose?: string[];
  who_should_join?: string[];
  key_outcomes?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

/**
 * Blog-related types
 */
export interface Blog {
  id: number;
  title: string;
  slug: string;
  blog_content?: string;
  content?: string;
  body?: string;
  excerpt?: string;
  image?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Footer settings
 */
export interface FooterLink {
  text: string;
  slug: string;
  new_tab?: boolean;
}

export interface FooterSettings {
  get_in_touch?: string;
  email_placeholder?: string;
  logo?: string;
  about?: string;
  explore?: string;
  explore_links?: FooterLink[];
  support?: string;
  support_links?: FooterLink[];
  contact?: string;
  contact_details?: {
    phone?: string;
    email?: string;
    locations?: string[];
  };
  follow_us?: string;
  social_media_icons?: string[];
  social_links?: Record<string, string>;
  copyright?: string;
}

/**
 * Placements and Reserve content
 */
export interface PlacementsReserveContent {
  id?: number;
  title?: string; // Legacy field name
  description?: string; // Legacy field name
  placements_title?: {
    main?: string;
  };
  placements_subtitle?: string;
  placement_images?: string[];
  reserve_title?: {
    main?: string;
  };
  reserve_subtitle?: string;
  reserve_block1?: string[] | string;
  reserve_block2?: string[] | string;
  reserve_block3?: string[] | string;
  reserve_button_name?: string;
  reserve_button_link?: string;
}

/**
 * Form details
 */
export interface FormDetails {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  courses?: number[];
  page?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Homepage content
 */
export interface HomePageContent {
  hero?: {
    title?: string;
    description?: string;
    button_text?: string;
    button_link?: string;
    image?: string;
  };
  key_features?: Array<{
    title?: string;
    description?: string;
    icon?: string;
  }>;
  job_support?: {
    job_support_title?: string;
    job_support_content?: string;
    job_support_button?: string;
    job_support_payment_types?: string[];
  };
}

/**
 * Title structure (used in multiple components)
 */
export interface TitleStructure {
  text?: string;
  part1?: string;
  part2?: string;
  main?: string;
}
