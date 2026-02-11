# NutriVision AI - Complete Setup Guide

This guide will walk you through setting up the ML-powered nutrition analysis platform from scratch.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Google account (for Gemini API)
- A Supabase account (free tier is sufficient)

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Navigate to project directory
cd nutrivision-ai

# Install all dependencies
npm install
```

### 2. Get Google Gemini API Key

The food scanner uses Google's Gemini 1.5 Flash model for computer vision.

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 3. Set Up Supabase Database

Supabase provides the PostgreSQL database for storing scan history and analytics.

1. Go to [Supabase](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in project details:
   - **Name**: nutrivision-ai (or your choice)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient

5. Wait for project to be provisioned (1-2 minutes)

6. Get your project credentials:
   - Click on "Project Settings" (gear icon)
   - Go to "API" section
   - Copy:
     - **Project URL** (looks like: https://xxxxx.supabase.co)
     - **anon/public** key (starts with "eyJ...")

7. The database tables will be created automatically when you first run the app

### 4. Configure Environment Variables

Create a `.env` file in the `nutrivision-ai` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
# Required: Google Gemini AI
VITE_GEMINI_API_KEY=AIza... # Your Gemini API key from step 2

# Required: Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co  # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=eyJ...                # Your Supabase anon key

# Optional: Firebase (only if you want Firebase auth instead of mock auth)
# VITE_FIREBASE_API_KEY=
# VITE_FIREBASE_AUTH_DOMAIN=
# VITE_FIREBASE_PROJECT_ID=
# VITE_FIREBASE_STORAGE_BUCKET=
# VITE_FIREBASE_MESSAGING_SENDER_ID=
# VITE_FIREBASE_APP_ID=
```

### 5. Initialize Database Tables

The database migrations are automatically applied. To manually run them:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor"
3. The tables should already exist. To verify, run:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see:
- `food_scans`
- `scan_analytics`

If tables don't exist, they will be created automatically on first use.

### 6. Run the Application

```bash
# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### 7. Test the Food Scanner

1. Create an account (sign up with any email/password)
2. Navigate to "Food Scanner" page
3. Either:
   - Click "Open Camera" and capture a photo of food
   - Or "Upload Image" to test with a food image
4. Click "Scan Food" to analyze
5. Wait 2-3 seconds for AI analysis
6. View results including:
   - Food name
   - Nutrition breakdown
   - Confidence score
   - Health recommendations

## Common Issues & Solutions

### Issue: "API Key not configured"
**Solution**: Verify your `VITE_GEMINI_API_KEY` is correctly set in `.env` file and restart the dev server.

### Issue: "Database connection failed"
**Solution**:
- Check your Supabase URL and anon key are correct
- Ensure your Supabase project is active
- Verify RLS policies are enabled (they are by default)

### Issue: "Camera not working"
**Solution**:
- Grant camera permissions in your browser
- Use HTTPS (camera requires secure context)
- Try the upload feature as alternative
- On mobile, use the back camera by default

### Issue: "AI Scan Failed"
**Solution**:
- Ensure image is clear and well-lit
- Try uploading instead of camera capture
- Check console for detailed error messages
- Verify you haven't exceeded Gemini API quota (60 requests/minute)

### Issue: "Build warnings about chunk size"
**Solution**: This is expected for ML applications with large dependencies. The app will still work fine. To optimize:
```bash
# Use production build
npm run build
npm run preview
```

## Testing the Features

### 1. Test Food Scanner
- Upload an image of Indian food (dal, rice, roti, etc.)
- Or any food item (pizza, salad, etc.)
- Check if nutrition data is accurate
- Verify scan appears in history

### 2. Test Stage Prep Engine
- Navigate to "Stage Prep" page
- Fill in the assessment form (3 steps)
- Click "Analyze and Generate Plan"
- Verify meal plan is generated
- Check if plan syncs to Meal Planner

### 3. Test Meal Planner Integration
- Scan a food item
- Add it to a meal slot
- Navigate to "Meal Planner"
- Verify the added item shows updated nutrition

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all `VITE_*` variables from your `.env` file

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Configure environment variables in Netlify dashboard

## API Usage Limits

### Gemini API (Free Tier)
- 60 requests per minute
- 1,500 requests per day
- Each food scan = 1 request

### Supabase (Free Tier)
- 500MB database storage
- 2GB bandwidth per month
- Unlimited API requests
- 50,000 monthly active users

## Advanced Configuration

### Custom Food Database

Edit `src/data/dashboard.ts` to add more Indian food items with accurate nutrition data.

### Adjust Scan Confidence Threshold

Edit `src/lib/gemini.ts` to modify the AI prompt for stricter/looser analysis.

### Modify UI Theme

Edit `tailwind.config.cjs` to change colors:
```javascript
colors: {
  primary: '#0EA5E9', // Change this
  accent: '#22C55E',  // And this
}
```

## Getting Help

1. Check browser console for detailed error messages
2. Review `README.md` for troubleshooting section
3. Ensure all environment variables are set correctly
4. Verify Supabase project is active and accessible
5. Check Gemini API quota hasn't been exceeded

## Next Steps

After successful setup:

1. Test all features thoroughly
2. Customize the UI theme to your preference
3. Add more food items to the database
4. Explore the Stage Prep calculator
5. Try the AI Coach feature
6. Review the scan history and analytics

---

**Ready to use!** Your ML-powered nutrition analysis platform is now fully functional.
