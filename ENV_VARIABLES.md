# Environment Variables Guide

## Required Environment Variables

### For Production (Vercel)

Based on your Vercel configuration, you need:

```env
NEXT_PUBLIC_API_URL=https://api.skillvedika.in
```

**Important Notes:**
- The `getApiUrl()` helper automatically adds `/api` suffix if not present
- So if your backend is at `https://api.skillvedika.in/api`, set: `NEXT_PUBLIC_API_URL=https://api.skillvedika.in`
- If your backend is at `https://api.skillvedika.in` (without `/api`), set: `NEXT_PUBLIC_API_URL=https://api.skillvedika.in/api`

### For Local Development

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Not Needed (Can Remove)

- `BACKEND_URL` - **NOT USED** anywhere in the codebase. You can remove this from Vercel.

## How It Works

The codebase uses a centralized `getApiUrl()` helper function that:
1. Takes an endpoint (e.g., `/courses`, `/header-settings`)
2. Automatically adds `/api` prefix if the base URL doesn't already end with `/api`
3. Returns the complete URL: `{baseUrl}/api{endpoint}`

**Example:**
- If `NEXT_PUBLIC_API_URL=https://api.skillvedika.in`
- `getApiUrl('/courses')` returns: `https://api.skillvedika.in/api/courses`

## Vercel Configuration

In your Vercel project settings, ensure:
- ✅ `NEXT_PUBLIC_API_URL` is set to `https://api.skillvedika.in`
- ❌ `BACKEND_URL` can be removed (not used)

## Testing

After setting the environment variable:
1. Redeploy your Vercel project
2. Check browser console for API calls
3. Verify API calls are going to the correct URL

