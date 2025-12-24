# Production Readiness Checklist

## Pre-Deployment Checklist

### Environment Configuration

- [ ] Set `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Set `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Configure `NEXT_PUBLIC_ENABLE_ANALYTICS` (true/false)
- [ ] Configure `NEXT_PUBLIC_ENABLE_WHATSAPP` (true/false)
- [ ] Set `NODE_ENV=production`
- [ ] Verify all environment variables are set

### Security

- [ ] Verify security headers are working (check in browser DevTools)
- [ ] Test CSP (Content Security Policy) doesn't break functionality
- [ ] Verify HSTS header is present in production
- [ ] Check that no sensitive data is exposed in client-side code
- [ ] Verify API endpoints use HTTPS
- [ ] Test XSS protection
- [ ] Test CSRF protection (if applicable)

### Performance

- [ ] Run `npm run build` and check for errors
- [ ] Verify bundle sizes are reasonable
- [ ] Test image optimization (check Network tab)
- [ ] Verify font loading optimization
- [ ] Check Core Web Vitals:
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Test on slow 3G connection
- [ ] Verify code splitting is working

### SEO

- [ ] Verify all pages have unique titles
- [ ] Check meta descriptions are present and unique
- [ ] Test Open Graph tags (use Facebook Debugger)
- [ ] Test Twitter Cards (use Twitter Card Validator)
- [ ] Verify canonical URLs are correct
- [ ] Check sitemap.xml is accessible
- [ ] Check robots.txt is accessible
- [ ] Verify structured data (JSON-LD) is valid
- [ ] Test with Google Search Console

### Functionality

- [ ] Test all API endpoints
- [ ] Verify form submissions work
- [ ] Test error handling
- [ ] Check loading states
- [ ] Verify navigation works
- [ ] Test responsive design on multiple devices
- [ ] Check accessibility (WCAG 2.1 compliance)
- [ ] Test with screen readers

### Code Quality

- [ ] Run `npm run lint` and fix all errors
- [ ] Run SonarQube analysis
- [ ] Check code coverage (if applicable)
- [ ] Review error logs
- [ ] Verify no console.log statements in production
- [ ] Check for TypeScript errors

### Monitoring & Analytics

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics (Google Analytics, etc.)
- [ ] Set up performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation

### Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile devices (iOS and Android)
- [ ] Test on tablets
- [ ] Test with different screen sizes

### Documentation

- [ ] Update README.md
- [ ] Document environment variables
- [ ] Document deployment process
- [ ] Document API endpoints
- [ ] Create runbook for common issues

## Post-Deployment Checklist

### Immediate Checks

- [ ] Verify site is accessible
- [ ] Check SSL certificate is valid
- [ ] Verify all pages load correctly
- [ ] Test critical user flows
- [ ] Check error logs
- [ ] Verify analytics are tracking

### Performance Monitoring

- [ ] Monitor Core Web Vitals
- [ ] Check API response times
- [ ] Monitor error rates
- [ ] Check server resources
- [ ] Monitor CDN performance (if applicable)

### SEO Monitoring

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Monitor indexing status
- [ ] Check for crawl errors
- [ ] Monitor search rankings

### Security Monitoring

- [ ] Monitor security logs
- [ ] Check for suspicious activity
- [ ] Verify security headers
- [ ] Monitor API rate limiting
- [ ] Check for vulnerabilities

## Rollback Plan

- [ ] Document rollback procedure
- [ ] Keep previous version accessible
- [ ] Test rollback process
- [ ] Have backup of database (if applicable)

## Emergency Contacts

- [ ] DevOps/Infrastructure team
- [ ] Backend API team
- [ ] Security team
- [ ] Product owner

## Notes

- Keep this checklist updated
- Review after each deployment
- Document any issues encountered
- Update procedures based on learnings
