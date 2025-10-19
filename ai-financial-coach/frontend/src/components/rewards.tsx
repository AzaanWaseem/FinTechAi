'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Star, CheckCircle, X } from 'lucide-react'

const POINTS_PER_DOLLAR = 0.01
const POINTS_PER_REWARD = 10
const REWARD_VALUE = 50

const popularRetailers = [
  { name: 'Amazon', icon: '🛒' },
  { name: 'Target', icon: '🎯' },
  { name: 'Walmart', icon: '🏪' },
  { name: 'Starbucks', icon: '☕' },
  { name: 'Chipotle', icon: '🌯' },
  { name: "McDonald's", icon: '🍔' },
  { name: 'DoorDash', icon: '🚗' },
  { name: 'Best Buy', icon: '🎮' }
]

interface RewardsProps {
  actualSavings: number
}

export function Rewards({ actualSavings }: RewardsProps) {
  const [selectedRetailer, setSelectedRetailer] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const totalPoints = Math.floor(actualSavings * POINTS_PER_DOLLAR)
  const availableRewards = Math.floor(totalPoints / POINTS_PER_REWARD)
  const remainingPoints = totalPoints % POINTS_PER_REWARD

  const handleRewardRedeem = () => {
    if (!selectedRetailer) {
      alert('Please select a retailer first')
      return
    }
    setShowConfirmation(true)
  }

  return (
    <>
      <Card className="capital-one-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-2xl text-gray-900">
            <Gift className="h-6 w-6 text-red-600" />
            <span>Rewards</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Earn points for every dollar you save and redeem them for gift cards
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Points Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl p-6 text-center min-w-[120px]">
                  <div className="text-3xl font-bold">{totalPoints}</div>
                  <div className="text-sm opacity-90">Total Points</div>
                </div>
                <div className="text-gray-700">
                  <p className="font-medium">{POINTS_PER_DOLLAR} points per $1 saved</p>
                  <p className="text-sm">
                    {availableRewards > 0 
                      ? `${availableRewards} rewards available!` 
                      : `${POINTS_PER_REWARD - remainingPoints} more points needed for your next reward!`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Redeem Section */}
          {availableRewards > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Redeem Your Rewards
              </h4>
              <p className="text-gray-600 mb-6">
                Get a ${REWARD_VALUE} gift card for every {POINTS_PER_REWARD} points!
              </p>
              
              <div className="grid grid-cols-4 gap-3 mb-6">
                {popularRetailers.map((retailer) => (
                  <button
                    key={retailer.name}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedRetailer === retailer.name
                        ? 'border-red-600 bg-red-600 text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRetailer(retailer.name)}
                  >
                    <span className="text-2xl mb-2">{retailer.icon}</span>
                    <span className="text-sm font-medium">{retailer.name}</span>
                  </button>
                ))}
              </div>

              {selectedRetailer && (
                <Button
                  onClick={handleRewardRedeem}
                  className="w-full capital-one-button text-lg py-4"
                >
                  Redeem ${REWARD_VALUE} {selectedRetailer} Gift Card
                </Button>
              )}
            </div>
          )}

          {/* Progress to Next Reward */}
          <div className="text-center">
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(remainingPoints / POINTS_PER_REWARD) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {POINTS_PER_REWARD - remainingPoints} more points needed for a ${REWARD_VALUE} gift card
              <span className="font-medium text-gray-800 ml-1">
                ({(remainingPoints / POINTS_PER_REWARD * 100).toFixed(1)}% complete)
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md capital-one-card">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Congratulations! 🎉</CardTitle>
              <CardDescription className="text-lg">
                Your ${REWARD_VALUE} {selectedRetailer} gift card is on its way!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => {
                  setShowConfirmation(false)
                  setSelectedRetailer('')
                }}
                className="capital-one-button"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
