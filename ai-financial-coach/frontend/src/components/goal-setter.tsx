'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSetGoal } from '@/hooks/use-api'
import { DollarSign, Target, TrendingUp, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react'

const goalSchema = z.object({
  goal: z
    .number({ message: 'Please enter a savings goal' })
    .min(1, 'Goal must be greater than $0')
    .max(10000, 'Goal seems too high, please enter a realistic amount'),
  budget: z
    .number({ message: 'Please enter your monthly budget' })
    .min(1, 'Budget must be greater than $0')
    .max(100000, 'Budget seems too high, please enter a realistic amount'),
})

type GoalFormData = z.infer<typeof goalSchema>

export function GoalSetter() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const setGoalMutation = useSetGoal()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  })

  const goalValue = watch('goal')
  const budgetValue = watch('budget')

  const onSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true)
    try {
      await setGoalMutation.mutateAsync({ goal: data.goal, budget: data.budget })
    } finally {
      setIsSubmitting(false)
    }
  }

  const tips = [
    {
      icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
      text: 'Aim for 10-20% of your monthly income for savings',
    },
    {
      icon: <Target className="h-5 w-5 text-green-600" />,
      text: 'Prioritize essential expenses before setting ambitious goals',
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-600" />,
      text: 'You can always adjust your goals later as your finances change',
    },
    {
      icon: <DollarSign className="h-5 w-5 text-purple-600" />,
      text: 'Even small, consistent savings add up significantly over time!',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Capital One Financial Coach</h1>
              <p className="text-sm text-gray-600">Set Your Financial Goals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Set Your Financial Goals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Establish your monthly budget and savings target to create a clear financial roadmap. 
            Our AI will help you stay on track.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="capital-one-card">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Financial Goals</h3>
              <p className="text-gray-600">
                Set your monthly budget and savings target to create a clear financial roadmap.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="budget" className="block text-sm font-semibold text-gray-700">
                  Monthly Budget
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="2000"
                    step="0.01"
                    min="1"
                    className="pl-12 text-lg py-4 capital-one-input"
                    {...register('budget', { valueAsNumber: true })}
                  />
                </div>
                {errors.budget && (
                  <p className="text-sm text-red-600">{errors.budget.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="goal" className="block text-sm font-semibold text-gray-700">
                  Monthly Savings Goal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="goal"
                    type="number"
                    placeholder="500"
                    step="0.01"
                    min="1"
                    className="pl-12 text-lg py-4 capital-one-input"
                    {...register('goal', { valueAsNumber: true })}
                  />
                </div>
                {errors.goal && (
                  <p className="text-sm text-red-600">{errors.goal.message}</p>
                )}
              </div>

              {goalValue && goalValue > 0 && budgetValue && budgetValue > 0 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">Annual Savings Potential</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      ${(goalValue * 12).toLocaleString()}
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      That&apos;s how much you could save in a year!
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Savings Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {((goalValue / budgetValue) * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {goalValue <= budgetValue ? 'Great savings rate!' : 'Savings goal exceeds budget - consider adjusting'}
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || setGoalMutation.isPending}
                className="w-full capital-one-button text-lg py-4"
              >
                {isSubmitting || setGoalMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Setting Your Goal...
                  </>
                ) : (
                  <>
                    Set My Goal
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>

              {setGoalMutation.isError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700 font-medium">
                    {setGoalMutation.error?.message || 'Failed to set your savings goal. Please try again.'}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Tips */}
          <div className="space-y-6">
            <div className="capital-one-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                Smart Financial Planning Tips
              </h3>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mt-1">{tip.icon}</div>
                    <span className="text-sm text-gray-700">{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="capital-one-card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Why This Matters
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Clear goals increase your chances of success by 42%</p>
                <p>• Budgeting helps you understand your spending patterns</p>
                <p>• Our AI will provide personalized insights based on your goals</p>
                <p>• You can adjust your targets anytime as your situation changes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}