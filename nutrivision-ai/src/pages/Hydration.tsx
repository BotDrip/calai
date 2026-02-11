import { useState } from 'react'
import { Droplets } from 'lucide-react'
import { hydrationStats } from '../data/dashboard'

const intakeHistory = {
  day: [2.1, 2.3, 2.4, 2.0, 2.3, 2.5, 2.2],
  week: [13.9, 14.2, 15.0, 14.8],
  month: [58.2, 61.7, 62.4, 63.1],
} as const

export default function Hydration() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const value = hydrationStats[view]
  const completion = Math.min((value / hydrationStats.goal) * 100, 100)

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="glass-card space-y-6 p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
              <Droplets size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Hydration Analytics</h2>
              <p className="text-xs text-slate-500">Daily, weekly, and monthly tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {(['day', 'week', 'month'] as const).map((item) => (
              <button
                key={item}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  view === item ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'
                }`}
                onClick={() => setView(item)}
                type="button"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-slate-800">{value}L</p>
            <p className="mb-1 text-sm text-slate-500">of {hydrationStats.goal}L goal</p>
          </div>
          <p className="text-sm text-slate-500">Hydration streak: {hydrationStats.streak} days</p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {intakeHistory[view].map((amount, index) => (
            <div key={`${view}-${index}`} className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-400">Slot {index + 1}</p>
              <p className="text-sm font-semibold text-slate-700">{amount}L</p>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card space-y-4 p-6">
        <div className="rounded-2xl bg-sky-50 p-4 text-sky-700">
          <p className="text-xs font-semibold uppercase">AI Advice</p>
          <p className="mt-2 text-sm">{hydrationStats.tips}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4">
          <p className="text-xs text-slate-500">Personalized Goal</p>
          <p className="text-xl font-bold text-slate-800">3.2L/day</p>
          <p className="mt-1 text-xs text-slate-500">Adjusted for your training intensity and current weather.</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4">
          <p className="text-xs text-slate-500">Weekly Streak Target</p>
          <p className="text-xl font-bold text-green-600">7/7 Days</p>
          <p className="mt-1 text-xs text-slate-500">Stay consistent for better recovery and pump quality.</p>
        </div>
      </article>
    </section>
  )
}
