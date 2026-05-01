"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthEnabled: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthEnabled: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isAuthEnabled = isSupabaseConfigured()

  useEffect(() => {
    if (!isAuthEnabled) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthEnabled])

  const signOut = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
      window.location.href = "/auth/login"
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthEnabled, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
