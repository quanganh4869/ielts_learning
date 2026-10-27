import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User } from '@/types/auth'
import { OnboardingData } from '@/types/onboarding'
import { apiService } from '@/services/apiService'

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithGoogle: () => void
  login: (email: string, pass: string) => Promise<void>
  register: (email: string, name: string, pass: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  completeOnboarding: (data: OnboardingData) => Promise<void>
  updateUser: (updated: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'ielts_platform_user_v1'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const body = await response.json()
        if (body.success && body.data) {
          const profile = body.data
          const mappedUser: User = {
            id: profile.id,
            email: profile.email,
            fullName: profile.name || profile.email.split('@')[0],
            avatarUrl: profile.avatarUrl,
            roles: profile.roles || [],
            isAdmin: Boolean(profile.admin),
            role: profile.admin ? 'admin' : 'student',
            targetBand: 7.0,
            testType: 'academic',
            currentBand: 6.5,
            isOnboarded: true,
            hasCompletedAssessment: true,
            createdAt: '2026-09-01',
          }
          setUser(mappedUser)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser))
          return
        }
      }

      // If backend reports 401 Unauthorized, clear state
      if (response.status === 401) {
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
        return
      }

      // Check localStorage if backend is unreachable during offline dev
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        setUser(null)
      }
    } catch {
      // Offline fallback: check localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setUser(JSON.parse(stored))
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const loginWithGoogle = () => {
    window.location.href = `${BACKEND_URL}/api/v1/oauth2/authorization/google`
  }

  const login = async (email: string, pass: string) => {
    setIsLoading(true)
    try {
      const loggedUser = await apiService.login(email, pass)
      setUser(loggedUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser))
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, name: string, pass: string) => {
    setIsLoading(true)
    try {
      const newUser = await apiService.register(email, name, pass)
      setUser(newUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
      return newUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      console.warn('Backend logout call warning:', e)
    } finally {
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
      setIsLoading(false)
      window.location.href = '/login'
    }
  }

  const completeOnboarding = async (data: OnboardingData) => {
    setIsLoading(true)
    try {
      const updated = await apiService.submitOnboarding(data)
      const merged = { ...user, ...updated, isOnboarded: true } as User
      setUser(merged)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (updated: Partial<User>) => {
    if (!user) return
    const merged = { ...user, ...updated }
    setUser(merged)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        login,
        register,
        logout,
        refreshUser,
        completeOnboarding,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
