import {
  BrainCircuit,
  Droplets,
  Flame,
  Gauge,
  LayoutDashboard,
  Menu,
  ScanLine,
  Settings,
  TrendingUp,
  Utensils,
  Waves,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const items = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { id: 'food-scan', icon: ScanLine, label: 'Food Scanner', path: '/food-scan' },
  { id: 'meals', icon: Utensils, label: 'Meal Planner', path: '/meals' },
  { id: 'hydration', icon: Droplets, label: 'Hydration', path: '/hydration' },
  { id: 'calories', icon: Gauge, label: 'Calories', path: '/calories' },
  { id: 'stage-prep', icon: Flame, label: 'Stage Prep', path: '/stage-prep' },
  { id: 'progress', icon: TrendingUp, label: 'Progress', path: '/progress' },
  { id: 'ai-coach', icon: BrainCircuit, label: 'AI Coach', path: '/ai-coach' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const [mobileExpanded, setMobileExpanded] = useState(false)

  return (
    <aside
      className={`glass-card sticky top-8 flex h-fit flex-col gap-4 border border-white/60 p-3 transition-all duration-300 ${
        mobileExpanded ? 'w-56' : 'w-20'
      } md:h-[calc(100vh-4rem)] md:w-56 md:p-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Waves size={22} />
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white md:hidden"
          onClick={() => setMobileExpanded((current) => !current)}
          title={mobileExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {mobileExpanded ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 ${
                  isActive ? 'bg-primary text-white shadow-soft' : 'hover:bg-white/80'
                }`
              }
              title={item.label}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'
                    }`}
                  />
                  <span
                    className={`truncate text-sm font-medium leading-none transition-all duration-200 ${
                      mobileExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
                    } md:w-auto md:opacity-100 ${isActive ? 'text-white' : 'text-slate-700'}`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
