'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface SpendingBreakdownCardProps {
  needsTotal: number
  wantsTotal: number
  className?: string
}

export function SpendingBreakdownCard({ needsTotal, wantsTotal, className = '' }: SpendingBreakdownCardProps) {
  const totalSpending = needsTotal + wantsTotal
  
  const chartData = [
    { name: 'Needs', value: needsTotal, color: '#10b981' },
    { name: 'Wants', value: wantsTotal, color: '#f59e0b' }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Spending Breakdown</h2>
      
      {/* Simple Bar Chart */}
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal">
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={60} />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Totals List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Needs</span>
          <span className="text-xl font-semibold text-gray-900">${needsTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Wants</span>
          <span className="text-xl font-semibold text-gray-900">${wantsTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className="text-xl font-bold text-gray-900">${totalSpending.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
