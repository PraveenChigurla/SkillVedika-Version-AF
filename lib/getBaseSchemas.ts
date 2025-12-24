/**
 * Base Schema Generator
 *
 * Generates base schemas (Organization, WebSite) that should be included on every page.
 * This ensures consistent structured data across the site.
 */

import { getSiteUrl } from './seo';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  type OrganizationSchema,
  type WebSiteSchema,
} from './structuredData';

/**
 * Get base schemas for every page
 * Includes Organization and WebSite schemas
 *
 * @param options - Optional organization details from footer settings or API
 * @returns Array of base schemas
 */
export async function getBaseSchemas(options?: {
  organizationName?: string;
  organizationUrl?: string;
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
  searchUrl?: string;
}): Promise<[OrganizationSchema, WebSiteSchema]> {
  const siteUrl = getSiteUrl();
  const orgName = options?.organizationName || 'SkillVedika';
  const orgUrl = options?.organizationUrl || siteUrl;
  const logo = options?.logo || `${siteUrl}/skillvedika-logo.png`;
  const description =
    options?.description ||
    'SkillVedika offers industry-ready online courses, corporate training, and job support programs designed to help professionals grow their careers in IT and technology.';

  // Build sameAs array from social links (if provided)
  const sameAs: string[] = options?.sameAs || [];

  // Parse addresses from location strings if needed
  const addresses = options?.addresses || [];

  const organizationSchema = generateOrganizationSchema(orgName, orgUrl, {
    logo,
    description,
    email: options?.email,
    phone: options?.phone,
    addresses: addresses.length > 0 ? addresses : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  });

  const websiteSchema = generateWebSiteSchema(
    orgName,
    siteUrl,
    options?.searchUrl || `${siteUrl}/courses`
  );

  return [organizationSchema, websiteSchema];
}
