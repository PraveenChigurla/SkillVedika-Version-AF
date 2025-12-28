# 🚨 Simple Fix - Do This Now

## The Problem
Your Vercel site can't find the backend API because the environment variable isn't set correctly.

## The Fix (3 Steps - 2 Minutes)

### Step 1: Go to Vercel
1. Open: https://vercel.com/dashboard
2. Click your project: **skill-vedika-version-af**
3. Click **Settings** → **Environment Variables**

### Step 2: Set the Variable
You should see `NEXT_PUBLIC_API_URL` already there.

**Make sure the value is exactly:**
```
https://api.skillvedika.in/api
```

**Check:**
- ✅ Value is exactly: `https://api.skillvedika.in/api`
- ✅ It's enabled for: Production, Preview, Development (all checked)
- ✅ Click **Save** button

### Step 3: Redeploy
1. Go to **Deployments** tab (top menu)
2. Find the latest deployment
3. Click **"..."** (three dots) on the right
4. Click **Redeploy**
5. Wait 2-3 minutes for build to finish

### Step 4: Test
1. Visit: https://www.skillvedika.in/courses
2. Open browser DevTools (F12) → Console tab
3. Check if courses load (not "0 Courses")
4. Look for errors - they should be gone

## That's It! 🎉

If it still doesn't work after redeploy, check:
- Did you click "Save" in Vercel?
- Did you redeploy after saving?
- Is the value exactly `https://api.skillvedika.in/api` (no extra spaces)?

