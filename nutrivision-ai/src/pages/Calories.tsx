import { AlertTriangle, Flame, Sparkles } from 'lucide-react'
import { calorieStats } from '../data/dashboard'

export default function Calories() {
  const remaining = calorieStats.goal - calorieStats.consumed
  const consumedPercent = Math.min((calorieStats.consumed / calorieStats.goal) * 100, 100)

  return (
    <section className="space-y-6">
      <article className="glass-card space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
              <Flame size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Calorie Intelligence</h2>
              <p className="text-xs text-slate-500">Goal vs consumed with meal-level analysis</p>
            </div>
          </div>
          {remaining < 0 && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
              <AlertTriangle size={12} /> Overeating Warning
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-4">
            <p className="text-xs text-slate-500">Daily Goal</p>
            <p className="text-xl font-bold text-slate-800">{calorieStats.goal} kcal</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <p className="text-xs text-slate-500">Consumed</p>
            <p className="text-xl font-bold text-primary">{calorieStats.consumed} kcal</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <p className="text-xs text-slate-500">Remaining</p>
            <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {remaining} kcal
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              style={{ width: `${consumedPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">{Math.round(consumedPercent)}% of daily target consumed</p>
        </div>
      </article>

      <article className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-800">Meal-wise Breakdown</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {Object.entries(calorieStats.meals).map(([meal, stats]) => (
            <div key={meal} className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{meal}</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{stats.consumed} kcal</p>
              <p className="text-xs text-slate-500">Target: {stats.target} kcal</p>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="mb-3 flex items-center gap-2 text-emerald-300">
          <Sparkles size={16} />
          <p className="text-xs font-semibold uppercase">AI Optimization Tips</p>
        </div>
        <ul className="space-y-2 text-sm text-slate-200">
          <li>Shift 100-150 kcal from dinner to post-workout to improve recovery.</li>
          <li>Add fiber-rich vegetables in lunch to reduce evening hunger spikes.</li>
          <li>Keep protein evenly distributed across all 4 meals for retention.</li>
        </ul>
      </article>
    </section>
  )
}
