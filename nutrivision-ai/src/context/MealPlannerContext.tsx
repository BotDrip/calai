import { createContext, useContext, useMemo, useState } from 'react'
import { mealPlanner } from '../data/dashboard'

export type MealSlot = 'morning' | 'afternoon' | 'evening' | 'night'

export type NutritionPayload = {
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
  estimatedWeight: number
}

type MealAddition = Record<MealSlot, NutritionPayload>
type MealTargets = Record<MealSlot, number>
type MealBaseNutrition = Record<MealSlot, NutritionPayload>

type PhaseStrategy = {
  phase: 'Bulking' | 'Cutting' | 'Peak Week'
  lockedAt: string
}

type ScanHistoryItem = {
  id: string
  meal: MealSlot
  foodName: string
  nutrition: NutritionPayload
  addedAt: string
}

type MealPlannerContextValue = {
  mealAdditions: MealAddition
  mealTargets: MealTargets
  phaseStrategy: PhaseStrategy | null
  scanHistory: ScanHistoryItem[]
  addScanToMeal: (meal: MealSlot, foodName: string, nutrition: NutritionPayload) => void
  getMealTarget: (meal: MealSlot) => number
  getBaseMealNutrition: (meal: MealSlot) => NutritionPayload
  applyStagePrepPlan: (payload: {
    phase: 'Bulking' | 'Cutting' | 'Peak Week'
    mealTargets: MealTargets
    mealBaseNutrition: MealBaseNutrition
  }) => void
}

const emptyPayload: NutritionPayload = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  fiber: 0,
  estimatedWeight: 0,
}

const initialAdditions: MealAddition = {
  morning: emptyPayload,
  afternoon: emptyPayload,
  evening: emptyPayload,
  night: emptyPayload,
}

const defaultTargets: MealTargets = {
  morning: mealPlanner.morning.target,
  afternoon: mealPlanner.afternoon.target,
  evening: mealPlanner.evening.target,
  night: mealPlanner.night.target,
}

const defaultBaseNutrition: MealBaseNutrition = {
  morning: {
    calories: mealPlanner.morning.calories,
    protein: mealPlanner.morning.macros.protein,
    carbs: mealPlanner.morning.macros.carbs,
    fats: mealPlanner.morning.macros.fats,
    fiber: 0,
    estimatedWeight: 0,
  },
  afternoon: {
    calories: mealPlanner.afternoon.calories,
    protein: mealPlanner.afternoon.macros.protein,
    carbs: mealPlanner.afternoon.macros.carbs,
    fats: mealPlanner.afternoon.macros.fats,
    fiber: 0,
    estimatedWeight: 0,
  },
  evening: {
    calories: mealPlanner.evening.calories,
    protein: mealPlanner.evening.macros.protein,
    carbs: mealPlanner.evening.macros.carbs,
    fats: mealPlanner.evening.macros.fats,
    fiber: 0,
    estimatedWeight: 0,
  },
  night: {
    calories: mealPlanner.night.calories,
    protein: mealPlanner.night.macros.protein,
    carbs: mealPlanner.night.macros.carbs,
    fats: mealPlanner.night.macros.fats,
    fiber: 0,
    estimatedWeight: 0,
  },
}

const MealPlannerContext = createContext<MealPlannerContextValue | undefined>(undefined)

function addNutrition(base: NutritionPayload, next: NutritionPayload): NutritionPayload {
  return {
    calories: base.calories + next.calories,
    protein: base.protein + next.protein,
    carbs: base.carbs + next.carbs,
    fats: base.fats + next.fats,
    fiber: base.fiber + next.fiber,
    estimatedWeight: base.estimatedWeight + next.estimatedWeight,
  }
}

export function MealPlannerProvider({ children }: { children: React.ReactNode }) {
  const [mealAdditions, setMealAdditions] = useState<MealAddition>(initialAdditions)
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [mealTargets, setMealTargets] = useState<MealTargets>(defaultTargets)
  const [mealBaseNutrition, setMealBaseNutrition] = useState<MealBaseNutrition>(defaultBaseNutrition)
  const [phaseStrategy, setPhaseStrategy] = useState<PhaseStrategy | null>(null)

  const addScanToMeal = (meal: MealSlot, foodName: string, nutrition: NutritionPayload) => {
    setMealAdditions((prev) => ({
      ...prev,
      [meal]: addNutrition(prev[meal], nutrition),
    }))

    setScanHistory((prev) => [
      {
        id: crypto.randomUUID(),
        meal,
        foodName,
        nutrition,
        addedAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const getMealTarget = (meal: MealSlot) => mealTargets[meal]
  const getBaseMealNutrition = (meal: MealSlot) => mealBaseNutrition[meal]

  const applyStagePrepPlan = (payload: {
    phase: 'Bulking' | 'Cutting' | 'Peak Week'
    mealTargets: MealTargets
    mealBaseNutrition: MealBaseNutrition
  }) => {
    setMealTargets(payload.mealTargets)
    setMealBaseNutrition(payload.mealBaseNutrition)
    setPhaseStrategy({
      phase: payload.phase,
      lockedAt: new Date().toISOString(),
    })
  }

  const value = useMemo(
    () => ({
      mealAdditions,
      mealTargets,
      phaseStrategy,
      scanHistory,
      addScanToMeal,
      getMealTarget,
      getBaseMealNutrition,
      applyStagePrepPlan,
    }),
    [mealAdditions, mealTargets, phaseStrategy, scanHistory],
  )

  return <MealPlannerContext.Provider value={value}>{children}</MealPlannerContext.Provider>
}

export function useMealPlanner() {
  const context = useContext(MealPlannerContext)
  if (!context) {
    throw new Error('useMealPlanner must be used within MealPlannerProvider')
  }
  return context
}
