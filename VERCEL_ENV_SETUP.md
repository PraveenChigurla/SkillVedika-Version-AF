# Vercel Environment Variables Setup

## Critical: Required Environment Variable

For the production deployment on Vercel to work correctly, you **MUST** set the following environment variable:

### `NEXT_PUBLIC_API_URL`

**Value:** `https://api.skillvedika.in`

**Important Notes:**
- Do NOT include `/api` suffix - the helper functions will add it automatically
- The value should be exactly: `https://api.skillvedika.in` (no trailing slash)
- This variable is used by all API calls throughout the application

## How to Set in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api.skillvedika.in`
   - **Environment:** Select all environments (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for the changes to take effect

## Verification

After setting the environment variable and redeploying:

1. Open your production site: `https://www.skillvedika.in`
2. Open browser DevTools → Console
3. Check that API calls are going to `https://api.skillvedika.in/api/...` (not `https://www.skillvedika.in/api/...`)
4. Verify that courses and blogs are loading correctly

## Troubleshooting

### If courses/blogs still not loading:

1. **Check Environment Variable:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_API_URL` is set to `https://api.skillvedika.in`
   - Make sure it's enabled for **Production** environment

2. **Redeploy:**
   - After changing environment variables, you MUST redeploy
   - Go to Deployments tab → Click "..." on latest deployment → "Redeploy"

3. **Check Browser Console:**
   - Open DevTools → Network tab
   - Look for API requests
   - They should go to `https://api.skillvedika.in/api/...`
   - If they go to `https://www.skillvedika.in/api/...`, the env var is not set correctly

4. **Verify Backend CORS:**
   - Ensure backend allows requests from `https://www.skillvedika.in`
   - Check backend `.env` has: `FRONTEND_URLS=https://www.skillvedika.in`

## Current Status

✅ Code has been updated to use centralized `getApiUrl()` and `getApiBaseUrl()` helpers
✅ All components now use consistent API URL construction
⚠️ **Action Required:** Set `NEXT_PUBLIC_API_URL` in Vercel environment variables

