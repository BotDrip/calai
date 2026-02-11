export type StrengthLevel = 'Weak' | 'Medium' | 'Strong'

export const passwordRules = {
  minLength: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
}

export function evaluatePasswordStrength(password: string): StrengthLevel {
  let score = 0
  if (password.length >= passwordRules.minLength) score += 1
  if (passwordRules.upper.test(password)) score += 1
  if (passwordRules.lower.test(password)) score += 1
  if (passwordRules.number.test(password)) score += 1
  if (passwordRules.special.test(password)) score += 1

  if (score >= 5) return 'Strong'
  if (score >= 3) return 'Medium'
  return 'Weak'
}
