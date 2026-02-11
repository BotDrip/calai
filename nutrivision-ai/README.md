# NutriVision AI - ML-Powered Nutrition Analysis Platform

A comprehensive health-tech web application featuring AI-powered food scanning, nutrition analysis, and meal planning. Built for faculty evaluation and demonstration of modern ML integration in web applications.

## Core ML Features

### 1. AI Food Scanner (Gemini Vision API)
- Real-time camera capture or image upload
- Computer vision-based food identification using Google Gemini 1.5 Flash
- Comprehensive nutrition analysis including:
  - Macronutrients (calories, protein, carbs, fats, fiber)
  - Portion size estimation
  - Food categorization
  - Health score calculation (1-10 scale)
  - Confidence score for ML predictions
  - Micronutrient highlights
  - Personalized recommendations for athletes
- Scan history with analytics (total scans, average confidence, total calories analyzed)

### 2. Intelligent Stage Prep Engine
- Mathematical modeling using BMR/TDEE equations
- Multi-phase nutrition planning (Bulking, Cutting, Peak Week)
- AI-driven meal plan generation based on:
  - Anthropometric data (age, height, weight, body fat)
  - Training frequency and intensity
  - Diet preferences (vegetarian/non-veg)
  - Budget constraints
  - Phase-specific priorities (fullness, fat loss, dryness, strength)
- Dynamic macro distribution with carb cycling strategies

### 3. AI Nutrition Coach
- Context-aware recommendations using Gemini AI
- Real-time meal optimization
- Budget-aware Indian food alternatives
- Recovery and hydration guidance

## Tech Stack

### Frontend
- React 19 + Vite
- TypeScript
- Tailwind CSS with glassmorphism design
- Framer Motion for animations
- Recharts for data visualization

### ML & AI
- Google Gemini 1.5 Flash (Vision + Text)
- Computer Vision for food recognition
- Natural Language Processing for recommendations
- Mathematical modeling for nutrition calculations

### Backend & Database
- Supabase (PostgreSQL) for data persistence
- Row Level Security (RLS) for data protection
- Real-time database operations
- Scan history and analytics storage

### Authentication
- Mock authentication system (for demo purposes)
- Can be easily replaced with Firebase or Supabase Auth
- User session management with localStorage

## Database Schema

### food_scans
Stores all AI-powered food scan results with nutrition data, confidence scores, and recommendations.

### scan_analytics
Tracks user scanning patterns, average confidence, and total nutrition analyzed.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the following:

```bash
# Required: Google Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Required: Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Firebase (if using Firebase auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
# ... other Firebase keys
```

### 3. Set Up Supabase Database
The database migrations have been applied automatically. Your Supabase project should have:
- `food_scans` table with RLS enabled
- `scan_analytics` table with RLS enabled
- Proper indexes for performance

### 4. Get Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 5. Run the Application
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

## ML Model Details

### Food Recognition Model
- Model: Google Gemini 1.5 Flash (Vision)
- Input: JPEG images (base64 encoded)
- Output: Structured JSON with nutrition data
- Features:
  - Multi-food detection
  - Portion size estimation
  - Indian cuisine specialization
  - Confidence scoring
  - Safety filters disabled for food analysis

### Nutrition Calculation Engine
- Uses Mifflin-St Jeor equation for BMR
- Activity multipliers based on training frequency
- Phase-specific macro distribution algorithms
- Budget-optimized meal planning using Indian food database

## Project Structure

```
src/
├── components/         # Reusable UI components
├── context/           # React context providers
│   ├── AuthContext    # Authentication state
│   ├── MealPlannerContext  # Meal planning state
│   └── ToastContext   # Notification system
├── data/              # Static data and food database
├── hooks/             # Custom React hooks
├── lib/               # External service integrations
│   ├── gemini.ts      # Gemini AI integration
│   ├── supabase.ts    # Database operations
│   └── firebase.ts    # Firebase config (optional)
├── pages/             # Main application pages
│   ├── FoodScan.tsx   # AI food scanner
│   ├── StagePrep.tsx  # ML-based prep planning
│   ├── Dashboard.tsx  # Main dashboard
│   └── ...other pages
└── index.css          # Global styles
```

## Key Features for Faculty Evaluation

### ML/AI Integration
1. Real-world computer vision application
2. Integration with Google's latest Gemini model
3. Structured data extraction from images
4. Confidence scoring and error handling

### Database Design
1. Proper normalization
2. Row Level Security implementation
3. Efficient indexing strategies
4. Analytics aggregation

### User Experience
1. Real-time camera integration
2. Progressive web app capabilities
3. Responsive design
4. Loading states and error handling

### Code Quality
1. TypeScript for type safety
2. Component-based architecture
3. Separation of concerns
4. Reusable service layer

## API Usage & Costs

### Gemini API
- Free tier: 60 requests per minute
- Each food scan = 1 request
- Each AI coach query = 1 request

### Supabase
- Free tier: 500MB database, 2GB bandwidth
- Unlimited API requests
- Real-time subscriptions available

## Troubleshooting

### Food Scanner Not Working
1. Check Gemini API key in `.env`
2. Verify API quota hasn't been exceeded
3. Ensure image is clear and well-lit
4. Check browser console for detailed errors

### Database Errors
1. Verify Supabase credentials in `.env`
2. Check RLS policies are properly set
3. Ensure user is authenticated
4. Check browser console for SQL errors

### Camera Not Working
1. Grant camera permissions in browser
2. Use HTTPS (required for camera access)
3. Try upload feature as fallback

## Academic Value

This project demonstrates:
- Integration of modern ML APIs in web applications
- Real-world computer vision use cases
- Database design for ML applications
- User-centric AI feature implementation
- Error handling in ML predictions
- Data persistence and analytics

## Future Enhancements

1. Meal recommendation system using collaborative filtering
2. Barcode scanning for packaged foods
3. Voice-based food logging
4. Integration with fitness trackers
5. Social features (meal sharing, challenges)
6. Multi-language support

## License

This project is for educational and demonstration purposes.

## Support

For issues or questions about the ML implementation:
1. Check the console for detailed error messages
2. Verify all API keys are correctly configured
3. Ensure database migrations have been applied
4. Review the Gemini API documentation for model-specific issues
