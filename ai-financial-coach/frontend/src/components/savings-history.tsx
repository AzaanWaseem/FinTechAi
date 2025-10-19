'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Calendar, Target, CheckCircle } from 'lucide-react'

interface SavingsHistoryProps {
  savingsGoal: number
  actualSavings: number
}

export function SavingsHistory({ savingsGoal, actualSavings }: SavingsHistoryProps) {
  const [viewMode, setViewMode] = useState<'month' | 'quarter'>('month')
  
  const getCurrentQuarter = (date: Date) => {
    const month = date.getMonth()
    return Math.floor(month / 3)
  }

  const getQuarterRange = (date: Date, quarterOffset: number) => {
    const currentDate = new Date(date)
    const currentQuarter = getCurrentQuarter(currentDate)
    
    // Adjust the date to the start of the current quarter
    currentDate.setMonth(currentQuarter * 3)
    
    // Move back by the offset
    currentDate.setMonth(currentDate.getMonth() - (quarterOffset * 3))
    
    const startMonth = currentDate.getMonth()
    const year = currentDate.getFullYear()
    
    const getMonthName = (monthIndex: number) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']
      return months[monthIndex]
    }

    const quarterMonths = [
      getMonthName(startMonth),
      getMonthName((startMonth + 1) % 12),
      getMonthName((startMonth + 2) % 12)
    ]

    return {
      name: `${quarterMonths[0]}-${quarterMonths[2]} ${year}`,
      months: quarterMonths,
      year
    }
  }

  const getTimePeriodsData = () => {
    if (viewMode === 'month') {
      const months = ['October', 'September', 'August']
      return months.map(month => ({
        name: `${month} 2025`,
        amount: actualSavings,
        goal: savingsGoal,
        percentage: Math.min(100, (actualSavings / savingsGoal) * 100)
      }))
    } else {
      const today = new Date(2025, 9, 18) // October 18, 2025
      const quarters = [
        { name: 'July-September 2025', amount: actualSavings * 3, goal: savingsGoal * 3 },
        { name: 'April-June 2025', amount: actualSavings * 3, goal: savingsGoal * 3 },
        { name: 'January-March 2025', amount: actualSavings * 3, goal: savingsGoal * 3 },
        { name: 'October-December 2024', amount: actualSavings * 3, goal: savingsGoal * 3 }
      ]
      return quarters.map(quarter => ({
        name: quarter.name,
        amount: quarter.amount,
        goal: quarter.goal,
        percentage: Math.min(100, (quarter.amount / quarter.goal) * 100)
      }))
    }
  }

  const data = getTimePeriodsData()

  return (
    <Card className="capital-one-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-2xl text-gray-900">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <span>Savings Progress</span>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Track your savings progress over time
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* View Selector */}
        <div className="flex space-x-3">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
            className={`flex-1 ${
              viewMode === 'month' 
                ? 'capital-one-button' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Last 3 Months
          </Button>
          <Button
            variant={viewMode === 'quarter' ? 'default' : 'outline'}
            onClick={() => setViewMode('quarter')}
            className={`flex-1 ${
              viewMode === 'quarter' 
                ? 'capital-one-button' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Target className="h-4 w-4 mr-2" />
            Past Year (Quarterly)
          </Button>
        </div>

        {/* Progress Data */}
        <div className="space-y-6">
          {data.map((period, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">{period.name}</h4>
                <div className="flex items-center space-x-2">
                  {period.amount >= period.goal && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {period.percentage.toFixed(1)}% Complete
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${period.percentage}%`,
                        background: period.amount >= period.goal 
                          ? 'linear-gradient(to right, #10b981, #059669)' 
                          : 'linear-gradient(to right, #3b82f6, #1d4ed8)'
                      }}
                    />
                  </div>
                  {/* Goal line indicator */}
                  <div 
                    className="absolute top-0 w-0.5 h-6 bg-red-500 rounded-full"
                    style={{ left: '100%' }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ${period.amount.toFixed(2)} / ${period.goal.toFixed(2)}
                  </span>
                  <span className={`font-medium ${
                    period.amount >= period.goal ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {period.amount >= period.goal ? 'Goal Achieved!' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.filter(period => period.amount >= period.goal).length}
              </div>
              <div className="text-sm text-gray-600">Goals Achieved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(data.reduce((acc, period) => acc + period.percentage, 0) / data.length)}%
              </div>
              <div className="text-sm text-gray-600">Average Progress</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
