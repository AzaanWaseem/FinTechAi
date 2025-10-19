'use client'

interface SavingsProgressCardProps {
  savingsGoal: number
  actualSavings: number
  className?: string
}

export function SavingsProgressCard({ savingsGoal, actualSavings, className = '' }: SavingsProgressCardProps) {
  // Mock data for the last 3 months
  const monthlyData = [
    { month: 'October 2025', amount: actualSavings, goal: savingsGoal },
    { month: 'September 2025', amount: actualSavings * 0.8, goal: savingsGoal },
    { month: 'August 2025', amount: actualSavings * 1.2, goal: savingsGoal }
  ]

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Savings Progress</h2>
      
      <div className="space-y-6">
        {monthlyData.map((data, index) => {
          const percentage = Math.min((data.amount / data.goal) * 100, 100)
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{data.month}</span>
                <span className="text-sm font-medium text-gray-700">
                  ${data.amount.toFixed(2)} / ${data.goal.toFixed(2)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{percentage.toFixed(1)}% Complete</span>
                <span>{data.amount >= data.goal ? 'Goal Achieved!' : 'In Progress'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
