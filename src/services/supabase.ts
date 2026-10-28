import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key'

/**
 * PKCE-aware storage adapter:
 * - Temporary PKCE 'code-verifier' challenge required across the Google OAuth browser redirect
 *   is held in sessionStorage for the handshake duration and promptly removed after exchange.
 * - ZERO access tokens, refresh tokens, JWTs, or session credentials touch persistent client storage.
 * - All authenticated user session state is managed strictly via server-issued HttpOnly cookies.
 */
class PkceSessionStorageAdapter implements Storage {
  private memoryStore: Record<string, string> = {}

  get length(): number {
    return Object.keys(this.memoryStore).length
  }

  clear(): void {
    this.memoryStore = {}
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
          const key = window.sessionStorage.key(i)
          if (key && key.includes('code-verifier')) {
            window.sessionStorage.removeItem(key)
          }
        }
      } catch (e) {
        console.warn('Error clearing PKCE storage:', e)
      }
    }
  }

  getItem(key: string): string | null {
    if (key.includes('code-verifier') && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        return window.sessionStorage.getItem(key)
      } catch {
        return null
      }
    }
    return this.memoryStore[key] ?? null
  }

  key(index: number): string | null {
    return Object.keys(this.memoryStore)[index] ?? null
  }

  removeItem(key: string): void {
    delete this.memoryStore[key]
    if (key.includes('code-verifier') && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(key)
      } catch {}
    }
  }

  setItem(key: string, value: string): void {
    if (key.includes('code-verifier') && typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(key, value)
      } catch {}
    } else {
      this.memoryStore[key] = value
    }
  }
}

export const inMemoryAuthStorage = new PkceSessionStorageAdapter()

/**
 * Official Supabase Client initialized with anonymous public key.
 * Used exclusively for client-side Google OAuth handshake initiation and PKCE URL exchange.
 * Tokens are never persisted client-side; they are immediately transferred to backend HttpOnly cookies.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: false,
    persistSession: false,
    storage: inMemoryAuthStorage,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('mock-project')
  )
}
