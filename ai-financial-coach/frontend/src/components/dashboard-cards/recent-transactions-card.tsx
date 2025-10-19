'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, X } from 'lucide-react'

interface Transaction {
  id: string
  description: string
  amount: number
  category: 'needs' | 'wants'
}

interface RecentTransactionsCardProps {
  transactions: Transaction[]
  onAddTransaction: () => void
  onRemoveTransaction: (id: string) => void
  removeMode: boolean
  onToggleRemoveMode: () => void
  selectedTxIds: string[]
  onToggleSelection: (id: string) => void
  className?: string
}

export function RecentTransactionsCard({ 
  transactions, 
  onAddTransaction, 
  onRemoveTransaction,
  removeMode,
  onToggleRemoveMode,
  selectedTxIds,
  onToggleSelection,
  className = '' 
}: RecentTransactionsCardProps) {
  const getCategoryStyle = (category: string) => {
    if (category === 'needs') {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-yellow-100 text-yellow-800'
  }

  const getCategoryLabel = (category: string) => {
    return category === 'needs' ? 'NEED' : 'WANT'
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
        <div className="flex space-x-2">
          <Button
            onClick={onAddTransaction}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            onClick={onToggleRemoveMode}
            variant={removeMode ? "destructive" : "outline"}
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {removeMode ? 'Cancel' : 'Remove'}
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your first transaction to get started</p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const isSelected = selectedTxIds.includes(transaction.id)
            
            return (
              <div
                key={transaction.id}
                className={`flex justify-between items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => removeMode && onToggleSelection(transaction.id)}
              >
                <div className="flex items-center space-x-3">
                  {removeMode && (
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <X className="h-2 w-2 text-white" />}
                    </div>
                  )}
                  
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {transaction.description}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(transaction.category)}`}>
                        {getCategoryLabel(transaction.category)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {removeMode && selectedTxIds.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            onClick={() => {
              selectedTxIds.forEach(id => onRemoveTransaction(id))
            }}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            Remove Selected ({selectedTxIds.length})
          </Button>
        </div>
      )}
    </div>
  )
}
