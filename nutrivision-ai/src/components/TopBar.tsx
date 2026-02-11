import { LogOut, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h1 className="text-2xl font-semibold">Hi, {user?.displayName ?? 'Athlete'}</h1>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="hidden items-center gap-2 rounded-2xl bg-white/80 px-4 py-3 shadow-soft md:flex">
          <Search size={18} className="text-slate-400" />
          <input
            placeholder="Search nutrition metrics"
            className="w-56 bg-transparent text-sm outline-none"
          />
        </div>
        <button className="button-ghost" type="button">
          <Sparkles size={18} />
          Upgrade
        </button>
        <button className="button-ghost" onClick={() => navigate('/settings')} type="button">
          Profile
        </button>
        <button
          className="button-primary"
          onClick={() => logout()}
          type="button"
          title="Logout"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  )
}
