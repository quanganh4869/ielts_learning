import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key'

/**
 * In-memory storage adapter to guarantee ZERO credentials or tokens touch
 * localStorage, sessionStorage, or IndexedDB.
 * All long-term session persistence is managed strictly via server-issued
 * HttpOnly, SameSite=Lax cookies.
 */
class InMemoryStorageAdapter implements Storage {
  private memoryStore: Record<string, string> = {}

  get length(): number {
    return Object.keys(this.memoryStore).length
  }

  clear(): void {
    this.memoryStore = {}
  }

  getItem(key: string): string | null {
    return this.memoryStore[key] ?? null
  }

  key(index: number): string | null {
    return Object.keys(this.memoryStore)[index] ?? null
  }

  removeItem(key: string): void {
    delete this.memoryStore[key]
  }

  setItem(key: string, value: string): void {
    this.memoryStore[key] = value
  }
}

export const inMemoryAuthStorage = new InMemoryStorageAdapter()

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
