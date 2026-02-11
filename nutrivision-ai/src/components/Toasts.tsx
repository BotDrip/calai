import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'

const toneStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
}

export default function Toasts() {
  const { toasts } = useToast()

  return (
    <div className="fixed right-6 top-6 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`glass-card flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm shadow-soft ${
              toneStyles[toast.tone ?? 'info']
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
