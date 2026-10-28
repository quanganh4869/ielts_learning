import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User } from '@/types/auth'
import { OnboardingData } from '@/types/onboarding'
import { apiService } from '@/services/apiService'
import { supabase, isSupabaseConfigured } from '@/services/supabase'
import { withCsrfHeaders } from '@/services/csrf'

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Exchanges OAuth token pair from redirect into server-issued HttpOnly cookies
   * and populates active user in React state. ZERO tokens are saved to localStorage.
   */
  const establishBackendSession = useCallback(async (token: string, refreshToken?: string | null): Promise<User | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ accessToken: token, refreshToken: refreshToken || null }),
      })

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          const profile = body.data
          const isUserAdmin = Boolean(
            profile.isAdmin ??
            profile.admin ??
            profile.roles?.some((r: string) => r.toUpperCase().includes('ADMIN'))
          )
          const mappedUser: User = {
            id: profile.id,
            email: profile.email,
            fullName: profile.name || profile.email.split('@')[0],
            avatarUrl: profile.avatarUrl,
            roles: profile.roles || [],
            isAdmin: isUserAdmin,
            role: isUserAdmin ? 'admin' : 'student',
            targetBand: 7.0,
            testType: 'academic',
            currentBand: 6.5,
            isOnboarded: true,
            hasCompletedAssessment: true,
            createdAt: '2026-09-01',
          }
          setUser(mappedUser)
          setAccessToken(token) // Kept in memory only for legacy props
          return mappedUser
        }
      } else {
        const errText = await res.text()
        console.error('Failed to establish backend session. HTTP status:', res.status, errText)
      }
    } catch (e) {
      console.error('Failed to establish backend session:', e)
    }
    return null
  }, [])

  /**
   * Syncs user profile by calling GET /api/v1/auth/me using HttpOnly access_token cookie.
   */
  const syncBackendUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })

      if (response.ok) {
        const body = await response.json()
        if (body.success && body.data) {
          const profile = body.data
          const isUserAdmin = Boolean(
            profile.isAdmin ??
            profile.admin ??
            profile.roles?.some((r: string) => r.toUpperCase().includes('ADMIN'))
          )
          const mappedUser: User = {
            id: profile.id,
            email: profile.email,
            fullName: profile.name || profile.email.split('@')[0],
            avatarUrl: profile.avatarUrl,
            roles: profile.roles || [],
            isAdmin: isUserAdmin,
            role: isUserAdmin ? 'admin' : 'student',
            targetBand: 7.0,
            testType: 'academic',
            currentBand: 6.5,
            isOnboarded: true,
            hasCompletedAssessment: true,
            createdAt: '2026-09-01',
          }
          setUser(mappedUser)
          return mappedUser
        }
      }

      if (response.status === 401) {
        // Access token is expired or missing. Attempt refresh using HttpOnly refresh_token cookie!
        const refreshResponse = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: withCsrfHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          credentials: 'include',
        })

        if (refreshResponse.ok) {
          const refreshBody = await refreshResponse.json()
          if (refreshBody.success && refreshBody.data) {
            const profile = refreshBody.data
            const isUserAdmin = Boolean(
              profile.isAdmin ??
              profile.admin ??
              profile.roles?.some((r: string) => r.toUpperCase().includes('ADMIN'))
            )
            const mappedUser: User = {
              id: profile.id,
              email: profile.email,
              fullName: profile.name || profile.email.split('@')[0],
              avatarUrl: profile.avatarUrl,
              roles: profile.roles || [],
              isAdmin: isUserAdmin,
              role: isUserAdmin ? 'admin' : 'student',
              targetBand: 7.0,
              testType: 'academic',
              currentBand: 6.5,
              isOnboarded: true,
              hasCompletedAssessment: true,
              createdAt: '2026-09-01',
            }
            setUser(mappedUser)
            return mappedUser
          }
        }

        setUser(null)
        setAccessToken(null)
        return null
      }
    } catch (e) {
      console.warn('Backend user profile fetch error:', e)
    }
    return null
  }, [])

  const refreshUser = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured()) {
        // 1. If OAuth Implicit hash (#access_token=...) is present in URL
        if (window.location.hash.includes('access_token=')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const tokenFromHash = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          if (tokenFromHash) {
            try {
              await establishBackendSession(tokenFromHash, refreshToken)
              window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
              return
            } catch (e) {
              console.error('Error handling hash token:', e)
            }
          }
        }

        // 2. If OAuth PKCE code (?code=...) is present in URL
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        if (code) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            if (!error && data?.session?.access_token) {
              await establishBackendSession(data.session.access_token, data.session.refresh_token)
              params.delete('code')
              const newSearch = params.toString() ? `?${params.toString()}` : ''
              window.history.replaceState({}, document.title, window.location.pathname + newSearch + window.location.hash)
              return
            }
          } catch (e) {
            console.error('Error exchanging code for session:', e)
          }
        }

        // 3. Check existing active Supabase session
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            await establishBackendSession(session.access_token, session.refresh_token)
            return
          }
        } catch (e) {
          console.warn('Error reading active session from Supabase:', e)
        }
      }

      // 4. Normal session restore via HttpOnly cookie check
      await syncBackendUser()
    } finally {
      setIsLoading(false)
    }
  }, [establishBackendSession, syncBackendUser])

  useEffect(() => {
    refreshUser()

    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.access_token) {
              setIsLoading(true)
              try {
                await establishBackendSession(session.access_token, session.refresh_token)
              } finally {
                setIsLoading(false)
              }
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setAccessToken(null)
            setIsLoading(false)
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [establishBackendSession, refreshUser])

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
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
      window.location.href = `${BACKEND_URL}/api/v1/oauth2/authorization/google`
    }
  }

  const login = async (email: string, pass: string) => {
    setIsLoading(true)
    try {
      const loggedUser = await apiService.login(email, pass)
      setUser(loggedUser)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, name: string, pass: string) => {
    setIsLoading(true)
    try {
      const newUser = await apiService.register(email, name, pass)
      setUser(newUser)
      return newUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut({ scope: 'local' })
      }
      await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: withCsrfHeaders({ Accept: 'application/json' }),
        credentials: 'include',
      })
    } catch (e) {
      console.warn('Logout API warning:', e)
    } finally {
      setUser(null)
      setAccessToken(null)
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
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (updated: Partial<User>) => {
    if (!user) return
    const merged = { ...user, ...updated }
    setUser(merged)
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
