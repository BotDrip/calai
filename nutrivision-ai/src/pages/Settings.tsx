import { Bell, Goal, SlidersHorizontal, UserCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="glass-card space-y-4 p-6">
        <div className="flex items-center gap-2 text-primary">
          <UserCircle2 size={18} />
          <h2 className="text-lg font-bold text-slate-800">Profile</h2>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl bg-white/80 p-4">
            <p className="text-xs text-slate-500">Name</p>
            <p className="text-sm font-semibold text-slate-700">{user?.displayName ?? 'NutriVision Athlete'}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-semibold text-slate-700">{user?.email ?? 'Not available'}</p>
          </div>
        </div>
      </article>

      <article className="glass-card space-y-4 p-6">
        <div className="flex items-center gap-2 text-emerald-500">
          <Goal size={18} />
          <h2 className="text-lg font-bold text-slate-800">Goals</h2>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <p className="rounded-2xl bg-white/80 p-4">Primary Goal: Stage-ready conditioning in 12 weeks</p>
          <p className="rounded-2xl bg-white/80 p-4">Daily Calorie Target: 2800 kcal</p>
          <p className="rounded-2xl bg-white/80 p-4">Hydration Goal: 3.0L minimum</p>
        </div>
      </article>

      <article className="glass-card space-y-4 p-6">
        <div className="flex items-center gap-2 text-orange-500">
          <SlidersHorizontal size={18} />
          <h2 className="text-lg font-bold text-slate-800">Preferences</h2>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <p className="rounded-2xl bg-white/80 p-4">Diet Preference: Mixed (Veg + Non-Veg)</p>
          <p className="rounded-2xl bg-white/80 p-4">Budget Mode: Enabled</p>
          <p className="rounded-2xl bg-white/80 p-4">Units: Metric</p>
        </div>
      </article>

      <article className="glass-card space-y-4 p-6">
        <div className="flex items-center gap-2 text-sky-500">
          <Bell size={18} />
          <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <p className="rounded-2xl bg-white/80 p-4">Meal reminders: On</p>
          <p className="rounded-2xl bg-white/80 p-4">Hydration nudges: On</p>
          <p className="rounded-2xl bg-white/80 p-4">Weekly progress digest: On</p>
        </div>
      </article>
    </section>
  )
}
