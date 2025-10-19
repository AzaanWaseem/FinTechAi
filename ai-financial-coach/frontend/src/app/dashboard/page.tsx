'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '@/store/app-store'
import { useAnalysis, useAddTransaction, useRemoveTransaction } from '@/hooks/use-api'
import { SpendingBreakdownCard } from '@/components/dashboard-cards/spending-breakdown-card'
import { SavingsProgressCard } from '@/components/dashboard-cards/savings-progress-card'
import { AiRecommendationCard } from '@/components/dashboard-cards/ai-recommendation-card'
import { RecentTransactionsCard } from '@/components/dashboard-cards/recent-transactions-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, AlertCircle, X } from 'lucide-react'

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than $0'),
})

type TransactionFormData = z.infer<typeof transactionSchema>

const DashboardHeader = () => {
  const setCurrentView = useAppStore((state) => state.setCurrentView)
  
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Your Financial Dashboard</h1>
      <Button
        onClick={() => setCurrentView('onboarding')}
        variant="outline"
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
      >
        Start Over
      </Button>
    </header>
  )
}

export default function DashboardPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [removeMode, setRemoveMode] = useState(false)
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([])
  
  const { analysisData, error, setError } = useAppStore()
  const { refetch: refetchAnalysis } = useAnalysis()
  const addTransactionMutation = useAddTransaction()
  const removeTransactionMutation = useRemoveTransaction()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  })

  const onSubmit = async (data: TransactionFormData) => {
    try {
      await addTransactionMutation.mutateAsync(data)
      setShowAddForm(false)
      reset()
    } catch {
      // Error is handled by the mutation
    }
  }

  const handleRemoveTransaction = async (id: string) => {
    try {
      await removeTransactionMutation.mutateAsync(id)
    } catch {
      // Error is handled by the mutation
    }
  }

  const toggleTransactionSelection = (id: string) => {
    setSelectedTxIds(prev => 
      prev.includes(id) 
        ? prev.filter(txId => txId !== id)
        : [...prev, id]
    )
  }

  if (!analysisData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="p-6 sm:p-8">
          <DashboardHeader />
          <div className="flex items-center justify-center min-h-96">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center space-y-4 p-8">
                <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Analyzing Your Finances</h2>
                <p className="text-gray-600 text-center">
                  We&apos;re processing your financial data to provide personalized insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const { needsTotal, wantsTotal, recommendation, categorizedTransactions } = analysisData
  const savingsGoal = analysisData.savingsGoal || 500
  const actualSavings = Math.max(0, savingsGoal - wantsTotal)
  const recentTransactions = categorizedTransactions.slice(-10).reverse()

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="p-6 sm:p-8">
        <DashboardHeader />
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">{error}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null)
                    refetchAnalysis()
                  }}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          
          {/* Column 1 - Spending Breakdown */}
          <div className="lg:col-span-1">
            <SpendingBreakdownCard 
              needsTotal={needsTotal} 
              wantsTotal={wantsTotal} 
            />
          </div>

          {/* Column 2 - Savings Progress (spans 2 columns) */}
          <div className="lg:col-span-2">
            <SavingsProgressCard 
              savingsGoal={savingsGoal} 
              actualSavings={actualSavings} 
            />
          </div>

          {/* Column 3 - AI Recommendation (spans 1 column, 2 rows) */}
          <div className="lg:col-span-1 lg:row-span-2">
            <AiRecommendationCard 
              recommendation={recommendation} 
            />
          </div>

          {/* Column 4 - Recent Transactions (spans 3 columns, 1 row) */}
          <div className="lg:col-span-3">
            <RecentTransactionsCard
              transactions={recentTransactions}
              onAddTransaction={() => setShowAddForm(true)}
              onRemoveTransaction={handleRemoveTransaction}
              removeMode={removeMode}
              onToggleRemoveMode={() => {
                setRemoveMode(!removeMode)
                if (removeMode) setSelectedTxIds([])
              }}
              selectedTxIds={selectedTxIds}
              onToggleSelection={toggleTransactionSelection}
            />
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Add New Transaction</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Input
                    id="description"
                    placeholder="e.g., Grocery shopping"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amount', { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addTransactionMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {addTransactionMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Transaction'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
