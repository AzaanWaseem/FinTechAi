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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-[#004977] mb-3 text-center">
          Set Your Financial Goals
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Set your monthly budget and savings goal to get personalized financial insights.
        </p>
        
        <form onSubmit={handleSetGoal} className="space-y-6">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Budget:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="3000"
                min="1"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004977] focus:border-transparent text-lg"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Savings Goal:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="500"
                min="1"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004977] focus:border-transparent text-lg"
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full bg-[#004977] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#003a5d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Setting Goal...' : 'Set My Goal'}
          </button>
        </form>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tips for setting your goals</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Budget should include all your monthly expenses</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Savings goal should be 10-20% of your budget</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Consider your essential expenses first</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>You can always adjust these later</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Even small amounts add up over time!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GoalSetter;
