import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSkeleton from './LoadingSkeleton'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSkeleton variant="screen" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
