import React, { useState } from 'react';
import Onboarding from './components/Onboarding';
import GoalSetter from './components/GoalSetter';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('onboarding');

  const handleOnboardingComplete = () => {
    setCurrentView('goal-setter');
  };

  const handleGoalSet = () => {
    setCurrentView('dashboard');
  };

  const handleBackToOnboarding = () => {
    setCurrentView('onboarding');
  };

  return (
    <div className="App">
      {currentView === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {currentView === 'goal-setter' && (
        <GoalSetter onComplete={handleGoalSet} />
      )}
      {currentView === 'dashboard' && (
        <Dashboard onBack={handleBackToOnboarding} />
      )}
    </div>
  );
}

export default App;
