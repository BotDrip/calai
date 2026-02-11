import { useEffect, useMemo, useState } from 'react'
import {
  BrainCircuit,
  Calculator,
  CalendarClock,
  CheckCircle2,
  Droplets,
  Flame,
  IndianRupee,
  RefreshCcw,
  ShieldCheck,
  Target,
  Trophy,
} from 'lucide-react'
import { useMealPlanner } from '../context/MealPlannerContext'
import type { MealSlot, NutritionPayload } from '../context/MealPlannerContext'
import { useToast } from '../context/ToastContext'

type Experience = 'Beginner' | 'Intermediate' | 'Advanced'
type Phase = 'Bulking' | 'Cutting' | 'Peak Week'
type DietType = 'Vegetarian' | 'Non-veg'
type BudgetLevel = 'Low' | 'Medium' | 'High'

type AssessmentForm = {
  age: number
  heightCm: number
  currentWeightKg: number
  targetStageWeightKg: number
  bodyFatPercent: number
  experience: Experience
  competitionDate: string
  phase: Phase
  trainingFrequency: number
  cardioFrequency: number
  dietType: DietType
  budgetLevel: BudgetLevel
  fullnessPriority: number
  fatLossPriority: number
  drynessPriority: number
  strengthPriority: number
}

type MealItem = {
  name: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fats: number
}

type GeneratedMeal = {
  title: string
  slot: MealSlot
  items: MealItem[]
  totals: NutritionPayload
  budgetAlternative: string
}

type AnalysisResult = {
  bmr: number
  tdee: number
  dailyCalories: number
  protein: number
  carbs: number
  fats: number
  confidence: number
  muscleRetentionScore: number
  fatLossRatePerWeek: number
  carbLoadPlan: string
  waterGuidance: string
}

type EngineSnapshot = {
  form: AssessmentForm
  analysis: AnalysisResult
  meals: Record<MealSlot, GeneratedMeal>
}

const STORAGE_KEY = 'nutrivision_stage_prep_engine_v1'
const slotOrder: MealSlot[] = ['morning', 'afternoon', 'evening', 'night']

const initialForm: AssessmentForm = {
  age: 24,
  heightCm: 173,
  currentWeightKg: 78,
  targetStageWeightKg: 72,
  bodyFatPercent: 14,
  experience: 'Intermediate',
  competitionDate: '',
  phase: 'Cutting',
  trainingFrequency: 6,
  cardioFrequency: 4,
  dietType: 'Non-veg',
  budgetLevel: 'Medium',
  fullnessPriority: 70,
  fatLossPriority: 82,
  drynessPriority: 75,
  strengthPriority: 68,
}

const foodDatabase = {
  oats: { kcal: 389, protein: 16.9, carbs: 66.3, fats: 6.9 },
  eggWhites: { kcal: 52, protein: 11.0, carbs: 0.7, fats: 0.2 },
  wholeEgg: { kcal: 143, protein: 13.0, carbs: 1.1, fats: 10.0 },
  riceCooked: { kcal: 130, protein: 2.7, carbs: 28.0, fats: 0.3 },
  chickenBreast: { kcal: 165, protein: 31.0, carbs: 0.0, fats: 3.6 },
  paneer: { kcal: 265, protein: 18.0, carbs: 6.0, fats: 20.0 },
  dalCooked: { kcal: 116, protein: 9.0, carbs: 20.0, fats: 0.4 },
  roti: { kcal: 297, protein: 9.0, carbs: 49.0, fats: 3.0 },
  soyChunks: { kcal: 345, protein: 52.0, carbs: 33.0, fats: 0.5 },
  roastedChana: { kcal: 369, protein: 22.0, carbs: 60.0, fats: 6.0 },
  milk: { kcal: 61, protein: 3.2, carbs: 4.8, fats: 3.3 },
  banana: { kcal: 89, protein: 1.1, carbs: 23.0, fats: 0.3 },
  sabzi: { kcal: 45, protein: 2.0, carbs: 8.0, fats: 1.0 },
  curd: { kcal: 60, protein: 3.5, carbs: 4.7, fats: 3.0 },
}

function roundNutrition(value: number) {
  return Math.max(0, Math.round(value))
}

function item(label: string, key: keyof typeof foodDatabase, grams: number): MealItem {
  const ratio = grams / 100
  return {
    name: label,
    grams,
    calories: roundNutrition(foodDatabase[key].kcal * ratio),
    protein: roundNutrition(foodDatabase[key].protein * ratio),
    carbs: roundNutrition(foodDatabase[key].carbs * ratio),
    fats: roundNutrition(foodDatabase[key].fats * ratio),
  }
}

function totalMealNutrition(items: MealItem[]): NutritionPayload {
  return items.reduce(
    (acc, current) => ({
      calories: acc.calories + current.calories,
      protein: acc.protein + current.protein,
      carbs: acc.carbs + current.carbs,
      fats: acc.fats + current.fats,
      fiber: acc.fiber + Math.round(current.grams * 0.03),
      estimatedWeight: acc.estimatedWeight + current.grams,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, estimatedWeight: 0 },
  )
}

function getActivityMultiplier(training: number, cardio: number) {
  const sessions = training + cardio
  if (sessions <= 4) return 1.45
  if (sessions <= 7) return 1.6
  if (sessions <= 10) return 1.72
  return 1.82
}

function getMacroFactors(phase: Phase) {
  if (phase === 'Bulking') return { proteinPerKg: 2.0, fatsPerKg: 0.9 }
  if (phase === 'Peak Week') return { proteinPerKg: 2.2, fatsPerKg: 0.7 }
  return { proteinPerKg: 2.4, fatsPerKg: 0.75 }
}

function calculateAnalysis(form: AssessmentForm): AnalysisResult {
  const bmr = 10 * form.currentWeightKg + 6.25 * form.heightCm - 5 * form.age + 5
  const tdee = bmr * getActivityMultiplier(form.trainingFrequency, form.cardioFrequency)

  const phaseAdjustment =
    form.phase === 'Bulking'
      ? 250
      : form.phase === 'Peak Week'
        ? -100
        : -250 - Math.round((form.fatLossPriority / 100) * 300)

  const dailyCalories = roundNutrition(tdee + phaseAdjustment)
  const macroFactors = getMacroFactors(form.phase)
  const protein = roundNutrition(form.currentWeightKg * macroFactors.proteinPerKg)
  const fats = roundNutrition(form.currentWeightKg * macroFactors.fatsPerKg)
  const carbs = roundNutrition((dailyCalories - protein * 4 - fats * 9) / 4)

  return {
    bmr: roundNutrition(bmr),
    tdee: roundNutrition(tdee),
    dailyCalories,
    protein,
    carbs,
    fats,
    confidence: 92,
    muscleRetentionScore: roundNutrition((protein / Math.max(form.currentWeightKg * 2.2, 1)) * 100),
    fatLossRatePerWeek: Number(((tdee - dailyCalories) / 7700).toFixed(2)),
    carbLoadPlan:
      form.phase === 'Peak Week'
        ? 'Front-load carbs 3 days out, then taper by 20% before show day.'
        : 'Use higher carbs on heavy training days and reduce 15% on rest days.',
    waterGuidance:
      form.phase === 'Peak Week'
        ? 'Keep water stable first, then controlled taper in final 36 hours.'
        : 'Maintain 4-5L daily with sodium consistency for fullness.',
  }
}

function distribute(value: number, ratios: number[]) {
  return ratios.map((ratio) => roundNutrition(value * ratio))
}

function buildMeals(form: AssessmentForm, analysis: AnalysisResult): Record<MealSlot, GeneratedMeal> {
  const caloriesPerMeal = distribute(analysis.dailyCalories, [0.26, 0.34, 0.14, 0.26])
  const carbBias = form.phase === 'Peak Week' ? 1.12 : form.phase === 'Bulking' ? 1.06 : 1

  const morningItems =
    form.dietType === 'Vegetarian'
      ? [
          item('Oats', 'oats', 60),
          item('Milk', 'milk', 250),
          item('Soy chunks', 'soyChunks', form.budgetLevel === 'Low' ? 30 : 40),
        ]
      : [
          item('Oats', 'oats', 60),
          item('Egg whites', 'eggWhites', 150),
          item('Whole egg', 'wholeEgg', 50),
        ]

  const afternoonItems =
    form.dietType === 'Vegetarian'
      ? [
          item('Rice (cooked)', 'riceCooked', roundNutrition(120 * carbBias)),
          item('Paneer', 'paneer', form.budgetLevel === 'Low' ? 90 : 130),
          item('Dal', 'dalCooked', 120),
          item('Sabzi', 'sabzi', 100),
        ]
      : [
          item('Rice (cooked)', 'riceCooked', roundNutrition(130 * carbBias)),
          item(
            form.budgetLevel === 'Low' ? 'Egg whites' : 'Chicken breast',
            form.budgetLevel === 'Low' ? 'eggWhites' : 'chickenBreast',
            form.budgetLevel === 'Low' ? 200 : 150,
          ),
          item('Sabzi', 'sabzi', 100),
        ]

  const eveningItems =
    form.budgetLevel === 'Low'
      ? [item('Roasted chana', 'roastedChana', 55), item('Banana', 'banana', 110)]
      : [
          item('Roasted chana', 'roastedChana', 40),
          item('Banana', 'banana', 110),
          item('Curd', 'curd', 120),
        ]

  const nightItems =
    form.dietType === 'Vegetarian'
      ? [item('Paneer', 'paneer', 120), item('Roti', 'roti', 70), item('Dal', 'dalCooked', 100)]
      : [
          item('Chicken breast', 'chickenBreast', form.budgetLevel === 'Low' ? 120 : 160),
          item('Roti', 'roti', 70),
          item('Sabzi', 'sabzi', 120),
        ]

  const meals: Record<MealSlot, GeneratedMeal> = {
    morning: {
      title: 'Morning',
      slot: 'morning',
      items: morningItems,
      totals: totalMealNutrition(morningItems),
      budgetAlternative: 'Switch whey with milk + soy chunks for better value.',
    },
    afternoon: {
      title: 'Afternoon',
      slot: 'afternoon',
      items: afternoonItems,
      totals: totalMealNutrition(afternoonItems),
      budgetAlternative: 'Rice + dal + eggs delivers better protein per rupee.',
    },
    evening: {
      title: 'Evening',
      slot: 'evening',
      items: eveningItems,
      totals: totalMealNutrition(eveningItems),
      budgetAlternative: 'Roasted chana replaces expensive protein bars.',
    },
    night: {
      title: 'Night',
      slot: 'night',
      items: nightItems,
      totals: totalMealNutrition(nightItems),
      budgetAlternative: 'Roti + paneer/chicken keeps prep sustainable daily.',
    },
  }

  const normalizedMeals = { ...meals }
  slotOrder.forEach((slot, index) => {
    normalizedMeals[slot] = {
      ...normalizedMeals[slot],
      totals: {
        ...normalizedMeals[slot].totals,
        calories: caloriesPerMeal[index],
      },
    }
  })

  return normalizedMeals
}

export default function StagePrep() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<AssessmentForm>(initialForm)
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null)
  const [workingWeight, setWorkingWeight] = useState(initialForm.currentWeightKg)
  const { applyStagePrepPlan } = useMealPlanner()
  const { pushToast } = useToast()

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as EngineSnapshot
      setSnapshot(parsed)
      setForm(parsed.form)
      setWorkingWeight(parsed.form.currentWeightKg)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const formCompletion = useMemo(() => ((step + 1) / 3) * 100, [step])

  const syncToMealPlanner = (analysis: AnalysisResult, meals: Record<MealSlot, GeneratedMeal>, phase: Phase) => {
    applyStagePrepPlan({
      phase,
      mealTargets: {
        morning: meals.morning.totals.calories,
        afternoon: meals.afternoon.totals.calories,
        evening: meals.evening.totals.calories,
        night: meals.night.totals.calories,
      },
      mealBaseNutrition: {
        morning: meals.morning.totals,
        afternoon: meals.afternoon.totals,
        evening: meals.evening.totals,
        night: meals.night.totals,
      },
    })

    pushToast(
      `AI Analysis Complete. ${analysis.dailyCalories} kcal plan synced to Meal Planner.`,
      'success',
    )
  }

  const runEngine = (nextForm: AssessmentForm) => {
    const analysis = calculateAnalysis(nextForm)
    const meals = buildMeals(nextForm, analysis)
    const nextSnapshot: EngineSnapshot = { form: nextForm, analysis, meals }
    setSnapshot(nextSnapshot)
    setForm(nextForm)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSnapshot))
    syncToMealPlanner(analysis, meals, nextForm.phase)
  }

  const handleAnalyze = (event: React.FormEvent) => {
    event.preventDefault()
    runEngine(form)
  }

  const handleRecalculate = () => {
    const updatedForm = { ...form, currentWeightKg: workingWeight }
    runEngine(updatedForm)
  }

  if (!snapshot) {
    return (
      <section className="space-y-6">
        <article className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-yellow-400">
                <Trophy size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Competition Mode</span>
              </div>
              <h2 className="text-3xl font-bold">AI Stage Prep Engine</h2>
              <p className="text-slate-400">Complete assessment to unlock personalized prep intelligence.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Assessment Progress</p>
              <p className="text-2xl font-bold">{Math.round(formCompletion)}%</p>
            </div>
          </div>

          <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${formCompletion}%` }}
            />
          </div>

          <form onSubmit={handleAnalyze} className="space-y-6">
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Age</span>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Height (cm)</span>
                  <input
                    type="number"
                    value={form.heightCm}
                    onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Current Weight (kg)</span>
                  <input
                    type="number"
                    value={form.currentWeightKg}
                    onChange={(e) => setForm({ ...form, currentWeightKg: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Target Stage Weight (kg)</span>
                  <input
                    type="number"
                    value={form.targetStageWeightKg}
                    onChange={(e) => setForm({ ...form, targetStageWeightKg: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Body Fat % (if known)</span>
                  <input
                    type="number"
                    value={form.bodyFatPercent}
                    onChange={(e) => setForm({ ...form, bodyFatPercent: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Experience Level</span>
                  <select
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value as Experience })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Competition Date</span>
                  <input
                    type="date"
                    value={form.competitionDate}
                    onChange={(e) => setForm({ ...form, competitionDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Current Phase</span>
                  <select
                    value={form.phase}
                    onChange={(e) => setForm({ ...form, phase: e.target.value as Phase })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  >
                    <option>Bulking</option>
                    <option>Cutting</option>
                    <option>Peak Week</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Training Frequency / Week</span>
                  <input
                    type="number"
                    value={form.trainingFrequency}
                    onChange={(e) => setForm({ ...form, trainingFrequency: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Cardio Frequency / Week</span>
                  <input
                    type="number"
                    value={form.cardioFrequency}
                    onChange={(e) => setForm({ ...form, cardioFrequency: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Diet Type</span>
                  <select
                    value={form.dietType}
                    onChange={(e) => setForm({ ...form, dietType: e.target.value as DietType })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  >
                    <option>Vegetarian</option>
                    <option>Non-veg</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-300">Budget Level</span>
                  <select
                    value={form.budgetLevel}
                    onChange={(e) => setForm({ ...form, budgetLevel: e.target.value as BudgetLevel })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-white outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { key: 'fullnessPriority', label: 'Muscle fullness priority' },
                  { key: 'fatLossPriority', label: 'Fat loss priority' },
                  { key: 'drynessPriority', label: 'Stage dryness priority' },
                  { key: 'strengthPriority', label: 'Strength retention priority' },
                ].map((slider) => (
                  <label key={slider.key} className="space-y-2 rounded-xl bg-white/5 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">{slider.label}</span>
                      <span className="text-cyan-300">
                        {form[slider.key as keyof AssessmentForm] as number}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form[slider.key as keyof AssessmentForm] as number}
                      onChange={(e) =>
                        setForm({ ...form, [slider.key]: Number(e.target.value) } as AssessmentForm)
                      }
                      className="w-full accent-sky-400"
                    />
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 transition disabled:opacity-30"
              >
                Back
              </button>
              {step < 2 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.min(2, prev + 1))}
                  className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                >
                  Analyze and Generate Plan
                </button>
              )}
            </div>
          </form>
        </article>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <article className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-yellow-400">
              <Trophy size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">AI Analysis Complete</span>
            </div>
            <h2 className="text-3xl font-bold">Intelligent Stage Prep Engine</h2>
            <p className="text-slate-400">Structured prep plan generated for {snapshot.form.phase} phase.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSnapshot(null)}
              className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200"
            >
              Edit Assessment
            </button>
            <button
              type="button"
              onClick={handleRecalculate}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
            >
              <RefreshCcw size={14} />
              Recalculate Plan
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">Recommended Daily Calories</p>
            <p className="text-2xl font-bold">{snapshot.analysis.dailyCalories} kcal</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">Protein</p>
            <p className="text-2xl font-bold">{snapshot.analysis.protein}g</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">Carbs</p>
            <p className="text-2xl font-bold">{snapshot.analysis.carbs}g</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">Fats</p>
            <p className="text-2xl font-bold">{snapshot.analysis.fats}g</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="mb-1 flex items-center gap-2 text-cyan-300">
              <Calculator size={14} />
              <p className="text-xs uppercase">Math Modelling</p>
            </div>
            <p className="text-sm text-slate-200">BMR: {snapshot.analysis.bmr} | TDEE: {snapshot.analysis.tdee}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="mb-1 flex items-center gap-2 text-cyan-300">
              <CheckCircle2 size={14} />
              <p className="text-xs uppercase">Model Confidence</p>
            </div>
            <p className="text-sm text-slate-200">{snapshot.analysis.confidence}% confidence score</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="mb-1 flex items-center gap-2 text-cyan-300">
              <CalendarClock size={14} />
              <p className="text-xs uppercase">Competition Date</p>
            </div>
            <p className="text-sm text-slate-200">{snapshot.form.competitionDate || 'Not set'}</p>
          </div>
        </div>
      </article>

      <article className="grid gap-6 xl:grid-cols-4">
        {slotOrder.map((slot) => {
          const meal = snapshot.meals[slot]
          return (
            <div key={slot} className="glass-card space-y-3 p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800">{meal.title}</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {meal.totals.calories} kcal
                </span>
              </div>
              <ul className="space-y-1">
                {meal.items.map((mealItem) => (
                  <li key={mealItem.name} className="text-xs text-slate-600">
                    {mealItem.name} - {mealItem.grams}g ({mealItem.calories} kcal)
                  </li>
                ))}
              </ul>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                P {meal.totals.protein}g | C {meal.totals.carbs}g | F {meal.totals.fats}g
              </div>
              <div className="rounded-xl bg-orange-50 p-3 text-xs text-orange-700">
                <p className="mb-1 flex items-center gap-1 font-semibold">
                  <IndianRupee size={12} /> Budget Alternative
                </p>
                <p>{meal.budgetAlternative}</p>
              </div>
            </div>
          )
        })}
      </article>

      <article className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-500">
            <ShieldCheck size={16} />
            <p className="text-xs font-semibold uppercase">Muscle Retention Score</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{snapshot.analysis.muscleRetentionScore}%</p>
        </div>
        <div className="glass-card p-5">
          <div className="mb-2 flex items-center gap-2 text-orange-500">
            <Flame size={16} />
            <p className="text-xs font-semibold uppercase">Fat Loss Rate</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{snapshot.analysis.fatLossRatePerWeek} kg/week</p>
        </div>
        <div className="glass-card p-5">
          <div className="mb-2 flex items-center gap-2 text-indigo-500">
            <Target size={16} />
            <p className="text-xs font-semibold uppercase">Peak Week Carb Load</p>
          </div>
          <p className="text-sm text-slate-600">{snapshot.analysis.carbLoadPlan}</p>
        </div>
        <div className="glass-card p-5">
          <div className="mb-2 flex items-center gap-2 text-sky-500">
            <Droplets size={16} />
            <p className="text-xs font-semibold uppercase">Water Guidance</p>
          </div>
          <p className="text-sm text-slate-600">{snapshot.analysis.waterGuidance}</p>
        </div>
      </article>

      <article className="glass-card p-6">
        <div className="mb-3 flex items-center gap-2">
          <BrainCircuit size={16} className="text-primary" />
          <h3 className="text-base font-bold text-slate-800">Academic Value Highlight</h3>
        </div>
        <ul className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          <li className="rounded-xl bg-white/80 p-3">Health data processing across anthropometrics and prep variables.</li>
          <li className="rounded-xl bg-white/80 p-3">AI recommendation system for athlete-specific nutrition planning.</li>
          <li className="rounded-xl bg-white/80 p-3">Mathematical modelling using BMR/TDEE and macro distribution equations.</li>
          <li className="rounded-xl bg-white/80 p-3">Rule-based expert system for phase and budget-aware meal decisions.</li>
        </ul>
      </article>

      <article className="rounded-3xl bg-slate-900 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-200">Need recalculation due to weight update?</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={workingWeight}
              onChange={(e) => setWorkingWeight(Number(e.target.value))}
              className="w-24 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={handleRecalculate}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Recalculate Plan
            </button>
          </div>
        </div>
      </article>
    </section>
  )
}
