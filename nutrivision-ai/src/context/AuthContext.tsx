import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Define a mock User type since we are removing Firebase
export type User = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  signUp: (name: string, email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY_USER = 'nutrivision_current_user'
const STORAGE_KEY_USERS = 'nutrivision_users'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for persisted session
    const storedUser = localStorage.getItem(STORAGE_KEY_USER)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user', e)
        localStorage.removeItem(STORAGE_KEY_USER)
      }
    }
    setLoading(false)
  }, [])

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]')
      const existingUser = users.find((u: any) => u.email === email)

      if (existingUser) {
        throw new Error('Email is already in use.')
      }

      const newUser: User = {
        uid: crypto.randomUUID(),
        email,
        displayName: name,
        photoURL: null,
      }

      // Save credential (password) - In a real app, never store passwords in local storage!
      // This is just a mock for demonstration purposes.
      const userRecord = { ...newUser, password }
      users.push(userRecord)
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users))

      // Set current session
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
      setUser(newUser)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]')
      const userRecord = users.find((u: any) => u.email === email && u.password === password)

      if (!userRecord) {
        throw new Error('Invalid email or password.')
      }

      const { password: _, ...userWithoutPassword } = userRecord
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newUser: User = {
      uid: 'google-user-' + crypto.randomUUID(),
      email: 'user@gmail.com',
      displayName: 'Google User',
      photoURL: null,
    }

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser))
    setUser(newUser)
    setLoading(false)
  }

  const logout = async () => {
    localStorage.removeItem(STORAGE_KEY_USER)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signInWithGoogle, logout }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
