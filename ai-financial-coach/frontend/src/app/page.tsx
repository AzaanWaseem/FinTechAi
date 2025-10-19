'use client'

import { useAppStore } from '@/store/app-store'
import { Onboarding } from '@/components/onboarding'
import { GoalSetter } from '@/components/goal-setter'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const currentView = useAppStore((state) => state.currentView)

  useEffect(() => {
    if (currentView === 'dashboard') {
      redirect('/dashboard')
    }
  }, [currentView])

  return (
    <main className="min-h-screen bg-background">
      {currentView === 'onboarding' && <Onboarding />}
      {currentView === 'goal-setter' && <GoalSetter />}
    </main>
  )
}