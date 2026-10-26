import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types/auth'
import { OnboardingData } from '@/types/onboarding'
import { apiService } from '@/services/apiService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (email: string, name: string, pass: string) => Promise<User>
  logout: () => void
  completeOnboarding: (data: OnboardingData) => Promise<void>
  updateUser: (updated: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'ielts_platform_user_v1'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        // Default authenticated demo user for smooth inspection
        const defaultUser: User = {
          id: 'u-demo-1',
          email: 'quanganh.ielts@example.com',
          fullName: 'Nguyễn Quang Anh',
          targetBand: 7.0,
          testType: 'academic',
          currentBand: 6.5,
          isOnboarded: true,
          hasCompletedAssessment: true,
          createdAt: '2026-09-01',
        }
        setUser(defaultUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser))
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const completeOnboarding = async (data: OnboardingData) => {
    setIsLoading(true)
    try {
      const updated = await apiService.submitOnboarding(data)
      const merged = { ...user, ...updated, isOnboarded: true }
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
        login,
        register,
        logout,
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
