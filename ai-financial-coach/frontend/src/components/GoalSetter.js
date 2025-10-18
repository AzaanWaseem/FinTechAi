import React, { useState } from 'react';
import axios from 'axios';
import './GoalSetter.css';

const GoalSetter = ({ onComplete }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetGoal = async (e) => {
    e.preventDefault();
    
    if (!goal || goal <= 0) {
      setError('Please enter a valid savings goal greater than $0');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/set-goal', {
        goal: parseFloat(goal)
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
        <h1>Set Your Monthly Savings Goal</h1>
        <p className="subtitle">
          Enter a target amount to receive personalized savings recommendations.
        </p>
        
        <form onSubmit={handleSetGoal} className="goal-form">
          <div className="input-group">
            <label htmlFor="goal">Monthly Savings Goal:</label>
            <div className="input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="500"
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
            <h3>Tips for setting your goal</h3>
          <ul>
            <li>Start with 10-20% of your monthly income</li>
            <li>Consider your essential expenses first</li>
            <li>You can always adjust this later</li>
            <li>Even small amounts add up over time!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GoalSetter;
