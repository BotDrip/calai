import {
  BrainCircuit,
  Droplets,
  Flame,
  ScanLine,
  Sparkles,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react';
import { calorieStats, hydrationStats, macroStats } from '../data/dashboard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Visualization Components ---

function RechartsProgress({ percent, color }: { percent: number; color: string }) {
  const data = [
    { name: 'Completed', value: percent },
    { name: 'Remaining', value: 100 - percent },
  ];

  return (
    <div className="h-28 w-28 relative mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={50}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#e2e8f0" /> 
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm font-bold text-slate-700">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

type MacroCardProps = {
  label: string;
  value: number;
  target: number;
  color: string;
};

function MacroDonut({ label, value, target, color }: MacroCardProps) {
  const percent = Math.min((value / target) * 100, 100);
  
  // Added animate-in class
  return (
    <article className="glass-card space-y-3 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
        <span className="text-xs font-semibold text-slate-500">{value}g / {target}g</span>
      </div>
      
      {/* Recharts Ring */}
      <RechartsProgress percent={percent} color={color} />

      <p className="text-center text-xs text-slate-500">
        {percent >= 100 ? 'Goal Met!' : `${Math.round(target - value)}g remaining`}
      </p>
    </article>
  );
}

export default function Dashboard() {
  const consumed = calorieStats.consumed;
  const goal = calorieStats.goal;
  const remaining = goal - consumed;
  const caloriePercent = Math.min((consumed / goal) * 100, 100);
  
  const hydrationPercent = Math.round((hydrationStats.day / hydrationStats.goal) * 100);
  const protein = macroStats.find((macro) => macro.label === 'Protein');
  const proteinPercent = protein ? Math.round((protein.value / protein.target) * 100) : 0;
  
  // Calculate Energy Balance (mock logic based on remaining cals)
  const energyBalance = Math.round((remaining / goal) * 100); 
  const recoveryScore = Math.min(98, 70 + hydrationStats.streak);

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
  ];

  // Main Calorie Pie Data
  const calorieData = [
    { name: 'Consumed', value: consumed, color: '#10B981' }, // Emerald
    { name: 'Remaining', value: remaining, color: '#E2E8F0' }, // Slate 200
  ];

  return (
    <section className="space-y-8 p-6 pb-20"> 
      
      {/* --- HERO SECTION --- */}
      {/* Added 'animate-in' and updated gradient for tech feel */}
      <section 
        className="animate-in glass-card relative overflow-hidden p-8 shadow-glass transition-all duration-500"
        style={{ animationDelay: '0ms' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10" />
        
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr,auto] lg:items-center">
          <div className="space-y-6">
            {/* Header Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                Overview
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <Sparkles size={12} /> AI Active
              </span>
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 shadow-sm">
                <TrendingUp size={12} /> On Track
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight">
                Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Athlete</span>
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Fuel smart. Recover harder. Perform better.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-3 sm:grid-cols-3 max-w-xl">
              <div className="rounded-2xl bg-white/60 p-4 backdrop-blur-md border border-white/50 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase">Goal</p>
                <p className="text-xl font-bold text-slate-800">{goal} <span className="text-xs font-normal text-slate-500">kcal</span></p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4 backdrop-blur-md border border-white/50 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase">Consumed</p>
                <p className="text-xl font-bold text-emerald-600">{consumed} <span className="text-xs font-normal text-slate-500">kcal</span></p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4 backdrop-blur-md border border-white/50 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase">Left</p>
                <p className="text-xl font-bold text-slate-800">{remaining} <span className="text-xs font-normal text-slate-500">kcal</span></p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl transition-all active:scale-95">
                <ScanLine size={16} />
                Scan Meal
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
                View Details
              </button>
            </div>
          </div>

          {/* Large Hero Chart */}
          <div className="hidden lg:block h-64 w-64 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={calorieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {calorieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
             </ResponsiveContainer>
             {/* Center Stats in Chart */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">{Math.round(caloriePercent)}%</span>
                <span className="text-xs text-slate-500 uppercase font-semibold">Complete</span>
             </div>
          </div>
        </div>
      </section>

      {/* --- METRICS GRID --- */}
      {/* Added animate-in with staggered delay */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              className="animate-in glass-card flex flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-white/60"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                   <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{metric.label}</p>
                   <p className="text-2xl font-bold text-slate-800 mt-1">{metric.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${metric.iconStyle}`}>
                  <Icon size={20} />
                </div>
              </div>
              
              <div className="space-y-2">
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{metric.percent}%</span>
                 </div>
                 <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${metric.fillStyle} transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(metric.percent, 100)}%` }}
                    />
                  </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* --- MACROS SECTION --- */}
      {/* Added animate-in */}
      <section 
        className="animate-in space-y-4"
        style={{ animationDelay: '500ms' }}
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-bold text-slate-800">Macro Balance Today</h3>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 border border-indigo-100">
            AI Optimized
          </span>
        </div>
        
        <div className="grid gap-5 md:grid-cols-3">
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
        
        <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-1">
           <div className="flex items-center justify-between rounded-xl bg-white/95 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                    <BrainCircuit size={18} />
                 </div>
                 <p className="text-sm font-medium text-slate-700">
                    <span className="font-bold text-indigo-600">AI Insight:</span> Protein intake is 15g below target for muscle recovery.
                 </p>
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Fix</button>
           </div>
        </div>
      </section>

      {/* --- QUICK ACTIONS --- */}
      {/* Added animate-in */}
      <section 
        className="animate-in glass-card p-6 border border-white/60"
        style={{ animationDelay: '600ms' }}
      >
        <h3 className="mb-4 text-sm font-bold text-slate-400 uppercase tracking-wide">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {['Scan Food', 'Log Water', 'Add Workout', 'Update Weight'].map((action, idx) => (
            <button
              key={action}
              type="button"
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-95
                 ${idx === 0 
                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20 hover:bg-slate-700' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                 }`}
            >
              {action}
            </button>
          ))}
        </div>
      </section>

    </section>
  );
}