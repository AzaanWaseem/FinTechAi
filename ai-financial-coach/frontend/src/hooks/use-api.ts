import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAppStore } from '@/store/app-store'
import { useEffect } from 'react'

// Query keys
export const queryKeys = {
  analysis: ['analysis'] as const,
  user: ['user'] as const,
}

// Analysis query
export const useAnalysis = () => {
  const setAnalysisData = useAppStore((state) => state.setAnalysisData)
  const setIsLoading = useAppStore((state) => state.setIsLoading)
  const setError = useAppStore((state) => state.setError)

  const query = useQuery({
    queryKey: queryKeys.analysis,
    queryFn: api.getAnalysis,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (query.data) {
      setAnalysisData(query.data)
      setIsLoading(false)
      setError(null)
    }
  }, [query.data, setAnalysisData, setIsLoading, setError])

  useEffect(() => {
    if (query.error) {
      const errorMessage = (query.error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to load analysis'
      setError(errorMessage)
      setIsLoading(false)
      // Set default data to prevent crashes
      setAnalysisData({
        needsTotal: 0,
        wantsTotal: 0,
        recommendation: 'Unable to load analysis data.',
        categorizedTransactions: [],
      })
    }
  }, [query.error, setError, setIsLoading, setAnalysisData])

  return query
}

// Onboarding mutation
export const useOnboard = () => {
  const setUser = useAppStore((state) => state.setUser)
  const setCurrentView = useAppStore((state) => state.setCurrentView)
  const setIsLoading = useAppStore((state) => state.setIsLoading)
  const setError = useAppStore((state) => state.setError)

  return useMutation({
    mutationFn: api.onboard,
    onMutate: () => {
      setIsLoading(true)
      setError(null)
    },
    onSuccess: (response) => {
      if (response.customerId && response.accountId) {
        setUser(response)
        setCurrentView('goal-setter')
      } else {
        setError('Failed to create your financial account. Please try again.')
      }
      setIsLoading(false)
    },
    onError: () => {
      setError('Failed to create your financial account. Please try again.')
      setIsLoading(false)
    },
  })
}

// Set goal mutation
export const useSetGoal = () => {
  const setCurrentView = useAppStore((state) => state.setCurrentView)
  const setIsLoading = useAppStore((state) => state.setIsLoading)
  const setError = useAppStore((state) => state.setError)

  return useMutation({
    mutationFn: ({ goal, budget }: { goal: number; budget: number }) => api.setGoal(goal, budget),
    onMutate: () => {
      setIsLoading(true)
      setError(null)
    },
    onSuccess: (response) => {
      if (response.status === 'success') {
        setCurrentView('dashboard')
      } else {
        setError('Failed to set your savings goal. Please try again.')
      }
      setIsLoading(false)
    },
    onError: () => {
      setError('Failed to set your savings goal. Please try again.')
      setIsLoading(false)
    },
  })
}

// Add transaction mutation
export const useAddTransaction = () => {
  const queryClient = useQueryClient()
  const setIsLoading = useAppStore((state) => state.setIsLoading)
  const setError = useAppStore((state) => state.setError)

  return useMutation({
    mutationFn: ({ description, amount }: { description: string; amount: number }) =>
      api.addTransaction(description, amount),
    onMutate: () => {
      setIsLoading(true)
      setError(null)
    },
    onSuccess: () => {
      // Invalidate and refetch analysis data
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis })
      setIsLoading(false)
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      setError(error?.response?.data?.error || 'Failed to add transaction.')
      setIsLoading(false)
    },
  })
}

// Remove transaction mutation
export const useRemoveTransaction = () => {
  const queryClient = useQueryClient()
  const setIsLoading = useAppStore((state) => state.setIsLoading)
  const setError = useAppStore((state) => state.setError)

  return useMutation({
    mutationFn: api.removeTransaction,
    onMutate: () => {
      setIsLoading(true)
      setError(null)
    },
    onSuccess: () => {
      // Invalidate and refetch analysis data
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis })
      setIsLoading(false)
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      setError(error?.response?.data?.error || 'Failed to remove transaction.')
      setIsLoading(false)
    },
  })
}
