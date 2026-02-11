import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Toasts from './components/Toasts'
import AppShell from './components/AppShell'
import Meals from './pages/Meals'
import FoodScan from './pages/FoodScan'
import Hydration from './pages/Hydration'
import Calories from './pages/Calories'
import StagePrep from './pages/StagePrep'
import Progress from './pages/Progress'
import AICoach from './pages/AICoach'
import Settings from './pages/Settings'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Toasts />
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/food-scan" element={<FoodScan />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/hydration" element={<Hydration />} />
            <Route path="/calories" element={<Calories />} />
            <Route path="/stage-prep" element={<StagePrep />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/ai-coach" element={<AICoach />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Navigate to="/settings" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
