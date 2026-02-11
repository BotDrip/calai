import { evaluatePasswordStrength, type StrengthLevel } from '../hooks/usePasswordStrength'

const strengthStyles: Record<StrengthLevel, string> = {
  Weak: 'bg-rose-400',
  Medium: 'bg-amber-400',
  Strong: 'bg-emerald-400',
}

const strengthWidths: Record<StrengthLevel, string> = {
  Weak: 'w-1/3',
  Medium: 'w-2/3',
  Strong: 'w-full',
}

export default function PasswordStrength({ password }: { password: string }) {
  const level = evaluatePasswordStrength(password)

  return (
    <div className="space-y-2">
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${strengthStyles[level]} ${strengthWidths[level]}`} />
      </div>
      <p className="text-xs text-slate-500">
        Password strength: <span className="font-semibold text-slate-700">{level}</span>
      </p>
    </div>
  )
}
