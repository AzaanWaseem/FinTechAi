'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/app-store'
import { useAnalysis, useAddTransaction, useRemoveTransaction } from '@/hooks/use-api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Rewards } from './rewards'
import { SavingsHistory } from './savings-history'
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Target, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingDown
} from 'lucide-react'

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than $0'),
})

type TransactionFormData = z.infer<typeof transactionSchema>

export function Dashboard() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [removeMode, setRemoveMode] = useState(false)
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([])
  
  const { analysisData, error, setError, setCurrentView } = useAppStore()
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

  const handleRemoveSelected = async () => {
    if (selectedTxIds.length === 0) {
      setError('No transactions selected to remove.')
      return
    }

    try {
      await Promise.all(
        selectedTxIds.map(id => removeTransactionMutation.mutateAsync(id))
      )
      setSelectedTxIds([])
      setRemoveMode(false)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-red-50 flex items-center justify-center">
        <div className="capital-one-card max-w-md w-full">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="h-8 w-8 text-white animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Finances</h2>
              <p className="text-gray-600">
                We&apos;re processing your financial data to provide personalized insights and recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { needsTotal, wantsTotal, recommendation, categorizedTransactions } = analysisData
  const savingsGoal = analysisData.savingsGoal || 500
  const totalSpending = needsTotal + wantsTotal
  const progressPercentage = savingsGoal > 0 
    ? Math.min((savingsGoal - wantsTotal) / savingsGoal * 100, 100) 
    : 0

  const pieData = [
    { name: 'Needs', value: needsTotal, color: '#10b981' },
    { name: 'Wants', value: wantsTotal, color: '#f59e0b' }
  ]

  const recentTransactions = categorizedTransactions.slice(-10).reverse()

  // Calculate monthly spending trend (mock data for demo)
  const monthlyData = [
    { month: 'Jan', spending: 1200, savings: 300 },
    { month: 'Feb', spending: 1100, savings: 400 },
    { month: 'Mar', spending: 1300, savings: 200 },
    { month: 'Apr', spending: 1000, savings: 500 },
    { month: 'May', spending: 1150, savings: 350 },
    { month: 'Jun', spending: totalSpending, savings: Math.max(0, savingsGoal - wantsTotal) }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Capital One Financial Coach</h1>
                <p className="text-sm text-gray-600">Your Personal Financial Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowAddForm(true)}
                className="capital-one-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
              <Button
                variant={removeMode ? 'destructive' : 'outline'}
                onClick={() => {
                  setRemoveMode(!removeMode)
                  if (removeMode) setSelectedTxIds([])
                }}
                className="border-gray-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {removeMode ? 'Cancel' : 'Remove'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('onboarding')}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Start Over
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="capital-one-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-900">
                  ${Math.max(0, savingsGoal - wantsTotal).toFixed(0)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">On track</span>
            </div>
          </div>

          <div className="capital-one-card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Monthly Goal</p>
                <p className="text-2xl font-bold text-blue-900">${savingsGoal}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-blue-600">{Math.max(0, progressPercentage).toFixed(1)}% complete</span>
            </div>
          </div>

          <div className="capital-one-card bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Spending</p>
                <p className="text-2xl font-bold text-orange-900">${totalSpending.toFixed(0)}</p>
              </div>
              <Wallet className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-orange-600">This month</span>
            </div>
          </div>

          <div className="capital-one-card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Transactions</p>
                <p className="text-2xl font-bold text-purple-900">{categorizedTransactions.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-purple-600">Tracked</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending Breakdown */}
          <Card className="capital-one-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl text-gray-900">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Spending Breakdown</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your spending categorized by needs vs wants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-8 mt-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    Needs: ${needsTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    Wants: ${wantsTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="capital-one-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl text-gray-900">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Monthly Trend</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your spending and savings over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(0)}`} />
                    <Bar dataKey="spending" fill="#f59e0b" name="Spending" />
                    <Bar dataKey="savings" fill="#10b981" name="Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards and Savings History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Rewards actualSavings={Math.max(0, savingsGoal - wantsTotal)} />
          <SavingsHistory 
            savingsGoal={savingsGoal} 
            actualSavings={Math.max(0, savingsGoal - wantsTotal)} 
          />
        </div>

        {/* AI Recommendation */}
        <Card className="capital-one-card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl text-gray-900">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <span>AI Financial Recommendation</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Personalized insights based on your spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-lg bg-white border border-blue-100">
              <p className="text-gray-700 text-lg leading-relaxed">{recommendation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="capital-one-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-xl text-gray-900">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span>Recent Transactions</span>
              </CardTitle>
              {removeMode && selectedTxIds.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleRemoveSelected}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove Selected ({selectedTxIds.length})
                </Button>
              )}
            </div>
            <CardDescription className="text-gray-600">
              Your latest financial activity and spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No transactions yet</p>
                <p className="text-sm">Add your first transaction to get started!</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => {
                const isSelected = selectedTxIds.includes(transaction.id)
                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 border-red-200 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                    }`}
                    onClick={() => removeMode && toggleTransactionSelection(transaction.id)}
                  >
                    <div className="flex items-center space-x-4">
                      {removeMode && (
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-red-600 border-red-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <X className="h-3 w-3 text-white" />}
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.category === 'needs' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {transaction.category === 'needs' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Target className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{transaction.description}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {transaction.category} • {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="capital-one-card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Transaction</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <Input
                  id="description"
                  placeholder="e.g., Grocery shopping"
                  className="capital-one-input"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700">
                  Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="capital-one-input"
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addTransactionMutation.isPending}
                  className="flex-1 capital-one-button"
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
          </div>
        </div>
      )}
    </div>
  )
}