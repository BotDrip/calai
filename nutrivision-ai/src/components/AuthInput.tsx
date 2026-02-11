import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type AuthInputProps = {
  label: string
  type?: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  showToggle?: boolean
}

export default function AuthInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder = ' ',
  showToggle = false,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="input-field input-peer"
        />
        <label htmlFor={name} className="floating-label">
          {label}
        </label>
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-5 text-slate-400 transition hover:text-primary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}
