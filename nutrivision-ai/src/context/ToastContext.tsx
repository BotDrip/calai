import { createContext, useContext, useMemo, useState } from 'react'

type Toast = {
  id: string
  message: string
  tone?: 'success' | 'error' | 'info'
}

type ToastContextValue = {
  toasts: Toast[]
  pushToast: (message: string, tone?: Toast['tone']) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const pushToast = (message: string, tone: Toast['tone'] = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => removeToast(id), 3200)
  }

  const value = useMemo(() => ({ toasts, pushToast, removeToast }), [toasts])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
