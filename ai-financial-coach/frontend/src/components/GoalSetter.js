import React, { useState } from 'react';
import axios from 'axios';
import './GoalSetter.css';

const GoalSetter = ({ onComplete, user }) => {
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
        user_id: user.id,
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
    <div className="goal-setter-container">
      <div className="goal-setter-card">
        <h1>Set Your Financial Goals</h1>
        <p className="subtitle">
          Set your monthly budget and savings goal to get personalized financial insights.
        </p>
        
        <form onSubmit={handleSetGoal} className="goal-form">
          <div className="input-group">
            <label htmlFor="budget">Monthly Budget:</label>
            <div className="input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="3000"
                min="1"
                step="0.01"
                className="goal-input"
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="goal">Monthly Savings Goal:</label>
            <div className="input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                min="1"
                step="0.01"
                className="goal-input"
              />
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            className="set-goal-button"
            disabled={isLoading}
          >
            {isLoading ? 'Setting Goal...' : 'Set My Goal'}
          </button>
        </form>
        
        <div className="goal-tips">
            <h3>Tips for setting your goals</h3>
          <ul>
            <li>Budget should include all your monthly expenses</li>
            <li>Savings goal should be 10-20% of your budget</li>
            <li>Consider your essential expenses first</li>
            <li>You can always adjust these later</li>
            <li>Even small amounts add up over time!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GoalSetter;
