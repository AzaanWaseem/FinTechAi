export interface Transaction {
  id: string
  description: string
  amount: number
  category: 'needs' | 'wants'
  date: string
}

export interface AnalysisData {
  needsTotal: number
  wantsTotal: number
  recommendation: string
  categorizedTransactions: Transaction[]
  savingsGoal?: number
}

export interface User {
  customerId: string
  accountId: string
}

export interface SavingsGoal {
  amount: number
  monthlyTarget: number
}

export interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
}
