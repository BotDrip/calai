import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import LoadingSkeleton from '../components/LoadingSkeleton'

type ProfileData = {
  name?: string
  email?: string
  createdAt?: Date
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      // Simulate API call
      setTimeout(() => {
        setProfile({
          name: user.displayName || 'NutriVision Member',
          email: user.email || '',
          createdAt: new Date(),
        })
        setLoading(false)
      }, 500)
    }

    loadProfile()
  }, [user])

  return (
    <div className="min-h-screen bg-base px-6 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[auto,1fr]">
        <Sidebar />
        <main className="space-y-6">
          <TopBar />
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <section className="glass-card space-y-6 p-6">
              <div>
                <p className="text-sm text-slate-500">Profile</p>
                <h2 className="text-2xl font-semibold">Faculty Account Overview</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs text-slate-500">Full Name</p>
                  <p className="text-lg font-semibold text-charcoal">
                    {profile?.name ?? user?.displayName ?? 'NutriVision Member'}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-lg font-semibold text-charcoal">
                    {profile?.email ?? user?.email ?? 'not available'}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-lg font-semibold text-charcoal">Faculty Evaluator</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-lg font-semibold text-charcoal">
                    {profile?.createdAt?.toLocaleDateString() ?? 'Just now'}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                Your profile is secured.
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
