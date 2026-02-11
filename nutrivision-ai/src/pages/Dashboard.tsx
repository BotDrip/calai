import {
  BrainCircuit,
  Droplets,
  Flame,
  ScanLine,
  Sparkles,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react'
import { calorieStats, hydrationStats, macroStats } from '../data/dashboard'

type MacroCardProps = {
  label: string
  value: number
  target: number
  color: string
}

function CircularProgress({ percent }: { percent: number }) {
  const value = Math.max(0, Math.min(100, percent))
  return (
    <div
      className="relative h-44 w-44 rounded-full p-3 shadow-soft transition-transform duration-300 hover:scale-[1.02]"
      style={{
        background: `conic-gradient(#0ea5e9 ${value}%, rgba(255,255,255,0.2) ${value}% 100%)`,
      }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white/85 backdrop-blur-md">
        <p className="text-3xl font-bold text-slate-800">{Math.round(value)}%</p>
        <p className="text-xs font-medium text-slate-500">Goal Hit</p>
      </div>
    </div>
  )
}

function MacroDonut({ label, value, target, color }: MacroCardProps) {
  const percent = Math.min((value / target) * 100, 100)
  return (
    <article className="glass-card space-y-3 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
        <span className="text-xs font-semibold text-slate-500">{Math.round(percent)}%</span>
      </div>
      <div
        className="mx-auto h-28 w-28 rounded-full p-2 transition-all duration-500"
        style={{
          background: `conic-gradient(${color} ${percent}%, rgba(226,232,240,0.7) ${percent}% 100%)`,
        }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white/85 text-xs font-bold text-slate-700">
          {value}g
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">
        {value}g / {target}g
      </p>
    </article>
  )
}

export default function Dashboard() {
  const consumed = calorieStats.consumed
  const goal = calorieStats.goal
  const remaining = goal - consumed
  const caloriePercent = (consumed / goal) * 100
  const hydrationPercent = Math.round((hydrationStats.day / hydrationStats.goal) * 100)
  const protein = macroStats.find((macro) => macro.label === 'Protein')
  const proteinPercent = protein ? Math.round((protein.value / protein.target) * 100) : 0
  const energyBalance = Math.round((remaining / goal) * 100 + 50)
  const recoveryScore = Math.min(98, 70 + hydrationStats.streak)

  const metrics = [
    {
      label: 'Hydration Level',
      value: `${hydrationPercent}%`,
      percent: hydrationPercent,
      icon: Droplets,
      iconStyle: 'bg-sky-100 text-sky-500',
      fillStyle: 'from-sky-400 to-cyan-400',
    },
    {
      label: 'Protein Intake',
      value: `${protein?.value ?? 0}g`,
      percent: proteinPercent,
      icon: Utensils,
      iconStyle: 'bg-indigo-100 text-indigo-500',
      fillStyle: 'from-indigo-400 to-blue-500',
    },
    {
      label: 'Energy Balance',
      value: `${energyBalance}%`,
      percent: energyBalance,
      icon: Zap,
      iconStyle: 'bg-amber-100 text-amber-500',
      fillStyle: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Recovery Score',
      value: `${recoveryScore}%`,
      percent: recoveryScore,
      icon: BrainCircuit,
      iconStyle: 'bg-emerald-100 text-emerald-500',
      fillStyle: 'from-emerald-400 to-teal-500',
    },
  ]

  return (
    <section className="space-y-8">
      <section className="glass-card relative overflow-hidden p-8 shadow-glass transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-white/20 to-emerald-100/20" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr,auto] lg:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-pill">Performance Overview</span>
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                <Sparkles size={12} /> AI Active
              </span>
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 shadow-[0_0_14px_rgba(34,197,94,0.4)]">
                <TrendingUp size={12} /> On Track
              </span>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-slate-800">Good Morning, Athlete</h2>
              <p className="mt-1 text-sm text-slate-500">Fuel smart. Recover harder. Perform better.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl lg:grid-cols-3">
              <div className="rounded-2xl bg-white/70 p-3 backdrop-blur-sm">
                <p className="text-xs text-slate-500">Today&apos;s Goal</p>
                <p className="text-xl font-bold text-slate-800">{goal} kcal</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 backdrop-blur-sm">
                <p className="text-xs text-slate-500">Consumed</p>
                <p className="text-xl font-bold text-primary">{consumed} kcal</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 backdrop-blur-sm">
                <p className="text-xs text-slate-500">Remaining</p>
                <p className="text-xl font-bold text-emerald-600">{remaining} kcal</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-orange-50/80 px-4 py-2 text-sm text-orange-700 ring-1 ring-orange-100">
              <Flame size={16} className="animate-pulse text-orange-500" />
              <span className="font-semibold">{hydrationStats.streak} Day Streak</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="button-primary shadow-lg shadow-primary/25" type="button">
                <ScanLine size={17} />
                Scan Meal
              </button>
              <button className="button-ghost" type="button">
                View Full Analysis
              </button>
            </div>
          </div>

          <div className="mx-auto">
            <CircularProgress percent={caloriePercent} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article
              key={metric.label}
              className="glass-card space-y-4 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.iconStyle}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${metric.fillStyle} transition-all duration-700`}
                  style={{ width: `${Math.min(metric.percent, 100)}%` }}
                />
              </div>
            </article>
          )
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Macro Balance Today</h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">AI Monitored</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {macroStats.map((macro) => (
            <MacroDonut
              key={macro.label}
              label={macro.label}
              value={macro.value}
              target={macro.target}
              color={macro.color}
            />
          ))}
        </div>
        <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          Protein slightly low for muscle gain.
        </p>
      </section>

      <section className="glass-card p-5">
        <h3 className="mb-4 text-base font-bold text-slate-800">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {['Scan Food', 'Add Manual Meal', 'Log Water', 'Update Weight'].map((action) => (
            <button
              key={action}
              type="button"
              className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
            >
              {action}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-white shadow-soft">
        <p className="text-sm font-medium text-slate-200">Discipline beats motivation. Stay consistent.</p>
        <p className="mt-1 text-xs text-cyan-300">You are performing better than 82% of users this week.</p>
      </section>
    </section>
  )
}
