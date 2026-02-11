import { BrainCircuit, IndianRupee, ShieldCheck, Sparkles } from 'lucide-react'
import { aiInsights } from '../data/dashboard'

export default function AICoach() {
  return (
    <section className="space-y-6">
      <article className="glass-card rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="mb-3 flex items-center gap-2 text-cyan-300">
          <BrainCircuit size={18} />
          <p className="text-xs font-semibold uppercase">AI Nutrition Coach</p>
        </div>
        <h2 className="text-2xl font-bold">Personalized coaching for training, meals, and recovery</h2>
      </article>

      <article className="grid gap-4 md:grid-cols-3">
        {aiInsights.map((insight) => (
          <div key={insight} className="glass-card p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Sparkles size={14} />
              <p className="text-xs font-semibold uppercase">Recommendation</p>
            </div>
            <p className="text-sm text-slate-700">{insight}</p>
          </div>
        ))}
      </article>

      <article className="grid gap-6 md:grid-cols-3">
        <div className="glass-card p-5">
          <div className="mb-2 flex items-center gap-2 text-orange-500">
            <IndianRupee size={16} />
            <p className="text-xs font-semibold uppercase">Budget Optimization</p>
          </div>
          <p className="text-sm text-slate-600">Rotate paneer, chana, eggs, and soya chunks to reduce weekly spend without lowering protein.</p>
        </div>
        <div className="glass-card p-5">
          <div className="mb-2 flex items-center gap-2 text-sky-500">
            <ShieldCheck size={16} />
            <p className="text-xs font-semibold uppercase">Recovery Feedback</p>
          </div>
          <p className="text-sm text-slate-600">Sleep quality is improving. Keep late meal sodium stable and maintain post-workout hydration.</p>
        </div>
        <div className="glass-card p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-500">
            <BrainCircuit size={16} />
            <p className="text-xs font-semibold uppercase">Meal Correction</p>
          </div>
          <p className="text-sm text-slate-600">If lunch protein drops below target, add 100g curd plus 30g roasted peanuts to balance macros.</p>
        </div>
      </article>
    </section>
  )
}
