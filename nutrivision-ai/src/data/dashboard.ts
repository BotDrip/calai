export const hydrationStats = {
  day: 2.3,
  week: 14.8,
  month: 62.4,
  goal: 3.0,
  streak: 12,
  tips: 'Drink 2 glasses of water immediately after waking up to boost metabolism.',
}

export const calorieStats = {
  goal: 2800,
  consumed: 1680,
  meals: {
    morning: { consumed: 650, target: 800 },
    afternoon: { consumed: 750, target: 900 },
    evening: { consumed: 280, target: 400 },
    night: { consumed: 760, target: 700 },
  },
}

export const macroStats = [
  { label: 'Protein', value: 145, target: 200, color: '#0EA5E9', unit: 'g' },
  { label: 'Carbs', value: 210, target: 350, color: '#22C55E', unit: 'g' },
  { label: 'Fats', value: 54, target: 80, color: '#F59E0B', unit: 'g' },
]

export const weightTrend = {
  weekly: [
    { label: 'Mon', weight: 78.2 },
    { label: 'Tue', weight: 78.0 },
    { label: 'Wed', weight: 77.8 },
    { label: 'Thu', weight: 77.6 },
    { label: 'Fri', weight: 77.5 },
    { label: 'Sat', weight: 77.7 },
    { label: 'Sun', weight: 77.4 },
  ],
  monthly: [
    { label: 'Week 1', weight: 80.5 },
    { label: 'Week 2', weight: 79.2 },
    { label: 'Week 3', weight: 78.4 },
    { label: 'Week 4', weight: 77.4 },
  ],
  current: 77.4,
  goal: 75.0,
  start: 85.0,
}

export const mealPlanner = {
  morning: {
    title: 'Morning Meal',
    time: '8:00 AM',
    calories: 650,
    target: 800,
    macros: { protein: 30, carbs: 80, fats: 15 },
    status: 'On Track',
    suggestion: {
      name: 'Oats & Eggs Power',
      items: ['Oats (60g)', 'Milk (250ml)', 'Boiled Eggs (2)'],
      cost: 'Rs45',
      protein: '22g',
      calories: '450 kcal',
    },
  },
  afternoon: {
    title: 'Afternoon Meal',
    time: '1:00 PM',
    calories: 750,
    target: 900,
    macros: { protein: 40, carbs: 100, fats: 20 },
    status: 'On Track',
    suggestion: {
      name: 'Rice, Dal & Sabzi',
      items: ['Rice (150g cooked)', 'Dal (120g)', 'Seasonal Sabzi (100g)'],
      cost: 'Rs55',
      protein: '18g',
      calories: '520 kcal',
    },
  },
  evening: {
    title: 'Evening Snack',
    time: '5:00 PM',
    calories: 280,
    target: 400,
    macros: { protein: 15, carbs: 40, fats: 8 },
    status: 'Low',
    suggestion: {
      name: 'Chana & Fruit Boost',
      items: ['Roasted Chana (50g)', 'Banana (1)'],
      cost: 'Rs20',
      protein: '12g',
      calories: '250 kcal',
    },
  },
  night: {
    title: 'Night Meal',
    time: '9:00 PM',
    calories: 760,
    target: 700,
    macros: { protein: 48, carbs: 70, fats: 22 },
    status: 'Over',
    suggestion: {
      name: 'Roti & Protein Source',
      items: ['Roti (2 pcs)', 'Paneer/Chicken (100g)'],
      cost: 'Rs60',
      protein: '25g',
      calories: '480 kcal',
    },
  },
}

export const stagePrep = {
  countdown: { weeks: 12, days: 4 },
  phase: 'Cutting',
  disciplineScore: 94,
  readiness: 78,
  feedback: {
    conditioning: 'Good vascularity visible in morning check-in.',
    dryness: 'Hold water intake consistent.',
    fullness: 'Carb load scheduled for Friday.',
  },
}

export const aiInsights = [
  'Your protein intake is slightly low for the cutting phase. Add whey or 100g chicken.',
  'Hydration streak is strong. Keep hitting 3L daily to improve muscle fullness.',
  'Budget tip: Swap quinoa with broken wheat (dalia) to save Rs200/week.',
]
