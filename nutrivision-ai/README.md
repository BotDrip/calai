# NutriVision AI

Modern health-tech web application for faculty evaluators and tech professionals. Built with React + Vite, Tailwind CSS, Firebase Authentication, Recharts, and Framer Motion.

## Features
- Premium glassmorphism UI with soft gradients, rounded cards, and interactive micro-animations
- Split-screen Login & Sign Up with floating labels and password visibility toggle
- Real-time validation, password strength indicator, and mismatch warning
- Firebase Email/Password and Google OAuth (secure popup)
- Auto-created user profile (Firestore)
- Dashboard with hydration animation, calorie progress, macro ring indicators, weight trend chart, and AI insights
- Toast notifications, loading skeletons, smooth number counters, and page transitions

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS + CSS variables
- Firebase Authentication + Firestore
- Recharts
- Framer Motion
- Lucide Icons

## Setup
1. Install dependencies:
   - `npm install`
2. Add Firebase config:
   - Run `npm run env:setup` to generate `.env`
   - Or manually copy `.env.example` to `.env` and fill in keys
3. Run the app:
   - `npm run dev`

## Project Structure
- `src/pages` – Login, Signup, Dashboard
- `src/components` – UI building blocks
- `src/context` – Auth and Toast providers
- `src/lib` – Firebase setup
- `src/data` – Dashboard data
- `src/hooks` – Password strength helpers

## Notes
- Unsplash images are used for real food photography.
- The UI is responsive and optimized for desktop and mobile.

## Firestore Rules
- See `firestore.rules` for user profile access control.

## Firebase Deploy
1. Update `.firebaserc` with your Firebase project ID.
2. Build the app: `npm run build`
3. Deploy hosting: `npm run firebase:deploy:hosting`
4. Deploy rules: `npm run firebase:deploy:rules`
