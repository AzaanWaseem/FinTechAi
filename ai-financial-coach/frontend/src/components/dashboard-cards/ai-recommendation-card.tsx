'use client'

import { CheckCircle } from 'lucide-react'

interface AiRecommendationCardProps {
  recommendation: string
  className?: string
}

export function AiRecommendationCard({ recommendation, className = '' }: AiRecommendationCardProps) {
  return (
    <div className={`bg-slate-800 rounded-lg shadow-md p-6 text-white ${className}`}>
      <div className="flex items-center mb-4">
        <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
        <h2 className="text-lg font-bold text-white">AI Recommendation</h2>
      </div>
      
      <div className="space-y-4">
        <p className="text-slate-200 leading-relaxed">
          {recommendation}
        </p>
        
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Key Insights</h3>
          <ul className="space-y-2 text-sm text-slate-200">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              Your spending patterns show good discipline
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              Consider increasing your savings rate by 5%
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              Track your progress weekly for better results
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
