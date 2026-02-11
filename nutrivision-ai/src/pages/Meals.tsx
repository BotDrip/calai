import { IndianRupee, Sparkles, Utensils } from 'lucide-react'
import { mealPlanner } from '../data/dashboard'
import { useMealPlanner } from '../context/MealPlannerContext'
import type { MealSlot } from '../context/MealPlannerContext'

const householdSuggestions = {
  morning: {
    veg: ['Poha (180g)', 'Curd (100g)', 'Peanuts (20g)'],
    nonVeg: ['Egg Bhurji (120g)', 'Roti (2)', 'Banana (1)'],
  },
  afternoon: {
    veg: ['Rice (160g cooked)', 'Dal (150g)', 'Paneer (80g)'],
    nonVeg: ['Rice (160g cooked)', 'Chicken Curry (140g)', 'Salad (100g)'],
  },
  evening: {
    veg: ['Sprouts Chaat (140g)', 'Coconut Water (250ml)'],
    nonVeg: ['Tuna Sandwich (150g)', 'Apple (1)'],
  },
  night: {
    veg: ['Roti (2)', 'Mixed Veg (180g)', 'Dahi (100g)'],
    nonVeg: ['Roti (2)', 'Grilled Chicken (160g)', 'Sauteed Veggies (120g)'],
  },
} as const

function getStatus(calories: number, target: number) {
  const ratio = calories / target
  if (ratio < 0.85) return 'Low'
  if (ratio <= 1.05) return 'On Track'
  return 'Over'
}

export default function Meals() {
  const { mealAdditions, getMealTarget, getBaseMealNutrition, phaseStrategy } = useMealPlanner()
  const mealEntries = Object.entries(mealPlanner) as [MealSlot, (typeof mealPlanner)[MealSlot]][]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <Utensils className="text-primary" /> Meal Performance Planner
        </h2>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">4 Meals Planned</span>
      </div>
      {phaseStrategy && (
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-xs font-semibold text-primary">
          Stage Prep Strategy Locked: {phaseStrategy.phase} | Synced {new Date(phaseStrategy.lockedAt).toLocaleDateString()}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {mealEntries.map(([key, meal]) => {
          const household = householdSuggestions[key]
          const base = getBaseMealNutrition(key)
          const target = getMealTarget(key)
          const extra = mealAdditions[key]
          const totalCalories = base.calories + extra.calories
          const totalProtein = base.protein + extra.protein
          const totalCarbs = base.carbs + extra.carbs
          const totalFats = base.fats + extra.fats
          const status = getStatus(totalCalories, target)
          const hasAIBoost = extra.calories > 0

          return (
            <article key={key} className="glass-card flex flex-col justify-between p-5 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">{meal.time}</p>
                    <h3 className="font-bold text-slate-800">{meal.title}</h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      status === 'On Track'
                        ? 'bg-green-100 text-green-700'
                        : status === 'Low'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Calories</span>
                    <span className="font-bold">
                      {Math.round(totalCalories)} / {target}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min((totalCalories / target) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>P: {Math.round(totalProtein)}g</span>
                    <span>C: {Math.round(totalCarbs)}g</span>
                    <span>F: {Math.round(totalFats)}g</span>
                  </div>
                  {hasAIBoost && (
                    <p className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <Sparkles size={10} />
                      Updated from AI Food Scanner
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-orange-50/50 p-3 ring-1 ring-orange-100">
                  <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase text-orange-600">
                    <IndianRupee size={10} /> Budget Indian Suggestions
                  </p>
                  <p className="text-xs font-semibold text-slate-700">Veg Options</p>
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {household.veg.map((item) => (
                      <li key={item} className="list-disc text-xs text-slate-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-semibold text-slate-700">Non-Veg Options</p>
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {household.nonVeg.map((item) => (
                      <li key={item} className="list-disc text-xs text-slate-600">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white/70 p-3 text-xs text-slate-600 ring-1 ring-slate-100">
                <p className="font-semibold text-slate-700">{meal.suggestion.name}</p>
                <p className="mt-1">Cost: {meal.suggestion.cost}</p>
                <p>Estimated Protein: {meal.suggestion.protein}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
