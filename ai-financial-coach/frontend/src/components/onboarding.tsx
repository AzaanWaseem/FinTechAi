'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOnboard } from '@/hooks/use-api'
import { CheckCircle, Sparkles, TrendingUp, Target, BookOpen, Shield, Clock, Users } from 'lucide-react'

export function Onboarding() {
  const [isStarting, setIsStarting] = useState(false)
  const onboardMutation = useOnboard()

  const handleStartJourney = async () => {
    setIsStarting(true)
    await onboardMutation.mutateAsync()
    setIsStarting(false)
  }

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      title: 'Bank-Grade Security',
      description: 'Your financial data is protected with enterprise-level security',
    },
    {
      icon: <Sparkles className="h-6 w-6 text-blue-600" />,
      title: 'AI-Powered Insights',
      description: 'Get intelligent analysis of your spending patterns',
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      title: 'Smart Recommendations',
      description: 'Receive personalized advice to reach your financial goals',
    },
    {
      icon: <Target className="h-6 w-6 text-purple-600" />,
      title: 'Goal Tracking',
      description: 'Monitor your progress with beautiful visualizations',
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: 'Real-Time Updates',
      description: 'Stay informed with instant financial insights',
    },
    {
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      title: 'Expert Support',
      description: 'Access to financial advisors when you need guidance',
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
              <p className="text-sm text-gray-600">Powered by AI Technology</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Take Control of Your Financial Future
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of customers who are already achieving their financial goals with our AI-powered coaching platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Features */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Why Choose Our Platform?</h3>
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - CTA Card */}
          <div className="capital-one-card">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Started Today</h3>
              <p className="text-gray-600">
                Create your account and start your journey to financial wellness in just a few minutes.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>No credit check required</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Free to use forever</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Bank-level security</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleStartJourney}
              disabled={isStarting || onboardMutation.isPending}
              className="w-full capital-one-button text-lg py-4"
            >
              {isStarting || onboardMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Creating Your Account...
                </>
              ) : (
                'Start Your Financial Journey'
              )}
            </Button>

            {onboardMutation.isError && (
              <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 font-medium">
                  {onboardMutation.error?.message || 'Failed to create your account. Please try again.'}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by over 100,000 customers</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Capital One</div>
            <div className="text-2xl font-bold text-gray-400">FDIC</div>
            <div className="text-2xl font-bold text-gray-400">SSL</div>
            <div className="text-2xl font-bold text-gray-400">256-bit</div>
          </div>
        </div>
      </div>
    </div>
  )
}
