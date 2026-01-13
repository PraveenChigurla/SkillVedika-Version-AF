/**
 * Structured Data (JSON-LD) utilities for SEO
 * Helps improve search engine understanding and rich snippets
 */

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?:
    | {
        '@type': 'ContactPoint';
        telephone?: string;
        contactType: string;
        email?: string;
      }
    | Array<{
        '@type': 'ContactPoint';
        telephone?: string;
        contactType: string;
        email?: string;
        areaServed?: string;
        availableLanguage?: string;
      }>;
  address?: Array<{
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  }>;
  sameAs?: string[];
  legalName?: string;
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface CourseSchema {
  '@context': 'https://schema.org';
  '@type': 'Course';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  image?: string;
  url?: string;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface ContactPageSchema {
  '@context': 'https://schema.org';
  '@type': 'ContactPage';
  url: string;
  mainEntity?: {
    '@type': 'Organization';
    name: string;
    url: string;
    logo?: string;
    description?: string;
    contactPoint?: Array<{
      '@type': 'ContactPoint';
      telephone?: string;
      contactType: string;
      email?: string;
      areaServed?: string;
      availableLanguage?: string;
    }>;
    address?: Array<{
      '@type': 'PostalAddress';
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    }>;
    sameAs?: string[];
  };
}

export interface AboutPageSchema {
  '@context': 'https://schema.org';
  '@type': 'AboutPage';
  url: string;
  mainEntity?: {
    '@type': 'Organization';
    name: string;
    legalName?: string;
    url: string;
    logo?: string;
    description?: string;
    foundingDate?: string;
    founder?: {
      '@type': 'Person' | 'Organization';
      name: string;
    };
    sameAs?: string[];
    contactPoint?: {
      '@type': 'ContactPoint';
      contactType: string;
      email?: string;
      telephone?: string;
    };
  };
}

export interface WebPageSchema {
  '@context': 'https://schema.org';
  '@type': 'WebPage';
  url: string;
  name?: string;
  description?: string;
  inLanguage?: string;
  isPartOf?: {
    '@type': 'WebSite';
    name: string;
    url: string;
  };
  about?: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
}

export interface CollectionPageSchema {
  '@context': 'https://schema.org';
  '@type': 'CollectionPage';
  url: string;
  name?: string;
  description?: string;
  mainEntity?: {
    '@type': 'ItemList';
    numberOfItems?: number;
    itemListElement?: Array<{
      '@type': 'ListItem';
      position: number;
      item?: {
        '@type': string;
        name?: string;
        url?: string;
      };
    }>;
  };
}

export interface BlogPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
}

/**
 * Generate Organization structured data
 * Enhanced with contact points, addresses, and social links
 */
export function generateOrganizationSchema(
  name: string = 'SkillVedika',
  url: string = 'https://skillvedika.com',
  options?: {
    logo?: string;
    description?: string;
    email?: string;
    phone?: string;
    addresses?: Array<{
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    }>;
    sameAs?: string[];
    legalName?: string;
  }
): OrganizationSchema {
  const contactPoints: Array<{
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    email?: string;
    areaServed?: string;
    availableLanguage?: string;
  }> = [];

  if (options?.email) {
    contactPoints.push({
      '@type': 'ContactPoint',
      email: options.email,
      contactType: 'Customer Service',
      availableLanguage: 'English',
    });
  }

  if (options?.phone) {
    contactPoints.push({
      '@type': 'ContactPoint',
      telephone: options.phone,
      contactType: 'Customer Service',
      areaServed: 'Worldwide',
      availableLanguage: 'English',
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(options?.legalName && { legalName: options.legalName }),
    ...(options?.logo && { logo: options.logo }),
    ...(options?.description && { description: options.description }),
    ...(contactPoints.length > 0 && { contactPoint: contactPoints }),
    ...(options?.addresses &&
      options.addresses.length > 0 && {
        address: options.addresses.map(addr => ({
          '@type': 'PostalAddress',
          ...(addr.streetAddress && { streetAddress: addr.streetAddress }),
          ...(addr.addressLocality && { addressLocality: addr.addressLocality }),
          ...(addr.addressRegion && { addressRegion: addr.addressRegion }),
          ...(addr.postalCode && { postalCode: addr.postalCode }),
          ...(addr.addressCountry && { addressCountry: addr.addressCountry }),
        })),
      }),
    ...(options?.sameAs && options.sameAs.length > 0 && { sameAs: options.sameAs }),
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebSiteSchema(
  name: string = 'SkillVedika',
  url: string = 'https://skillvedika.com',
  searchUrl?: string
): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${searchUrl}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  };
}

/**
 * Generate Course structured data
 */
export function generateCourseSchema(
  name: string,
  description: string,
  providerName: string = 'SkillVedika',
  providerUrl: string = 'https://skillvedika.com',
  image?: string,
  courseUrl?: string
): CourseSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: providerName,
      url: providerUrl,
    },
    ...(image && { image }),
    ...(courseUrl && { url: courseUrl }),
  };
}

/**
 * Generate Breadcrumb structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

/**
 * Generate FAQPage structured data
 *
 * IMPORTANT: Only use for real, visible FAQs that match on-page content exactly.
 * Do NOT include promotional content or hidden/expandable-only content.
 *
 * @param faqs - Array of FAQ objects with question and answer
 * @returns FAQPage schema or null if invalid
 */
export function generateFAQPageSchema(
  faqs: Array<{ question: string; answer: string }>
): FAQPageSchema | null {
  if (!Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  // Filter out invalid FAQs (empty questions or answers)
  const validFaqs = faqs.filter(
    faq =>
      faq &&
      typeof faq.question === 'string' &&
      faq.question.trim().length > 0 &&
      typeof faq.answer === 'string' &&
      faq.answer.trim().length > 0
  );

  if (validFaqs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.trim(),
      },
    })),
  };
}

/**
 * Generate ContactPage structured data with Organization
 *
 * @param url - Absolute URL of the contact page
 * @param organization - Organization details
 * @returns ContactPage schema
 */
export function generateContactPageSchema(
  url: string,
  organization: {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    email?: string;
    phone?: string;
    addresses?: Array<{
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    }>;
    sameAs?: string[];
  }
): ContactPageSchema {
  const contactPoints: Array<{
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    email?: string;
    areaServed?: string;
    availableLanguage?: string;
  }> = [];

  if (organization.email) {
    contactPoints.push({
      '@type': 'ContactPoint',
      email: organization.email,
      contactType: 'Customer Service',
      availableLanguage: 'English',
    });
  }

  if (organization.phone) {
    contactPoints.push({
      '@type': 'ContactPoint',
      telephone: organization.phone,
      contactType: 'Customer Service',
      areaServed: 'Worldwide',
      availableLanguage: 'English',
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url,
    mainEntity: {
      '@type': 'Organization',
      name: organization.name,
      url: organization.url,
      ...(organization.logo && { logo: organization.logo }),
      ...(organization.description && { description: organization.description }),
      ...(contactPoints.length > 0 && { contactPoint: contactPoints }),
      ...(organization.addresses &&
        organization.addresses.length > 0 && {
          address: organization.addresses.map(addr => ({
            '@type': 'PostalAddress',
            ...(addr.streetAddress && { streetAddress: addr.streetAddress }),
            ...(addr.addressLocality && { addressLocality: addr.addressLocality }),
            ...(addr.addressRegion && { addressRegion: addr.addressRegion }),
            ...(addr.postalCode && { postalCode: addr.postalCode }),
            ...(addr.addressCountry && { addressCountry: addr.addressCountry }),
          })),
        }),
      ...(organization.sameAs &&
        organization.sameAs.length > 0 && {
          sameAs: organization.sameAs,
        }),
    },
  };
}

/**
 * Generate AboutPage structured data with Organization
 *
 * @param url - Absolute URL of the about page
 * @param organization - Organization details
 * @returns AboutPage schema
 */
export function generateAboutPageSchema(
  url: string,
  organization: {
    name: string;
    legalName?: string;
    url: string;
    logo?: string;
    description?: string;
    foundingDate?: string;
    founder?: {
      name: string;
      type?: 'Person' | 'Organization';
    };
    sameAs?: string[];
    email?: string;
    phone?: string;
  }
): AboutPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url,
    mainEntity: {
      '@type': 'Organization',
      name: organization.name,
      url: organization.url,
      ...(organization.legalName && { legalName: organization.legalName }),
      ...(organization.logo && { logo: organization.logo }),
      ...(organization.description && { description: organization.description }),
      ...(organization.foundingDate && { foundingDate: organization.foundingDate }),
      ...(organization.founder && {
        founder: {
          '@type': organization.founder.type || 'Organization',
          name: organization.founder.name,
        },
      }),
      ...(organization.sameAs &&
        organization.sameAs.length > 0 && {
          sameAs: organization.sameAs,
        }),
      ...((organization.email || organization.phone) && {
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          ...(organization.email && { email: organization.email }),
          ...(organization.phone && { telephone: organization.phone }),
        },
      }),
    },
  };
}

/**
 * Generate WebPage structured data
 *
 * @param url - Absolute URL of the page
 * @param options - Page metadata
 * @returns WebPage schema
 */
export function generateWebPageSchema(
  url: string,
  options?: {
    name?: string;
    description?: string;
    inLanguage?: string;
    siteName?: string;
    siteUrl?: string;
    organizationName?: string;
    organizationUrl?: string;
  }
): WebPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    ...(options?.name && { name: options.name }),
    ...(options?.description && { description: options.description }),
    ...(options?.inLanguage && { inLanguage: options.inLanguage }),
    ...(options?.siteName &&
      options?.siteUrl && {
        isPartOf: {
          '@type': 'WebSite',
          name: options.siteName,
          url: options.siteUrl,
        },
      }),
    ...(options?.organizationName &&
      options?.organizationUrl && {
        about: {
          '@type': 'Organization',
          name: options.organizationName,
          url: options.organizationUrl,
        },
      }),
  };
}

/**
 * Generate CollectionPage structured data (for listing pages)
 *
 * @param url - Absolute URL of the collection page
 * @param options - Collection metadata
 * @returns CollectionPage schema
 */
export function generateCollectionPageSchema(
  url: string,
  options?: {
    name?: string;
    description?: string;
    items?: Array<{
      name: string;
      url: string;
      type?: string;
    }>;
  }
): CollectionPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url,
    ...(options?.name && { name: options.name }),
    ...(options?.description && { description: options.description }),
    ...(options?.items &&
      options.items.length > 0 && {
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: options.items.length,
          itemListElement: options.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': item.type || 'Thing',
              name: item.name,
              url: item.url,
            },
          })),
        },
      }),
  };
}

/**
 * Generate BlogPosting structured data
 *
 * @param options - Blog post metadata
 * @returns BlogPosting schema
 */
export function generateBlogPostingSchema(options: {
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  url: string;
  authorName?: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
}): BlogPostingSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: options.headline,
    ...(options.description && { description: options.description }),
    ...(options.image && { image: options.image }),
    ...(options.datePublished && { datePublished: options.datePublished }),
    ...(options.dateModified && { dateModified: options.dateModified }),
    ...(options.authorName && {
      author: {
        '@type': 'Person',
        name: options.authorName,
        ...(options.authorUrl && { url: options.authorUrl }),
      },
    }),
    ...(options.publisherName && {
      publisher: {
        '@type': 'Organization',
        name: options.publisherName,
        ...(options.publisherLogo && {
          logo: {
            '@type': 'ImageObject',
            url: options.publisherLogo,
          },
        }),
      },
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': options.url,
    },
  };
}

/**
 * Generate Review Schema (JSON-LD) for testimonials
 */
export function generateReviewSchema(options: {
  authorName: string;
  authorImage?: string;
  rating: number;
  reviewText: string;
  datePublished?: string;
  courseCategory?: string;
}): object {
  const review: any = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: options.authorName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: options.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: options.reviewText,
  };

  if (options.authorImage) {
    review.author.image = options.authorImage;
  }

  if (options.datePublished) {
    review.datePublished = options.datePublished;
  }

  if (options.courseCategory) {
    review.itemReviewed = {
      '@type': 'Course',
      name: options.courseCategory,
    };
  }

  return review;
}

/**
 * Generate AggregateRating Schema (JSON-LD) for course ratings
 */
export function generateAggregateRatingSchema(options: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue: options.ratingValue,
    reviewCount: options.reviewCount,
    bestRating: options.bestRating || 5,
    worstRating: options.worstRating || 1,
  };
}

/**
 * Render structured data as JSON-LD script tag
 */
export function StructuredData({ data }: Readonly<{ data: object | object[] }>) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((schema, index) => {
        // Generate a unique key based on schema type and index
        const schemaType = (schema as { '@type'?: string })['@type'] || 'schema';
        const key = `${schemaType}-${index}`;

        return (
          <script
            key={key}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
          />
        );
      })}
    </>
  );
}
