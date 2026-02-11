import { useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Dumbbell, Scale } from 'lucide-react'
import { weightTrend } from '../data/dashboard'

export default function Progress() {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly')
  const data = view === 'weekly' ? weightTrend.weekly : weightTrend.monthly

  return (
    <section className="space-y-6">
      <article className="glass-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Progress & Body Metrics</h2>
              <p className="text-xs text-slate-500">Weight trends and body composition insights</p>
            </div>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setView('weekly')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                view === 'weekly' ? 'bg-white shadow-sm' : 'text-slate-500'
              }`}
              type="button"
            >
              Weekly
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                view === 'monthly' ? 'bg-white shadow-sm' : 'text-slate-500'
              }`}
              type="button"
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="weight" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#weightFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="grid gap-6 md:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500">Current Weight</p>
          <p className="text-xl font-bold text-slate-800">{weightTrend.current}kg</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500">Goal Weight</p>
          <p className="text-xl font-bold text-primary">{weightTrend.goal}kg</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500">Muscle vs Fat</p>
          <p className="text-xl font-bold text-green-600">68% / 32%</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-slate-500">Goal Comparison</p>
          <p className="text-xl font-bold text-orange-500">
            {(weightTrend.current - weightTrend.goal).toFixed(1)}kg to target
          </p>
        </div>
      </article>

      <article className="glass-card rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <Dumbbell size={16} />
          <p className="text-xs font-semibold uppercase">Bodybuilding Insight</p>
        </div>
        <p className="text-sm text-slate-200">
          Weight trend is consistent. Keep protein high and maintain training intensity to preserve lean mass during cut.
        </p>
      </article>
    </section>
  )
}
