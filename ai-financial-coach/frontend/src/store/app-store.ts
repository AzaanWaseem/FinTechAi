import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, AnalysisData } from '@/types'

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  
  // Analysis state
  analysisData: AnalysisData | null
  setAnalysisData: (data: AnalysisData | null) => void
  
  // UI state
  currentView: 'onboarding' | 'goal-setter' | 'dashboard'
  setCurrentView: (view: 'onboarding' | 'goal-setter' | 'dashboard') => void
  
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Error state
  error: string | null
  setError: (error: string | null) => void
  
  // Reset function
  reset: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      user: null,
      analysisData: null,
      currentView: 'onboarding',
      isLoading: false,
      error: null,
      
      // Actions
      setUser: (user) => set({ user }),
      setAnalysisData: (analysisData) => set({ analysisData }),
      setCurrentView: (currentView) => set({ currentView }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Reset function
      reset: () => set({
        user: null,
        analysisData: null,
        currentView: 'onboarding',
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'ai-financial-coach-store',
    }
  )
)
