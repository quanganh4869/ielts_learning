import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User } from '@/types/auth'
import { OnboardingData } from '@/types/onboarding'
import { apiService } from '@/services/apiService'
import { supabase, isSupabaseConfigured } from '@/services/supabase'

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  loginWithGoogle: () => Promise<void>
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
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const syncBackendUser = useCallback(async (token: string | null): Promise<User | null> => {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers,
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
          return mappedUser
        }
      }

      if (response.status === 401) {
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
    } catch {
      // Offline fallback: check localStorage
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setUser(parsed)
          return parsed
        } catch {
          setUser(null)
        }
      }
    }
    return null
  }, [])

  const refreshUser = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured()) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          setAccessToken(session.access_token)
          await syncBackendUser(session.access_token)
          return
        }
      }
      await syncBackendUser(accessToken)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, syncBackendUser])

  useEffect(() => {
    // 1. Initial session bootstrap
    refreshUser()

    // 2. Listen to official Supabase Auth state events (token refreshed, sign-in, sign-out)
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.access_token) {
              setAccessToken(session.access_token)
              await syncBackendUser(session.access_token)
            }
          } else if (event === 'SIGNED_OUT') {
            setAccessToken(null)
            setUser(null)
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [refreshUser, syncBackendUser])

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) {
        throw error
      }
    } else {
      // Fallback for local development if Supabase env credentials are not yet supplied
      window.location.href = `${BACKEND_URL}/api/v1/oauth2/authorization/google`
    }
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
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut()
      }
      await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        credentials: 'include',
      })
    } catch (e) {
      console.warn('Logout API warning:', e)
    } finally {
      setAccessToken(null)
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
        accessToken,
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
