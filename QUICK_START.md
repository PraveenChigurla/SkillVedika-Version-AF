# Quick Start Guide - After Refactoring

## Installation

```bash
npm install
```

## Available Scripts

### Development

```bash
npm run dev
```

Starts the development server with Turbopack.

### Build

```bash
npm run build
```

Creates an optimized production build.

### Type Checking

```bash
npm run type-check
```

Runs TypeScript type checking without emitting files.

### Linting

```bash
npm run lint
```

Runs ESLint to check for code quality issues.

```bash
npm run lint:fix
```

Runs ESLint and automatically fixes issues where possible.

### Formatting

```bash
npm run format
```

Formats all code using Prettier.

```bash
npm run format:check
```

Checks if code is properly formatted.

### Production

```bash
npm start
```

Starts the production server (run after `npm run build`).

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SITE_URL=https://skillvedika.com
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_WHATSAPP=true
NEXT_PUBLIC_ENABLE_COOKIE_CONSENT=true
```

## Key Changes

### Using API Services

Instead of direct fetch calls, use the service layer:

```typescript
import { coursesService } from '@/services/api.service';

const courses = await coursesService.getAll();
```

### Error Handling

Use centralized error handling:

```typescript
import { normalizeError, getUserFriendlyMessage } from '@/lib/utils/error-handler';

try {
  // Your code
} catch (error) {
  const appError = normalizeError(error);
  const message = getUserFriendlyMessage(appError);
  // Show message to user
}
```

### Validation

Use validation utilities:

```typescript
import { validateEmail, validatePhone } from '@/lib/utils/validation';

if (validateEmail(email)) {
  // Valid email
}
```

### Configuration

Use centralized configuration:

```typescript
import { APP_CONFIG, SEO_CONFIG } from '@/lib/config/app.config';

const siteUrl = APP_CONFIG.url;
const defaultTitle = SEO_CONFIG.defaultTitle;
```

## Next Steps

1. Review `MIGRATION_GUIDE.md` to migrate existing code
2. Check `PRODUCTION_CHECKLIST.md` before deploying
3. Read `REFACTORING_GUIDE.md` for detailed information

## Troubleshooting

### TypeScript Errors

Run `npm run type-check` to see all TypeScript errors.

### Linting Errors

Run `npm run lint:fix` to automatically fix many issues.

### Build Errors

1. Check environment variables are set
2. Run `npm run type-check` to find TypeScript errors
3. Check `next.config.mjs` for configuration issues

## Support

- Check documentation files in the root directory
- Review code comments in service files
- Check Next.js documentation: https://nextjs.org/docs
