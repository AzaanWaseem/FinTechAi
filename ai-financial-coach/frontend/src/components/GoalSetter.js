import React, { useState } from 'react';
import axios from 'axios';

const GoalSetter = ({ onComplete }) => {
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetGoal = async (e) => {
    e.preventDefault();
    
    if (!goal || goal <= 0) {
      setError('Please enter a valid savings goal greater than $0');
      return;
    }
    
    if (!budget || budget <= 0) {
      setError('Please enter a valid monthly budget greater than $0');
      return;
    }
    
    if (parseFloat(goal) > parseFloat(budget)) {
      setError('Your savings goal cannot be greater than your monthly budget');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/set-goal', {
        goal: parseFloat(goal),
        budget: parseFloat(budget)
      });
      
      if (response.data.status === 'success') {
        onComplete();
      } else {
        setError('Failed to set your savings goal. Please try again.');
      }
    } catch (err) {
      console.error('Goal setting error:', err);
      setError('Failed to set your savings goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center-screen">
      <div className="welcome-box">
        <h1 className="text-3xl font-bold text-center text-white mb-3">
          Set Your Financial Goals
        </h1>
        <p className="text-white text-center mb-6">
          Set your monthly budget and savings goal to get personalized financial insights.
        </p>
        
        <form onSubmit={handleSetGoal} className="space-y-6">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-white mb-2 text-left">
              Monthly Budget:
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-semibold">$</span>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder=""
                min="1"
                step="0.01"
                className="w-full pr-5 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004977] focus:border-transparent bg-white shadow-md"
                style={{ backgroundColor: '#ffffff', borderRadius: '16px', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '40px', fontSize: '1.5rem' }}
              />
            </div>
          </div>
          
          <div className="mt-12">
            <label htmlFor="goal" className="block text-sm font-medium text-white mb-2 text-left">
              Monthly Savings Goal:
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-semibold">$</span>
              <input
                type="number"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder=""
                min="1"
                step="0.01"
                className="w-full pr-5 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004977] focus:border-transparent bg-white shadow-md"
                style={{ backgroundColor: '#ffffff', borderRadius: '16px', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '40px', fontSize: '1.5rem' }}
              />
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}
          
          <div style={{ marginTop: '32px' }}>
            <button 
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
              aria-disabled={isLoading}
            >
              {isLoading ? 'Setting Goal...' : 'Set My Goal'}
            </button>
          </div>
        </form>
        
        <div className="features text-sm mt-8">
          <h3 className="font-bold mb-2 text-center text-white">Tips for setting your goals</h3>
          <div className="features-text text-center text-base leading-7">
            <p><span className="feature-check">✓</span> Budget should include all your monthly expenses</p>
            <p><span className="feature-check">✓</span> Savings goal should be 10-20% of your budget</p>
            <p><span className="feature-check">✓</span> Consider your essential expenses first</p>
            <p><span className="feature-check">✓</span> You can always adjust these later</p>
            <p><span className="feature-check">✓</span> Even small amounts add up over time!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSetter;
